import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { ESTATE_CENTER, seedEstateBlocks } from "./seed-estate";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("cooper2026", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@cooperestate.com" },
    update: {},
    create: {
      email: "admin@cooperestate.com",
      name: "Vineyard Admin",
      role: "OWNER",
      passwordHash,
    },
  });

  const vineyard = await prisma.vineyard.upsert({
    where: { id: "cooper-estate-vineyards" },
    update: {
      name: "Cooper Estate Vineyards",
      location: "Red Mountain AVA, Benton County, Washington, US",
    },
    create: {
      id: "cooper-estate-vineyards",
      name: "Cooper Estate Vineyards",
      location: "Red Mountain AVA, Benton County, Washington, US",
    },
  });

  const estate = await seedEstateBlocks(prisma, vineyard.id, admin.id);

  const now = new Date();
  const daysFromNow = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d;
  };
  const daysAgo = (days: number) => daysFromNow(-days);

  const sampleEquipment = [
    {
      name: "Kubota M5-111",
      type: "Tractor",
      status: "ACTIVE" as const,
      serialNumber: "CEV-TR-001",
      lastServicedAt: daysAgo(45),
      nextServiceAt: daysFromNow(15),
      notes: "Primary vineyard tractor. 4WD.",
    },
    {
      name: "Pellenc Optimum 9900",
      type: "Harvester",
      status: "ACTIVE" as const,
      serialNumber: "CEV-HV-001",
      lastServicedAt: daysAgo(120),
      nextServiceAt: daysFromNow(60),
    },
    {
      name: "Gregoire G65 Sprayer",
      type: "Sprayer",
      status: "ACTIVE" as const,
      serialNumber: "CEV-SP-001",
      lastServicedAt: daysAgo(20),
      nextServiceAt: daysAgo(3),
      notes: "Overdue filter and nozzle check.",
    },
    {
      name: "Polaris Ranger 570",
      type: "ATV",
      status: "ACTIVE" as const,
      serialNumber: "CEV-ATV-01",
      lastServicedAt: daysAgo(30),
      nextServiceAt: daysFromNow(30),
    },
    {
      name: "Netafim Pump Station",
      type: "Pump",
      status: "IN_MAINTENANCE" as const,
      serialNumber: "CEV-PU-001",
      lastServicedAt: daysAgo(5),
      nextServiceAt: daysFromNow(2),
      notes: "Valve replacement in progress.",
    },
    {
      name: "John Deere 5075E",
      type: "Tractor",
      status: "RETIRED" as const,
      serialNumber: "CEV-TR-OLD",
      notes: "Replaced by Kubota M5-111.",
    },
  ];

  const equipmentByName: Record<string, string> = {};

  for (const equip of sampleEquipment) {
    const existing = await prisma.equipment.findFirst({
      where: { name: equip.name },
    });

    const record = existing
      ? existing
      : await prisma.equipment.create({
          data: {
            name: equip.name,
            type: equip.type,
            status: equip.status,
            serialNumber: equip.serialNumber,
            lastServicedAt: equip.lastServicedAt,
            nextServiceAt: equip.nextServiceAt,
            notes: equip.notes,
          },
        });

    equipmentByName[equip.name] = record.id;

    if (!existing && equip.name === "Gregoire G65 Sprayer") {
      await prisma.maintenanceRecord.create({
        data: {
          equipmentId: record.id,
          performedAt: equip.lastServicedAt!,
          description: "Pre-season nozzle inspection",
          notes: "Scheduled follow-up for filter replacement.",
        },
      });
    }
  }

  const sampleTasks = [
    {
      blockCode: "1",
      type: "PRUNING" as const,
      status: "IN_PROGRESS" as const,
      title: "Winter cane pruning — 1-CS1",
      dueDate: daysFromNow(3),
      equipmentName: "Kubota M5-111",
    },
    {
      blockCode: "13",
      type: "SPRAYING" as const,
      status: "PENDING" as const,
      title: "Early season fungicide — 13-MR13",
      dueDate: daysFromNow(1),
      equipmentName: "Gregoire G65 Sprayer",
    },
    {
      blockCode: "3",
      type: "INSPECTION" as const,
      status: "PENDING" as const,
      title: "Bud break inspection — 3-MR3",
      dueDate: daysFromNow(5),
    },
    {
      blockCode: "40",
      type: "INSPECTION" as const,
      status: "COMPLETED" as const,
      title: "Canopy health check — 40-CM40",
      dueDate: daysAgo(2),
      completedAt: daysAgo(1),
    },
  ];

  for (const taskData of sampleTasks) {
    const blockId = estate.blockByCode[taskData.blockCode];
    if (!blockId) continue;

    const existing = await prisma.task.findFirst({
      where: { blockId, title: taskData.title },
    });

    if (!existing) {
      await prisma.task.create({
        data: {
          blockId,
          type: taskData.type,
          status: taskData.status,
          title: taskData.title,
          dueDate: taskData.dueDate,
          completedAt: taskData.completedAt ?? null,
          assignedToId: admin.id,
          equipmentId:
            "equipmentName" in taskData && taskData.equipmentName
              ? equipmentByName[taskData.equipmentName]
              : undefined,
        },
      });
    }
  }

  const sampleSchedules = [
    {
      blockCode: "1",
      frequency: "weekly",
      method: "Drip",
      volume: 450,
      startDate: daysAgo(60),
    },
    {
      blockCode: "3",
      frequency: "weekly",
      method: "Drip",
      volume: 380,
      startDate: daysAgo(45),
    },
    {
      blockCode: "13",
      frequency: "biweekly",
      method: "Drip",
      volume: 320,
      startDate: daysAgo(30),
    },
  ];

  for (const sched of sampleSchedules) {
    const blockId = estate.blockByCode[sched.blockCode];
    if (!blockId) continue;

    const existing = await prisma.irrigationSchedule.findFirst({
      where: { blockId, frequency: sched.frequency, active: true },
    });

    if (!existing) {
      await prisma.irrigationSchedule.create({
        data: {
          blockId,
          frequency: sched.frequency,
          startDate: sched.startDate,
          volume: sched.volume,
          method: sched.method,
          active: true,
        },
      });
    }
  }

  console.log("Seed complete:");
  console.log(`  Vineyard: ${vineyard.name}`);
  console.log(`  Estate center: ${ESTATE_CENTER.lat}, ${ESTATE_CENTER.lng}`);
  console.log(`  Vineyard blocks: ${estate.vineyardBlockCount}`);
  console.log(`  Infrastructure areas: ${estate.infrastructureCount}`);
  console.log(`  GPS polygons extracted: ${estate.geometryCount}`);
  if (estate.missingGeometry.length > 0) {
    console.log(`  Missing geometry (${estate.missingGeometry.length}):`);
    for (const name of estate.missingGeometry) {
      console.log(`    - ${name}`);
    }
  }
  console.log(`  Varieties: ${estate.source.varieties.length}`);
  console.log(`  Equipment: ${sampleEquipment.length}`);
  console.log(`  Demo tasks: ${sampleTasks.length}`);
  console.log(`  Imported irrigation records: 3 (blocks 3, 31, 32)`);
  console.log(`  Admin login: admin@cooperestate.com / cooper2026`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
