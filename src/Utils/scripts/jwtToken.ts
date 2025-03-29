import jwt, { Secret } from 'jsonwebtoken';
import config from '../../config.js';
import { ErrorEnum } from '../../DataTypes/enums/Error.js';

const JWT_SECRET = config.JWT_SECRET;
const REFRESH_TOKEN_SECRET = config.REFRESH_TOKEN_SECRET;

// In-memory store for blacklisted tokens (for demonstration purposes)
const blacklistedTokens = new Set<string>();

interface TokenOptions {
    expiresIn?: string | number; // Allow customization of expiration
    type?: 'access' | 'refresh'; // Define token type
}

interface TokenResponse {
    token: string;
    expiresIn: string | number;
}

interface TokenPairResponse {
    accessToken: TokenResponse;
    refreshToken?: TokenResponse;
}

/**
 * Generate a JWT token based on user payload and options.
 */
export const generateToken = (
    user: any,
    options: TokenOptions = { type: 'refresh', expiresIn: '24h' }
): TokenResponse => {
    if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
        throw ErrorEnum.InvalidJwtSecret();
    }

    const secret = options.type === 'refresh' ? REFRESH_TOKEN_SECRET : JWT_SECRET;
    const expiresIn = options.expiresIn || (options.type === 'refresh' ? '7d' : '24h');

    const token = jwt.sign(
        user,
        secret,
        { expiresIn }
    );

    return { token, expiresIn };
};

/**
 * Generate both access and refresh tokens, if needed.
 */
export const generateTokens = (user: any, generateRefreshToken: boolean = false): TokenPairResponse => {
    const accessToken = generateToken(user, { type: 'access', expiresIn: '24h' });

    let refreshToken: TokenResponse | undefined;
    if (generateRefreshToken) {
        refreshToken = generateToken(user, { type: 'refresh', expiresIn: '7d' });
    }

    return {
        accessToken,
        refreshToken
    };
};

/**
 * Verify a JWT token.
 */
export const verifyToken = (token: string, type: 'access' | 'refresh' = 'access'): any => {
    try {
        const secret = type === 'refresh' ? REFRESH_TOKEN_SECRET : JWT_SECRET;

        // Check if the token is blacklisted
        if (blacklistedTokens.has(token)) {
            throw ErrorEnum.InvalidJwt(`Blacklisted ${type} token`);
        }

        return jwt.verify(token, secret as Secret) as any;
    } catch (error) {
        throw ErrorEnum.InvalidJwt(`Invalid ${type} token`);
    }
};

/**
 * Utility function to refresh the access token.
 */
export const refreshAccessToken = (refreshToken: string): TokenResponse => {
    const decoded = verifyToken(refreshToken, 'refresh');
    return generateToken(decoded, { type: 'access', expiresIn: '24h' });
};

/**
 * Blacklist an access token.
 */
export const blacklistAccessToken = (accessToken: string): void => {
    blacklistedTokens.add(accessToken);
};

/**
 * Blacklist a refresh token.
 */
export const blacklistRefreshToken = (refreshToken: string): void => {
    blacklistedTokens.add(refreshToken);
};