import { Request, Response } from 'express';
import * as medicineService from './medicine.service';

export const getMedicinesHandler = async (req: Request, res: Response) => {
  const { search, limit, page } = req.query;
  
  const result = await medicineService.listMedicines({
    search: search as string,
    limit: limit ? parseInt(limit as string) : 50,
    page: page ? parseInt(page as string) : 1,
  });

  res.status(200).json(result);
};

export const createMedicineHandler = async (req: Request, res: Response) => {
  const medicine = await medicineService.createMedicine(req.body);
  res.status(201).json(medicine);
};

export const deleteMedicineHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  await medicineService.deleteMedicine(id);
  res.status(200).json({ message: 'Medicine deleted successfully' });
};
