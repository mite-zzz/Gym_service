import { User, Role } from '@prisma/client';
import { prisma } from '../config/database';

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: Role;
}

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByRefreshToken(token: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { refreshToken: token } });
  }

  async create(data: CreateUserInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await prisma.user.count({ where: { email } });
    return count > 0;
  }

  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    await prisma.user.update({ where: { id }, data: { refreshToken: token } });
  }
}

export const userRepository = new UserRepository();
