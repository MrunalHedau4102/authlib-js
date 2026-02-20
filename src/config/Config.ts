/**
 * Configuration management for AuthLib
 */

export class Config {
  readonly JWT_SECRET_KEY: string;
  readonly JWT_ALGORITHM: string;
  readonly JWT_ACCESS_TOKEN_EXPIRY_MINUTES: number;
  readonly JWT_REFRESH_TOKEN_EXPIRY_DAYS: number;

  readonly DATABASE_URL: string;
  readonly DATABASE_TYPE: string;

  readonly SMTP_SERVER: string;
  readonly SMTP_USERNAME: string;
  readonly SMTP_PASSWORD: string;
  readonly SMTP_FROM: string;

  readonly NODE_ENV: string;

  constructor() {
    this.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'change-me-in-production';
    this.JWT_ALGORITHM = process.env.JWT_ALGORITHM || 'HS256';
    this.JWT_ACCESS_TOKEN_EXPIRY_MINUTES = parseInt(
      process.env.JWT_ACCESS_TOKEN_EXPIRY_MINUTES || '15'
    );
    this.JWT_REFRESH_TOKEN_EXPIRY_DAYS = parseInt(
      process.env.JWT_REFRESH_TOKEN_EXPIRY_DAYS || '7'
    );

    this.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost/authlib_db';
    this.DATABASE_TYPE = process.env.DATABASE_TYPE || 'postgres';

    this.SMTP_SERVER = process.env.SMTP_SERVER || 'smtp.gmail.com';
    this.SMTP_USERNAME = process.env.SMTP_USERNAME || '';
    this.SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
    this.SMTP_FROM = process.env.SMTP_FROM || 'noreply@authlib.dev';

    this.NODE_ENV = process.env.NODE_ENV || 'development';
  }

  isProduction(): boolean {
    return this.NODE_ENV === 'production';
  }

  validate(): void {
    if (!this.JWT_SECRET_KEY || this.JWT_SECRET_KEY === 'change-me-in-production') {
      throw new Error('JWT_SECRET_KEY must be set in production');
    }
    if (!this.DATABASE_URL) {
      throw new Error('DATABASE_URL must be set');
    }
  }
}
