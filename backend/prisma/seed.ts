import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const superAdminPassword = await bcrypt.hash('ChangeMe123!', 10);
  const adminPassword = await bcrypt.hash('ChangeMe123!', 10);

  await prisma.admin.upsert({
    where: { username: 'disura.s' },
    update: {},
    create: {
      fullName: 'Disura Sandaruwan',
      username: 'disura.s',
      email: 'disura@sparkline.edu',
      passwordHash: superAdminPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });

  await prisma.admin.upsert({
    where: { username: 'test.admin' },
    update: {},
    create: {
      fullName: 'Test Admin',
      username: 'test.admin',
      email: 'test.admin@sparkline.edu',
      passwordHash: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('Seed complete: disura.s (Super Admin), test.admin (Admin)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });