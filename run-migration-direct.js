// Direct migration without reading file
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runMigration() {
  console.log('🔄 Running database migration directly...\n');

  try {
    console.log('🔌 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connected!\n');

    const migrations = [
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT',
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "nickname" TEXT',
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bio" TEXT',
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "yearEnrolled" TEXT',
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "currentSemester" TEXT',
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "academicAdvisor" TEXT',
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "targetIps" DOUBLE PRECISION',
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "faculty" TEXT',
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "university" TEXT'
    ];

    console.log(`📝 Executing ${migrations.length} migrations...\n`);

    for (let i = 0; i < migrations.length; i++) {
      const sql = migrations[i];
      const fieldName = sql.match(/"([^"]+)"/g)[1].replace(/"/g, '');
      
      try {
        console.log(`⚙️  [${i + 1}/${migrations.length}] Adding column: ${fieldName}`);
        await prisma.$executeRawUnsafe(sql);
        console.log(`   ✅ Success`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ⏭️  Already exists`);
        } else {
          console.log(`   ❌ Error: ${error.message}`);
        }
      }
    }

    console.log('\n🔍 Verifying columns...');
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
        AND column_name IN (
          'whatsapp', 'nickname', 'bio', 
          'yearEnrolled', 'currentSemester', 'academicAdvisor', 'targetIps',
          'faculty', 'university'
        )
      ORDER BY column_name
    `;

    console.log(`\n✅ Found ${result.length} columns:`);
    result.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });

    if (result.length === 9) {
      console.log('\n🎉 All migrations successful!');
      console.log('\n📋 Next steps:');
      console.log('   1. Run: npx prisma generate');
      console.log('   2. Restart dev server (Ctrl+C then npm run dev)');
      console.log('   3. Test at: http://localhost:3000/settings');
      return true;
    } else {
      console.log(`\n⚠️  Expected 9 columns but found ${result.length}`);
      return false;
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

runMigration().then(success => {
  process.exit(success ? 0 : 1);
});
