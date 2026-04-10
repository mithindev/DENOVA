import fs from 'fs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const logs = await prisma.systemLog.findMany({ 
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  fs.writeFileSync('last_error.txt', JSON.stringify(logs, null, 2));
}
run().finally(() => prisma.$disconnect());
