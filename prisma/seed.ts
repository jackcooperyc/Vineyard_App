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

    if (!existing && equip.name === "Kubota M5-111") {
      await prisma.maintenanceRecord.create({
        data: {
          equipmentId: record.id,
          performedAt: daysAgo(45),
          description: "Oil and filter change",
          notes: "Next service at 100-hour interval.",
        },
      });
    }

    if (!existing && equip.name === "Polaris Ranger 570") {
      await prisma.maintenanceRecord.create({
        data: {
          equipmentId: record.id,
          performedAt: daysAgo(30),
          description: "Tire pressure and brake check",
        },
      });
    }

    if (!existing && equip.name === "Netafim Pump Station") {
      await prisma.maintenanceRecord.create({
        data: {
          equipmentId: record.id,
          performedAt: daysAgo(5),
          description: "Valve inspection — replacement started",
          notes: "Pump offline until valve swap completes.",
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
    {
      blockCode: "5",
      type: "PRUNING" as const,
      status: "PENDING" as const,
      title: "Cane selection — 5-CM5",
      dueDate: daysFromNow(4),
    },
    {
      blockCode: "7",
      type: "INSPECTION" as const,
      status: "PENDING" as const,
      title: "Soil moisture check — 7-CM7",
      dueDate: daysFromNow(2),
    },
    {
      blockCode: "9",
      type: "SPRAYING" as const,
      status: "IN_PROGRESS" as const,
      title: "Sulfur application — 9-CS9",
      dueDate: daysFromNow(1),
      equipmentName: "Gregoire G65 Sprayer",
    },
    {
      blockCode: "15",
      type: "HARVESTING" as const,
      status: "PENDING" as const,
      title: "Harvest prep walk-through — 15-CS15",
      dueDate: daysFromNow(14),
    },
    {
      blockCode: "18",
      type: "INSPECTION" as const,
      status: "PENDING" as const,
      title: "Canopy thinning assessment — 18-ZN",
      dueDate: daysFromNow(7),
    },
    {
      blockCode: "20",
      type: "PRUNING" as const,
      status: "PENDING" as const,
      title: "Spur pruning — 20-CS20",
      dueDate: daysFromNow(6),
      equipmentName: "Kubota M5-111",
    },
    {
      blockCode: "22",
      type: "OTHER" as const,
      status: "PENDING" as const,
      title: "Trellis wire tension check — 22-VN22",
      dueDate: daysFromNow(10),
    },
    {
      blockCode: "25",
      type: "INSPECTION" as const,
      status: "COMPLETED" as const,
      title: "Winter damage survey — 25-NB",
      dueDate: daysAgo(5),
      completedAt: daysAgo(3),
    },
    {
      blockCode: "2",
      type: "PRUNING" as const,
      status: "PENDING" as const,
      title: "Spur pruning — 2-CF2",
      dueDate: daysFromNow(8),
      equipmentName: "Kubota M5-111",
    },
    {
      blockCode: "4",
      type: "INSPECTION" as const,
      status: "PENDING" as const,
      title: "Bud break count — 4-CH4",
      dueDate: daysFromNow(6),
    },
    {
      blockCode: "10",
      type: "SPRAYING" as const,
      status: "PENDING" as const,
      title: "Pre-bloom sulfur — 10-CS10",
      dueDate: daysFromNow(3),
      equipmentName: "Gregoire G65 Sprayer",
    },
    {
      blockCode: "14",
      type: "INSPECTION" as const,
      status: "IN_PROGRESS" as const,
      title: "Canopy assessment — 14-CM14",
      dueDate: daysFromNow(2),
    },
    {
      blockCode: "21",
      type: "PRUNING" as const,
      status: "PENDING" as const,
      title: "Cane thinning — 21-CM21",
      dueDate: daysFromNow(9),
    },
    {
      blockCode: "28",
      type: "HARVESTING" as const,
      status: "PENDING" as const,
      title: "Yield estimate walk — 28-SY28",
      dueDate: daysFromNow(21),
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
    {
      blockCode: "5",
      frequency: "weekly",
      method: "Drip",
      volume: 280,
      startDate: daysAgo(21),
    },
    {
      blockCode: "7",
      frequency: "biweekly",
      method: "Drip",
      volume: 350,
      startDate: daysAgo(14),
    },
    {
      blockCode: "9",
      frequency: "weekly",
      method: "Drip",
      volume: 420,
      startDate: daysAgo(7),
    },
    {
      blockCode: "15",
      frequency: "weekly",
      method: "Drip",
      volume: 400,
      startDate: daysAgo(28),
    },
    {
      blockCode: "20",
      frequency: "biweekly",
      method: "Drip",
      volume: 310,
      startDate: daysAgo(35),
    },
    {
      blockCode: "27",
      frequency: "weekly",
      method: "Drip",
      volume: 290,
      startDate: daysAgo(10),
    },
    {
      blockCode: "31",
      frequency: "biweekly",
      method: "Drip",
      volume: 260,
      startDate: daysAgo(50),
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

  const sampleIrrigationRecords = [
    {
      blockCode: "1",
      appliedAt: daysAgo(4),
      volume: 440,
      method: "Drip",
      notes: "Seed demo: weekly drip — block 1-CS1",
    },
    {
      blockCode: "5",
      appliedAt: daysAgo(5),
      volume: 275,
      method: "Drip",
      notes: "Seed demo: weekly drip — block 5-CM5",
    },
    {
      blockCode: "7",
      appliedAt: daysAgo(18),
      volume: 340,
      method: "Drip",
      notes: "Seed demo: biweekly drip — block 7-CM7 (overdue)",
    },
    {
      blockCode: "9",
      appliedAt: daysAgo(3),
      volume: 410,
      method: "Drip",
      notes: "Seed demo: weekly drip — block 9-CS9",
    },
    {
      blockCode: "13",
      appliedAt: daysAgo(16),
      volume: 305,
      method: "Drip",
      notes: "Seed demo: biweekly drip — block 13-MR13 (overdue)",
    },
    {
      blockCode: "15",
      appliedAt: daysAgo(6),
      volume: 395,
      method: "Drip",
      notes: "Seed demo: weekly drip — block 15-CS15",
    },
    {
      blockCode: "20",
      appliedAt: daysAgo(10),
      volume: 300,
      method: "Drip",
      notes: "Seed demo: biweekly drip — block 20-CS20",
    },
    {
      blockCode: "27",
      appliedAt: daysAgo(4),
      volume: 285,
      method: "Drip",
      notes: "Seed demo: weekly drip — block 27-MR27",
    },
    {
      blockCode: "32",
      appliedAt: daysAgo(12),
      volume: 250,
      method: "Drip",
      notes: "Seed demo: supplemental drip — block 32-MB32",
    },
  ];

  for (const record of sampleIrrigationRecords) {
    const blockId = estate.blockByCode[record.blockCode];
    if (!blockId) continue;

    const existing = await prisma.irrigationRecord.findFirst({
      where: { blockId, notes: record.notes },
    });

    if (!existing) {
      await prisma.irrigationRecord.create({
        data: {
          blockId,
          appliedAt: record.appliedAt,
          volume: record.volume,
          method: record.method,
          status: "APPLIED",
          notes: record.notes,
        },
      });
    }
  }

  await prisma.environmentalThreshold.upsert({
    where: { vineyardId: vineyard.id },
    update: {},
    create: {
      vineyardId: vineyard.id,
      frostWarningTempF: 32,
      heatStressTempF: 95,
    },
  });

  const block1Id = estate.blockByCode["1"];
  const block3Id = estate.blockByCode["3"];
  const existingPump = await prisma.irrigationPump.findFirst({
    where: { name: "Main station pump" },
  });
  if (!existingPump) {
    await prisma.irrigationPump.create({
      data: {
        name: "Main station pump",
        gpsPoint: {
          type: "Point",
          coordinates: [ESTATE_CENTER.lng, ESTATE_CENTER.lat],
        },
        flowCapacity: 150,
        servicedBlockIds: [block1Id, block3Id].filter(Boolean) as string[],
        notes: "Demo pump at estate GIS centroid for map overlay testing.",
      },
    });
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
  console.log(`  Demo schedules: ${sampleSchedules.length}`);
  console.log(
    `  Irrigation records: ${sampleIrrigationRecords.length} demo + 3 imported (blocks 3, 31, 32)`,
  );
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
