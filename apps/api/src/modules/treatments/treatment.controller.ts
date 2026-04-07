import { Request, Response } from 'express';
import { TreatmentService } from './treatment.service';
import { AppError } from '../../lib/AppError';

export const listTreatments = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const { appointmentId } = req.query;
  if (!appointmentId || typeof appointmentId !== 'string') throw new AppError('appointmentId query param required', 400);
  res.json(await TreatmentService.getByAppointment(appointmentId, req.user.clinicId));
};

export const createTreatment = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const treatment = await TreatmentService.create(req.body, req.user.clinicId);
  res.status(201).json(treatment);
};

export const updateTreatment = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  res.json(await TreatmentService.update(req.params.id, req.body, req.user.clinicId));
};

export const deleteTreatment = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  await TreatmentService.delete(req.params.id, req.user.clinicId);
  res.status(204).send();
};
