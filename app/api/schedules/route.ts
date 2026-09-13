import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - Get all schedules for user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schedules = await prisma.schedule.findMany({
      where: {
        course: {
          userId: session.user.id
        }
      },
      include: {
        course: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
  }
}

// POST - Create new schedule
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      courseName,
      courseCode,
      sks,
      lecturer,
      dayOfWeek,
      startTime,
      endTime,
      room,
      color,
      totalSessions,
      maxAbsences
    } = body;

    // Validate required fields
    if (!courseName || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if course already exists
    let course = await prisma.course.findFirst({
      where: {
        userId: session.user.id,
        name: courseName,
      }
    });

    // Create course if doesn't exist
    if (!course) {
      course = await prisma.course.create({
        data: {
          userId: session.user.id,
          name: courseName,
          code: courseCode || null,
          sks: sks ? parseInt(sks) : null,
          lecturer: lecturer || null,
          color: color || 'blue',
          // TEMPORARY: Comment out until Prisma regenerated
          // totalSessions: totalSessions ? parseInt(totalSessions) : null,
          // maxAbsences: maxAbsences ? parseInt(maxAbsences) : null,
        }
      });
    }

    // Parse time strings to Date objects
    const parseTime = (timeStr: string, dayOfWeek: string) => {
      // Get next occurrence of the day
      const daysMap: Record<string, number> = {
        'Minggu': 0, 'Senin': 1, 'Selasa': 2, 'Rabu': 3,
        'Kamis': 4, 'Jumat': 5, 'Sabtu': 6
      };
      
      const today = new Date();
      const targetDay = daysMap[dayOfWeek];
      const currentDay = today.getDay();
      
      let daysUntilTarget = targetDay - currentDay;
      if (daysUntilTarget < 0) daysUntilTarget += 7;
      
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysUntilTarget);
      
      // Parse time (format: HH:MM or HH:MM AM/PM)
      const [hourStr, minuteStr] = timeStr.split(':');
      let hour = parseInt(hourStr);
      const minute = parseInt(minuteStr) || 0;
      
      targetDate.setHours(hour, minute, 0, 0);
      return targetDate;
    };

    const startDateTime = parseTime(startTime, dayOfWeek);
    const endDateTime = parseTime(endTime, dayOfWeek);

    // Create schedule
    const schedule = await prisma.schedule.create({
      data: {
        courseId: course.id,
        dayOfWeek,
        startTime: startDateTime,
        endTime: endDateTime,
        room: room || null,
      },
      include: {
        course: true
      }
    });

    return NextResponse.json({ 
      success: true,
      schedule,
      message: 'Jadwal berhasil ditambahkan'
    });

  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    );
  }
}

// DELETE - Delete schedule
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('id');

    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 });
    }

    // Verify ownership
    const schedule = await prisma.schedule.findFirst({
      where: {
        id: scheduleId,
        course: {
          userId: session.user.id
        }
      }
    });

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    await prisma.schedule.delete({
      where: { id: scheduleId }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Jadwal berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 });
  }
}

// PUT - Update schedule
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { scheduleId, dayOfWeek, startTime, endTime, room } = body;

    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 });
    }

    // Verify ownership
    const schedule = await prisma.schedule.findFirst({
      where: {
        id: scheduleId,
        course: {
          userId: session.user.id
        }
      }
    });

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    // Update schedule
    const updated = await prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        ...(dayOfWeek && { dayOfWeek }),
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
        ...(room !== undefined && { room }),
      },
      include: {
        course: true
      }
    });

    return NextResponse.json({ 
      success: true,
      schedule: updated,
      message: 'Jadwal berhasil diperbarui'
    });

  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
  }
}
