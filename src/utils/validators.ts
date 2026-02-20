/**
 * Input validators for email and password
 */

import { ValidationError } from './exceptions';

export class EmailValidator {
  static validate(email: string): void {
    if (!email || typeof email !== 'string') {
      throw new ValidationError('Email must be a non-empty string');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }

    if (email.length > 254) {
      throw new ValidationError('Email must not exceed 254 characters');
    }
  }
}

export class PasswordValidator {
  static validate(password: string): void {
    if (!password || typeof password !== 'string') {
      throw new ValidationError('Password must be a non-empty string');
    }

    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      throw new ValidationError('Password must not exceed 128 characters');
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      throw new ValidationError(
        'Password must contain uppercase, lowercase, number, and special character'
      );
    }
  }
}
