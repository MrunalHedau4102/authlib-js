/**
 * TypeORM database configuration
 */

import { DataSource } from 'typeorm';
import { Config } from '../config/Config';
import { User } from '../models/User';
import { TokenBlacklist } from '../models/TokenBlacklist';

const config = new Config();

export const AppDataSource = new DataSource({
  type: (config.DATABASE_TYPE as any) || 'postgres',
  url: config.DATABASE_URL,
  synchronize: !config.isProduction(),
  logging: config.NODE_ENV === 'development',
  entities: [User, TokenBlacklist],
  migrations: ['src/database/migrations/**/*.ts'],
  subscribers: ['src/database/subscribers/**/*.ts']
});
