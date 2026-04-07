import { Request, Response } from 'express';
import { BillingService } from './billing.service';
import { AppError } from '../../lib/AppError';

export const listBills = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  res.json(await BillingService.getAll(req.user.clinicId));
};

export const getBill = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  res.json(await BillingService.getById(req.params.id, req.user.clinicId));
};

export const createBill = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const bill = await BillingService.create(req.body, req.user.clinicId);
  res.status(201).json(bill);
};

export const updateBill = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  res.json(await BillingService.update(req.params.id, req.body, req.user.clinicId));
};
