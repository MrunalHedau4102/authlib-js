/**
 * Password hashing and verification utility
 */

import * as bcrypt from 'bcryptjs';

export class PasswordHandler {
  private readonly saltRounds = 12;

  /**
   * Hash a password
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const hash = await bcrypt.hash(password, this.saltRounds);
      return hash;
    } catch (error) {
      throw new Error(`Password hashing failed: ${error}`);
    }
  }

  /**
   * Verify a password against a hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, hash);
      return isMatch;
    } catch (error) {
      throw new Error(`Password verification failed: ${error}`);
    }
  }

  /**
   * Check if a password needs rehashing (e.g., after updating salt rounds)
   */
  async needsRehashing(hash: string): Promise<boolean> {
    try {
      const parts = hash.split('$');
      if (parts.length < 4) return true;

      const roundsInHash = parseInt(parts[2], 10);
      return roundsInHash < this.saltRounds;
    } catch {
      return true;
    }
  }
}
