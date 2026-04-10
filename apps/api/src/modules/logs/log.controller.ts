import { Request, Response } from 'express';
import { logger } from '../../lib/logger';
import prisma from '../../services/db.service';
import { emailService } from '../../services/email';
import { env } from '../../config/env';
import { schedulerService } from '../../services/scheduler.service';

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

export const testEmail = async (req: Request, res: Response) => {
  const result = await emailService.sendEmail({
    to: env.REPORT_RECIPIENT || 'mithindev1@gmail.com',
    subject: 'Resend Test Email - Dental HMS',
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #2c3e50;">Dental HMS Email Integration Test</h2>
        <p>This is a test email confirming that the Resend integration is working correctly.</p>
        <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">If you received this, the refactor was successful.</p>
      </div>
    `,
  });

  if (result.success) {
    res.json({ message: 'Test email sent successfully', messageId: result.messageId });
  } else {
    res.status(500).json({ message: 'Failed to send test email', error: result.error });
  }
};

export const testAppointmentReport = async (req: Request, res: Response) => {
  logger.info('Manual trigger: sendDailyAppointmentReport test endpoint hit.');
  
  try {
    await schedulerService.sendDailyAppointmentReport();
    res.json({ message: 'Daily appointment report triggered successfully. Check your email.' });
  } catch (error) {
    logger.error('Error triggering daily appointment report manually:', error);
    res.status(500).json({ message: 'Failed to trigger appointment report', error });
  }
};
