import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/client.service';

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const client = await svc.getClientByUserId(req.user!.sub);
    if (!client) { res.status(404).json({ message: 'Client profile not found' }); return; }
    res.json(client);
  } catch (e) { next(e); }
}

export async function createMe(req: Request, res: Response, next: NextFunction) {
  try {
    const exists = await svc.getClientByUserId(req.user!.sub);
    if (exists) { res.status(409).json({ message: 'Profile already exists' }); return; }
    const client = await svc.createClient(req.user!.sub, req.body);
    res.status(201).json(client);
  } catch (e) { next(e); }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const client = await svc.updateClient(req.user!.sub, req.body);
    res.json(client);
  } catch (e) { next(e); }
}
