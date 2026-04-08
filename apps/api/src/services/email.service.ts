import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../lib/logger';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter() {
    if (!this.transporter) {
      if (!env.EMAIL_USER || !env.EMAIL_PASS) {
        logger.warn('Email configuration is incomplete. Email sending will be skipped.');
        return null;
      }

      this.transporter = nodemailer.createTransport({
        host: env.EMAIL_HOST,
        port: Number(env.EMAIL_PORT),
        secure: env.EMAIL_PORT === '465',
        auth: {
          user: env.EMAIL_USER,
          pass: env.EMAIL_PASS,
        },
      });
    }
    return this.transporter;
  }

  async sendMail(to: string, subject: string, html: string) {
    const transporter = this.getTransporter();
    if (!transporter) return false;

    try {
      const info = await transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
      });
      logger.info(`Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
