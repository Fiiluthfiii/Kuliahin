import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        courses: {
          include: {
            schedules: true,
            tasks: {
              where: {
                status: { not: 'completed' }
              },
              orderBy: {
                deadline: 'asc'
              }
            },
            attendances: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get today's date
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('id-ID', { weekday: 'long' });

    // Get today's schedule
    const todaySchedules = await prisma.schedule.findMany({
      where: {
        course: {
          userId: userId
        },
        dayOfWeek: dayOfWeek
      },
      include: {
        course: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    // Get all pending tasks
    const allTasks = await prisma.task.findMany({
      where: {
        userId: userId,
        status: { not: 'completed' }
      },
      include: {
        course: true
      },
      orderBy: {
        deadline: 'asc'
      }
    });

    // Calculate attendance statistics
    const attendanceStats = await Promise.all(
      user.courses.map(async (course) => {
        const totalSessions = await prisma.schedule.findMany({
          where: { courseId: course.id }
        });

        const attendedSessions = await prisma.attendance.findMany({
          where: {
            courseId: course.id,
            userId: userId,
            status: 'hadir'
          }
        });

        const scheduleCount = totalSessions.length;
        const attendedCount = attendedSessions.length;
        const percentage = scheduleCount > 0 ? (attendedCount / scheduleCount) * 100 : 100;
        const safeAbsences = Math.floor(scheduleCount * 0.25); // 25% max absences
        const currentAbsences = scheduleCount - attendedCount;
        const remainingSafeAbsences = Math.max(0, safeAbsences - currentAbsences);

        return {
          courseId: course.id,
          courseName: course.name,
          percentage: percentage.toFixed(0),
          attended: attendedCount,
          total: scheduleCount,
          remainingSafeAbsences,
          status: percentage >= 90 ? 'Sempurna' : percentage >= 80 ? 'Aman' : percentage >= 75 ? 'Waspada' : 'Bahaya',
          tone: percentage >= 90 ? 'green' : percentage >= 80 ? 'blue' : percentage >= 75 ? 'orange' : 'red'
        };
      })
    );

    // Calculate overall attendance
    const totalAttendance = attendanceStats.reduce((sum, stat) => sum + parseFloat(stat.percentage), 0);
    const avgAttendance = user.courses.length > 0 ? totalAttendance / user.courses.length : 0;

    // Calculate total SKS
    const totalSKS = user.courses.reduce((sum, course) => sum + (course.sks || 0), 0);

    // Count tasks by urgency
    const urgentTasks = allTasks.filter(task => {
      if (!task.deadline) return false;
      const deadline = new Date(task.deadline);
      const now = new Date();
      const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours <= 24;
    });

    const thisWeekTasks = allTasks.filter(task => {
      if (!task.deadline) return false;
      const deadline = new Date(task.deadline);
      const now = new Date();
      const diffDays = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays > 1 && diffDays <= 7;
    });

    const nextWeekTasks = allTasks.filter(task => {
      if (!task.deadline) return false;
      const deadline = new Date(task.deadline);
      const now = new Date();
      const diffDays = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays > 7 && diffDays <= 14;
    });

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        image: user.image
      },
      stats: {
        todayClasses: todaySchedules.length,
        pendingTasks: allTasks.length,
        avgAttendance: avgAttendance.toFixed(1),
        totalSKS: totalSKS,
        totalCourses: user.courses.length,
        urgentTasksCount: urgentTasks.length,
        thisWeekTasksCount: thisWeekTasks.length,
        nextWeekTasksCount: nextWeekTasks.length
      },
      todaySchedules,
      tasks: allTasks.slice(0, 5), // Top 5 tasks
      attendanceStats,
      courses: user.courses
    });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
