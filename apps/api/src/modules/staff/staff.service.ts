import prisma from '../../services/db.service';
import { AppError } from '../../lib/AppError';
import { hashPassword } from '../../lib/password';

export class StaffService {
  static async getAll(clinicId: string) {
    return prisma.staff.findMany({
      where: { clinicId },
      select: { id: true, name: true, username: true, email: true, role: true, phone: true, speciality: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getById(id: string, clinicId: string) {
    const staff = await prisma.staff.findFirst({
      where: { id, clinicId },
      select: { id: true, name: true, username: true, email: true, role: true, phone: true, speciality: true, createdAt: true },
    });
    if (!staff) throw new AppError('Staff member not found.', 404);
    return staff;
  }

  static async create(data: any, clinicId: string) {
    const existing = await prisma.staff.findUnique({ where: { username: data.username } });
    if (existing) throw new AppError('Username already taken.', 400);

    const hashedPassword = await hashPassword(data.password);
    return prisma.staff.create({
      data: { ...data, password: hashedPassword, clinicId },
      select: { id: true, name: true, username: true, email: true, role: true, phone: true, speciality: true, createdAt: true },
    });
  }

  static async update(id: string, data: any, clinicId: string) {
    await this.getById(id, clinicId);
    return prisma.staff.update({
      where: { id },
      data,
      select: { id: true, name: true, username: true, email: true, role: true, phone: true, speciality: true, createdAt: true },
    });
  }

  static async delete(id: string, clinicId: string) {
    await this.getById(id, clinicId);
    await prisma.staff.delete({ where: { id } });
  }
}
