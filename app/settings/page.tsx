import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';
import { formatDate, extractInitials, getCurrentSemester } from '@/lib/utils';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  // Get session from NextAuth
  const session = await getServerSession(authOptions);
  
  console.log("🔐 Settings - Session check:", session ? "Authenticated" : "Not authenticated");

  // Redirect to login if not authenticated
  if (!session || !session.user) {
    console.log("❌ No session, redirecting to login");
    redirect('/login');
  }

  const userId = session.user.id;
  console.log("✅ Authenticated user ID:", userId);

  // Fetch user data with courses
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      courses: {
        include: {
          schedules: true
        }
      }
    }
  });

  if (!user) {
    console.error("❌ User not found:", userId);
    redirect('/login');
  }

  console.log("✅ User data fetched:", user.email);
  console.log("📊 NIM:", user.nim || 'Belum diisi');
  console.log("📊 Major:", user.major || 'Belum diisi');
  console.log("📊 IPK:", user.ipk || 'Belum diisi');

  const today = new Date();
  const formattedDate = formatDate(today);
  const semester = getCurrentSemester();
  const userInitials = extractInitials(user.name || 'User');
  const totalSKS = user.courses.reduce((sum, course) => sum + (course.sks || 0), 0);

  const userData = {
    name: user.name || '',
    email: user.email || '',
    image: user.image || null,
    nim: user.nim || '',
    major: user.major || '',
    ipk: user.ipk ? user.ipk.toString() : '',
    ips: user.ips ? user.ips.toString() : '',
    whatsapp: user.whatsapp || '',
    nickname: user.nickname || '',
    bio: user.bio || '',
    yearEnrolled: user.yearEnrolled || '',
    currentSemester: user.currentSemester || '',
    academicAdvisor: user.academicAdvisor || '',
    targetIps: user.targetIps ? user.targetIps.toString() : '',
    faculty: user.faculty || '',
    university: user.university || ''
  };

  return (
    <SettingsClient 
      userData={userData}
      formattedDate={formattedDate}
      semester={semester}
      userInitials={userInitials}
      totalSKS={totalSKS}
    />
  );
}

