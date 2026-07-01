import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const RED_MOUNTAIN_CENTER = { lat: 46.214, lng: -119.328 };

function blockPolygon(
  blockIndex: number,
  latOffset: number,
  lngOffset: number,
): object {
  const baseLat = RED_MOUNTAIN_CENTER.lat + latOffset;
  const baseLng = RED_MOUNTAIN_CENTER.lng + lngOffset;
  const size = 0.0012;

  return {
    type: "Polygon",
    coordinates: [
      [
        [baseLng, baseLat],
        [baseLng + size, baseLat],
        [baseLng + size, baseLat + size * 0.7],
        [baseLng, baseLat + size * 0.7],
        [baseLng, baseLat],
      ],
    ],
  };
}

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
    update: {},
    create: {
      id: "cooper-estate-vineyards",
      name: "Cooper Estate Vineyards",
      location: "Red Mountain, Washington",
    },
  });

  const varieties = await Promise.all(
    [
      { name: "Cabernet Sauvignon", color: "RED" as const },
      { name: "Merlot", color: "RED" as const },
      { name: "Syrah", color: "RED" as const },
      { name: "Cabernet Franc", color: "RED" as const },
      { name: "Malbec", color: "RED" as const },
      { name: "Chardonnay", color: "WHITE" as const },
      { name: "Sauvignon Blanc", color: "WHITE" as const },
    ].map((v) =>
      prisma.variety.upsert({
        where: { name: v.name },
        update: {},
        create: v,
      }),
    ),
  );

  const varietyByName = Object.fromEntries(varieties.map((v) => [v.name, v]));

  const blocksData = [
    {
      code: "CEV-01",
      name: "North Ridge Cabernet",
      acreage: 4.2,
      variety: "Cabernet Sauvignon",
      vineCount: 3360,
      yearPlanted: 2015,
      rootstock: "110R",
      latOffset: 0.002,
      lngOffset: -0.003,
    },
    {
      code: "CEV-02",
      name: "East Slope Merlot",
      acreage: 3.8,
      variety: "Merlot",
      vineCount: 3040,
      yearPlanted: 2016,
      rootstock: "3309C",
      latOffset: 0.001,
      lngOffset: -0.001,
    },
    {
      code: "CEV-03",
      name: "Sunset Syrah",
      acreage: 2.5,
      variety: "Syrah",
      vineCount: 2000,
      yearPlanted: 2018,
      rootstock: "110R",
      latOffset: 0.0,
      lngOffset: 0.001,
    },
    {
      code: "CEV-04",
      name: "Valley Floor Cab Franc",
      acreage: 3.1,
      variety: "Cabernet Franc",
      vineCount: 2480,
      yearPlanted: 2017,
      rootstock: "101-14",
      latOffset: -0.001,
      lngOffset: -0.002,
    },
    {
      code: "CEV-05",
      name: "South Bench Malbec",
      acreage: 2.9,
      variety: "Malbec",
      vineCount: 2320,
      yearPlanted: 2019,
      rootstock: "110R",
      latOffset: -0.002,
      lngOffset: 0.0,
    },
    {
      code: "CEV-06",
      name: "Ridge Top Chardonnay",
      acreage: 2.2,
      variety: "Chardonnay",
      vineCount: 1760,
      yearPlanted: 2020,
      rootstock: "3309C",
      latOffset: 0.0015,
      lngOffset: 0.002,
    },
    {
      code: "CEV-07",
      name: "Creek Side Sauvignon",
      acreage: 1.8,
      variety: "Sauvignon Blanc",
      vineCount: 1440,
      yearPlanted: 2021,
      rootstock: "101-14",
      latOffset: -0.0015,
      lngOffset: 0.0015,
    },
    {
      code: "CEV-08",
      name: "Heritage Block Cabernet",
      acreage: 5.0,
      variety: "Cabernet Sauvignon",
      vineCount: 4000,
      yearPlanted: 2012,
      rootstock: "110R",
      latOffset: 0.003,
      lngOffset: 0.0,
      status: "ACTIVE" as const,
      notes: "Original estate planting. Premium tier fruit.",
    },
  ];

  const blockByCode: Record<string, string> = {};

  for (const [index, blockData] of blocksData.entries()) {
    const variety = varietyByName[blockData.variety];
    const geometry = blockPolygon(index, blockData.latOffset, blockData.lngOffset);
    const centerLat = RED_MOUNTAIN_CENTER.lat + blockData.latOffset + 0.00042;
    const centerLng = RED_MOUNTAIN_CENTER.lng + blockData.lngOffset + 0.0006;

    const block = await prisma.block.upsert({
      where: {
        vineyardId_code: {
          vineyardId: vineyard.id,
          code: blockData.code,
        },
      },
      update: {},
      create: {
        vineyardId: vineyard.id,
        code: blockData.code,
        name: blockData.name,
        acreage: blockData.acreage,
        status: blockData.status ?? "ACTIVE",
        notes: blockData.notes,
        plantings: {
          create: {
            varietyId: variety.id,
            vineCount: blockData.vineCount,
            yearPlanted: blockData.yearPlanted,
            rootstock: blockData.rootstock,
            rowSpacing: 8,
            vineSpacing: 4,
          },
        },
        mapFeature: {
          create: {
            geometry,
            centerLat,
            centerLng,
          },
        },
      },
    });

    blockByCode[blockData.code] = block.id;

    await prisma.note.create({
      data: {
        blockId: block.id,
        authorId: admin.id,
        content: `Seed note for ${blockData.name} — ${blockData.variety}, planted ${blockData.yearPlanted}.`,
      },
    });
  }

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
      blockCode: "CEV-01",
      type: "PRUNING" as const,
      status: "IN_PROGRESS" as const,
      title: "Winter cane pruning — North Ridge",
      dueDate: daysFromNow(3),
      equipmentName: "Kubota M5-111",
    },
    {
      blockCode: "CEV-02",
      type: "SPRAYING" as const,
      status: "PENDING" as const,
      title: "Early season fungicide application",
      dueDate: daysFromNow(1),
      equipmentName: "Gregoire G65 Sprayer",
    },
    {
      blockCode: "CEV-03",
      type: "INSPECTION" as const,
      status: "PENDING" as const,
      title: "Bud break inspection",
      dueDate: daysFromNow(5),
    },
    {
      blockCode: "CEV-04",
      type: "HARVESTING" as const,
      status: "PENDING" as const,
      title: "Harvest prep walkthrough",
      dueDate: daysFromNow(14),
    },
    {
      blockCode: "CEV-08",
      type: "INSPECTION" as const,
      status: "COMPLETED" as const,
      title: "Canopy health check — Heritage Block",
      dueDate: daysAgo(2),
      completedAt: daysAgo(1),
    },
  ];

  for (const taskData of sampleTasks) {
    const blockId = blockByCode[taskData.blockCode];
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
      blockCode: "CEV-01",
      frequency: "weekly",
      method: "Drip",
      volume: 450,
      startDate: daysAgo(60),
    },
    {
      blockCode: "CEV-02",
      frequency: "weekly",
      method: "Drip",
      volume: 380,
      startDate: daysAgo(45),
    },
    {
      blockCode: "CEV-03",
      frequency: "biweekly",
      method: "Drip",
      volume: 320,
      startDate: daysAgo(30),
    },
    {
      blockCode: "CEV-08",
      frequency: "weekly",
      method: "Drip",
      volume: 520,
      startDate: daysAgo(90),
    },
  ];

  for (const sched of sampleSchedules) {
    const blockId = blockByCode[sched.blockCode];
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

  const sampleRecords = [
    {
      blockCode: "CEV-01",
      appliedAt: daysAgo(5),
      volume: 440,
      duration: 120,
      method: "Drip",
      status: "APPLIED" as const,
    },
    {
      blockCode: "CEV-02",
      appliedAt: daysAgo(10),
      volume: 375,
      duration: 100,
      method: "Drip",
      status: "APPLIED" as const,
    },
    {
      blockCode: "CEV-03",
      appliedAt: daysAgo(20),
      volume: 310,
      duration: 90,
      method: "Drip",
      status: "APPLIED" as const,
      notes: "Slightly under target volume — check pressure.",
    },
    {
      blockCode: "CEV-08",
      appliedAt: daysAgo(12),
      volume: 500,
      duration: 140,
      method: "Drip",
      status: "APPLIED" as const,
    },
    {
      blockCode: "CEV-04",
      appliedAt: daysAgo(3),
      volume: 200,
      duration: 60,
      method: "Drip",
      status: "MISSED" as const,
      notes: "Valve stuck — irrigation did not run as scheduled.",
    },
  ];

  for (const rec of sampleRecords) {
    const blockId = blockByCode[rec.blockCode];
    if (!blockId) continue;

    const existing = await prisma.irrigationRecord.findFirst({
      where: {
        blockId,
        appliedAt: rec.appliedAt,
        status: rec.status,
      },
    });

    if (!existing) {
      await prisma.irrigationRecord.create({
        data: {
          blockId,
          appliedAt: rec.appliedAt,
          volume: rec.volume,
          duration: rec.duration,
          method: rec.method,
          status: rec.status,
          notes: rec.notes,
        },
      });
    }
  }

  console.log("Seed complete:");
  console.log(`  Vineyard: ${vineyard.name}`);
  console.log(`  Blocks: ${blocksData.length}`);
  console.log(`  Equipment: ${sampleEquipment.length}`);
  console.log(`  Tasks: ${sampleTasks.length}`);
  console.log(`  Irrigation schedules: ${sampleSchedules.length}`);
  console.log(`  Irrigation records: ${sampleRecords.length}`);
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
