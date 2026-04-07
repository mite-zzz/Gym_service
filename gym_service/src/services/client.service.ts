import { prisma } from '../config/database';

export async function getClientByUserId(userId: string) {
  return prisma.client.findUnique({ where: { userId } });
}

export async function createClient(userId: string, data: { name: string; email: string; phone?: string }) {
  return prisma.client.create({ data: { userId, ...data } });
}

export async function updateClient(userId: string, data: { name?: string; email?: string; phone?: string }) {
  return prisma.client.update({ where: { userId }, data });
}

export async function getAllClients() {
  return prisma.client.findMany({ include: { subscriptions: true }, orderBy: { createdAt: 'desc' } });
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({ where: { id }, include: { subscriptions: true } });
}

export async function deleteClientById(id: string) {
  return prisma.client.delete({ where: { id } });
}
