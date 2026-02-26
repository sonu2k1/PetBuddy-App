import crypto from 'crypto';
import User, { IUser } from './auth.model';
import { getRedisClient } from '@/server/config/redis';
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    TokenPayload,
} from '@/server/utils/jwt';
import {
    BadRequestError,
    UnauthorizedError,
    TooManyRequestsError,
} from '@/server/utils/AppError';
import { logger } from '@/server/utils/logger';

// ─── Constants ───────────────────────────────────────
const OTP_EXPIRY_SECONDS = 120;          // 2 minutes
const OTP_COOLDOWN_SECONDS = 60;         // 1 minute between resends
const OTP_MAX_ATTEMPTS = 5;              // Max verify attempts
const OTP_RATE_LIMIT_WINDOW = 3600;      // 1 hour window
const OTP_RATE_LIMIT_MAX = 10;           // Max OTP requests per hour
const REFRESH_TOKEN_DAYS = 7;

// ─── Helpers ─────────────────────────────────────────

/** Normalise phone to +91XXXXXXXXXX */
const normalisePhone = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    const last10 = digits.slice(-10);
    return `+91${last10}`;
};

/** Generate a 6-digit OTP */
const generateOTP = (): string => {
    return crypto.randomInt(100000, 999999).toString();
};

/** Generate a unique session ID */
const generateSessionId = (): string => {
    return crypto.randomUUID();
};

// ─── Redis Key Builders ──────────────────────────────
const otpKey = (phone: string) => `otp:${phone}`;
const otpAttemptsKey = (phone: string) => `otp:attempts:${phone}`;
const otpRateLimitKey = (phone: string) => `otp:ratelimit:${phone}`;
const otpCooldownKey = (phone: string) => `otp:cooldown:${phone}`;

// ═════════════════════════════════════════════════════
//  SERVICE METHODS
// ═════════════════════════════════════════════════════

/**
 * Send OTP to phone number.
 * - Rate limited: max 10 requests per hour per phone
 * - Cooldown: 60 seconds between resends
 * - OTP stored in Redis with 2 min expiry
 */
export const sendOtp = async (phone: string) => {
    const normalisedPhone = normalisePhone(phone);
    const redis = getRedisClient();

    // ── Rate limit check ───────────────────────────────
    const rateLimitCount = await redis.incr(otpRateLimitKey(normalisedPhone));
    if (rateLimitCount === 1) {
        await redis.expire(otpRateLimitKey(normalisedPhone), OTP_RATE_LIMIT_WINDOW);
    }
    if (rateLimitCount > OTP_RATE_LIMIT_MAX) {
        throw new TooManyRequestsError(
            'Too many OTP requests. Please try again after some time.',
        );
    }

    // ── Cooldown check ─────────────────────────────────
    const cooldown = await redis.get(otpCooldownKey(normalisedPhone));
    if (cooldown) {
        const ttl = await redis.ttl(otpCooldownKey(normalisedPhone));
        throw new BadRequestError(
            `Please wait ${ttl} seconds before requesting a new OTP.`,
        );
    }

    // ── Generate and store OTP ─────────────────────────
    const otp = generateOTP();

    await redis.setex(otpKey(normalisedPhone), OTP_EXPIRY_SECONDS, otp);
    await redis.setex(otpCooldownKey(normalisedPhone), OTP_COOLDOWN_SECONDS, '1');
    await redis.del(otpAttemptsKey(normalisedPhone)); // Reset attempts

    // TODO: Send OTP via SMS provider (Twilio, MSG91, etc.)
    logger.info(`📲 OTP for ${normalisedPhone}: ${otp} (remove in production!)`);

    return {
        phone: normalisedPhone,
        message: 'OTP sent successfully',
        expiresIn: OTP_EXPIRY_SECONDS,
        // TODO: Remove this once SMS provider (Twilio, MSG91, etc.) is integrated
        otp,
    };
};

/**
 * Verify OTP and authenticate user.
 * - Max 5 verify attempts per OTP
 * - Creates user if first time
 * - Session locking: invalidates previous session
 * - Returns JWT token pair
 */
