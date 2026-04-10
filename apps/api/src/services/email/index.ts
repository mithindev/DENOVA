import { IEmailProvider, EmailOptions, SendEmailResult } from './types';
import { ResendProvider } from './providers/resend.provider';
import { logger } from '../../lib/logger';

class EmailService {
  private provider: IEmailProvider;

  constructor() {
    // Default to Resend provider
    this.provider = new ResendProvider();
  }

  /**
   * Set a different email provider at runtime if needed
   */
  setProvider(provider: IEmailProvider) {
    this.provider = provider;
  }

  /**
   * Send an email using the active provider
   */
  async sendEmail(options: EmailOptions): Promise<SendEmailResult> {
    try {
      const result = await this.provider.sendEmail(options);
      
      if (result.success) {
        logger.info(`Email sent successfully via ${this.provider.name} | ID: ${result.messageId}`);
      } else {
        logger.error(`Failed to send email via ${this.provider.name}:`, result.error);
      }
      
      return result;
    } catch (error) {
      logger.error(`Critical error sending email via ${this.provider.name}:`, error);
      return { success: false, error };
    }
  }

  /**
   * Backward compatibility / Helper for existing logic
   */
  async sendMail(to: string, subject: string, html: string, attachments?: EmailOptions['attachments']) {
    return this.sendEmail({ to, subject, html, attachments });
  }
}

export const emailService = new EmailService();
