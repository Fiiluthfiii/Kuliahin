const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkScheduleTimes() {
  try {
    console.log('🔍 Memeriksa jadwal Intelegensi Buatan...\n');
    
    // Find all schedules with "Intelegensi" or "Buatan"
    const schedules = await prisma.schedule.findMany({
      where: {
        course: {
          name: {
            contains: 'Intelegensi',
            mode: 'insensitive'
          }
        }
      },
      include: {
        course: true
      }
    });

    if (schedules.length === 0) {
      console.log('❌ Tidak ditemukan jadwal Intelegensi Buatan');
      await prisma.$disconnect();
      return;
    }

    schedules.forEach((schedule, index) => {
      console.log(`\n📅 Schedule ${index + 1}:`);
      console.log('   Mata Kuliah:', schedule.course.name);
      console.log('   Hari:', schedule.dayOfWeek);
      console.log('   ID:', schedule.id);
      console.log('   Start Time (UTC):', schedule.startTime.toISOString());
      console.log('   End Time (UTC):', schedule.endTime.toISOString());
      console.log('   Start Time (Local):', schedule.startTime.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
      console.log('   End Time (Local):', schedule.endTime.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));
      
      const startHour = schedule.startTime.getUTCHours();
      const endHour = schedule.endTime.getUTCHours();
      console.log('   Hour (UTC):', startHour, '-', endHour);
      console.log('   Hour (WIB = UTC+7):', (startHour + 7) % 24, '-', (endHour + 7) % 24);
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkScheduleTimes();
