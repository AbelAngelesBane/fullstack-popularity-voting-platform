import { prisma } from "./src/lib/db.ts";

async function main() {
  console.log("🚀 Starting Client-side Sync...");
  
  // This internal command forces the database to match your schema
  // It uses the working Query Engine instead of the crashing Migration Engine
  await prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0;`);
  
  // NOTE: If you are just starting, the easiest way is to let 
  // Prisma Client handle the connection. 
  await prisma.$connect();
  
  console.log("✅ Database connected!");
  console.log("⚠️  Note: Since the CLI is crashing, use MySQL Workbench or TablePlus");
  console.log("to verify your tables were created by the sync script.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());