import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET all courses for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const courses = await prisma.course.findMany({
      where: { userId },
      include: {
        schedules: {
          orderBy: { startTime: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

  // POST create a new course
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    const {
      name,
      code,
      sks,
      lecturer,
      color,
      semester,
      totalSessions,
      maxAbsences,
      schedules // Array of schedule objects: { dayOfWeek, startTime, endTime, room }
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Course name is required' }, { status: 400 });
    }

    // Create course with schedules
    const course = await prisma.course.create({
      data: {
        userId,
        name,
        code: code || null,
        sks: sks ? parseInt(sks) : null,
        lecturer: lecturer || null,
        color: color || 'blue',
        semester: semester || null,
        totalSessions: totalSessions ? parseInt(totalSessions) : null,
        maxAbsences: maxAbsences ? parseInt(maxAbsences) : null,
        schedules: schedules && schedules.length > 0 ? {
          create: schedules.map((schedule: any) => ({
            dayOfWeek: schedule.dayOfWeek,
            startTime: new Date(schedule.startTime),
            endTime: new Date(schedule.endTime),
            room: schedule.room || null
          }))
        } : undefined
      },
      include: {
        schedules: true
      }
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}

// PUT update an existing course
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    const {
      id,
      name,
      code,
      sks,
      lecturer,
      color,
      semester
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Verify course belongs to user
    const existingCourse = await prisma.course.findUnique({
      where: { id }
    });

    if (!existingCourse || existingCourse.userId !== userId) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Update course
    const course = await prisma.course.update({
      where: { id },
      data: {
        name: name || existingCourse.name,
        code: code !== undefined ? code : existingCourse.code,
        sks: sks !== undefined ? parseInt(sks) : existingCourse.sks,
        lecturer: lecturer !== undefined ? lecturer : existingCourse.lecturer,
        color: color || existingCourse.color,
        semester: semester !== undefined ? semester : existingCourse.semester
      },
      include: {
        schedules: true
      }
    });

    return NextResponse.json({ course }, { status: 200 });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

// DELETE a course
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Verify course belongs to user
    const existingCourse = await prisma.course.findUnique({
      where: { id }
    });

    if (!existingCourse || existingCourse.userId !== userId) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Delete course (cascades to schedules)
    await prisma.course.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Course deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
