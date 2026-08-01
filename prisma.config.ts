import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: "postgresql://postgres.rnihyjukjljlqcquipuz:LGmy9im2tEcwHv34@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres",
  },
});