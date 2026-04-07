import prisma from '../../services/db.service';
import { AppError } from '../../lib/AppError';

export class PatientService {
  static async getAll(clinicId: string, query?: string, limit: number = 15) {
    const where: any = { clinicId };
    
    if (query) {
      const orConditions: any[] = [
        { name: { contains: query, mode: 'insensitive' } },
        { opNo: { contains: query, mode: 'insensitive' } },
      ];
      
      // Only include phone in search if it looks like a phone number (digits) and is 7+ chars
      const digits = query.replace(/\D/g, '');
      if (digits.length >= 7) {
        orConditions.push({ phone: { contains: query } });
        orConditions.push({ mobile: { contains: query } });
      }
      
      where.OR = orConditions;
    }

    return prisma.patient.findMany({
      where,
      orderBy: { regDate: 'desc' },
      take: limit,
      include: {
        _count: { select: { appointments: true } },
      },
    });
  }

  static async getById(id: string, clinicId: string) {
    const patient = await prisma.patient.findFirst({
      where: { id, clinicId },
      include: {
        appointments: {
          orderBy: { date: 'desc' },
          include: { treatments: true },
        },
      },
    });

    if (!patient) throw new AppError('Patient not found.', 404);
    return patient;
  }

  static async create(data: any, clinicId: string) {
    // If opNo is not provided, generate it automatically based on patient count
    if (!data.opNo) {
      const count = await prisma.patient.count({ where: { clinicId } });
      data.opNo = `OP-${(count + 1).toString().padStart(4, '0')}`;
    }

    const patientData = {
      ...data,
      clinicId,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      regDate: data.regDate ? new Date(data.regDate) : undefined,
    };

    return prisma.patient.create({
      data: patientData,
    });
  }

  static async update(id: string, data: any, clinicId: string) {
    await this.getById(id, clinicId);
    const updateData = {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      regDate: data.regDate ? new Date(data.regDate) : undefined,
    };

    return prisma.patient.update({
      where: { id },
      data: updateData,
    });
  }

  static async delete(id: string, clinicId: string) {
    await this.getById(id, clinicId);
    return prisma.patient.delete({ where: { id } });
  }
}
