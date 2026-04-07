import prisma from '../../services/db.service';
import { AppError } from '../../lib/AppError';

export class AppointmentService {
  static async getAll(clinicId: string, date?: string) {
    const where: any = { patient: { clinicId } };
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return prisma.appointment.findMany({
      where,
      orderBy: { date: 'asc' },
      include: {
        patient: { select: { id: true, name: true, phone: true, opNo: true, gender: true, age: true } },
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
        treatments: { orderBy: { createdAt: 'asc' } },
        prescriptions: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!appt) throw new AppError('Appointment not found.', 404);
    return appt;
  }

  static async create(data: any, clinicId: string) {
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

  /**
   * Save & Complete — atomically:
   * 1. Update clinical notes on the Appointment
   * 2. Create all Treatment rows
   * 3. Replace all Prescription rows
   * 4. Set status → COMPLETED
   */
  static async complete(
    id: string,
    clinicId: string,
    data: {
      allergies?: string | null;
      clinicalDetails?: string | null;
      appointmentNotes?: string | null;
      treatments?: any[];
      prescriptions?: any[];
    }
  ) {
    await this.getById(id, clinicId); // verify ownership

    return prisma.$transaction(async (tx) => {
      // 1. Update appointment clinical notes + status
      const updatedAppt = await tx.appointment.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          allergies: data.allergies ?? undefined,
          clinicalDetails: data.clinicalDetails ?? undefined,
          appointmentNotes: data.appointmentNotes ?? undefined,
        },
      });

      // 2. Create treatment rows (don't delete existing ones — append)
      if (data.treatments && data.treatments.length > 0) {
        await tx.treatment.createMany({
          data: data.treatments.map((t) => ({ ...t, appointmentId: id })),
        });
      }

      // 3. Replace prescriptions entirely
      await tx.prescription.deleteMany({ where: { appointmentId: id } });
      if (data.prescriptions && data.prescriptions.length > 0) {
        await tx.prescription.createMany({
          data: data.prescriptions.map((p) => ({ ...p, appointmentId: id })),
        });
      }

      return updatedAppt;
    });
  }

  /** Get all appointments for a patient (for visiting history) */
  static async getByPatient(patientId: string, clinicId: string) {
    const patient = await prisma.patient.findFirst({ where: { id: patientId, clinicId } });
    if (!patient) throw new AppError('Patient not found.', 404);

    const appts = await prisma.appointment.findMany({
      where: { patientId },
      orderBy: { date: 'desc' },
      include: {
        patient: { select: { opNo: true } },
        doctor: { select: { id: true, name: true } },
        treatments: true,
        prescriptions: true,
        _count: { select: { treatments: true, prescriptions: true } },
      },
    });

    return appts.map(a => ({ ...a, opNo: a.patient.opNo }));
  }
}
