/**
 * Authentication service
 */

import { DataSource, Repository } from 'typeorm';
import { User } from '../models/User';
import { TokenBlacklist } from '../models/TokenBlacklist';
import { UserService } from './UserService';
import { JWTHandler, TokenPayload } from '../utils/JWTHandler';
import { PasswordHandler } from '../utils/PasswordHandler';
import { EmailValidator, PasswordValidator } from '../utils/validators';
import {
  UserNotFound,
  InvalidCredentials,
  InvalidToken,
  DatabaseError
} from '../utils/exceptions';
import { Config } from '../config/Config';

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user: Omit<User, 'passwordHash'>;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private userService: UserService;
  private jwtHandler: JWTHandler;
  private passwordHandler: PasswordHandler;
  private tokenBlacklistRepository: Repository<TokenBlacklist>;
  private config: Config;

  constructor(dataSource: DataSource, config?: Config) {
    this.userService = new UserService(dataSource);
    this.jwtHandler = new JWTHandler(config);
    this.passwordHandler = new PasswordHandler();
    this.tokenBlacklistRepository = dataSource.getRepository(TokenBlacklist);
    this.config = config || new Config();
  }

  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<AuthResponse> {
    try {
      // Validate inputs
      EmailValidator.validate(input.email);
      PasswordValidator.validate(input.password);

      // Create user
      const user = await this.userService.createUser({
        email: input.email,
        password: input.password,
        firstName: input.firstName,
        lastName: input.lastName
      });

      // Generate tokens
      const tokens = this._generateTokens(user);

      return {
        success: true,
        user: this._userToResponse(user),
        ...tokens
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    try {
      // Validate inputs
      EmailValidator.validate(input.email);

      // Find user
      const user = await this.userService.getUserByEmail(input.email);

      // Check if user is active
      if (!user.isActive) {
        throw new InvalidCredentials('User account is deactivated');
      }

      // Verify password
      const isPasswordValid = await this.passwordHandler.verifyPassword(
        input.password,
        user.passwordHash
      );

      if (!isPasswordValid) {
        throw new InvalidCredentials('Invalid email or password');
      }

      // Update last login
      await this.userService.updateLastLogin(user.id);

      // Generate tokens
      const tokens = this._generateTokens(user);

      return {
        success: true,
        user: this._userToResponse(user),
        ...tokens
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify access token
   */
  verifyToken(token: string): TokenPayload {
    return this.jwtHandler.verifyToken(token);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = this.jwtHandler.verifyToken(refreshToken);

      if (decoded.type !== 'refresh') {
        throw new InvalidToken('Invalid token type');
      }

      // Check if token is blacklisted
      const isBlacklisted = await this._isTokenBlacklisted(refreshToken);
      if (isBlacklisted) {
        throw new InvalidToken('Token has been revoked');
      }

      // Generate new access token
      const accessToken = this.jwtHandler.createAccessToken(
        decoded.userId,
        decoded.email
      );

      return { accessToken };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user (blacklist tokens)
   */
  async logout(accessToken: string, refreshToken: string): Promise<{ success: boolean }> {
    try {
      const accessPayload = this.jwtHandler.decodeToken(accessToken);
      const refreshPayload = this.jwtHandler.decodeToken(refreshToken);

      if (!accessPayload || !refreshPayload) {
        throw new InvalidToken('Invalid token');
      }

      // Blacklist both tokens
      await this._blacklistToken(accessToken, accessPayload.exp || 0, accessPayload.userId);
      await this._blacklistToken(
        refreshToken,
        refreshPayload.exp || 0,
        refreshPayload.userId
      );

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Internal: Generate access and refresh tokens
   */
  private _generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const accessToken = this.jwtHandler.createAccessToken(user.id, user.email);
    const refreshToken = this.jwtHandler.createRefreshToken(user.id, user.email);

    return { accessToken, refreshToken };
  }

  /**
   * Internal: Convert user to response object
   */
  private _userToResponse(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...userResponse } = user;
    return userResponse as Omit<User, 'passwordHash'>;
  }

  /**
   * Internal: Blacklist a token
   */
  private async _blacklistToken(token: string, expiresAt: number, userId: number): Promise<void> {
    try {
      const blacklistEntry = this.tokenBlacklistRepository.create({
        token,
        userId,
        expiresAt: new Date(expiresAt * 1000)
      });

      await this.tokenBlacklistRepository.save(blacklistEntry);
    } catch (error) {
      throw new DatabaseError(`Failed to blacklist token: ${error}`);
    }
  }

  /**
   * Internal: Check if token is blacklisted
   */
  private async _isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const blacklistedToken = await this.tokenBlacklistRepository.findOne({
        where: { token }
      });

      return !!blacklistedToken;
    } catch (error) {
      throw new DatabaseError(`Failed to check token blacklist: ${error}`);
    }
  }
}
