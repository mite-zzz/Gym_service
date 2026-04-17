import { User } from '@prisma/client';
import { userRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/hash';
import { signToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import type { RegisterDto, LoginDto } from '../middlewares/validation.middleware';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
}

export interface AuthResult extends TokenPair {
  user: SafeUser;
}

export type SafeUser = Omit<User, 'password' | 'refreshToken'>;

class AuthService {
  private async generateTokenPair(user: User): Promise<TokenPair> {
    const accessToken = signToken({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken(user.id);
    await userRepository.updateRefreshToken(user.id, refreshToken);
    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: env.JWT_EXPIRES_IN,
    };
  }

  async register(dto: RegisterDto): Promise<AuthResult> {
    const emailTaken = await userRepository.existsByEmail(dto.email);
    if (emailTaken) {
      throw AppError.conflict(`An account with email "${dto.email}" already exists.`);
    }

    const hashedPassword = await hashPassword(dto.password);
    const user = await userRepository.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      role: dto.role,
    });

    const tokens = await this.generateTokenPair(user);
    return { ...tokens, user: this.sanitize(user) };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await userRepository.findByEmail(dto.email);
    if (!user) {
      throw AppError.unauthorized('Invalid email or password.');
    }

    const passwordMatch = await comparePassword(dto.password, user.password);
    if (!passwordMatch) {
      throw AppError.unauthorized('Invalid email or password.');
    }

    const tokens = await this.generateTokenPair(user);
    return { ...tokens, user: this.sanitize(user) };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const payload = verifyRefreshToken(refreshToken);

    const user = await userRepository.findByRefreshToken(refreshToken);
    if (!user || user.id !== payload.sub) {
      throw AppError.unauthorized('Invalid refresh token. Please log in again.');
    }

    return this.generateTokenPair(user);
  }

  async logout(userId: string): Promise<void> {
    await userRepository.updateRefreshToken(userId, null);
  }

  async getMe(userId: string): Promise<SafeUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User');
    }
    return this.sanitize(user);
  }

  private sanitize(user: User): SafeUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshToken, ...safeUser } = user;
    return safeUser;
  }
}

export const authService = new AuthService();
