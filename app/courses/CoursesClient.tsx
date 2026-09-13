"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type IconName = "dashboard" | "calendar_today" | "check_box" | "photo_camera" | "menu_book" | "settings" | "logout" | "search" | "search_off" | "notifications" | "download" | "add" | "expand_more" | "grid_view" | "more_vert" | "access_time" | "location_on" | "school" | "assignment" | "check_circle" | "qr_code_scanner" | "folder_open" | "calendar_month" | "event_available" | "person" | "filter_alt" | "tune" | "close" | "save";

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

interface CourseData {
  id: string;
  code: string;
  credits: string;
  title: string;
  lecturer: string;
  day: string;
  time: string;
  room: string;
  attendance: string;
  percent: number;
  task: string;
  taskTone: string;
  taskExtra: string;
  color: string;
  schedules: Array<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    room: string;
  }>;
}

interface WeeklyDayData {
  day: string;
  count: string;
  cards: Array<{
    name: string;
    time: string;
    tone: string;
  }>;
}

interface Stats {
  totalSKS: number;
  totalCourses: number;
  totalHoursPerWeek: string;
  targetIPS: string;
}

interface CoursesClientProps {
  userData: UserData;
  courses: CourseData[];
  weeklyData: WeeklyDayData[];
  stats: Stats;
  formattedDate: string;
  semester: string;
  userInitials: string;
  displayName: string;
}

const navItems: { label: string; icon: IconName; href: string }[] = [
  { label: "Dashboard", icon: "dashboard", href: "/dashboard" },
  { label: "Jadwal Kuliah", icon: "calendar_today", href: "/schedule" },
  { label: "Tugas Kuliah", icon: "check_box", href: "/tasks" },
  { label: "Absensi & Bukti Foto", icon: "photo_camera", href: "/attendance" },
  { label: "Mata Kuliah", icon: "menu_book", href: "/courses" },
  { label: "Profil & Pengaturan", icon: "settings", href: "/settings" },
];

