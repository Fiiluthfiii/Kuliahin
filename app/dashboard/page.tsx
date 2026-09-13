import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';
import { formatDate, extractInitials, getCurrentSemester } from '@/lib/utils';
import DashboardClient from './DashboardClient';
import Image from 'next/image';

type IconName =
  | "dashboard" | "calendar_today" | "check_box" | "photo_camera" | "menu_book" | "settings" | "logout"
  | "search" | "notifications" | "calendar_month" | "assignment_late" | "verified" | "school" | "arrow_forward"
  | "location_on" | "person" | "meeting_room" | "schedule" | "info" | "add_a_photo" | "camera_alt";

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return <span aria-hidden="true" className={`material-icons ${className}`}>{name}</span>;
}

const navItems: { label: string; icon: IconName; href: string }[] = [
  { label: "Dashboard", icon: "dashboard", href: "/dashboard" },
  { label: "Jadwal Kuliah", icon: "calendar_today", href: "/schedule" },
  { label: "Tugas Kuliah", icon: "check_box", href: "/tasks" },
  { label: "Absensi & Bukti Foto", icon: "photo_camera", href: "/attendance" },
  { label: "Mata Kuliah", icon: "menu_book", href: "/courses" },
  { label: "Profil & Pengaturan", icon: "settings", href: "/settings" },
];

