import { Request, Response } from 'express';
import { PatientService } from './patient.service';
import { AppError } from '../../lib/AppError';

export const listPatients = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  
  const { query, limit } = req.query;
  const parsedLimit = limit ? parseInt(limit as string) : 15;
  
  const patients = await PatientService.getAll(
    req.user.clinicId, 
    query as string, 
    parsedLimit
  );
  
  res.json(patients);
};

export const getPatient = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const patient = await PatientService.getById(req.params.id, req.user.clinicId);
  res.json(patient);
};

export const createPatient = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const patient = await PatientService.create(req.body, req.user.clinicId);
  res.status(201).json(patient);
};

export const updatePatient = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  const patient = await PatientService.update(req.params.id, req.body, req.user.clinicId);
  res.json(patient);
};

export const deletePatient = async (req: Request, res: Response) => {
  if (!req.user) throw new AppError('Unauthorized', 401);
  await PatientService.delete(req.params.id, req.user.clinicId);
  res.status(204).send();
};
