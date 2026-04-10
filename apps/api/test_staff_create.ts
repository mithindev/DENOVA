import { PrismaClient } from '@prisma/client';
import { hashPassword } from './src/lib/password';

const prisma = new PrismaClient();

async function test() {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) {
    console.error('No clinic found in DB');
    return;
  }
  const clinicId = clinic.id;
  const data = {
    name: 'Test Staff',
    username: 'teststaff' + Date.now(),
    email: 'test' + Date.now() + '@example.com',
    password: 'password123',
    phone: '1234567890',
    role: 'STAFF',
    speciality: 'General'
  };

  try {
    const hashedPassword = await hashPassword(data.password);
    const staff = await prisma.staff.create({
      data: { ...data, password: hashedPassword, clinicId } as any,
    });
    console.log('Success:', staff);
  } catch (e: any) {
    console.error('Error Message:', e.message);
    console.error('Error Code:', e.code);
    console.error('Error Metadata:', e.meta);
  }
}

test().finally(() => prisma.$disconnect());
