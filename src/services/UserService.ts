/**
 * User management service
 */

import { Repository, DataSource } from 'typeorm';
import { User } from '../models/User';
import { PasswordHandler } from '../utils/PasswordHandler';
import { UserNotFound, UserAlreadyExists, DatabaseError } from '../utils/exceptions';

export interface CreateUserInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export class UserService {
  private userRepository: Repository<User>;
  private passwordHandler: PasswordHandler;

  constructor(dataSource: DataSource) {
    this.userRepository = dataSource.getRepository(User);
    this.passwordHandler = new PasswordHandler();
  }

  /**
   * Create a new user
   */
  async createUser(input: CreateUserInput): Promise<User> {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.findOne({
        where: { email: input.email }
      });

      if (existingUser) {
        throw new UserAlreadyExists(`User with email ${input.email} already exists`);
      }

      // Hash password
      const passwordHash = await this.passwordHandler.hashPassword(input.password);

      // Create user
      const user = this.userRepository.create({
        email: input.email,
        passwordHash,
        firstName: input.firstName || null,
        lastName: input.lastName || null
      });

      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof UserAlreadyExists) {
        throw error;
      }
      throw new DatabaseError(`Failed to create user: ${error}`);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new UserNotFound(`User with ID ${userId} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof UserNotFound) {
        throw error;
      }
      throw new DatabaseError(`Failed to get user: ${error}`);
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        throw new UserNotFound(`User with email ${email} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof UserNotFound) {
        throw error;
      }
      throw new DatabaseError(`Failed to get user: ${error}`);
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: number, updates: Partial<User>): Promise<User> {
    try {
      const user = await this.getUserById(userId);

      Object.assign(user, updates);
      user.updatedAt = new Date();

      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof UserNotFound) {
        throw error;
      }
      throw new DatabaseError(`Failed to update user: ${error}`);
    }
  }

  /**
   * Activate user
   */
  async activateUser(userId: number): Promise<User> {
    return this.updateUser(userId, { isActive: true });
  }

  /**
   * Deactivate user
   */
  async deactivateUser(userId: number): Promise<User> {
    return this.updateUser(userId, { isActive: false });
  }

  /**
   * Verify user
   */
  async verifyUser(userId: number): Promise<User> {
    return this.updateUser(userId, { isVerified: true });
  }

  /**
   * Update last login
   */
  async updateLastLogin(userId: number): Promise<User> {
    return this.updateUser(userId, { lastLogin: new Date() });
  }
}
