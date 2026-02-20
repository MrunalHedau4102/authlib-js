/**
 * AuthLib - A scalable, framework-agnostic JavaScript authentication library.
 * Provides signup, login, JWT token management, and password reset functionality.
 */

export { AuthService } from './services/AuthService';
export { UserService } from './services/UserService';
export { User } from './models/User';
export { TokenBlacklist } from './models/TokenBlacklist';

// Exceptions
export {
  AuthException,
  UserNotFound,
  InvalidCredentials,
  InvalidToken,
  UserAlreadyExists,
  ValidationError,
  DatabaseError
} from './utils/exceptions';

// Config
export { Config } from './config/Config';

export const version = '1.0.0';
