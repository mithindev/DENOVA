export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    cid?: string;
    content_type?: string;
  }>;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: any;
}

export interface IEmailProvider {
  name: string;
  sendEmail(options: EmailOptions): Promise<SendEmailResult>;
}
