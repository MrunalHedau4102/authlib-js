/**
 * JWT token handling utility
 */

import * as jwt from 'jsonwebtoken';
import { Config } from '../config/Config';
import { InvalidToken } from './exceptions';

export interface TokenPayload {
  userId: number;
  email: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export class JWTHandler {
  private config: Config;

  constructor(config?: Config) {
    this.config = config || new Config();
  }

  /**
   * Create an access token
   */
  createAccessToken(
    userId: number,
    email: string,
    additionalClaims?: Record<string, any>
  ): string {
    if (!userId || typeof userId !== 'number') {
      throw new Error('userId must be a positive number');
    }

    if (!email || typeof email !== 'string') {
      throw new Error('email must be a non-empty string');
    }

    const payload: TokenPayload = {
      userId,
      email,
      type: 'access',
      ...additionalClaims
    };

    const token = jwt.sign(payload, this.config.JWT_SECRET_KEY, {
      algorithm: this.config.JWT_ALGORITHM as any,
      expiresIn: `${this.config.JWT_ACCESS_TOKEN_EXPIRY_MINUTES}m`
    });

    return token;
  }

  /**
   * Create a refresh token
   */
  createRefreshToken(
    userId: number,
    email: string,
    additionalClaims?: Record<string, any>
  ): string {
    if (!userId || typeof userId !== 'number') {
      throw new Error('userId must be a positive number');
    }

    if (!email || typeof email !== 'string') {
      throw new Error('email must be a non-empty string');
    }

    const payload: TokenPayload = {
      userId,
      email,
      type: 'refresh',
      ...additionalClaims
    };

    const token = jwt.sign(payload, this.config.JWT_SECRET_KEY, {
      algorithm: this.config.JWT_ALGORITHM as any,
      expiresIn: `${this.config.JWT_REFRESH_TOKEN_EXPIRY_DAYS}d`
    });

    return token;
  }

  /**
   * Verify and decode a token
   */
  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.config.JWT_SECRET_KEY, {
        algorithms: [this.config.JWT_ALGORITHM as any]
      }) as TokenPayload;

      return decoded;
    } catch (error) {
      throw new InvalidToken(`Token verification failed: ${error}`);
    }
  }

  /**
   * Decode token without verification (for inspection)
   */
  decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      return decoded;
    } catch {
      return null;
    }
  }
}
