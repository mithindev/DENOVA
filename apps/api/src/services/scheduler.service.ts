import cron from 'node-cron';
import prisma from './db.service';
import { emailService } from './email.service';
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

      const subject = `Daily Appointment Report - ${dateStr}`;
      const html = this.generateAppointmentHtml(appointments, dateStr);

      await emailService.sendMail(recipient, subject, html);
    } catch (error) {
      logger.error('Error in sendDailyAppointmentReport:', error);
    }
  }

  private generateAppointmentHtml(appointments: any[], dateStr: string) {
    let tableRows = '';

    if (appointments.length === 0) {
      return `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2c3e50;">Daily Appointment Report</h2>
          <p><strong>Date:</strong> ${dateStr}</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p style="padding: 20px; background: #f9f9f9; border-radius: 5px; text-align: center; color: #666;">
            No appointments scheduled for today.
          </p>
          <p style="font-size: 12px; color: #999; margin-top: 20px;">
            This is an automated report from Dental HMS.
          </p>
        </div>
      `;
    }

    appointments.forEach((apt) => {
      const time = new Date(apt.date).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      tableRows += `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px; font-weight: bold;">${time}</td>
          <td style="padding: 12px;">
            <div style="font-weight: bold;">${apt.patient.name}</div>
            <div style="font-size: 12px; color: #666;">OP: ${apt.patient.opNo || 'N/A'} | Mob: ${apt.patient.mobile || apt.patient.phone || 'N/A'}</div>
          </td>
          <td style="padding: 12px;">${apt.doctor?.name || 'Any Doctor'}</td>
          <td style="padding: 12px; color: #666;">${apt.reason || '-'}</td>
        </tr>
      `;
    });

    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2c3e50;">Daily Appointment Report</h2>
        <p><strong>Date:</strong> ${dateStr}</p>
        <p><strong>Total Appointments:</strong> ${appointments.length}</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #eee;">
          <thead>
            <tr style="background-color: #f8f9fa; border-bottom: 2px solid #dee2e6; text-align: left;">
              <th style="padding: 12px;">Time</th>
              <th style="padding: 12px;">Patient</th>
              <th style="padding: 12px;">Doctor</th>
              <th style="padding: 12px;">Reason</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        
        <p style="font-size: 12px; color: #999; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
          This is an automated report from Dental HMS. Please do not reply to this email.
        </p>
      </div>
    `;
  }
}

export const schedulerService = new SchedulerService();
