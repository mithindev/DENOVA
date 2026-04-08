import fs from 'fs';
import path from 'path';
import prisma from '../src/services/db.service';
import { Prisma } from '@prisma/client';

/**
 * JSON IMPORT SCRIPT: SSMS Patient Registration to PostgreSQL
 * 
 * Instructions:
 * 1. Export your table using Python to JSON format.
 * 2. Save the file as 'patients_import.json' in 'apps/api/data/imports/'.
 * 3. Run this script: npx ts-node scripts/import_patients_json.ts
 */

const JSON_PATH = path.join(__dirname, '../data/imports/patients_import.json');

function mapGender(sex: string): "MALE" | "FEMALE" | "OTHER" {
  const s = sex?.toLowerCase() || '';
  if (s.startsWith('m')) return "MALE";
  if (s.startsWith('f')) return "FEMALE";
  return "OTHER";
}

function toDecimal(val: any): Prisma.Decimal | null {
  if (val === null || val === undefined || String(val).trim() === '') return null;
  const n = parseFloat(String(val));
  return isNaN(n) ? null : new Prisma.Decimal(n);
}

function toDate(val: any): Date | null {
  if (!val || val === 'NULL' || String(val).trim() === '') return null;
  
  // Handle DD/MM/YYYY or DD-MM-YYYY specifically
  const dateStr = String(val).trim();
  const parts = dateStr.split(/[\/\-]/);
  
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1; // 0-indexed months
    const y = parseInt(parts[2], 10);
    const date = new Date(y, m, d);
    return isNaN(date.getTime()) ? null : date;
  }

  // Fallback to native
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function toInt(val: any, fieldName?: string): number | null {
  if (val === null || val === undefined || String(val).trim() === '') return null;
  
  const raw = String(val).split('.')[0];
  const n = parseInt(raw, 10);
  
  // Postgres INT4 range: -2,147,483,648 to +2,147,483,647
  if (isNaN(n) || n > 2147483647 || n < -2147483648) {
    if (fieldName) console.warn(`⚠️ Oversized integer for ${fieldName}: ${val}. Setting to null.`);
    return null;
  }

  // Logical check for Age
  if (fieldName?.toLowerCase() === 'age' && n > 150) {
    console.warn(`⚠️ Unlikely Age value: ${n}. Setting to null.`);
    return null;
  }

  return n;
}

async function runImport() {
  console.log('🚀 Starting JSON Data Migration...');

  if (!fs.existsSync(JSON_PATH)) {
    console.error(`❌ Error: JSON file not found at ${JSON_PATH}`);
    process.exit(1);
  }

  // 1. Read JSON file
  const rawData = fs.readFileSync(JSON_PATH, 'utf8');
  const patientsArray = JSON.parse(rawData);

  if (!Array.isArray(patientsArray)) {
    console.error('❌ Error: JSON must be an array of patient records.');
    process.exit(1);
  }

  console.log(`📊 Found ${patientsArray.length} records in JSON.`);

  // 2. Find Primary Clinic
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) {
    console.error('❌ Error: No Clinic found. Please run seed first.');
    process.exit(1);
  }

  // 3. Clear Existing Patients (Per User Instruction)
  console.log('⚠️ Clearing existing patients table...');
  await prisma.patient.deleteMany();
  console.log('✅ Patients table cleared.');

  // 4. Batch Processing
  const BATCH_SIZE = 1000;
  let successCount = 0;

  for (let i = 0; i < patientsArray.length; i += BATCH_SIZE) {
    const batch = patientsArray.slice(i, i + BATCH_SIZE);
    
    const mappedBatch = batch.map((row: any) => ({
      id: row.id ? String(toInt(row.id, 'id')) : undefined,
      clinicId: clinic.id,
      opNo: row.OPno ? String(toInt(row.OPno, 'OPno')) : null,
      name: row.Name || 'Unknown',
      gender: mapGender(row.sex),
      dateOfBirth: toDate(row.DOB),
      age: toInt(row.Age, 'Age'),
      birthWeight: toDecimal(row.birthweight),
      currentWeight: toDecimal(row.Currentweight),
      bloodGroup: row.Bloodgroup || null,
      height: toDecimal(row.height),
      fathersName: row.Fathersname || null,
      mothersName: row.mothername || null,
      phone: row.phno ? String(row.phno).trim() : null,
      mobile: row.mobile ? String(row.mobile).trim() : null,
      address1: row.Address1 || null,
      address2: row.Address2 || null,
      address3: row.Address3 || null,
      regDate: toDate(row.regdate) || new Date(),
      regFee: toDecimal(row.Reg_fee),
      consulFee: toDecimal(row.Consul_fee),
      otherFee: toDecimal(row.other_fee),
      fatherOccupation: row.fatheroccupation || null,
      motherOccupation: row.motheroccupation || null,
      // Legacy staff associations skipped to prevent Foreign Key violations
      registeredById: null,
      doctorId: null,
    }));

    try {
      await prisma.patient.createMany({
        data: mappedBatch,
        skipDuplicates: true,
      });
      successCount += mappedBatch.length;
      console.log(`📦 Imported batch ${Math.floor(i / BATCH_SIZE) + 1} (${successCount} total)`);
    } catch (err) {
      console.error(`❌ Batch Error at index ${i}:`, err);
    }
  }

  console.log(`\n🎉 Data Migration Complete!`);
  console.log(`Successfully Imported: ${successCount}`);
}

runImport()
  .catch(e => {
    console.error('❌ Migration Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
