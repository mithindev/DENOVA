import prisma from '../src/services/db.service';
import { hashPassword } from '../src/lib/password';

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create a Primary Clinic
  const clinic = await prisma.clinic.upsert({
    where: { email: 'admin@balajidental.com' },
    update: {},
    create: {
      name: 'Balaji Dental Care',
      email: 'admin@balajidental.com',
      address: '123 Medical Square, North City',
      phone: '+91-9988776655',
    },
  });

  // 2. Create Admin Staff
  const adminPassword = await hashPassword('admin123');
  await prisma.staff.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      name: 'Dr. Mithin Raj',
      username: 'admin',
      email: 'dr.mithin@balajidental.com',
      phone: '+91-9988776655',
      password: adminPassword,
      role: 'ADMIN',
      clinicId: clinic.id,
      speciality: 'Prosthodontist',
    },
  });

  // 3. Create Sample Patients
  const patientsCount = await prisma.patient.count();
  if (patientsCount === 0) {
    await prisma.patient.createMany({
      data: [
        {
          name: 'Rahul Khanna',
          phone: '9876543210',
          clinicId: clinic.id,
          gender: 'MALE',
        },
        {
          name: 'Sarah Joseph',
          phone: '9876543211',
          clinicId: clinic.id,
          gender: 'FEMALE',
        },
      ],
    });
    console.log('✅ Sample patients created.');
  }

  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
