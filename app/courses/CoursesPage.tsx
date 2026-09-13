import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';
import { formatDate, extractInitials, getCurrentSemester } from '@/lib/utils';
import CoursesClient from './CoursesClient';

export default async function CoursesPage() {
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
          },
          tasks: {
            where: {
              status: { not: 'completed' }
            }
          },
          attendances: {
            where: {
              status: 'hadir'
            }
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
  
  // Get display name (nickname or first name)
  const displayName = user.nickname || user.name?.split(' ')[0] || 'User';

  // Transform courses to usable format
  const coursesData = user.courses.map(course => {
    // Get primary schedule (first one)
    const primarySchedule = course.schedules[0];
    
    // Calculate attendance from actual attendance records
    const totalSessions = course.totalSessions || 0;
    const attendedSessions = course.attendances?.filter(a => a.status === 'hadir').length || 0;
    const attendancePercent = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;
    const attendanceText = totalSessions > 0 
      ? `${attendancePercent}% (${attendedSessions}/${totalSessions} Sesi)` 
      : 'Belum ada data';
    
    // Count active tasks (incomplete tasks for this course)
    const activeTasks = course.tasks?.filter(t => t.status !== 'completed').length || 0;
    const taskText = activeTasks > 0 ? `${activeTasks} Tugas Aktif` : 'Tidak ada tugas';
    const taskTone = activeTasks > 0 ? 'red' : 'blue';
    const taskExtra = activeTasks > 0 ? 'Segera' : '';
    
    return {
      id: course.id,
      code: course.code || 'N/A',
      credits: `${course.sks || 0} SKS`,
      title: course.name,
      lecturer: course.lecturer || 'Dosen belum ditentukan',
      day: primarySchedule?.dayOfWeek || '-',
      time: primarySchedule ? `${new Date(primarySchedule.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - ${new Date(primarySchedule.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB` : '-',
      room: primarySchedule?.room || 'Ruang belum ditentukan',
      attendance: attendanceText,
      percent: attendancePercent,
      task: taskText,
      taskTone,
      taskExtra,
      color: course.color || 'blue',
      schedules: course.schedules.map(schedule => ({
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime.toISOString(),
        endTime: schedule.endTime.toISOString(),
        room: schedule.room || 'TBA'
      }))
    };
  });

  // Group courses by day for weekly spread
  const weeklyData = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(day => {
    const dayCourses = coursesData.filter(course => 
      course.schedules.some(schedule => schedule.dayOfWeek === day)
    );
    
    return {
      day,
      count: dayCourses.length > 0 ? `${dayCourses.length} MK` : 'Libur',
      cards: dayCourses.map(course => {
        const daySchedule = course.schedules.find(s => s.dayOfWeek === day);
        const startTime = daySchedule ? new Date(daySchedule.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';
        const endTime = daySchedule ? new Date(daySchedule.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';
        
        return {
          name: course.title,
          time: `${startTime} - ${endTime}`,
          tone: course.color
        };
      })
    };
  });

  // Calculate total hours per week
  const totalHoursPerWeek = user.courses.reduce((total, course) => {
    return total + course.schedules.reduce((courseTotal, schedule) => {
      const start = new Date(schedule.startTime);
      const end = new Date(schedule.endTime);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return courseTotal + hours;
    }, 0);
  }, 0);

  // Target IPS (placeholder - could be from user settings)
  const targetIPS = user.targetIps || 3.85;

  return (
    <CoursesClient
      userData={{
        name: user.name || 'User',
        nickname: user.nickname || null,
        email: user.email,
        image: user.image,
        major: user.major || 'Teknik Informatika'
      }}
      courses={coursesData}
      weeklyData={weeklyData}
      stats={{
        totalSKS,
        totalCourses: coursesData.length,
        totalHoursPerWeek: totalHoursPerWeek.toFixed(1),
        targetIPS: targetIPS.toFixed(2)
      }}
      formattedDate={formattedDate}
      semester={semester}
      userInitials={userInitials}
      displayName={displayName}
    />
  );
}
