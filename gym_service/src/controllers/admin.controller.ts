import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/client.service';

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
