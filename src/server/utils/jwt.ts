import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

export interface TokenPayload {
    userId: string;
    role: string;
}

const getAccessSecret = () => process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';
const getAccessExpiry = () => process.env.JWT_ACCESS_EXPIRY || '15m';
const getRefreshExpiry = () => process.env.JWT_REFRESH_EXPIRY || '7d';

export const generateAccessToken = (payload: TokenPayload): string => {
    const options: SignOptions = { expiresIn: getAccessExpiry() as any };
    return jwt.sign(payload, getAccessSecret(), options);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    const options: SignOptions = { expiresIn: getRefreshExpiry() as any };
    return jwt.sign(payload, getRefreshSecret(), options);
};

export const verifyAccessToken = (token: string): TokenPayload & JwtPayload => {
    return jwt.verify(token, getAccessSecret()) as TokenPayload & JwtPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload & JwtPayload => {
    return jwt.verify(token, getRefreshSecret()) as TokenPayload & JwtPayload;
};

export const generateTokenPair = (payload: TokenPayload) => ({
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
});
