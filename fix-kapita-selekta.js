const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixKapitaSelekta() {
  try {
    console.log('🔍 Mencari mata kuliah Kapita Selekta...');
    
    // Find Kapita Selekta course
    const course = await prisma.course.findFirst({
      where: {
        name: {
          contains: 'Kapita',
          mode: 'insensitive'
        }
      }
    });

    if (!course) {
      console.error('❌ Mata kuliah Kapita Selekta tidak ditemukan!');
      console.log('📝 Silakan pastikan nama mata kuliah mengandung kata "Kapita"');
      await prisma.$disconnect();
      return;
    }

    console.log('✅ Ditemukan:', course.name);
    console.log('📊 Data saat ini:');
    console.log('   - totalSessions:', course.totalSessions || 'NULL');
    console.log('   - maxAbsences:', course.maxAbsences || 'NULL');

    // Update using raw SQL to bypass Prisma Client type checking
    await prisma.$executeRaw`
      UPDATE "Course" 
      SET "totalSessions" = 16, "maxAbsences" = 3
      WHERE id = ${course.id}
    `;

    console.log('\n✅ BERHASIL UPDATE!');
    console.log('   - totalSessions: 16 ✓');
    console.log('   - maxAbsences: 3 ✓');
    console.log('\n🎉 Silakan refresh halaman Dashboard untuk lihat perubahan!');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

fixKapitaSelekta();
