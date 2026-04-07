import prisma from '../../services/db.service';
import { AppError } from '../../lib/AppError';

export class AppointmentService {
  static async getAll(clinicId: string) {
    return prisma.appointment.findMany({
      where: { patient: { clinicId } },
      orderBy: { date: 'desc' },
      include: {
        patient: { select: { id: true, name: true, phone: true } },
        doctor: { select: { id: true, name: true, speciality: true } },
        _count: { select: { treatments: true } },
      },
    });
  }

  static async getById(id: string, clinicId: string) {
    const appt = await prisma.appointment.findFirst({
      where: { id, patient: { clinicId } },
      include: {
        patient: true,
        doctor: { select: { id: true, name: true, speciality: true } },
        treatments: true,
        billing: true,
      },
    });
    if (!appt) throw new AppError('Appointment not found.', 404);
    return appt;
  }

  static async create(data: any, clinicId: string) {
    // Verify the patient belongs to the same clinic
    const patient = await prisma.patient.findFirst({ where: { id: data.patientId, clinicId } });
    if (!patient) throw new AppError('Patient not found in this clinic.', 404);
    return prisma.appointment.create({
      data: { ...data, date: new Date(data.date) },
      include: { patient: { select: { id: true, name: true } } },
    });
  }

  static async update(id: string, data: any, clinicId: string) {
    await this.getById(id, clinicId);
    return prisma.appointment.update({
      where: { id },
      data: { ...data, ...(data.date && { date: new Date(data.date) }) },
    });
  }

  static async delete(id: string, clinicId: string) {
    await this.getById(id, clinicId);
    await prisma.appointment.delete({ where: { id } });
  }
}
