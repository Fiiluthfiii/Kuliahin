const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create or get user
  const user = await prisma.user.upsert({
    where: { email: 'dimas.pratama@example.com' },
    update: {},
    create: {
      name: 'Dimas Pratama',
      email: 'dimas.pratama@example.com',
    },
  });

  console.log('✅ User created:', user.name);

  // Create courses
  const courses = [
    {
      name: 'Pemrograman Web Lanjut',
      code: 'TIF301',
      lecturer: 'Dr. Ir. Budi Santoso, M.Kom',
      sks: 3,
      color: '#4F46E5',
      semester: 'Genap 2024/2025',
    },
    {
      name: 'Basis Data Lanjut',
      code: 'TIF302',
      lecturer: 'Dr. Siti Aminah, M.T',
      sks: 3,
      color: '#DC2626',
      semester: 'Genap 2024/2025',
    },
    {
      name: 'Kecerdasan Buatan',
      code: 'TIF303',
      lecturer: 'Prof. Dr. Ahmad Hidayat, Ph.D',
      sks: 3,
      color: '#059669',
      semester: 'Genap 2024/2025',
    },
    {
      name: 'Sistem Terdistribusi',
      code: 'TIF304',
      lecturer: 'Prof. Maya Indah, Ph.D',
      sks: 3,
      color: '#7C3AED',
      semester: 'Genap 2024/2025',
    },
    {
      name: 'Keamanan Siber',
      code: 'TIF305',
      lecturer: 'Dr. Rizki Pratama, M.Kom',
      sks: 3,
      color: '#EA580C',
      semester: 'Genap 2024/2025',
    },
    {
      name: 'Manajemen Proyek TI',
      code: 'TIF306',
      lecturer: 'Ir. Dewi Lestari, M.M',
      sks: 3,
      color: '#0891B2',
      semester: 'Genap 2024/2025',
    },
  ];

  const createdCourses = [];
  for (const courseData of courses) {
    const course = await prisma.course.create({
      data: {
        ...courseData,
        userId: user.id,
      },
    });
    createdCourses.push(course);
    console.log(`✅ Course created: ${course.name}`);
  }

  // Create schedules
  const schedules = [
    // Senin
    { courseIndex: 0, dayOfWeek: 'Senin', startHour: 8, startMinute: 0, endHour: 10, endMinute: 30, room: 'Lab Komputer Terpadu 3' },
    { courseIndex: 3, dayOfWeek: 'Senin', startHour: 13, startMinute: 0, endHour: 15, endMinute: 30, room: 'Ruang Teori 402 (Gedung B)' },
    // Selasa
    { courseIndex: 1, dayOfWeek: 'Selasa', startHour: 8, startMinute: 0, endHour: 10, endMinute: 30, room: 'Lab Database 1' },
    { courseIndex: 4, dayOfWeek: 'Selasa', startHour: 13, startMinute: 0, endHour: 15, endMinute: 30, room: 'Lab Keamanan Jaringan' },
    // Rabu
    { courseIndex: 0, dayOfWeek: 'Rabu', startHour: 8, startMinute: 0, endHour: 10, endMinute: 30, room: 'Lab Komputer Terpadu 3' },
    { courseIndex: 3, dayOfWeek: 'Rabu', startHour: 13, startMinute: 0, endHour: 15, endMinute: 30, room: 'Ruang Teori 402 (Gedung B)' },
    // Kamis
    { courseIndex: 2, dayOfWeek: 'Kamis', startHour: 8, startMinute: 0, endHour: 10, endMinute: 30, room: 'Lab AI & Machine Learning' },
    { courseIndex: 5, dayOfWeek: 'Kamis', startHour: 13, startMinute: 0, endHour: 15, endMinute: 30, room: 'Ruang Seminar 201' },
    // Jumat
    { courseIndex: 1, dayOfWeek: 'Jumat', startHour: 8, startMinute: 0, endHour: 10, endMinute: 30, room: 'Lab Database 1' },
  ];

  const createdSchedules = [];
  for (const scheduleData of schedules) {
    const today = new Date();
    const startTime = new Date(today);
    startTime.setHours(scheduleData.startHour, scheduleData.startMinute, 0, 0);
    
    const endTime = new Date(today);
    endTime.setHours(scheduleData.endHour, scheduleData.endMinute, 0, 0);

    const schedule = await prisma.schedule.create({
      data: {
        courseId: createdCourses[scheduleData.courseIndex].id,
        dayOfWeek: scheduleData.dayOfWeek,
        startTime,
        endTime,
        room: scheduleData.room,
      },
    });
    createdSchedules.push(schedule);
    console.log(`✅ Schedule created: ${scheduleData.dayOfWeek} - ${createdCourses[scheduleData.courseIndex].name}`);
  }

  // Create attendance records (past 4 weeks)
  const today = new Date();
  for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
    for (const schedule of createdSchedules) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - (weekOffset * 7));
      
      // Random attendance (90% chance of attending)
      if (Math.random() < 0.9) {
        await prisma.attendance.create({
          data: {
            userId: user.id,
            courseId: schedule.courseId,
            scheduleId: schedule.id,
            sessionDate: targetDate,
            photoKey: `attendance_${schedule.id}_${targetDate.getTime()}.jpg`,
            status: 'hadir',
          },
        });
      }
    }
  }
  console.log('✅ Attendance records created');

  // Create tasks
  const tasks = [
    {
      courseIndex: 0,
      title: 'Implementasi RESTful API Authentication JWT & Role-based',
      description: 'Buat sistem autentikasi lengkap dengan JWT dan role-based access control menggunakan Node.js dan Express',
      deadlineHours: 12,
      priority: 'high',
    },
    {
      courseIndex: 3,
      title: 'Perancangan Algoritma Raft Consensus & Paper Review',
      description: 'Analisis dan review paper tentang algoritma Raft, serta implementasi simulasi sederhana',
      deadlineHours: 48,
      priority: 'medium',
    },
    {
      courseIndex: 1,
      title: 'Normalisasi Skema Database PostgreSQL B2B E-Commerce',
      description: 'Desain dan normalisasi database untuk sistem e-commerce B2B hingga 3NF',
      deadlineHours: 96,
      priority: 'medium',
    },
    {
      courseIndex: 2,
      title: 'Training Model Neural Network untuk Klasifikasi Gambar',
      description: 'Implementasi CNN untuk klasifikasi dataset CIFAR-10 menggunakan TensorFlow',
      deadlineHours: 168,
      priority: 'medium',
    },
    {
      courseIndex: 4,
      title: 'Penetration Testing Report - Web Application Security',
      description: 'Lakukan penetration testing pada aplikasi web dummy dan buat laporan lengkap',
      deadlineHours: 240,
      priority: 'low',
    },
  ];

  for (const taskData of tasks) {
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + taskData.deadlineHours);
    deadline.setHours(23, 59, 0, 0);

    await prisma.task.create({
      data: {
        userId: user.id,
        courseId: createdCourses[taskData.courseIndex].id,
        title: taskData.title,
        description: taskData.description,
        deadline,
        priority: taskData.priority,
        status: 'todo',
      },
    });
    console.log(`✅ Task created: ${taskData.title}`);
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
