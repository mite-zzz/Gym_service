import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/client.service';
import { createSubscriptionForClient } from '../services/subscription.service';

export async function createClient(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, name, email, phone } = req.body;
    if (!userId || !name || !email) {
      res.status(400).json({ message: 'userId, name and email are required' });
      return;
    }
    const existing = await svc.getClientByUserId(userId);
    if (existing) {
      res.status(409).json({ message: 'Client profile already exists for this user' });
      return;
    }
    const client = await svc.createClient(userId, { name, email, phone });
    res.status(201).json(client);
  } catch (e) { next(e); }
}

export async function getAllClients(req: Request, res: Response, next: NextFunction) {
  try {
    const clients = await svc.getAllClients();
    res.json(clients);
  } catch (e) { next(e); }
}

export async function getClientById(req: Request, res: Response, next: NextFunction) {
  try {
    const client = await svc.getClientById(req.params.id);
    if (!client) { res.status(404).json({ message: 'Client not found' }); return; }
    res.json(client);
  } catch (e) { next(e); }
}

export async function deleteClient(req: Request, res: Response, next: NextFunction) {
  try {
    const client = await svc.getClientById(req.params.id);
    if (!client) { res.status(404).json({ message: 'Client not found' }); return; }
    await svc.deleteClientById(req.params.id);
    res.status(204).send();
  } catch (e) { next(e); }
}

export async function createClientSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, startDate } = req.body;
    if (!type || !startDate) {
      res.status(400).json({ message: 'type and startDate are required' });
      return;
    }
    const sub = await createSubscriptionForClient(req.params.id, {
      type,
      startDate: new Date(startDate),
    });
    res.status(201).json(sub);
  } catch (e: any) {
    if (e.message?.includes('not found')) { res.status(404).json({ message: e.message }); return; }
    next(e);
  }
}
