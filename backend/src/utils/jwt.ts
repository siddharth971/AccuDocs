import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { config } from '../config/env.config';
import { logger } from './logger';

export interface TokenPayload {
  userId: string;
  mobile: string;
  role: 'admin' | 'client';
}

export interface DecodedToken extends JwtPayload, TokenPayload { }

/**
 * Generate access token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as any,
    issuer: 'accudocs-api',
    audience: 'accudocs-client',
  };

  return jwt.sign(payload, config.jwt.secret, options);
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn as string,
    issuer: 'accudocs-api',
    audience: 'accudocs-client',
  };

  return jwt.sign(payload, config.jwt.refreshSecret, options);
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = (payload: TokenPayload): { accessToken: string; refreshToken: string } => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): DecodedToken | null => {
  try {
    return jwt.verify(token, config.jwt.secret, {
      issuer: 'accudocs-api',
      audience: 'accudocs-client',
    }) as DecodedToken;
  } catch (error) {
    logger.debug(`Access token verification failed: ${(error as Error).message}`);
    return null;
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): DecodedToken | null => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret, {
      issuer: 'accudocs-api',
      audience: 'accudocs-client',
    }) as DecodedToken;
  } catch (error) {
    logger.debug(`Refresh token verification failed: ${(error as Error).message}`);
    return null;
  }
};

/**
 * Decode token without verification (for debugging)
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
};

/**
 * Get token expiry time in seconds
 */
export const getTokenExpiry = (token: string): number | null => {
  const decoded = decodeToken(token);
  if (decoded && decoded.exp) {
    return decoded.exp - Math.floor(Date.now() / 1000);
  }
  return null;
};
