import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';
import { getCurrentSemester } from '@/lib/utils';
import TasksClient from './TasksClient';

export default async function TasksPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Fetch total SKS from courses
  const courses = await prisma.course.findMany({
    where: { userId },
    select: { sks: true }
  });

  const totalSKS = courses.reduce((sum, course) => sum + (course.sks || 0), 0);
  const semester = getCurrentSemester();

  return <TasksClient totalSKS={totalSKS} semester={semester} />;
}

