import { User } from '@prisma/client';
import { userRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/hash';
import { signToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import type { RegisterDto, LoginDto } from '../middlewares/validation.middleware';

// ─────────────────────────────────────────────
//  Auth Service — Business Logic
// ─────────────────────────────────────────────

export interface AuthResult {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: SafeUser;
}

/** User object without the sensitive password field */
export type SafeUser = Omit<User, 'password'>;

class AuthService {
  /**
   * Registers a new user.
   *  1. Checks email uniqueness
   *  2. Hashes the password
   *  3. Persists the user
   *  4. Returns a signed JWT + user profile (no password)
   */
  async register(dto: RegisterDto): Promise<AuthResult> {
    const emailTaken = await userRepository.existsByEmail(dto.email);
    if (emailTaken) {
      throw AppError.conflict(
        `An account with email "${dto.email}" already exists.`,
      );
    }

    const hashedPassword = await hashPassword(dto.password);

    const user = await userRepository.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      role: dto.role,
    });

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: env.JWT_EXPIRES_IN,
      user: this.sanitize(user),
    };
  }

  /**
   * Authenticates an existing user.
   *  1. Looks up the user by email
   *  2. Compares the provided password against the stored hash
   *  3. Returns a signed JWT + user profile (no password)
   */
  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await userRepository.findByEmail(dto.email);

    // Use constant-time comparison message to prevent user enumeration
    if (!user) {
      throw AppError.unauthorized('Invalid email or password.');
    }

    const passwordMatch = await comparePassword(dto.password, user.password);
    if (!passwordMatch) {
      throw AppError.unauthorized('Invalid email or password.');
    }

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: env.JWT_EXPIRES_IN,
      user: this.sanitize(user),
    };
  }

  /**
   * Retrieves the currently authenticated user's profile.
   */
  async getMe(userId: string): Promise<SafeUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User');
    }
    return this.sanitize(user);
  }

  /**
   * Strips the password field from a User record before returning
   * it to the client.
   */
  private sanitize(user: User): SafeUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    return safeUser;
  }
}

export const authService = new AuthService();