export const verifyOtp = async (phone: string, otp: string, name?: string) => {
    const normalisedPhone = normalisePhone(phone);
    const redis = getRedisClient();

    // ── Attempt tracking ───────────────────────────────
    const attempts = await redis.incr(otpAttemptsKey(normalisedPhone));
    if (attempts === 1) {
        await redis.expire(otpAttemptsKey(normalisedPhone), OTP_EXPIRY_SECONDS);
    }
    if (attempts > OTP_MAX_ATTEMPTS) {
        // Burn the OTP after too many failed attempts
        await redis.del(otpKey(normalisedPhone));
        await redis.del(otpAttemptsKey(normalisedPhone));
        throw new TooManyRequestsError(
            'Too many failed attempts. Please request a new OTP.',
        );
    }

    // ── Verify OTP ─────────────────────────────────────
    // Note: Upstash REST may return numeric values as numbers, so cast to string
    const storedOtpRaw = await redis.get(otpKey(normalisedPhone));

    if (!storedOtpRaw) {
        throw new BadRequestError('OTP has expired. Please request a new one.');
    }

    const storedOtp = String(storedOtpRaw);

    if (storedOtp !== otp) {
        const remaining = OTP_MAX_ATTEMPTS - attempts;
        throw new BadRequestError(
            `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
        );
    }

    // ── OTP valid — clean up Redis ─────────────────────
    await redis.del(otpKey(normalisedPhone));
    await redis.del(otpAttemptsKey(normalisedPhone));
    await redis.del(otpCooldownKey(normalisedPhone));

    // ── Find or create user ────────────────────────────
    let user: IUser | null = await User.findOne({ phone: normalisedPhone });
    let isNewUser = false;

    if (!user) {
        user = await User.create({
            phone: normalisedPhone,
            isVerified: true,
            ...(name ? { name: name.trim() } : {}),
        });
        isNewUser = true;
        logger.info(`👤 New user created: ${normalisedPhone} (name: ${name || 'not provided'})`);
    } else {
        if (!user.isVerified) {
            user.isVerified = true;
        }
        // Save the name for existing users if they provided one during login
        if (name) {
            user.name = name.trim();
        }
    }

    // ── Session locking — invalidate previous sessions ─
    const sessionId = generateSessionId();
    user.activeSessionId = sessionId;

    // Remove all old refresh tokens (single session enforcement)
    user.refreshTokens = [];

    // ── Generate tokens ────────────────────────────────
    const tokenPayload: TokenPayload = {
        userId: user._id.toString(),
        role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token in DB
    const refreshExpiry = new Date();
    refreshExpiry.setDate(refreshExpiry.getDate() + REFRESH_TOKEN_DAYS);

    user.refreshTokens.push({
        token: refreshToken,
        sessionId,
        createdAt: new Date(),
        expiresAt: refreshExpiry,
    });

    await user.save();

    logger.info(`✅ User authenticated: ${normalisedPhone} | Session: ${sessionId}`);

    return {
        accessToken,
        refreshToken,
        sessionId,
        isNewUser,
        user: {
            _id: user._id,
            phone: user.phone,
            name: user.name,
            role: user.role,
            isVerified: user.isVerified,
        },
    };
};

/**
 * Refresh the access token using a valid refresh token.
 * - Validates refresh token from DB
 * - Enforces session locking (activeSessionId must match)
 * - Rotates the refresh token (old one is invalidated)
 */
export const refreshAccessToken = async (refreshTokenStr: string) => {
    // ── Verify JWT signature ───────────────────────────
    let payload: TokenPayload;
    try {
        const decoded = verifyRefreshToken(refreshTokenStr);
        payload = { userId: decoded.userId, role: decoded.role };
    } catch {
        throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // ── Find user and validate stored token ────────────
    const user = await User.findById(payload.userId);
    if (!user) {
        throw new UnauthorizedError('User not found');
    }

    const storedToken = user.refreshTokens.find(
        (rt) => rt.token === refreshTokenStr,
    );

    if (!storedToken) {
        // Possible token reuse attack — revoke all sessions
        logger.warn(`🚨 Refresh token reuse detected for user ${user._id}`);
        user.refreshTokens = [];
        user.activeSessionId = null;
        await user.save();
        throw new UnauthorizedError('Refresh token revoked. Please login again.');
    }

    // ── Check session locking ──────────────────────────
    if (user.activeSessionId !== storedToken.sessionId) {
        throw new UnauthorizedError(
            'Session expired. You have been logged in from another device.',
        );
    }

    // ── Check expiry ───────────────────────────────────
    if (storedToken.expiresAt < new Date()) {
        user.refreshTokens = user.refreshTokens.filter(
            (rt) => rt.token !== refreshTokenStr,
        );
        await user.save();
        throw new UnauthorizedError('Refresh token has expired. Please login again.');
    }

    // ── Rotate refresh token ──────────────────────────
    const newTokenPayload: TokenPayload = {
        userId: user._id.toString(),
        role: user.role,
    };

    const newAccessToken = generateAccessToken(newTokenPayload);
    const newRefreshToken = generateRefreshToken(newTokenPayload);

    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + REFRESH_TOKEN_DAYS);

    // Remove old token, add new one
    user.refreshTokens = user.refreshTokens.filter(
        (rt) => rt.token !== refreshTokenStr,
    );
    user.refreshTokens.push({
        token: newRefreshToken,
        sessionId: storedToken.sessionId,
        createdAt: new Date(),
        expiresAt: newExpiry,
    });

    await user.save();

    logger.info(`🔄 Token refreshed for user ${user._id}`);

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
            _id: user._id,
            phone: user.phone,
            name: user.name,
            role: user.role,
            isVerified: user.isVerified,
        },
    };
};

/**
 * Logout — revoke all refresh tokens and clear active session.
 */
export const logout = async (userId: string) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new UnauthorizedError('User not found');
    }

    user.refreshTokens = [];
    user.activeSessionId = null;
    await user.save();

    logger.info(`👋 User logged out: ${user.phone}`);

    return { message: 'Logged out successfully' };
};
