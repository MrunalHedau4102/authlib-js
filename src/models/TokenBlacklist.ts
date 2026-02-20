/**
 * Token blacklist model for logout and revocation
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index
} from 'typeorm';

@Entity('token_blacklist')
@Index('idx_token_blacklist_token', ['token'])
export class TokenBlacklist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  token: string;

  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'timestamp with time zone' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  blacklistedAt: Date;

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      expiresAt: this.expiresAt,
      blacklistedAt: this.blacklistedAt
    };
  }
}
