import prisma from '../../services/db.service';
import { AppError } from '../../lib/AppError';
import { hashPassword, comparePassword } from '../../lib/password';
import { generateToken } from '../../lib/token';
import { AuthResponse } from '@dental/shared';

export class AuthService {
  static async login(username: string, password: string): Promise<AuthResponse> {
    const user = await prisma.staff.findUnique({
      where: { username },
    });

    if (!user || !(await comparePassword(password, user.password))) {
      throw new AppError('Invalid username or password.', 401);
    }

    const payload = {
      id: user.id,
      clinicId: user.clinicId,
      username: user.username,
      name: user.name,
      role: user.role,
    };

    const token = generateToken(payload);

    return { user: payload, token };
  }

  static async registerClinic(data: any): Promise<AuthResponse> {
    const { name, username, password, clinicName, email, phone } = data;

    // Check if user exists
    const existingUser = await prisma.staff.findUnique({ where: { username } });
    if (existingUser) throw new AppError('Username already taken.', 400);

    const hashedPassword = await hashPassword(password);

    // Transaction to create clinic and admin user
    const result = await prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.create({
        data: { name: clinicName },
      });

      const admin = await tx.staff.create({
        data: {
          name,
          username,
          email,
          phone,
          password: hashedPassword,
          role: 'ADMIN',
          clinicId: clinic.id,
        },
      });

      return admin;
    });

    const payload = {
      id: result.id,
      clinicId: result.clinicId,
      username: result.username,
      name: result.name,
      role: result.role,
    };

    return { user: payload, token: generateToken(payload) };
  }
}
