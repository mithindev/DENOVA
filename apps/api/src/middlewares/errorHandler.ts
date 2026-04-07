import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/AppError';
import { logger, sanitizeData } from '../lib/logger';
import prisma from '../services/db.service';

export const errorHandler = async (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const isTrusted = error instanceof AppError;

  // Context for logging
  const context = {
    userId: req.user?.id,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    body: sanitizeData(req.body),
    params: req.params,
    query: req.query,
  };

  // Log error using Winston
  logger.error(error.message, {
    ...context,
    stack: error.stack,
  });

  // Persist critical errors to the database
  if (!isTrusted || statusCode === 500) {
    try {
      await prisma.systemLog.create({
        data: {
          level: 'ERROR',
          message: error.message,
          stack: error.stack,
          context: context as any,
        },
      });
    } catch (dbError) {
      // If DB logging fails, just log to the file logger
      logger.error('Failed to save log to DB', { error: dbError });
    }
  }

  return res.status(statusCode).json({
    status: 'error',
    message: isTrusted ? error.message : 'Something went wrong on the server.',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};
