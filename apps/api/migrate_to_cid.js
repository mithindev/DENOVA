const fs = require('fs');

const servicePath = 'd:\\DENOVA\\apps\api\\src\\services\\scheduler.service.ts';
const bannerPath = 'C:\\Users\\mithi\\.gemini\\antigravity\\brain\\15392619-7735-4a8e-b59c-587cef3c1903\\dental_email_banner_1775632845719.png';
const iconPath = 'C:\\Users\\mithi\\.gemini\\antigravity\\brain\\15392619-7735-4a8e-b59c-587cef3c1903\\tooth_icon_3d_1775632865478.png';

const newContent = `import cron from 'node-cron';
import fs from 'fs';
import prisma from './db.service';
import { emailService } from './email';
import { env } from '../config/env';
import { logger } from '../lib/logger';

class SchedulerService {
  init() {
    // Run at 6:00 AM every day
    cron.schedule('0 6 * * *', async () => {
      logger.info('Running daily appointment report job...');
      await this.sendDailyAppointmentReport();
    });
    
    logger.info('📅 Scheduler service initialized (6 AM daily report)');
  }

  async sendDailyAppointmentReport() {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const appointments = await prisma.appointment.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            in: ['SCHEDULED', 'WAITING'],
          },
        },
        include: {
          patient: true,
          doctor: true,
        },
        orderBy: {
          date: 'asc',
        },
      });

      const recipient = env.REPORT_RECIPIENT;
      if (!recipient) {
        logger.warn('REPORT_RECIPIENT is not configured. Skipping daily report email.');
        return;
      }

      const dateStr = startOfDay.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

      const subject = \`Daily Appointment Report - \${dateStr}\`;
      const html = this.generateAppointmentHtml(appointments, dateStr);

      // Embedded Images as Attachments
      const attachments = [
        {
          filename: 'banner.png',
          content: fs.readFileSync('${bannerPath.replace(/\\/g, '\\\\')}'),
          cid: 'banner',
          content_type: 'image/png'
        },
        {
          filename: 'tooth.png',
          content: fs.readFileSync('${iconPath.replace(/\\/g, '\\\\')}'),
          cid: 'tooth',
          content_type: 'image/png'
        }
      ];

      await emailService.sendMail(recipient, subject, html, attachments);
    } catch (error) {
      logger.error('Error in sendDailyAppointmentReport:', error);
    }
  }

  private generateAppointmentHtml(appointments: any[], dateStr: string) {
    let tableRows = '';

    const bannerUrl = 'cid:banner';
    const toothIconUrl = 'cid:tooth';

    if (appointments.length === 0) {
      return \`
        <div style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eef2f6; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
          <img src="\${bannerUrl}" alt="Dental Care Banner" style="width: 100%; height: auto; display: block;" />
          <div style="padding: 40px; text-align: center;">
            <img src="\${toothIconUrl}" alt="Icon" style="width: 60px; height: 60px; margin-bottom: 20px;" />
            <h2 style="color: #1a202c; margin: 0 0 10px 0; font-size: 24px;">Daily Appointment Report</h2>
            <p style="color: #718096; margin: 0 0 30px 0;">Date: \${dateStr}</p>
            <div style="padding: 30px; background-color: #f7fafc; border-radius: 12px; border: 1px dashed #cbd5e0;">
              <p style="color: #4a5568; font-size: 16px; margin: 0;">No appointments scheduled for today.</p>
            </div>
            <p style="margin-top: 40px; font-size: 12px; color: #a0aec0; border-top: 1px solid #edf2f7; padding-top: 20px;">
              Automated Report • Dental HMS Management System
            </p>
          </div>
        </div>
      \`;
    }

    appointments.forEach((apt) => {
      tableRows += \`
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 16px;">
            <div style="font-weight: 600; color: #2d3748; font-size: 15px;">\${apt.patient.name}</div>
            <div style="font-size: 12px; color: #718096; margin-top: 2px;">
              <span style="background: #ebf4ff; color: #3182ce; padding: 2px 6px; border-radius: 4px; font-weight: 500;">OP: \${apt.patient.opNo || 'N/A'}</span>
              <span style="margin-left: 8px;">📱 \${apt.patient.mobile || apt.patient.phone || 'N/A'}</span>
            </div>
          </td>
          <td style="padding: 16px; color: #4a5568; font-size: 14px;">
            <div style="display: flex; align-items: center;">
              <span style="font-weight: 500;">\${apt.doctor?.name || 'Any Doctor'}</span>
            </div>
          </td>
          <td style="padding: 16px; color: #718096; font-size: 14px; font-style: italic;">
            \${apt.reason || 'General Consultation'}
          </td>
        </tr>
      \`;
    });

    return \`
      <div style="font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eef2f6; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <!-- Hero Banner -->
        <img src="\${bannerUrl}" alt="Dental HMS Banner" style="width: 100%; height: auto; display: block;" />
        
        <div style="padding: 32px;">
          <!-- Header -->
          <table style="width: 100%; margin-bottom: 24px;">
            <tr>
              <td>
                <h2 style="color: #1a202c; margin: 0; font-size: 22px; font-weight: 700;">Daily Appointment Report</h2>
                <p style="color: #718096; margin: 4px 0 0 0; font-size: 14px;">Reviewing schedule for \${dateStr}</p>
              </td>
              <td style="text-align: right;">
                <div style="background: #3182ce; color: #ffffff; padding: 10px 20px; border-radius: 10px; display: inline-block;">
                  <div style="font-size: 20px; font-weight: 700; line-height: 1;">\${appointments.length}</div>
                  <div style="font-size: 11px; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Total Appointments</div>
                </div>
              </td>
            </tr>
          </table>

          <!-- Appointment Table -->
          <div style="border: 1px solid #edf2f7; border-radius: 10px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="background-color: #f8fafc; border-bottom: 1px solid #edf2f7;">
                  <th style="padding: 12px 16px; font-size: 12px; font-weight: 600; color: #4a5568; text-transform: uppercase; letter-spacing: 0.05em;">Patient Info</th>
                  <th style="padding: 12px 16px; font-size: 12px; font-weight: 600; color: #4a5568; text-transform: uppercase; letter-spacing: 0.05em;">Doctor</th>
                  <th style="padding: 12px 16px; font-size: 12px; font-weight: 600; color: #4a5568; text-transform: uppercase; letter-spacing: 0.05em;">Reason</th>
                </tr>
              </thead>
              <tbody>
                \${tableRows}
              </tbody>
            </table>
          </div>

          <!-- Footer -->
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #f7fafc; text-align: center;">
            <img src="\${toothIconUrl}" alt="Logo" style="width: 32px; height: 32px; margin-bottom: 12px; opacity: 0.8;" />
            <p style="font-size: 12px; color: #a0aec0; margin: 0;">
              This is an automated clinical report. Please do not reply directly to this email.<br/>
              © 2026 Dental Hospital Management System
            </p>
          </div>
        </div>
      </div>
    \`;
  }
}

export const schedulerService = new SchedulerService();
\`;

fs.writeFileSync(servicePath, newContent);
console.log('Successfully refactored scheduler.service.ts to use CID attachments and removed Base64 strings.');
