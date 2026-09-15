const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listAllSchedules() {
  try {
    console.log('🔍 Mengambil semua jadwal...\n');
    
    const schedules = await prisma.schedule.findMany({
      include: {
        course: true
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    if (schedules.length === 0) {
      console.log('❌ Tidak ada jadwal di database');
      await prisma.$disconnect();
      return;
    }

    console.log(`📊 Total: ${schedules.length} jadwal\n`);

    schedules.forEach((schedule, index) => {
      const startDate = new Date(schedule.startTime);
      const endDate = new Date(schedule.endTime);
      
      // Get Jakarta time
      const startHourWIB = startDate.getUTCHours() + 7;
      const startMinWIB = startDate.getUTCMinutes();
      const endHourWIB = endDate.getUTCHours() + 7;
      const endMinWIB = endDate.getUTCMinutes();
      
      console.log(`${index + 1}. ${schedule.course.name}`);
      console.log(`   ID: ${schedule.id}`);
      console.log(`   Hari: ${schedule.dayOfWeek}`);
      console.log(`   Waktu di DB (UTC): ${startDate.getUTCHours()}:${String(startDate.getUTCMinutes()).padStart(2, '0')} - ${endDate.getUTCHours()}:${String(endDate.getUTCMinutes()).padStart(2, '0')}`);
      console.log(`   Waktu ditampilkan (WIB): ${startHourWIB}:${String(startMinWIB).padStart(2, '0')} - ${endHourWIB}:${String(endMinWIB).padStart(2, '0')}`);
      console.log(`   Ruang: ${schedule.room || '-'}`);
      console.log('');
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

listAllSchedules();
