import { User, Role } from '@prisma/client';
import { prisma } from '../config/database';

// ─────────────────────────────────────────────
//  User Repository
//  Encapsulates all database access for Users.
// ─────────────────────────────────────────────

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: Role;
}

export class UserRepository {
  /**
   * Finds a user by their unique ID.
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  /**
   * Finds a user by their email address.
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  /**
   * Creates a new user record.
   */
  async create(data: CreateUserInput): Promise<User> {
    return prisma.user.create({ data });
  }

  /**
   * Checks whether a user with the given email already exists.
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await prisma.user.count({ where: { email } });
    return count > 0;
  }
}

// Export a singleton instance
export const userRepository = new UserRepository();
