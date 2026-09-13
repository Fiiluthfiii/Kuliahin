// Simple Node.js script to run database migrations
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runMigration() {
  console.log('🔄 Running database migration...\n');

  try {
    // First, check if we can connect to database
    console.log('🔌 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!\n');

    // Read the SQL migration file
    const sqlFile = path.join(__dirname, 'prisma', 'migrations', 'all-profile-fields.sql');
    
    if (!fs.existsSync(sqlFile)) {
      console.error(`❌ Migration file not found: ${sqlFile}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split by semicolon and filter out empty statements and comments
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => {
        if (!s) return false;
        if (s.startsWith('--')) return false;
        if (s.toUpperCase().startsWith('SELECT')) return false;
        return true;
      });

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          const displayStatement = statement.length > 80 
            ? statement.substring(0, 80) + '...' 
            : statement;
          
          console.log(`⚙️  [${i + 1}/${statements.length}] ${displayStatement}`);
          await prisma.$executeRawUnsafe(statement + ';');
          console.log(`   ✅ Success`);
          successCount++;
        } catch (error) {
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate column')) {
            console.log(`   ⏭️  Skipped (already exists)`);
            skipCount++;
          } else {
            console.error(`   ❌ Failed: ${error.message}`);
            throw error;
          }
        }
        console.log('');
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);
    console.log(`   ❌ Failed: ${statements.length - successCount - skipCount}`);

    // Verify the columns exist
    console.log('\n🔍 Verifying columns in User table...\n');
    
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

    if (result && result.length > 0) {
      console.log('✅ Columns found in User table:');
      console.table(result);
    } else {
      console.error('❌ No new columns found! Migration may have failed.');
      process.exit(1);
    }

    // Test if we can actually use these columns
    console.log('\n🧪 Testing column access...');
    const testUser = await prisma.user.findFirst({
      select: {
        id: true,
        whatsapp: true,
        faculty: true,
        university: true
      }
    });
    
    if (testUser !== null) {
      console.log('✅ Columns are accessible!');
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 New fields added to User table:');
    console.log('   ✅ whatsapp, nickname, bio');
    console.log('   ✅ yearEnrolled, currentSemester, academicAdvisor, targetIps');
    console.log('   ✅ faculty, university');
    console.log('\n🔄 Now restart your dev server:');
    console.log('   1. Press Ctrl+C in the terminal running "npm run dev"');
    console.log('   2. Run: npm run dev');
    console.log('   3. Test saving profile at http://localhost:3000/settings');

  } catch (error) {
    console.error('\n❌ Migration failed!');
    console.error('\nError Details:');
    console.error('  Name:', error.name);
    console.error('  Message:', error.message);
    
    if (error.code) {
      console.error('  Code:', error.code);
    }
    
    if (error.meta) {
      console.error('  Meta:', JSON.stringify(error.meta, null, 2));
    }

    console.error('\n📋 Troubleshooting:');
    console.error('  1. Check your DATABASE_URL in .env file');
    console.error('  2. Make sure PostgreSQL is running');
    console.error('  3. Verify database connection with: npx prisma db pull');
    console.error('\n  If using Neon database, check connection at:');
    console.error('  https://console.neon.tech/');
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
console.log('═'.repeat(60));
console.log('  DATABASE MIGRATION SCRIPT');
console.log('═'.repeat(60));
console.log('');

runMigration().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