export default function CoursesClient({
  userData,
  courses,
  weeklyData,
  stats,
  formattedDate,
  semester,
  userInitials,
  displayName
}: CoursesClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [day, setDay] = useState("Semua");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseSks, setCourseSks] = useState("3");
  const [courseLecturer, setCourseLecturer] = useState("");
  const [courseColor, setCourseColor] = useState("blue");
  const [scheduleDay, setScheduleDay] = useState("Senin");
  const [scheduleRoom, setScheduleRoom] = useState("");
  const [scheduleStartTime, setScheduleStartTime] = useState("08:00");
  const [scheduleEndTime, setScheduleEndTime] = useState("10:30");
  const [courseNotes, setCourseNotes] = useState("");

  const handleAddCourse = async () => {
    if (!courseName.trim()) {
      alert("Nama mata kuliah harus diisi!");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create datetime objects for schedule times
      const today = new Date();
      const startDateTime = new Date(today);
      const [startHour, startMinute] = scheduleStartTime.split(':');
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

      const endDateTime = new Date(today);
      const [endHour, endMinute] = scheduleEndTime.split(':');
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: courseName,
          code: courseCode || null,
          sks: parseInt(courseSks),
          lecturer: courseLecturer || null,
          color: courseColor,
          semester: semester,
          schedules: [{
            dayOfWeek: scheduleDay,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            room: scheduleRoom || null
          }]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add course');
      }

      // Reset form
      setCourseName("");
      setCourseCode("");
      setCourseSks("3");
      setCourseLecturer("");
      setCourseColor("blue");
      setScheduleDay("Senin");
      setScheduleRoom("");
      setScheduleStartTime("08:00");
      setScheduleEndTime("10:30");
      setCourseNotes("");
      setShowModal(false);

      // Refresh page to show new course
      router.refresh();
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Gagal menambahkan mata kuliah. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibleCourses = useMemo(() => 
    courses.filter((course) =>
      `${course.title} ${course.code} ${course.lecturer}`.toLowerCase().includes(query.toLowerCase()) &&
      (day === "Semua" || course.day === day)
    ),
    [courses, query, day]
  );

  return (
    <div className="dashboard-shell courses-shell">
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
              className={`nav-item ${item.label === "Mata Kuliah" ? "active" : ""}`}
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

      <div className="dashboard-main">
        <header className="topbar">
          <div className="search-box">
            <Icon name="search" />
            <input
              type="search"
              placeholder="Cari mata kuliah, tugas, atau jadwal..."
              aria-label="Cari"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="topbar-actions">
            <div className="date-label">{formattedDate}</div>
            <button className="notification-button" aria-label="Notifikasi" type="button">
              <Icon name="notifications" />
              <span className="notification-dot" />
            </button>
            <div className="profile-chip">
              {userData.image ? (
                <Image
                  src={userData.image}
                  alt={userData.name}
                  width={32}
                  height={32}
                  className="avatar"
                />
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

        <main className="courses-content">
          <section className="courses-header">
            <div>
              <div className="course-breadcrumb">
                AKADEMIK <b>/</b> <strong>MATA KULIAH</strong>
              </div>
              <h1>
                Mata Kuliah <span>{semester}</span>
              </h1>
              <div className="course-summary">
                <b>{stats.totalCourses} Mata Kuliah</b>
                <i />
                <strong>{stats.totalSKS} SKS Aktif</strong>
                <i />
                <em>↗ Target IPK: {stats.targetIPS}</em>
              </div>
            </div>
            <div className="course-header-actions">
              <button type="button">
                <Icon name="download" />
                Ekspor KRS
              </button>
              <button className="add-course-button" onClick={() => setShowModal(true)} type="button">
                <Icon name="add" />
                Tambah Mata Kuliah
              </button>
            </div>
          </section>

          <section className="course-filters">
            <label>
              <Icon name="search" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari mata kuliah, kode MK, atau nama dosen..."
              />
            </label>
            <div className="day-tabs">
              {["Semua", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((item) => {
                const dayMap: Record<string, string> = {
                  Sen: "Senin",
                  Sel: "Selasa",
                  Rab: "Rabu",
                  Kam: "Kamis",
                  Jum: "Jumat",
                  Sab: "Sabtu",
                  Min: "Minggu"
                };
                const isActive = (day === "Semua" && item === "Semua") || day === dayMap[item];
                
                return (
                  <button
                    className={isActive ? "active" : ""}
                    onClick={() => setDay(item === "Semua" ? "Semua" : dayMap[item])}
                    type="button"
                    key={item}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
            <button className="course-select" type="button">
              Semua SKS <Icon name="expand_more" />
            </button>
            <button className="grid-button" type="button">
              <Icon name="grid_view" />
            </button>
          </section>

          {visibleCourses.length > 0 ? (
            <section className="courses-grid">
              {visibleCourses.map((course) => (
                <CourseCard key={course.id} {...course} />
              ))}
            </section>
          ) : (
            <EmptyCourses
              onReset={() => {
                setQuery("");
                setDay("Semua");
              }}
            />
          )}

          <WeeklySpread weeklyData={weeklyData} totalHours={stats.totalHoursPerWeek} />
        </main>
      </div>

      {showModal && (
        <div className="course-modal-backdrop" onClick={() => !isSubmitting && setShowModal(false)}>
          <div className="course-modal course-modal-form" onClick={(event) => event.stopPropagation()}>
            <div className="course-modal-header">
              <div className="course-modal-icon">
                <Icon name="menu_book" />
              </div>
              <div>
                <h2>Tambah Mata Kuliah Baru</h2>
                <p>Lengkapi data mata kuliah semester ini</p>
              </div>
              <button 
                className="course-modal-close" 
                onClick={() => !isSubmitting && setShowModal(false)} 
                type="button"
                disabled={isSubmitting}
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="course-modal-body">
              <label className="modal-label required">
                Nama Mata Kuliah
                <input 
                  placeholder="Contoh: Pemrograman Mobile Lanjut" 
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  disabled={isSubmitting}
                />
              </label>
              <div className="modal-two-fields">
                <label className="modal-label">
                  Kode MK
                  <input 
                    placeholder="IF3207" 
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    disabled={isSubmitting}
                  />
                </label>
                <label className="modal-label">
                  Jumlah SKS
                  <select 
                    className="modal-select"
                    value={courseSks}
                    onChange={(e) => setCourseSks(e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="1">1 SKS</option>
                    <option value="2">2 SKS</option>
                    <option value="3">3 SKS</option>
                    <option value="4">4 SKS</option>
                    <option value="6">6 SKS</option>
                  </select>
                </label>
              </div>
              <label className="modal-label">
                Dosen Pengampu Utama
                <div className="modal-input-icon">
                  <Icon name="person" />
                  <input 
                    placeholder="Nama & gelar lengkap dosen" 
                    value={courseLecturer}
                    onChange={(e) => setCourseLecturer(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </label>
              <label className="modal-label">
                Pilih Warna Label Aksen
                <div className="modal-color-options">
                  <i 
                    className={courseColor === 'blue' ? 'selected' : ''} 
                    onClick={() => !isSubmitting && setCourseColor('blue')}
                  />
                  <i 
                    className={courseColor === 'violet' ? 'violet selected' : 'violet'} 
                    onClick={() => !isSubmitting && setCourseColor('violet')}
                  />
                  <i 
                    className={courseColor === 'orange' ? 'orange selected' : 'orange'} 
                    onClick={() => !isSubmitting && setCourseColor('orange')}
                  />
                  <i 
                    className={courseColor === 'green' ? 'green selected' : 'green'} 
                    onClick={() => !isSubmitting && setCourseColor('green')}
                  />
                  <i 
                    className={courseColor === 'pink' ? 'pink selected' : 'pink'} 
                    onClick={() => !isSubmitting && setCourseColor('pink')}
                  />
                  <i 
                    className={courseColor === 'teal' ? 'teal selected' : 'teal'} 
                    onClick={() => !isSubmitting && setCourseColor('teal')}
                  />
                </div>
              </label>
              <div className="routine-slot">
                <div className="routine-heading">
                  <span>
                    <Icon name="calendar_month" />
                    Slot Jadwal Rutin Kuliah
                  </span>
                  <b>Slot 1</b>
                </div>
                <div className="modal-two-fields">
                  <label className="modal-label">
                    Hari Kuliah
                    <select 
                      className="modal-select"
                      value={scheduleDay}
                      onChange={(e) => setScheduleDay(e.target.value)}
                      disabled={isSubmitting}
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
                  <label className="modal-label">
                    Ruang / Lab
                    <input 
                      placeholder="Lab Komputer 3" 
                      value={scheduleRoom}
                      onChange={(e) => setScheduleRoom(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </label>
                </div>
                <div className="modal-two-fields">
                  <label className="modal-label">
                    Jam Mulai
                    <input 
                      type="time"
                      value={scheduleStartTime}
                      onChange={(e) => setScheduleStartTime(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </label>
                  <label className="modal-label">
                    Jam Selesai
                    <input 
                      type="time"
                      value={scheduleEndTime}
                      onChange={(e) => setScheduleEndTime(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </label>
                </div>
              </div>
              <label className="modal-label">
                Target Nilai &amp; Catatan Khusus
                <textarea 
                  placeholder="Target A. Butuh portofolio GitHub untuk tugas akhir..." 
                  value={courseNotes}
                  onChange={(e) => setCourseNotes(e.target.value)}
                  disabled={isSubmitting}
                />
              </label>
            </div>
            <div className="course-modal-footer">
              <button 
                type="button" 
                onClick={() => !isSubmitting && setShowModal(false)}
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button 
                className="add-course-button" 
                onClick={handleAddCourse} 
                type="button"
                disabled={isSubmitting}
              >
                <Icon name="save" />
                {isSubmitting ? 'Menyimpan...' : 'Simpan Mata Kuliah'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CourseCard({
  code,
  credits,
  title,
  lecturer,
  day,
  time,
  room,
  attendance,
  percent,
  task,
  taskTone,
  taskExtra,
  color
}: CourseData) {
  return (
    <article className={`course-card ${color}`}>
      <div className="course-card-top">
        <div>
          <b>{code}</b>
          <span>{credits}</span>
          <i />
        </div>
        <button aria-label={`Menu ${title}`} type="button">
          <Icon name="more_vert" />
        </button>
      </div>
      <h2>{title}</h2>
      <p className="course-lecturer">
        <Icon name="school" />
        {lecturer}
      </p>
      <div className="course-time">
        <div>
          <span>
            <Icon name="access_time" />
            {day}, {time}
          </span>
          <span>
            <Icon name="location_on" />
            {room}
          </span>
        </div>
        <small>2.5 Jam</small>
      </div>
      <div className="attendance-label">
        <span>Kehadiran Mahasiswa</span>
        <strong>{attendance}</strong>
      </div>
      <div className="attendance-progress">
        <i style={{ width: `${percent}%` }} />
      </div>
      <div className="course-task-row">
        <span className={`course-task ${taskTone}`}>
          <Icon name={task.includes("Tugas") ? "assignment" : "check_circle"} />
          {task}
        </span>
        <span>{taskExtra}</span>
      </div>
      <div className="course-card-actions">
        <button type="button">
          <Icon name="folder_open" />
          Detail &amp; Materi
        </button>
        <button type="button">
          <Icon name="qr_code_scanner" />
          Absen
        </button>
      </div>
    </article>
  );
}

function EmptyCourses({ onReset }: { onReset: () => void }) {
  return (
    <section className="empty-courses panel">
      <div className="empty-courses-icon">
        <Icon name="search_off" />
      </div>
      <h2>Mata Kuliah Tidak Ditemukan</h2>
      <p>
        Coba periksa kembali kata kunci pencarian atau reset
        <br className="desktop-only" /> filter hari &amp; SKS Anda.
      </p>
      <button onClick={onReset} type="button">
        Reset Filter
      </button>
    </section>
  );
}

function WeeklySpread({ weeklyData, totalHours }: { weeklyData: WeeklyDayData[]; totalHours: string }) {
  return (
    <section className="weekly-spread panel">
      <div className="weekly-spread-heading">
        <div>
          <h2>Sebaran Jadwal Mingguan Kuliah</h2>
          <p>Alokasi jam kuliah aktif di kampus per hari</p>
        </div>
        <span>{totalHours} Jam Tatap Muka</span>
      </div>
      <div className="weekly-days">
        {weeklyData.map((item) => (
          <div className="weekly-day" key={item.day}>
            <div>
              <strong>{item.day}</strong>
              <span>{item.count}</span>
            </div>
            {item.cards.length ? (
              item.cards.map((card, idx) => (
                <div className={`weekly-class ${card.tone}`} key={`${card.name}-${idx}`}>
                  <b>{card.name}</b>
                  <span>{card.time}</span>
                </div>
              ))
            ) : (
              <div className="empty-day">
                <Icon name="event_available" />
                Fokus Belajar Mandiri
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
