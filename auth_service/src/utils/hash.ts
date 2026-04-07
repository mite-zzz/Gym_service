import bcrypt from 'bcryptjs';
import { env } from '../config/env';

// ─────────────────────────────────────────────
//  Password Hashing Utilities (bcrypt)
// ─────────────────────────────────────────────

/**
 * Hashes a plain-text password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
}

/**
 * Compares a plain-text password against a stored hash.
 */
export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
