"use client";

import { useState } from "react";
import Image from "next/image";

type IconName = "dashboard" | "calendar_today" | "check_box" | "photo_camera" | "menu_book" | "settings" | "logout" | "search" | "notifications" | "assignment" | "check_circle" | "filter_list" | "swap_vert" | "view_module" | "format_list_bulleted" | "add" | "chat_bubble_outline" | "calendar_month" | "person" | "emoji_events" | "done_all" | "close" | "tune" | "arrow_forward";

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

interface TasksClientProps {
  totalSKS: number;
  semester: string;
}

export default function TasksClient({ totalSKS, semester }: TasksClientProps) {
  const [view, setView] = useState<"board" | "list">("board");
  const [priority, setPriority] = useState("Semua Prioritas");
  const [query, setQuery] = useState("");
  const [newTask, setNewTask] = useState(false);

  return <div className="dashboard-shell tasks-shell">
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
            className={`nav-item ${item.label === "Tugas Kuliah" ? "active" : ""}`} 
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
    <div className="dashboard-main"><header className="topbar"><div className="search-box"><Icon name="search" /><input type="search" placeholder="Cari mata kuliah, tugas, atau jadwal..." aria-label="Cari" /></div><div className="topbar-actions"><div className="date-label">Rabu, 24 Oktober 2024</div><button className="notification-button" aria-label="Notifikasi" type="button"><Icon name="notifications" /><span className="notification-dot" /></button><div className="profile-chip"><div className="avatar">DP</div><div><div className="profile-name">Dimas Pratama</div><div className="profile-course">Teknik Informatika</div></div></div></div></header>
      <main className="tasks-content">
        <section className="tasks-hero"><div className="tasks-hero-copy"><div className="tasks-kicker"><i /> SEMESTER GENAP 2024/2025 <b>•</b> <strong>Fakultas Ilmu Komputer</strong></div><h1>Daftar Tugas &amp; Proyek<br />Kuliah</h1><p><strong>7 Tugas Aktif</strong> <b>•</b> 12 Tugas Berhasil Diselesaikan</p></div><div className="task-counters"><Counter label="Belum Selesai" value="3" icon="assignment" tone="pending" /><Counter label="Selesai" value="12" icon="check_circle" tone="done" /><Counter label="Terlambat" value="0" icon="close" tone="late" /></div></section>
        <section className="task-toolbar"><div className="task-toolbar-left"><label className="task-search"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul tugas, modul..." /></label><button className="task-select" type="button">Semua Mata Kuliah (6)<Icon name="swap_vert" /></button><button className={`task-select priority-select ${priority !== "Semua Prioritas" ? "active" : ""}`} onClick={() => setPriority(priority === "Semua Prioritas" ? "Prioritas Tinggi" : "Semua Prioritas")} type="button">{priority}<Icon name="tune" /></button><button className="task-sort" type="button">Urutkan: Deadline Terdekat <Icon name="swap_vert" /></button></div><div className="task-toolbar-right"><div className="view-toggle"><button className={view === "board" ? "selected" : ""} onClick={() => setView("board")} type="button"><Icon name="view_module" />Papan</button><button className={view === "list" ? "selected" : ""} onClick={() => setView("list")} type="button"><Icon name="format_list_bulleted" />Daftar</button></div><button className="new-task-button" onClick={() => setNewTask(true)} type="button"><Icon name="add" />Buat Tugas Baru</button></div></section>
        {view === "board" ? <div className="task-board"><TaskColumn title="Belum Dikerjakan" count="2" tone="pending" icon="add" query={query} /><TaskColumn title="Selesai" count="12" tone="done" icon="done_all" query={query} /></div> : <TaskList query={query} />}
        {newTask && <div className="task-modal-backdrop" onClick={() => setNewTask(false)}><div className="task-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setNewTask(false)} type="button"><Icon name="close" /></button><h2>Buat Tugas Baru</h2><p>Tambahkan tugas kuliah baru ke daftar Anda.</p><input placeholder="Judul tugas" /><input placeholder="Mata kuliah" /><button className="new-task-button" onClick={() => setNewTask(false)} type="button">Simpan Tugas</button></div></div>}
      </main>
    </div>
  </div>;
}

function Counter({ label, value, icon, tone }: { label: string; value: string; icon: IconName; tone: string }) { return <div className={`task-counter ${tone}`}><div>{label}</div><strong>{value}</strong><Icon name={icon} /></div>; }

function TaskColumn({ title, count, tone, icon, query }: { title: string; count: string; tone: "pending" | "done"; icon: IconName; query: string }) {
  const pending = tone === "pending";
  return <section className={`task-column ${tone}`}><div className="task-column-heading"><div><i /> <h2>{title}</h2> <span>{count}</span></div><Icon name={icon} /></div>{pending ? <><TaskCard query={query} type="pending" course="Sistem Terdistribusi" title="Tugas Proyek Sistem Terdistribusi (Implementasi RPC & Socket)" description="Membangun arsitektur microservices sederhana menggunakan protokol gRPC..." due="28 Okt 2024 (4 hari lagi)" priority="High Priority" progress="0 dari 3 subtasks" /><TaskCard query={query} type="pending" course="Etika Profesi" title="Resume Jurnal Etika Profesi Bab 4: Hak Cipta Perangkat Lunak" description="Ringkasan 3 halaman standar format IEEE terkait lisensi open-source vs proprietary" due="30 Okt 2024 • 17:00 WIB" priority="Low Priority" individual /></> : <><TaskCard query={query} type="done" course="Algoritma Lanjut" title="Makalah Analisis Algoritma Sorting: QuickSort vs TimSort" description="Analisis kompleksitas asimtotik waktu dan ruang pada dataset skewed. Telah..." done="100% Selesai" /><TaskCard query={query} type="done" course="Kecerdasan Buatan" title="Quiz Online Minggu ke-6: Heuristic Search & A* Algorithm" description="Evaluasi pemahaman konsep tree search, graph search, admissible heuristic, serta konsistensi grafik node." done="Nilai Tercatat di SIAKAD" score="95/100" /><div className="study-success"><span><Icon name="emoji_events" /></span><div><strong>Ritme Belajar Sangat Bagus!</strong><p>Telah menyelesaikan 3 tugas besar minggu ini. Pertahankan!</p></div></div></>}</section>;
}

function TaskCard({ type, course, title, description, due, priority, progress, individual, done, score, query }: { type: "pending" | "done"; course: string; title: string; description: string; due?: string; priority?: string; progress?: string; individual?: boolean; done?: string; score?: string; query: string }) {
  if (query && !`${course} ${title}`.toLowerCase().includes(query.toLowerCase())) return null;
  return <article className={`task-board-card ${type}`}><div className="task-card-top"><span className="course-pill">{course}</span>{type === "pending" ? <span className={`priority-pill ${priority === "High Priority" ? "high" : "low"}`}><i />{priority}</span> : <span className="done-pill">✓ {score ? `Skor: ${score}` : "Tuntas"}</span>}</div><h3>{title}</h3>{type === "done" && <h3 className="completed-title">{title}</h3>}<p>{description}</p>{type === "pending" ? <>{progress && <div className="subtask-progress"><span>{progress}</span><div><i /><i /><i /><i /></div></div>}<div className="task-card-meta"><span className={priority === "High Priority" ? "deadline" : "date"}><Icon name="calendar_month" />{due}</span>{individual ? <span className="individual-tag">Individual</span> : <span className="comment-icons"><Icon name="chat_bubble_outline" /><Icon name="check_box" /></span>}</div></> : <div className="task-card-meta done-meta"><span><Icon name="emoji_events" />{score ? done : "Diserahkan kemarin, 14:20"}</span><strong>{score ? score : done}</strong></div>}</article>;
}

function TaskList({ query }: { query: string }) { return <section className="task-list-view"><div className="list-header"><h2>Semua Tugas</h2><span>14 tugas</span></div>{["Tugas Proyek Sistem Terdistribusi (Implementasi RPC & Socket)", "Resume Jurnal Etika Profesi Bab 4: Hak Cipta Perangkat Lunak", "Makalah Analisis Algoritma Sorting: QuickSort vs TimSort", "Quiz Online Minggu ke-6: Heuristic Search & A* Algorithm"].filter((title) => !query || title.toLowerCase().includes(query.toLowerCase())).map((title, index) => <div className="task-list-row" key={title}><span>{index < 2 ? "Belum Dikerjakan" : "Selesai"}</span><strong>{title}</strong><small>{index + 1} • Mata Kuliah</small><Icon name="arrow_forward" /></div>)}</section>; }
