import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs"; // Make sure to install: npm install bcryptjs @types/bcryptjs

const connectionString =
  "postgresql://postgres.rnihyjukjljlqcquipuz:LGmy9im2tEcwHv34@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Seed Admin User
  const adminEmail = "admin@example.com";
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Using upsert prevents errors if you run the seed multiple times
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
    },
    create: {
      email: adminEmail,
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin user seeded:", admin.email);

  // 2. Seed Love Notes
  await prisma.loveNote.createMany({
    data: [
      {
        title: "Why You Mean The World To Me",
        content:
          "Every moment with you brings so much warmth and happiness into my life.",
        reason: "Just wanted to remind you how special you are.",
      },
    ],
  });

  // 3. Seed Couple Goals
  await prisma.goal.createMany({
    data: [
      {
        text: "Sunset picnic at the riverside",
        completed: false,
      },
      {
        text: "Baking cookies together from scratch",
        completed: false,
      },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
