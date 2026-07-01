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

    await prisma.note.create({
      data: {
        blockId: block.id,
        authorId: admin.id,
        content: `Seed note for ${blockData.name} — ${blockData.variety}, planted ${blockData.yearPlanted}.`,
      },
    });
  }

  console.log("Seed complete:");
  console.log(`  Vineyard: ${vineyard.name}`);
  console.log(`  Blocks: ${blocksData.length}`);
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
