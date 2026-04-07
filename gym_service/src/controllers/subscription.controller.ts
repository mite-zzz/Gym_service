import { Request, Response, NextFunction } from 'express';
import * as svc from '../services/subscription.service';

export async function getMy(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await svc.getSubscriptionsByUserId(req.user!.sub));
  } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, startDate, endDate, isActive } = req.body;
    const sub = await svc.createSubscription(req.user!.sub, {
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive,
    });
    res.status(201).json(sub);
  } catch (e: any) {
    if (e.message?.includes('not found')) { res.status(404).json({ message: e.message }); return; }
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, startDate, endDate, isActive } = req.body;
    const sub = await svc.updateSubscription(req.user!.sub, req.params.id, {
      type,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      isActive,
    });
    res.json(sub);
  } catch (e: any) {
    if (e.message?.includes('not found')) { res.status(404).json({ message: e.message }); return; }
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await svc.deleteSubscription(req.user!.sub, req.params.id);
    res.status(204).send();
  } catch (e: any) {
    if (e.message?.includes('not found')) { res.status(404).json({ message: e.message }); return; }
    next(e);
  }
}
