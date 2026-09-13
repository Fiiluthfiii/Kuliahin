import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getCurrentSemester } from '@/lib/utils';
import Image from 'next/image';

type IconName = "dashboard" | "calendar_today" | "check_box" | "photo_camera" | "menu_book" | "settings" | "logout";

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

interface SidebarProps {
  activeItem?: string;
}

export default async function Sidebar({ activeItem = "Dashboard" }: SidebarProps) {
  const session = await getServerSession(authOptions);
  
  let totalSKS = 0;
  if (session?.user?.id) {
    const courses = await prisma.course.findMany({
      where: { userId: session.user.id },
      select: { sks: true }
    });
    totalSKS = courses.reduce((sum, course) => sum + (course.sks || 0), 0);
  }

  const semester = getCurrentSemester();

  return (
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
        <div>
          <div className="brand-name">Kuliahin</div>
          <div className="brand-subtitle">Student Companion</div>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Navigasi utama">
        {navItems.map((item) => (
          <a 
            className={`nav-item ${item.label === activeItem ? "active" : ""}`} 
            href={item.href} 
            key={item.label}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="semester-box">
          <div>{semester}</div>
          <strong>{totalSKS} SKS Aktif</strong>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button className="logout-button" type="submit">
            <Icon name="logout" />
            <span>Keluar</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
