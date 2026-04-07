import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, json } = format;

// Custom log format for development
const devFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${stack || message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` | ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// Sensitive fields to sanitize
const sensitiveFields = ['password', 'token', 'secret', 'authorization'];

const sanitizeData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  const sanitized = { ...data };
  for (const key of Object.keys(sanitized)) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }
  return sanitized;
};

const logger = createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'dental-hms-api' },
  transports: [
    // Console transport for real-time visibility
    new transports.Console({
      format: combine(
        colorize(),
        devFormat
      ),
    }),
    // Daily Rotate File for errors
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d',
    }),
    // Daily Rotate File for all logs (info and above)
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
    }),
  ],
});

export { logger, sanitizeData };
