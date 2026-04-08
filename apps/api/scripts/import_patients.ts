import fs from 'fs';
import path from 'path';
import readline from 'readline';
import prisma from '../src/services/db.service';
import { Prisma } from '@prisma/client';

/**
 * IMPORT SCRIPT: SSMS Patient Registration to PostgreSQL
 * 
 * Instructions:
 * 1. Export your Registration table from SSMS to CSV.
 * 2. Save the file as 'registration_import.csv' in 'apps/api/data/imports/'.
 * 3. Run this script: npx ts-node scripts/import_patients.ts
 */

const CSV_PATH = path.join(__dirname, '../data/imports/registration_import.csv');

async function parseDate(dateStr: string): Promise<Date | null> {
  if (!dateStr || dateStr.toLowerCase() === 'null' || dateStr.trim() === '') return null;
  
  // Format expected: DD-MM-YYYY
  const parts = dateStr.split(/[-/]/);
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
  const year = parseInt(parts[2], 10);
  
  const date = new Date(year, month, day);
  return isNaN(date.getTime()) ? null : date;
}

function mapGender(sex: string): "MALE" | "FEMALE" | "OTHER" {
  const s = sex?.toLowerCase() || '';
  if (s.startsWith('m')) return "MALE";
  if (s.startsWith('f')) return "FEMALE";
  return "OTHER";
}

function toDecimal(val: string): Prisma.Decimal | null {
  if (!val || val.toLowerCase() === 'null' || val.trim() === '') return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : new Prisma.Decimal(n);
}

async function runImport() {
  console.log('🚀 Starting Data Migration...');

  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ Error: CSV file not found at ${CSV_PATH}`);
    process.exit(1);
  }

  // 1. Find Primary Clinic
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) {
    console.error('❌ Error: No Clinic found in database. Please run seed first.');
    process.exit(1);
  }
  console.log(`📍 Found primary clinic: ${clinic.name} (${clinic.id})`);

  // 2. Clear Existing Patients
  console.log('⚠️ Clearing existing patients table...');
  await prisma.patient.deleteMany();
  console.log('✅ Patients table cleared.');

  // 3. Read and Parse CSV
  const fileStream = fs.createReadStream(CSV_PATH);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let rowCount = 0;
  let successCount = 0;
  let headers: string[] = [];

  const patientsData: any[] = [];

  for await (const line of rl) {
    // Switch to STRICT Tabs to prevent commas in addresses from shifting columns
    const columns = line.split('\t').map(c => c.trim().replace(/^["']|["']$/g, '').trim());

    if (rowCount === 0) {
      headers = columns;
      rowCount++;
      continue;
    }

    // Map columns by index
    const row: any = {};
    headers.forEach((h, i) => {
      const cleanH = h.replace(/[\[\]]/g, '').trim();
      row[cleanH] = columns[i] || '';
    });

    try {
      // Safety for Age: Ensure it's a valid small integer
      const rawAge = parseInt(row.Age, 10);
      const safeAge = (!isNaN(rawAge) && rawAge > 0 && rawAge < 150) ? rawAge : null;
      
      if (row.Age && safeAge === null) {
        console.warn(`⚠️ Row ${rowCount}: Invalid or oversized Age value "${row.Age}". Setting to null.`);
      }

      const patient = {
        clinicId: clinic.id,
        opNo: row.OPno || null,
        name: row.Name || 'Unknown',
        gender: mapGender(row.sex),
        dateOfBirth: await parseDate(row.DOB),
        age: safeAge,
        birthWeight: toDecimal(row.birthweight),
        currentWeight: toDecimal(row.Currentweight),
        bloodGroup: row.Bloodgroup || null,
        height: toDecimal(row.height),
        fathersName: row.Fathersname || null,
        mothersName: row.mothername || null,
        phone: row.phno || null,
        mobile: row.mobile || null,
        address1: row.Address1 || null,
        address2: row.Address2 || null,
        address3: row.Address3 || null,
        regDate: (await parseDate(row.regdate)) || new Date(),
        regFee: toDecimal(row.Reg_fee),
        consulFee: toDecimal(row.Consul_fee),
        otherFee: toDecimal(row.other_fee),
        fatherOccupation: row.fatheroccupation || null,
        motherOccupation: row.motheroccupation || null,
        // Uder_Id and Doctor_id are skipped/set to null as per plan for now
      };

      patientsData.push(patient);
      successCount++;
    } catch (err) {
      console.error(`❌ Failed to parse row ${rowCount}:`, err);
    }

    rowCount++;
    
    // Batch insert every 1000 records to avoid memory issues
    if (patientsData.length >= 1000) {
      await prisma.patient.createMany({ data: patientsData });
      patientsData.length = 0;
      console.log(`📦 Inserted ${successCount} records...`);
    }
  }

  // Final batch insert
  if (patientsData.length > 0) {
    await prisma.patient.createMany({ data: patientsData });
  }

  console.log(`\n🎉 Data Migration Complete!`);
  console.log(`Total Rows Read: ${rowCount - 1}`);
  console.log(`Total Patients Imported: ${successCount}`);
}

runImport()
  .catch(e => {
    console.error('❌ Migration Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
