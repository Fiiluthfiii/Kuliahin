const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runMigration() {
  try {
    // Execute each ALTER TABLE separately
    await prisma.$executeRawUnsafe('ALTER TABLE "Course" ADD COLUMN "totalSessions" INTEGER');
    console.log('✅ Added totalSessions column');
    
    await prisma.$executeRawUnsafe('ALTER TABLE "Course" ADD COLUMN "maxAbsences" INTEGER');
    console.log('✅ Added maxAbsences column');
    
    console.log('✅ Migration completed successfully');
    await prisma.$disconnect();
  } catch (err) {
    console.error('❌ Migration failed:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

runMigration();
