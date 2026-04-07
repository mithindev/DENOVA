import { Request, Response } from 'express';
import { logger } from '../../lib/logger';
import prisma from '../../services/db.service';

export const logClientError = async (req: Request, res: Response) => {
  const { message, stack, url, userAgent } = req.body;

  // Log to Winston
  logger.error(`CLIENT ERROR: ${message}`, {
    stack,
    url,
    userAgent,
    userId: req.user?.id,
    ip: req.ip,
  });

  // Log to DB for high-visibility
  await prisma.systemLog.create({
    data: {
      level: 'CLIENT_ERROR',
      message: message,
      stack: stack,
      context: {
        url,
        userAgent,
        userId: req.user?.id,
        ip: req.ip,
      } as any,
    },
  });

  res.status(204).send();
};

export const listLogs = async (req: Request, res: Response) => {
  const logs = await prisma.systemLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100, // Return latest 100 logs
  });
  res.json(logs);
};