async function getDashboardData(userId: string) {
  console.log("🔍 Fetching dashboard data for user:", userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      courses: {
        include: {
          schedules: true,
          tasks: {
            where: { status: { not: 'completed' } },
            orderBy: { deadline: 'asc' }
          },
          attendances: true
        }
      }
    }
  });

  if (!user) {
    console.error("❌ User not found:", userId);
    throw new Error('User not found');
  }

  console.log("✅ User found:", user.email);
  console.log("📚 Total courses:", user.courses.length);
  console.log("🎓 NIM:", user.nim || 'Belum diisi');
  console.log("📊 IPK:", user.ipk || 'Belum diisi');

  const today = new Date();
  const dayOfWeek = today.toLocaleDateString('id-ID', { weekday: 'long' });

  console.log("📅 Today is:", dayOfWeek);

  const todaySchedules = await prisma.schedule.findMany({
    where: {
      course: { userId: userId },
      dayOfWeek: dayOfWeek
    },
    include: { course: true },
    orderBy: { startTime: 'asc' }
  });

  console.log("📋 Today's schedules:", todaySchedules.length);

  const allTasks = await prisma.task.findMany({
    where: {
      userId: userId,
      status: { not: 'completed' }
    },
    include: { course: true },
    orderBy: { deadline: 'asc' }
  });

  console.log("✏️ Pending tasks:", allTasks.length);

  const attendanceStats = await Promise.all(
    user.courses.map(async (course) => {
      // Use totalSessions from course settings (user input)
      const totalSessions = course.totalSessions || 0;
      const maxAbsences = course.maxAbsences || 0;

      const attendedSessions = await prisma.attendance.findMany({
        where: {
          courseId: course.id,
          userId: userId,
          status: 'hadir'
        }
      });

      const attendedCount = attendedSessions.length;
      const percentage = totalSessions > 0 ? (attendedCount / totalSessions) * 100 : 0;
      
      // Calculate remaining safe absences based on user's maxAbsences setting
      const currentAbsences = totalSessions - attendedCount;
      const remainingSafeAbsences = Math.max(0, maxAbsences - currentAbsences);

      // Status based on percentage
      let status = 'Bahaya';
      let tone = 'red';
      if (percentage >= 90) {
        status = 'Sempurna';
        tone = 'green';
      } else if (percentage >= 80) {
        status = 'Aman';
        tone = 'blue';
      } else if (percentage >= 75) {
        status = 'Waspada';
        tone = 'orange';
      }

      return {
        courseId: course.id,
        courseName: course.name,
        percentage: totalSessions > 0 ? percentage.toFixed(0) : '0',
        attended: attendedCount,
        total: totalSessions,
        remainingSafeAbsences,
        status,
        tone
      };
    })
  );

  const totalAttendance = attendanceStats.reduce((sum, stat) => sum + parseFloat(stat.percentage), 0);
  const avgAttendance = user.courses.length > 0 ? totalAttendance / user.courses.length : 0;
  const totalSKS = user.courses.reduce((sum, course) => sum + (course.sks || 0), 0);

  const urgentTasks = allTasks.filter(task => {
    if (!task.deadline) return false;
    const diffHours = (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60);
    return diffHours <= 24;
  });

  const thisWeekTasks = allTasks.filter(task => {
    if (!task.deadline) return false;
    const diffDays = (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diffDays > 1 && diffDays <= 7;
  });

  const nextWeekTasks = allTasks.filter(task => {
    if (!task.deadline) return false;
    const diffDays = (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diffDays > 7 && diffDays <= 14;
  });

  console.log("📊 Dashboard data prepared successfully");

  return {
    user: {
      name: user.name || 'User',
      nickname: user.nickname || null,
      email: user.email,
      image: user.image,
      nim: user.nim,
      major: user.major,
      ipk: user.ipk,
      ips: user.ips
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
    tasks: allTasks.slice(0, 5),
    attendanceStats,
    courses: user.courses
  };
}

export default async function DashboardPage() {
  // Get session from NextAuth
  const session = await getServerSession(authOptions);
  
  console.log("🔐 Session check:", session ? "Authenticated" : "Not authenticated");

  // Redirect to login if not authenticated
  if (!session || !session.user) {
    console.log("❌ No session, redirecting to login");
    redirect('/login');
  }

  const userId = session.user.id;
  console.log("✅ Authenticated user ID:", userId);

  let dashboardData;
  
  try {
    dashboardData = await getDashboardData(userId);
  } catch (error) {
    console.error('❌ Error loading dashboard data:', error);
    dashboardData = {
      user: { 
        name: session.user.name || 'User', 
        email: session.user.email || '', 
        image: session.user.image || null,
        nim: null,
        major: null,
        ipk: null,
        ips: null
      },
      stats: {
        todayClasses: 0,
        pendingTasks: 0,
        avgAttendance: '0',
        totalSKS: 0,
        totalCourses: 0,
        urgentTasksCount: 0,
        thisWeekTasksCount: 0,
        nextWeekTasksCount: 0
      },
      todaySchedules: [],
      tasks: [],
      attendanceStats: [],
      courses: []
    };
  }

  const today = new Date();
  const formattedDate = formatDate(today);
  const semester = getCurrentSemester();
  const userInitials = extractInitials(dashboardData.user.name);

  const hour = today.getHours();
  let greeting = 'Selamat pagi';
  if (hour >= 12 && hour < 15) greeting = 'Selamat siang';
  else if (hour >= 15 && hour < 18) greeting = 'Selamat sore';
  else if (hour >= 18) greeting = 'Selamat malam';

  const firstClassDesc = dashboardData.todaySchedules.length > 0 
    ? dashboardData.todaySchedules.map(s => s.course.name.split(' ').slice(0, 2).join(' ')).join(' & ')
    : 'Tidak ada kelas';

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Image 
              src="/images/logos/LOGO-KULIAHIN.png" 
              alt="Kuliahin Logo" 
              width={28} 
              height={28}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div><div className="brand-name">Kuliahin</div><div className="brand-subtitle">Student Companion</div></div>
        </div>

        <nav className="sidebar-nav" aria-label="Navigasi utama">
          {navItems.map((item, index) => (
            <a className={`nav-item ${index === 0 ? "active" : ""}`} href={item.href} key={item.label}>
              <Icon name={item.icon} /><span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="semester-box">
            <div>{semester}</div>
            <strong>{dashboardData.stats.totalSKS} SKS Aktif</strong>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button className="logout-button" type="submit">
              <Icon name="logout" /><span>Keluar</span>
            </button>
          </form>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="topbar">
          <div className="search-box">
            <Icon name="search" />
            <input type="search" placeholder="Cari mata kuliah, tugas, atau jadwal..." aria-label="Cari" />
          </div>
          <div className="topbar-actions">
            <div className="date-label">{formattedDate}</div>
            <button className="notification-button" aria-label="Notifikasi" type="button">
              <Icon name="notifications" /><span className="notification-dot" />
            </button>
            <div className="profile-chip">
              {dashboardData.user.image ? (
                <img 
                  src={dashboardData.user.image} 
                  alt={dashboardData.user.name} 
                  className="avatar-img"
                />
              ) : (
                <div className="avatar">{userInitials}</div>
              )}
              <div>
                <div className="profile-name">{dashboardData.user.name}</div>
                <div className="profile-course">{dashboardData.user.major || 'Teknik Informatika'}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          <section className="welcome-card">
            <div className="welcome-kicker">
              <strong>{semester}</strong><span>•</span><span>NIM {dashboardData.user.nim || 'Belum diisi'}</span>
            </div>
            <h1>
              Halo, {dashboardData.user.nickname || dashboardData.user.name.split(' ')[0]}! <span className="wave">👋</span> {greeting}, siap menghadapi perkuliahan<br className="desktop-only" /> hari ini?
            </h1>
            <p>"Disiplin adalah jembatan antara cita-cita dan pencapaian akademikmu."</p>
          </section>

          <section className="stats-grid" aria-label="Ringkasan akademik">
            <article className="stat-card">
              <div className="stat-heading">
                <span>Jadwal Hari Ini</span>
                <span className="stat-icon indigo"><Icon name="calendar_month" /></span>
              </div>
              <div className="stat-value">{dashboardData.stats.todayClasses} <small>Kelas</small></div>
              <div className="stat-description">{dashboardData.stats.todayClasses === 0 ? 'Tidak ada kelas' : firstClassDesc}</div>
              {dashboardData.stats.todayClasses > 0 && (
                <div className="stat-status green-text"><i /> Kelas terjadwal</div>
              )}
            </article>
            
            <article className="stat-card">
              <div className="stat-heading">
                <span>Tugas Menunggu</span>
                <span className="stat-icon red"><Icon name="assignment_late" /></span>
              </div>
              <div className="stat-value">{dashboardData.stats.pendingTasks} <small>Tugas</small></div>
              {dashboardData.stats.urgentTasksCount > 0 ? (
                <div className="stat-status red-text">
                  {dashboardData.stats.urgentTasksCount} pelitution deadline hari ini
                </div>
              ) : (
                <div className="stat-status green-text">
                  <b className="check-mark">✓</b> Tidak ada deadline mendesak
                </div>
              )}
              <div className="stat-footer">
                {dashboardData.stats.thisWeekTasksCount} pekan ini <b>•</b> {dashboardData.stats.nextWeekTasksCount} pekan depan
              </div>
            </article>
            
            <article className="stat-card">
              <div className="stat-heading">
                <span>Rata-rata Kehadiran</span>
                <span className="stat-icon mint"><Icon name="verified" /></span>
              </div>
              <div className="stat-value">{dashboardData.stats.avgAttendance}%</div>
              <div className="stat-status green-text">
                <b className="check-mark">✓</b> {parseFloat(dashboardData.stats.avgAttendance) >= 75 ? 'Perlu Perhatian' : 'Perlu Perhatian'}
              </div>
              <div className="stat-footer">Tersedia cadangan dispensasi</div>
            </article>
            
            <article className="stat-card">
              <div className="stat-heading">
                <span>Beban SKS Semester</span>
                <span className="stat-icon blue"><Icon name="school" /></span>
              </div>
              <div className="stat-value">{dashboardData.stats.totalSKS} <small>SKS</small></div>
              <div className="stat-description">{dashboardData.stats.totalCourses} Mata Kuliah Reguler Aktif</div>
              <div className="stat-footer split">
                <span>IPK: {dashboardData.user.ipk ? dashboardData.user.ipk.toFixed(2) : 'Belum diisi'}</span><strong>Maks 24 SKS</strong>
              </div>
            </article>
          </section>

          <DashboardClient 
            todaySchedules={dashboardData.todaySchedules}
            tasks={dashboardData.tasks}
            attendanceStats={dashboardData.attendanceStats}
            formattedDate={formattedDate}
          />
        </main>
      </div>
    </div>
  );
}
