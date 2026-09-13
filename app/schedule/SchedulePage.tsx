import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';
import { formatDate, extractInitials, getCurrentSemester } from '@/lib/utils';
import ScheduleClient from './ScheduleClient';

export default async function SchedulePage() {
  // Get session
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Fetch user data with courses and schedules
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      courses: {
        include: {
          schedules: {
            orderBy: { startTime: 'asc' }
          }
        }
      }
    }
  });

  if (!user) {
    redirect('/login');
  }

  // Calculate total SKS
  const totalSKS = user.courses.reduce((sum, course) => sum + (course.sks || 0), 0);

  // Format data for client
  const today = new Date();
  const formattedDate = formatDate(today);
  const semester = getCurrentSemester();
  const userInitials = extractInitials(user.name || 'User');
  
  // Get Indonesian day name
  const dayOfWeek = today.toLocaleDateString('id-ID', { weekday: 'long' });
  
  console.log('🔍 DEBUG Schedule Page:', {
    today: today.toString(),
    dayOfWeek,
    totalSchedules: user.courses.flatMap(c => c.schedules).length,
    scheduleDays: user.courses.flatMap(c => c.schedules).map(s => s.dayOfWeek)
  });

  // Transform schedules to usable format
  const schedulesData = user.courses.flatMap(course => 
    course.schedules.map(schedule => ({
      id: schedule.id,
      courseId: course.id,
      courseName: course.name,
      courseCode: course.code || '',
      sks: course.sks || 0,
      lecturer: course.lecturer || 'Dosen belum ditentukan',
      color: course.color || 'blue',
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime.toISOString(),
      endTime: schedule.endTime.toISOString(),
      room: schedule.room || 'Ruang belum ditentukan'
    }))
  );

  // Get today's schedules
  const todaySchedules = schedulesData.filter(s => s.dayOfWeek === dayOfWeek);

  // Calculate stats
  const totalClassesPerWeek = schedulesData.length;
  const totalHoursPerWeek = schedulesData.reduce((sum, schedule) => {
    const start = new Date(schedule.startTime);
    const end = new Date(schedule.endTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return sum + hours;
  }, 0);

  return (
    <ScheduleClient
      userData={{
        name: user.name || 'User',
        nickname: user.nickname || null,
        email: user.email,
        image: user.image,
        major: user.major || 'Teknik Informatika'
      }}
      schedules={schedulesData}
      todaySchedules={todaySchedules}
      stats={{
        totalSKS,
        totalClasses: totalClassesPerWeek,
        todayClasses: todaySchedules.length,
        totalHoursPerWeek: totalHoursPerWeek.toFixed(1),
        avgAttendance: '0'
      }}
      formattedDate={formattedDate}
      semester={semester}
      userInitials={userInitials}
      currentDay={dayOfWeek}
    />
  );
}
