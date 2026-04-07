import prisma from '../../services/db.service';
import { AppError } from '../../lib/AppError';

export class BillingService {
  static async getAll(clinicId: string) {
    return prisma.billing.findMany({
      where: { appointment: { patient: { clinicId } } },
      orderBy: { createdAt: 'desc' },
      include: {
        appointment: {
          include: { patient: { select: { id: true, name: true, phone: true } } },
        },
      },
    });
  }

  static async getById(id: string, clinicId: string) {
    const bill = await prisma.billing.findFirst({
      where: { id, appointment: { patient: { clinicId } } },
      include: {
        appointment: { include: { patient: true, treatments: true } },
      },
    });
    if (!bill) throw new AppError('Bill not found.', 404);
    return bill;
  }

  static async create(data: any, clinicId: string) {
    const appt = await prisma.appointment.findFirst({
      where: { id: data.appointmentId, patient: { clinicId } },
    });
    if (!appt) throw new AppError('Appointment not found in this clinic.', 404);

    const existing = await prisma.billing.findUnique({ where: { appointmentId: data.appointmentId } });
    if (existing) throw new AppError('Bill already exists for this appointment.', 400);

    const totalAmount = data.totalAmount.toString();
    const paidAmount = (data.paidAmount ?? 0).toString();
    const status = parseFloat(paidAmount) >= parseFloat(totalAmount) ? 'PAID'
      : parseFloat(paidAmount) > 0 ? 'PARTIAL' : 'UNPAID';

    return prisma.billing.create({
      data: { ...data, totalAmount, paidAmount, status },
    });
  }

  static async update(id: string, data: any, clinicId: string) {
    const bill = await this.getById(id, clinicId);
    const totalAmount = (data.totalAmount ?? bill.totalAmount).toString();
    const paidAmount = (data.paidAmount ?? bill.paidAmount).toString();
    const status = parseFloat(paidAmount) >= parseFloat(totalAmount) ? 'PAID'
      : parseFloat(paidAmount) > 0 ? 'PARTIAL' : 'UNPAID';

    return prisma.billing.update({
      where: { id },
      data: { ...data, totalAmount, paidAmount, status },
    });
  }
}
