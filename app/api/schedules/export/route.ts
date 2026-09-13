import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all schedules
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        courses: {
          include: {
            schedules: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate iCalendar format
    const schedules = user.courses.flatMap(course =>
      course.schedules.map(schedule => ({
        course,
        schedule
      }))
    );

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Kuliahin//Schedule//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Jadwal Kuliah',
      'X-WR-TIMEZONE:Asia/Jakarta',
    ];

    schedules.forEach(({ course, schedule }) => {
      const startDate = new Date(schedule.startTime);
      const endDate = new Date(schedule.endTime);
      
      // Format date for iCal (YYYYMMDDTHHMMSS)
      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      // Get recurrence rule for weekly events
      const dayMap: Record<string, string> = {
        'Minggu': 'SU',
        'Senin': 'MO',
        'Selasa': 'TU',
        'Rabu': 'WE',
        'Kamis': 'TH',
        'Jumat': 'FR',
        'Sabtu': 'SA'
      };

      const rrule = `FREQ=WEEKLY;BYDAY=${dayMap[schedule.dayOfWeek]};COUNT=16`; // 16 weeks per semester

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${schedule.id}@kuliahin.app`,
        `DTSTAMP:${formatDate(new Date())}`,
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `RRULE:${rrule}`,
        `SUMMARY:${course.name}`,
        `DESCRIPTION:Kode: ${course.code || '-'}\\nDosen: ${course.lecturer || '-'}\\nSKS: ${course.sks || '-'}`,
        `LOCATION:${schedule.room || 'TBA'}`,
        'STATUS:CONFIRMED',
        'TRANSP:OPAQUE',
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');

    const icsString = icsContent.join('\r\n');

    return new NextResponse(icsString, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="jadwal-kuliah.ics"',
      },
    });

  } catch (error) {
    console.error('Error exporting calendar:', error);
    return NextResponse.json({ error: 'Failed to export calendar' }, { status: 500 });
  }
}
