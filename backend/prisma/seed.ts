import { PrismaClient, RoomType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedAdmins() {
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
}

// Per Deliverable 01: Main lab floors 3,5,6 = 4 labs/side; New lab floors 3,10,12,13 = 3 labs/side; New floor 14 = 1 large hall/side
function roomsForFloor(buildingCode: string, floor: number, side: string): { code: string; type: RoomType }[] {
  const rooms: { code: string; type: RoomType }[] = [];
  const prefix = `${buildingCode}-${String(floor).padStart(2, '0')}${side}`;

  if (buildingCode === 'M') {
    const labFloors = [3, 5, 6];
    if (labFloors.includes(floor)) {
      for (let i = 1; i <= 4; i++) rooms.push({ code: `${prefix}-LAB${i}`, type: 'LAB' });
    } else {
      for (let i = 1; i <= 3; i++) rooms.push({ code: `${prefix}-L${String(i).padStart(2, '0')}`, type: 'LECTURE' });
      rooms.push({ code: `${prefix}-LAB1`, type: 'LAB' });
    }
  } else {
    const labFloors = [3, 10, 12, 13];
    if (floor === 14) {
      rooms.push({ code: `${prefix}-LH1`, type: 'LARGE_LECTURE_HALL' });
    } else if (labFloors.includes(floor)) {
      for (let i = 1; i <= 3; i++) rooms.push({ code: `${prefix}-LAB${i}`, type: 'LAB' });
    } else {
      for (let i = 1; i <= 3; i++) rooms.push({ code: `${prefix}-L${String(i).padStart(2, '0')}`, type: 'LECTURE' });
    }
  }
  return rooms;
}

async function seedStructure() {
  const main = await prisma.building.upsert({
    where: { code: 'M' },
    update: {},
    create: { code: 'M', name: 'Main Building' },
  });
  const newB = await prisma.building.upsert({
    where: { code: 'N' },
    update: {},
    create: { code: 'N', name: 'New Building' },
  });

  const buildings: { building: typeof main; floors: number; sides: string[] }[] = [
    { building: main, floors: 10, sides: ['A', 'B'] },
    { building: newB, floors: 14, sides: ['G', 'F'] },
  ];

  for (const { building, floors, sides } of buildings) {
    for (let floorNumber = 1; floorNumber <= floors; floorNumber++) {
      const floor = await prisma.floor.upsert({
        where: { buildingId_floorNumber: { buildingId: building.id, floorNumber } },
        update: {},
        create: { buildingId: building.id, floorNumber },
      });

      for (const sideCode of sides) {
        const side = await prisma.side.upsert({
          where: { floorId_sideCode: { floorId: floor.id, sideCode } },
          update: {},
          create: { floorId: floor.id, sideCode },
        });

        const rooms = roomsForFloor(building.code, floorNumber, sideCode);
        for (const room of rooms) {
          await prisma.room.upsert({
            where: { code: room.code },
            update: {},
            create: { code: room.code, type: room.type, sideId: side.id },
          });
        }
      }
    }
  }
}

async function main() {
  await seedAdmins();
  await seedStructure();
  console.log('Seed complete: admins + full campus structure (buildings, floors, sides, rooms)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });