import { prisma } from '../config/database';
import { SubscriptionType } from '@prisma/client';

export async function getSubscriptionsByUserId(userId: string) {
  const client = await prisma.client.findUnique({ where: { userId } });
  if (!client) return [];
  return prisma.subscription.findMany({ where: { clientId: client.id } });
}

export async function createSubscription(
  userId: string,
  data: { type: SubscriptionType; startDate: Date; endDate: Date; isActive?: boolean },
) {
  const client = await prisma.client.findUnique({ where: { userId } });
  if (!client) throw new Error('Client profile not found. Create profile first.');
  return prisma.subscription.create({ data: { clientId: client.id, ...data } });
}

export async function updateSubscription(
  userId: string,
  id: string,
  data: { type?: SubscriptionType; startDate?: Date; endDate?: Date; isActive?: boolean },
) {
  const sub = await prisma.subscription.findFirst({ where: { id, client: { userId } } });
  if (!sub) throw new Error('Subscription not found or access denied');
  return prisma.subscription.update({ where: { id }, data });
}

export async function deleteSubscription(userId: string, id: string) {
  const sub = await prisma.subscription.findFirst({ where: { id, client: { userId } } });
  if (!sub) throw new Error('Subscription not found or access denied');
  return prisma.subscription.delete({ where: { id } });
}
