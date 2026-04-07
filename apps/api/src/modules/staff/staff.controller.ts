import { Request, Response } from 'express';
import { StaffService } from './staff.service';
import { AppError } from '../../lib/AppError';

export const listStaff = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  res.json(await StaffService.getAll(req.user.clinicId));
};

export const getStaffMember = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  res.json(await StaffService.getById(req.params.id, req.user.clinicId));
};

export const createStaff = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const staff = await StaffService.create(req.body, req.user.clinicId);
  res.status(201).json(staff);
};

export const updateStaff = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  res.json(await StaffService.update(req.params.id, req.body, req.user.clinicId));
};

export const deleteStaff = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  await StaffService.delete(req.params.id, req.user.clinicId);
  res.status(204).send();
};
