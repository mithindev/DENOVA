import prisma from '../src/services/db.service';
import { hashPassword } from '../src/lib/password';

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create a Primary Clinic
  const clinic = await prisma.clinic.upsert({
    where: { email: 'admin@sriganeshdental.com' },
    update: {},
    create: {
      name: 'Sri Ganesh Dental Care',
      email: 'admin@sriganeshdental.com',
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
      email: 'dr.mithin@sriganeshdental.com',
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

  // 4. Seed Medicines
  const medicines = [
    'MEDOMOL', 'DOLOFORCE', 'INEMAC', 'CALSAT', 'ZARNAC-SP', 'NOMCLOX', 
    'CLEDOMOX 375', 'CLEDOMOX 625', 'EROXDISTAB', 'EMCLOX', 'TABLO-OZ', 
    'ZINETAC', 'UNICLOT', 'ALNAC-SP', 'DOLOCARE', 'CANEFOPLUS', 'HEFENPLUS', 
    'Z', 'DICFENPLUS', 'EXTRAMMUNE', 'AVIL', 'RIBOFLAVINE', 'BOTROPASE', 
    'GLY(250 MG)', 'GLY(500 MG)', 'GUMTONE', 'SENSODENT KF', 'OLSEPT(M.WASH)', 
    'FIXON', 'CLINSODENT', 'BRUSH', 'SENSOFORM (G.P)', 'DENSOFORM(G.P)', 
    'ORAHELP GEL', 'ORNIGREAT GEL', 'ARNAK-P', 'MOXCIKIND CV-625', 
    'EROX CV-625', 'POINT', 'DIVION PLUS', 'LYDASE', 'MOXBIT', 'EROX CV 375', 
    'ENERGION-OD', 'SAY CAL', 'EDOMOX C', 'SAY FLAM SP', 'ZENAC PLUS', 
    'DOLOKIND PLUS', 'MOXCIKIND CV 375', 'DICLO SAN S', 'AMOXREL', 'FEPARED', 
    'DENTO GEL', 'DENTA FORCE', 'THERMOKIND GEL', 'MEDOMOL(300)', 'ZIOMOX', 
    'RABLUX 20', 'ERONAC', 'CLOFENAC SP', 'NEBUMOX', 'MULTIDASE', 'SERCLO', 
    'AMOXYREL', 'ZENAC SP', 'BARCLAV', 'BARCLAV 375', 'ZIOCLAV 375'
  ];

  for (const m of medicines) {
    await (prisma as any).medicine.upsert({
      where: { name: m },
      update: {},
      create: { name: m }
    });
  }
  console.log(`✅ Seeded ${medicines.length} medicines.`);

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
