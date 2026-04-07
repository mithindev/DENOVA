import prisma from '../../services/db.service';
import { AppError } from '../../lib/AppError';

export class TreatmentService {
  static async getByAppointment(appointmentId: string, clinicId: string) {
    // Verify appointment belongs to clinic
    const appt = await prisma.appointment.findFirst({ where: { id: appointmentId, patient: { clinicId } } });
    if (!appt) throw new AppError('Appointment not found.', 404);
    return prisma.treatment.findMany({ where: { appointmentId }, orderBy: { createdAt: 'asc' } });
  }

  static async create(data: any, clinicId: string) {
    const appt = await prisma.appointment.findFirst({ where: { id: data.appointmentId, patient: { clinicId } } });
    if (!appt) throw new AppError('Appointment not found in this clinic.', 404);
    return prisma.treatment.create({ data: { ...data, cost: data.cost.toString() } });
  }

  static async update(id: string, data: any, clinicId: string) {
    const treatment = await prisma.treatment.findFirst({
      where: { id },
      include: { appointment: { include: { patient: true } } },
    });
    if (!treatment || treatment.appointment.patient.clinicId !== clinicId) {
      throw new AppError('Treatment not found.', 404);
    }
    return prisma.treatment.update({
      where: { id },
      data: { ...data, ...(data.cost && { cost: data.cost.toString() }) },
    });
  }

  static async delete(id: string, clinicId: string) {
    const treatment = await prisma.treatment.findFirst({
      where: { id },
      include: { appointment: { include: { patient: true } } },
    });
    if (!treatment || treatment.appointment.patient.clinicId !== clinicId) {
      throw new AppError('Treatment not found.', 404);
    }
    await prisma.treatment.delete({ where: { id } });
  }
}
