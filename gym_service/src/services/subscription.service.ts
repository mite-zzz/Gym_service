import { prisma } from '../config/database';
import { SubscriptionType } from '@prisma/client';

function calcEndDate(startDate: Date, type: SubscriptionType): Date {
  const end = new Date(startDate);
  if (type === 'monthly') {
    end.setMonth(end.getMonth() + 1);
  } else {
    end.setFullYear(end.getFullYear() + 1);
  }
  return end;
}

function isActive(endDate: Date): boolean {
  return new Date() <= endDate;
}

function withActiveStatus<T extends { endDate: Date }>(sub: T) {
  return { ...sub, isActive: isActive(sub.endDate) };
}

export async function getSubscriptionsByUserId(userId: string) {
  const client = await prisma.client.findUnique({ where: { userId } });
  if (!client) return [];
  const subs = await prisma.subscription.findMany({ where: { clientId: client.id } });
  return subs.map(withActiveStatus);
}

export async function createSubscription(
  userId: string,
  data: { type: SubscriptionType; startDate: Date },
) {
  const client = await prisma.client.findUnique({ where: { userId } });
  if (!client) throw new Error('Client profile not found. Create profile first.');

  const endDate = calcEndDate(data.startDate, data.type);

  const sub = await prisma.subscription.create({
    data: {
      clientId: client.id,
      type: data.type,
      startDate: data.startDate,
      endDate,
      isActive: isActive(endDate),
    },
  });
  return withActiveStatus(sub);
}

export async function updateSubscription(
  userId: string,
  id: string,
  data: { type?: SubscriptionType; startDate?: Date },
) {
  const sub = await prisma.subscription.findFirst({ where: { id, client: { userId } } });
  if (!sub) throw new Error('Subscription not found or access denied');

  const newType = data.type ?? sub.type;
  const newStart = data.startDate ?? sub.startDate;
  const endDate = calcEndDate(newStart, newType);

  const updated = await prisma.subscription.update({
    where: { id },
    data: { type: newType, startDate: newStart, endDate, isActive: isActive(endDate) },
  });
  return withActiveStatus(updated);
}

export async function deleteSubscription(userId: string, id: string) {
  const sub = await prisma.subscription.findFirst({ where: { id, client: { userId } } });
  if (!sub) throw new Error('Subscription not found or access denied');
  return prisma.subscription.delete({ where: { id } });
}

export async function createSubscriptionForClient(
  clientId: string,
  data: { type: SubscriptionType; startDate: Date },
) {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) throw new Error('Client not found');

  const endDate = calcEndDate(data.startDate, data.type);

  const sub = await prisma.subscription.create({
    data: {
      clientId: client.id,
      type: data.type,
      startDate: data.startDate,
      endDate,
      isActive: isActive(endDate),
    },
  });
  return withActiveStatus(sub);
}
