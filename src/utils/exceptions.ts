/**
 * Custom exceptions for AuthLib
 */

export class AuthException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthException';
  }
}

export class UserNotFound extends AuthException {
  constructor(message: string = 'User not found') {
    super(message);
    this.name = 'UserNotFound';
  }
}

export class InvalidCredentials extends AuthException {
  constructor(message: string = 'Invalid email or password') {
    super(message);
    this.name = 'InvalidCredentials';
  }
}

export class InvalidToken extends AuthException {
  constructor(message: string = 'Invalid or expired token') {
    super(message);
    this.name = 'InvalidToken';
  }
}

export class UserAlreadyExists extends AuthException {
  constructor(message: string = 'User already exists') {
    super(message);
    this.name = 'UserAlreadyExists';
  }
}

export class ValidationError extends AuthException {
  constructor(message: string = 'Validation failed') {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends AuthException {
  constructor(message: string = 'Database operation failed') {
    super(message);
    this.name = 'DatabaseError';
  }
}
