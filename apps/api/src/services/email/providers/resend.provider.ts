import { Resend } from 'resend';
import { IEmailProvider, EmailOptions, SendEmailResult } from '../types';
import { env } from '../../../config/env';
import { logger } from '../../../lib/logger';

export class ResendProvider implements IEmailProvider {
  name = 'resend';
  private client: Resend | null = null;

  constructor() {
    if (env.RESEND_API_KEY) {
      this.client = new Resend(env.RESEND_API_KEY);
    } else {
      logger.warn('Resend API key is not configured.');
    }
  }

  async sendEmail(options: EmailOptions): Promise<SendEmailResult> {
    if (!this.client) {
      return { success: false, error: 'Resend client not initialized (missing API key)' };
    }

    try {
      const payload: any = {
        from: options.from || env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
      };

      if (options.html) payload.html = options.html;
      if (options.text) payload.text = options.text;
      if (options.attachments) payload.attachments = options.attachments;

      const { data, error } = await this.client.emails.send(payload);

      if (error) {
        logger.error('Resend error:', error);
        return { success: false, error };
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      logger.error('Resend exception:', error);
      return { success: false, error };
    }
  }
}
