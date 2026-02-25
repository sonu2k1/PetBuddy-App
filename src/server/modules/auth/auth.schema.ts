import { z } from 'zod';

// Indian phone: +91 followed by 10 digits, or just 10 digits
const phoneRegex = /^(\+91)?[6-9]\d{9}$/;

export const sendOtpSchema = z.object({
    phone: z
        .string()
        .trim()
        .regex(phoneRegex, 'Invalid phone number. Use format: +91XXXXXXXXXX or 10-digit number'),
});

export const verifyOtpSchema = z.object({
    phone: z
        .string()
        .trim()
        .regex(phoneRegex, 'Invalid phone number'),
    otp: z
        .string()
        .trim()
        .length(6, 'OTP must be exactly 6 digits')
        .regex(/^\d{6}$/, 'OTP must be numeric'),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
