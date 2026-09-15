"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type IconName =
  | "dashboard" | "calendar_today" | "check_box" | "photo_camera" | "menu_book" | "settings" | "logout"
  | "search" | "notifications" | "calendar_month" | "view_module" | "format_list_bulleted" | "expand_more"
  | "tune" | "cloud_download" | "add" | "access_time" | "event_available" | "science" | "assessment"
  | "location_on" | "person" | "laptop_mac" | "meeting_room" | "groups" | "save" | "link" | "sync"
  | "arrow_forward" | "camera_alt";

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return <span aria-hidden="true" className={`material-icons ${className}`}>{name}</span>;
}

interface UserData {
  name: string;
  nickname: string | null;
  email: string;
  image: string | null;
  major: string;
}

interface ScheduleData {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  sks: number;
  lecturer: string;
  color: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
}

interface Stats {
  totalSKS: number;
  totalClasses: number;
  todayClasses: number;
  totalHoursPerWeek: string;
  avgAttendance: string;
}

interface ScheduleClientProps {
  userData: UserData;
  schedules: ScheduleData[];
  todaySchedules: ScheduleData[];
  stats: Stats;
  formattedDate: string;
  semester: string;
  userInitials: string;
  currentDay: string;
}

const navItems: { label: string; icon: IconName; href: string }[] = [
  { label: "Dashboard", icon: "dashboard", href: "/dashboard" },
  { label: "Jadwal Kuliah", icon: "calendar_today", href: "/schedule" },
  { label: "Tugas Kuliah", icon: "check_box", href: "/tasks" },
  { label: "Absensi & Bukti Foto", icon: "photo_camera", href: "/attendance" },
  { label: "Mata Kuliah", icon: "menu_book", href: "/courses" },
  { label: "Profil & Pengaturan", icon: "settings", href: "/settings" },
];

const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const hours = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

const colorToneMap: Record<string, string> = {
  blue: "blue",
  green: "green",
  purple: "purple",
  lavender: "lavender",
  orange: "orange",
  pink: "pink",
  red: "red",
  yellow: "yellow",
  slate: "slate",
  indigo: "indigo",
  teal: "teal",
  cyan: "cyan",
};

