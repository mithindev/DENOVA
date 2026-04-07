import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const data = await AuthService.login(username, password);
  res.json(data);
};

export const register = async (req: Request, res: Response) => {
  const data = await AuthService.registerClinic(req.body);
  res.status(201).json(data);
};

export const me = async (req: Request, res: Response) => {
  res.json({ user: req.user });
};
