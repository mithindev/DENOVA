import { Request, Response } from 'express';
import { AppointmentService } from './appointment.service';
import { AppError } from '../../lib/AppError';

export const listAppointments = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const { date } = req.query;
  res.json(await AppointmentService.getAll(req.user.clinicId, date as string));
};

export const getAppointment = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  res.json(await AppointmentService.getById(req.params.id, req.user.clinicId));
};

export const createAppointment = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const appt = await AppointmentService.create(req.body, req.user.clinicId);
  res.status(201).json(appt);
};

export const updateAppointment = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  res.json(await AppointmentService.update(req.params.id, req.body, req.user.clinicId));
};

export const completeAppointment = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const appt = await AppointmentService.complete(req.params.id, req.user.clinicId, req.body);
  res.json(appt);
};

export const getVisitingHistory = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const { patientId } = req.query;
  if (!patientId || typeof patientId !== 'string') throw new AppError('patientId query param required', 400);
  res.json(await AppointmentService.getByPatient(patientId, req.user.clinicId));
};

export const deleteAppointment = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  await AppointmentService.delete(req.params.id, req.user.clinicId);
  res.status(204).send();
};