export default function ScheduleClient({
  userData,
  schedules,
  todaySchedules,
  stats,
  formattedDate,
  semester,
  userInitials,
  currentDay
}: ScheduleClientProps) {
  const router = useRouter();
  const [view, setView] = useState("grid");
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    courseName: '',
    courseCode: '',
    sks: '',
    lecturer: '',
    dayOfWeek: 'Senin',
    startTime: '',
    endTime: '',
    room: '',
    color: 'blue',
    totalSessions: '14',
    maxAbsences: '3'
  });

  const displayName = userData.nickname || userData.name.split(' ')[0];

  // Format time for display
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    // Ensure we're displaying in WIB (Asia/Jakarta)
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false,
      timeZone: 'Asia/Jakarta'
    });
  };

  // Calculate position for calendar grid
  const getCalendarPosition = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Get hours in WIB (Asia/Jakarta timezone)
    const startHourWIB = parseInt(start.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      hour12: false,
      timeZone: 'Asia/Jakarta'
    }));
    const startMinWIB = parseInt(start.toLocaleTimeString('id-ID', { 
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    }));
    const endHourWIB = parseInt(end.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      hour12: false,
      timeZone: 'Asia/Jakarta'
    }));
    const endMinWIB = parseInt(end.toLocaleTimeString('id-ID', { 
      minute: '2-digit',
      timeZone: 'Asia/Jakarta'
    }));
    
    const startHour = startHourWIB + startMinWIB / 60;
    const endHour = endHourWIB + endMinWIB / 60;
    
    // Base hour is 7:00 AM
    const top = (startHour - 7) * 80; // 80px per hour
    const height = (endHour - startHour) * 80;
    
    return { top, height };
  };

  // Check if schedule is currently active
  const isCurrentClass = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const isToday = selectedDay === currentDay;
    return isToday && now >= start && now <= end;
  };

  // Get day index
  const getDayIndex = (dayName: string) => days.indexOf(dayName);

  // Get current time position
  const getCurrentTimePosition = () => {
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    return (currentHour - 7) * 80;
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle color selection
  const handleColorChange = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };

  // Handle form submit
  const handleSubmit = async () => {
    // Validation
    if (!formData.courseName || !formData.dayOfWeek || !formData.startTime || !formData.endTime) {
      setMessage({ type: 'error', text: 'Mohon isi semua field yang wajib!' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Jadwal berhasil ditambahkan!' });
        setSaved(true);
        
        // Reset form
        setFormData({
          courseName: '',
          courseCode: '',
          sks: '',
          lecturer: '',
          dayOfWeek: 'Senin',
          startTime: '',
          endTime: '',
          room: '',
          color: 'blue',
          totalSessions: '14',
          maxAbsences: '3'
        });

        // Refresh page after 1 second
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal menambahkan jadwal' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat menyimpan jadwal' });
    } finally {
      setLoading(false);
    }
  };

  // Handle export calendar
  const handleExport = () => {
    window.open('/api/schedules/export', '_blank');
  };

  // Scroll to add form
  const scrollToAddForm = () => {
    const formElement = document.querySelector('.add-schedule-card');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="dashboard-shell schedule-shell">
      {/* Sidebar */}
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
              className={`nav-item ${item.label === "Jadwal Kuliah" ? "active" : ""}`}
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
            <strong>{stats.totalSKS} SKS Aktif</strong>
          </div>
          <button className="logout-button" type="button">
            <Icon name="logout" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Top Bar */}
        <header className="topbar">
          <div className="search-box">
            <Icon name="search" />
            <input type="search" placeholder="Cari mata kuliah, tugas, atau jadwal..." aria-label="Cari" />
          </div>
          <div className="topbar-actions">
            <div className="date-label">{formattedDate}</div>
            <button className="notification-button" aria-label="Notifikasi" type="button">
              <Icon name="notifications" />
              <span className="notification-dot" />
            </button>
            <div className="profile-chip">
              {userData.image ? (
                <Image src={userData.image} alt={userData.name} width={32} height={32} className="avatar" />
              ) : (
                <div className="avatar">{userInitials}</div>
              )}
              <div>
                <div className="profile-name">{displayName}</div>
                <div className="profile-course">{userData.major}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Schedule Content */}
        <main className="schedule-content">
          {/* Hero Section */}
          <section className="schedule-hero">
            <div className="schedule-title">
              <div className="schedule-title-icon">
                <Icon name="calendar_month" />
              </div>
              <div>
                <h1>Jadwal Perkuliahan<br />Mingguan</h1>
                <p>
                  {semester} <b>•</b> <strong>Total {stats.totalSKS} SKS</strong> <b>•</b> {stats.totalClasses} Kelas Terdaftar
                </p>
              </div>
            </div>
            
            <div className="schedule-toolbar">
              <div className="view-switch">
                <button
                  className={view === "grid" ? "selected" : ""}
                  onClick={() => setView("grid")}
                  type="button"
                >
                  <Icon name="view_module" />Grid Mingguan
                </button>
                <button
                  className={view === "list" ? "selected" : ""}
                  onClick={() => setView("list")}
                  type="button"
                >
                  <Icon name="format_list_bulleted" />Daftar List
                </button>
              </div>
              
              <div className="filter-row">
                <button type="button">
                  Semua Hari (Sen - Min) <Icon name="expand_more" />
                </button>
                <button type="button">
                  Filter Mata Kuliah <Icon name="tune" />
                </button>
              </div>
              
              <div className="schedule-actions">
                <button className="export-button" type="button" onClick={handleExport}>
                  <Icon name="cloud_download" />Ekspor .ics
                </button>
                <button className="add-button" type="button" onClick={scrollToAddForm}>
                  <Icon name="add" />Tambah Jadwal
                </button>
              </div>
            </div>
          </section>

          <div className="schedule-layout">
            <div className="schedule-left">
              {/* Stats Cards */}
              <section className="schedule-stats">
                <StatCard
                  icon="access_time"
                  tone="indigo"
                  label="Total Jam / Minggu"
                  value={`${stats.totalHoursPerWeek} Jam`}
                />
                <StatCard
                  icon="event_available"
                  tone="green"
                  label="Kelas Hari Ini"
                  value={`${stats.todayClasses} Kelas`}
                />
                <StatCard
                  icon="menu_book"
                  tone="yellow"
                  label="Total Mata Kuliah"
                  value={`${stats.totalClasses} MK`}
                />
                <StatCard
                  icon="assessment"
                  tone="blue"
                  label="Kehadiran Rata-rata"
                  value={`${stats.avgAttendance}%`}
                />
              </section>

              {/* Calendar or List View */}
              {view === "grid" ? (
                <WeeklyCalendar
                  schedules={schedules}
                  selectedDay={selectedDay}
                  setSelectedDay={setSelectedDay}
                  currentDay={currentDay}
                  getDayIndex={getDayIndex}
                  getCalendarPosition={getCalendarPosition}
                  isCurrentClass={isCurrentClass}
                  formatTime={formatTime}
                  getCurrentTimePosition={getCurrentTimePosition}
                />
              ) : (
                <ScheduleList
                  schedules={schedules}
                  formatTime={formatTime}
                />
              )}

              {/* Today's Summary */}
              <section className="panel daily-summary">
                <div className="daily-heading">
                  <div className="daily-title">
                    <Icon name="view_module" />
                    <h2>Ringkasan Sesi Hari Ini ({currentDay}, {formattedDate.split(',')[1]})</h2>
                  </div>
                  <span className="active-count">{todaySchedules.length} Kelas Aktif</span>
                </div>
                {todaySchedules.length > 0 ? (
                  <div className="session-cards">
                    {todaySchedules.map((schedule, index) => {
                      const isCurrent = isCurrentClass(schedule.startTime, schedule.endTime);
                      const tone = colorToneMap[schedule.color] || "blue";
                      
                      return (
                        <SessionCard
                          key={schedule.id}
                          tone={tone}
                          status={`Sesi ${index + 1} • ${isCurrent ? 'Berlangsung' : 'Terjadwal'}`}
                          title={schedule.courseName}
                          room={schedule.room}
                          credits={`${schedule.sks} SKS`}
                          time={`${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)} WIB`}
                          attendance={isCurrent ? "Berlangsung Sekarang" : "Siap"}
                          button={isCurrent ? "Hadir Sekarang" : "Lihat Detail"}
                          upcoming={!isCurrent}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#8797b2' }}>
                    <Icon name="event_available" style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }} />
                    <p style={{ fontSize: '13px', marginTop: '8px' }}>Tidak ada jadwal kuliah untuk hari ini</p>
                    <p style={{ fontSize: '11px', marginTop: '4px', color: '#a0b0c8' }}>
                      Tambahkan jadwal baru atau pilih hari lain untuk melihat jadwal
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* Right Sidebar */}
            <aside className="schedule-right">
              <AddScheduleCard 
                formData={formData}
                onInputChange={handleInputChange}
                onColorChange={handleColorChange}
                onSave={handleSubmit}
                loading={loading}
                saved={saved}
                message={message}
              />
              <CapacityCard totalSKS={stats.totalSKS} />
              <SyncCard />
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ icon, tone, label, value }: { icon: IconName; tone: string; label: string; value: string }) {
  return (
    <article className="schedule-stat">
      <span className={`schedule-stat-icon ${tone}`}>
        <Icon name={icon} />
      </span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function WeeklyCalendar({
  schedules,
  selectedDay,
  setSelectedDay,
  currentDay,
  getDayIndex,
  getCalendarPosition,
  isCurrentClass,
  formatTime,
  getCurrentTimePosition
}: {
  schedules: any[];
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  currentDay: string;
  getDayIndex: (day: string) => number;
  getCalendarPosition: (start: string, end: string) => { top: number; height: number };
  isCurrentClass: (start: string, end: string) => boolean;
  formatTime: (time: string) => string;
  getCurrentTimePosition: () => number;
}) {
  const allDays = days; // All 7 days: Senin - Minggu
  
  return (
    <section className="panel calendar-panel">
      <div className="calendar-top">
        <div className="current-time">
          <i />
          Waktu Sekarang: <strong>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB ({currentDay})</strong>
        </div>
        <div className="calendar-legend">
          <span><i className="legend-practical" />Praktikum</span>
          <span><i className="legend-theory" />Teori Wajib</span>
          <span><i className="legend-open" />Kuliah Terbuka</span>
        </div>
      </div>
      
      <div className="calendar-scroll" style={{ overflowX: 'auto', overflowY: 'hidden' }}>
        <div style={{ minWidth: '1200px' }}>
          <div className="calendar-head">
            <span>Jam</span>
            {allDays.map((day) => (
              <button
                className={selectedDay === day ? "day-active" : ""}
                onClick={() => setSelectedDay(day)}
                type="button"
                key={day}
              >
                {day}
                {day === currentDay && <small>Hari Ini</small>}
              </button>
            ))}
          </div>
          
          <div className="calendar-body">
            <div className="hour-labels">
              {hours.map((hour) => <span key={hour}>{hour}</span>)}
            </div>
            
            <div className="calendar-days">
              {allDays.map((day, dayIndex) => (
                <div
                  className={`day-column ${selectedDay === day ? "selected-column" : ""}`}
                  key={day}
                >
                  <div className="hour-lines" />
                  {schedules
                    .filter((schedule) => schedule.dayOfWeek === day)
                    .map((schedule) => {
                      const { top, height } = getCalendarPosition(schedule.startTime, schedule.endTime);
                      const isCurrent = isCurrentClass(schedule.startTime, schedule.endTime);
                      const tone = colorToneMap[schedule.color] || "blue";
                      
                      return (
                        <CalendarClass
                          key={schedule.id}
                          tone={tone}
                          code={schedule.courseCode}
                          title={schedule.courseName}
                          sks={`${schedule.sks} SKS`}
                          room={schedule.room}
                          lecturer={schedule.lecturer}
                          time={`${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}`}
                          top={top}
                          height={height}
                          current={isCurrent}
                        />
                      );
                    })}
                  {day === currentDay && (
                    <div className="now-line" style={{ top: getCurrentTimePosition() }}>
                      <i />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CalendarClass({
  tone,
  code,
  title,
  sks,
  room,
  lecturer,
  time,
  top,
  height,
  current = false
}: {
  tone: string;
  code: string;
  title: string;
  sks: string;
  room: string;
  lecturer: string;
  time: string;
  top: number;
  height: number;
  current?: boolean;
}) {
  return (
    <article
      className={`calendar-class ${tone} ${current ? "is-current" : ""}`}
      style={{ top, height }}
    >
      <div className="class-badge-row">
        <span>{sks}</span>
        {current && <b>BERLANGSUNG</b>}
      </div>
      <h3>{title}</h3>
      <p style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>
        <Icon name="school" />
        {code}
      </p>
      <p>
        <Icon name={room.includes("Lab") ? "laptop_mac" : "meeting_room"} />
        {room}
      </p>
      <div className="calendar-class-bottom">
        <span>Dosen: {lecturer}</span>
        <strong>{time}</strong>
      </div>
      {current && (
        <button type="button">
          <Icon name="camera_alt" />Hadir
        </button>
      )}
    </article>
  );
}

function ScheduleList({ schedules, formatTime }: { schedules: any[]; formatTime: (time: string) => string }) {
  return (
    <section className="panel schedule-list-view">
      <div className="list-view-title">
        <h2>Daftar Jadwal Mingguan</h2>
        <span>{schedules.length} kelas terdaftar</span>
      </div>
      {schedules.map((schedule) => (
        <div className="list-schedule-row" key={schedule.id}>
          <b>{schedule.dayOfWeek}</b>
          <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
          <strong>{schedule.courseName}</strong>
          <small>{schedule.room}</small>
        </div>
      ))}
    </section>
  );
}

function SessionCard({
  tone,
  status,
  title,
  room,
  credits,
  time,
  attendance,
  button,
  upcoming = false
}: {
  tone: string;
  status: string;
  title: string;
  room: string;
  credits: string;
  time: string;
  attendance: string;
  button: string;
  upcoming?: boolean;
}) {
  return (
    <article className={`session-card ${tone}`}>
      <div className="session-status">{status}</div>
      <h3>{title}</h3>
      <div className="session-details">
        <span>Ruang: <b>{room}</b></span>
        <span>SKS: <b>{credits}</b></span>
        <span>Pukul: <b>{time}</b></span>
        <span className={upcoming ? "warning" : "verified"}>
          {upcoming ? attendance : <>Presensi: <b>{attendance}</b></>}
        </span>
      </div>
      <button type="button">{button}</button>
    </article>
  );
}

function AddScheduleCard({ 
  formData,
  onInputChange,
  onColorChange,
  onSave,
  loading,
  saved,
  message
}: { 
  formData: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onColorChange: (color: string) => void;
  onSave: () => void;
  loading: boolean;
  saved: boolean;
  message: { type: 'success' | 'error', text: string } | null;
}) {
  const colors = [
    { name: 'blue', class: 'color-selected' },
    { name: 'green', class: 'color-green' },
    { name: 'cyan', class: 'color-blue' },
    { name: 'yellow', class: 'color-yellow' },
    { name: 'red', class: 'color-red' },
    { name: 'purple', class: 'color-purple' },
  ];

  return (
    <section className="panel add-schedule-card">
      <div className="add-card-heading">
        <h2>
          <Icon name="add" />Tambah<br />Jadwal Baru
        </h2>
        <span>Cepat</span>
      </div>

      {message && (
        <div style={{
          padding: '10px 12px',
          marginBottom: '12px',
          borderRadius: '8px',
          fontSize: '11px',
          backgroundColor: message.type === 'success' ? '#e6faf3' : '#fff0f2',
          color: message.type === 'success' ? '#008f69' : '#ef5172',
          border: `1px solid ${message.type === 'success' ? '#00c896' : '#ffc4d0'}`
        }}>
          {message.text}
        </div>
      )}

      <label>
        Nama Mata Kuliah *
        <input 
          name="courseName"
          value={formData.courseName}
          onChange={onInputChange}
          placeholder="e.g. Pembelajaran Mesin" 
        />
      </label>

      <div className="two-fields">
        <label>
          Kode MK
          <input 
            name="courseCode"
            value={formData.courseCode}
            onChange={onInputChange}
            placeholder="IF4021" 
          />
        </label>
        <label>
          Bobot SKS
          <input 
            name="sks"
            type="number"
            value={formData.sks}
            onChange={onInputChange}
            placeholder="3" 
          />
        </label>
      </div>

      <label>
        Hari Perkuliahan *
        <select 
          name="dayOfWeek"
          value={formData.dayOfWeek}
          onChange={onInputChange}
          className="select-input"
          style={{ 
            appearance: 'none',
            cursor: 'pointer',
            paddingRight: '30px',
            backgroundImage: 'none'
          }}
        >
          <option value="Senin">Senin</option>
          <option value="Selasa">Selasa</option>
          <option value="Rabu">Rabu</option>
          <option value="Kamis">Kamis</option>
          <option value="Jumat">Jumat</option>
          <option value="Sabtu">Sabtu</option>
          <option value="Minggu">Minggu</option>
        </select>
      </label>

      <div className="two-fields">
        <label>
          Jam Mulai *
          <input 
            name="startTime"
            type="time"
            value={formData.startTime}
            onChange={onInputChange}
            placeholder="08:00" 
          />
        </label>
        <label>
          Jam Selesai *
          <input 
            name="endTime"
            type="time"
            value={formData.endTime}
            onChange={onInputChange}
            placeholder="10:30" 
          />
        </label>
      </div>

      <label>
        Ruangan / Lab
        <input 
          name="room"
          value={formData.room}
          onChange={onInputChange}
          placeholder="Lab Riset 1 / Gd. D 204"
        />
      </label>

      <label>
        Dosen Pengampu
        <input 
          name="lecturer"
          value={formData.lecturer}
          onChange={onInputChange}
          placeholder="Nama lengkap & gelar..."
        />
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <label>
          Total Sesi Pertemuan <span style={{ color: '#ef4444' }}>*</span>
          <input 
            name="totalSessions"
            type="number"
            min="1"
            max="20"
            value={formData.totalSessions}
            onChange={onInputChange}
            placeholder="14"
          />
          <small style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
            Jumlah pertemuan dalam 1 semester
          </small>
        </label>

        <label>
          Jatah Absen Maksimal <span style={{ color: '#ef4444' }}>*</span>
          <input 
            name="maxAbsences"
            type="number"
            min="0"
            max="10"
            value={formData.maxAbsences}
            onChange={onInputChange}
            placeholder="3"
          />
          <small style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', display: 'block', fontWeight: 500 }}>
            Jika melebihi, tidak bisa ikut ujian
          </small>
        </label>
      </div>

      <label>
        Pilih Warna Label
        <div className="color-options">
          {colors.map((color) => (
            <i
              key={color.name}
              className={formData.color === color.name ? 'color-selected' : color.class}
              onClick={() => onColorChange(color.name)}
              style={{ 
                cursor: 'pointer',
                ...(formData.color === color.name && {
                  border: '2px solid #fff',
                  outline: '2px solid #4b3bd4'
                })
              }}
            />
          ))}
        </div>
      </label>

      <button 
        className="save-schedule" 
        onClick={onSave} 
        type="button"
        disabled={loading}
        style={{
          opacity: loading ? 0.6 : 1,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        <Icon name="save" />
        {loading ? 'Menyimpan...' : saved ? 'Jadwal Tersimpan' : 'Simpan Jadwal Kuliah'}
      </button>
    </section>
  );
}

function CapacityCard({ totalSKS }: { totalSKS: number }) {
  const maxSKS = 24;
  const remaining = maxSKS - totalSKS;
  const percentage = (totalSKS / maxSKS) * 100;
  
  return (
    <section className="panel capacity-card">
      <div>
        <h2>Kapasitas SKS<br />Semester</h2>
        <strong>
          {totalSKS} / {maxSKS}<br /><small>SKS</small>
        </strong>
      </div>
      <div className="capacity-progress">
        <i style={{ width: `${percentage}%` }} />
      </div>
      <div className="capacity-footer">
        <span>Tersisa {remaining} SKS<br />(Maksimal {maxSKS})</span>
        <b>Status:<br />{totalSKS >= 21 ? 'Optimal' : 'Baik'}</b>
      </div>
    </section>
  );
}

function SyncCard() {
  return (
    <section className="sync-card">
      <h3><Icon name="sync" /> Sinkronisasi Otomatis</h3>
      <p>
        Hubungkan kalender Kuliahin dengan Google Calendar atau Apple iCal di smartphone kamu
        agar pengingat kelas berbunyi 15 menit sebelum perkuliahan dimulai.
      </p>
      <div>
        <button type="button">Sinkronkan Kalender</button>
        <button type="button">Panduan</button>
      </div>
    </section>
  );
}
