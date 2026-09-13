"use client";

import { ChangeEvent, useRef, useState } from "react";
import Image from "next/image";

type IconName = "dashboard" | "calendar_today" | "check_box" | "photo_camera" | "menu_book" | "settings" | "logout" | "search" | "notifications" | "verified" | "cloud_done" | "expand_more" | "camera_alt" | "folder_open" | "notes" | "lock" | "download" | "fullscreen" | "edit_note" | "event_available" | "info" | "person";

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

const galleryItems = [
  { tone: "present", status: "Hadir (Sesi 7)", image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=82", time: "08:14 WIB • R2 Terverifikasi", room: "Lab Komputer 3", date: "Rabu, 17 Okt 2024", credits: "3 SKS • 08.00 - 10.30", title: "Pemrograman Web Lanjut", description: "Pengenalan Next.js App Router, Dynamic Route Handlers, dan implementasi Presigned Upload.", lecturer: "Dr. Budi Santoso, M.Kom." },
  { tone: "present", status: "Hadir (Sesi 7)", image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=82", time: "13:12 WIB • R2 Terverifikasi", room: "Ruang 402", date: "Kamis, 17 Okt 2024", credits: "3 SKS • 13.00 - 15.30", title: "Sistem Terdistribusi", description: "Mendalami CAP Theorem, algoritma Raft consensus, dan simulasi node failure pada cluster.", lecturer: "Ir. Agus Hidayat, M.T." },
  { tone: "permit", status: "Izin Seminar (Sesi 6)", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=82", time: "09:30 WIB • Surat Masuk R2", room: "Disetujui Prodi", date: "Senin, 10 Okt 2024", credits: "3 SKS • 10.00 - 12.30", title: "Kecerdasan Buatan", description: "Delegasi Kampus pada Indonesia AI Summit 2024 di JCC Senayan. Dokumen surat tugas...", lecturer: "Prof. Retno Wijaya, Ph.D." },
];

export default function AttendancePage() {
  const [attendanceStatus, setAttendanceStatus] = useState("Hadir");
  const [galleryFilter, setGalleryFilter] = useState("Semua Mata Kuliah");
  const [uploaded, setUploaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => { if (event.target.files?.[0]) setUploaded(true); };

  return <div className="dashboard-shell attendance-shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark"><Image src="/images/logos/LOGO-KULIAHIN.png" alt="Kuliahin Logo" width={28} height={28} style={{ objectFit: 'contain' }} /></div><div><div className="brand-name">Kuliahin</div><div className="brand-subtitle">Student Companion</div></div></div><nav className="sidebar-nav" aria-label="Navigasi utama">{navItems.map((item) => <a className={`nav-item ${item.label === "Absensi & Bukti Foto" ? "active" : ""}`} href={item.href} key={item.label}><Icon name={item.icon} /><span>{item.label}</span></a>)}</nav><div className="sidebar-bottom"><div className="semester-box"><div>Semester Genap 2024/2025</div><strong>21 SKS Aktif</strong></div><button className="logout-button" type="button"><Icon name="logout" /><span>Keluar</span></button></div></aside>
    <div className="dashboard-main"><header className="topbar"><div className="search-box"><Icon name="search" /><input type="search" placeholder="Cari mata kuliah, tugas, atau jadwal..." aria-label="Cari" /></div><div className="topbar-actions"><div className="date-label">Rabu, 24 Oktober 2024</div><button className="notification-button" aria-label="Notifikasi" type="button"><Icon name="notifications" /><span className="notification-dot" /></button><div className="profile-chip"><div className="avatar">DP</div><div><div className="profile-name">Dimas Pratama</div><div className="profile-course">Teknik Informatika</div></div></div></div></header>
      <main className="attendance-content">
        <section className="attendance-header"><div><div className="attendance-kicker"><Icon name="verified" /> AKREDITASI &amp; ARSIP PRESENSI DIGITAL</div><h1>Dokumentasi &amp; Presensi Kuliah</h1><p>Simpan bukti kehadiran berupa foto per sesi kuliah dengan penyimpanan<br className="desktop-only" /> aman di Cloudflare R2.</p></div><div className="attendance-counters"><MiniStat label="Total Sesi" value="48" suffix="Sesi" tone="blue" /><MiniStat label="Hadir" value="45" suffix="(93.8%)" tone="green" /><MiniStat label="Izin/Sakit" value="2" suffix="Sesi" tone="yellow" /><MiniStat label="Alpa" value="1" suffix="Sesi" tone="red" /></div></section>

        <div className="attendance-main-grid">
          <section className="attendance-form panel"><div className="attendance-form-heading"><h2><i />Presensi Sesi Kuliah Sekarang</h2><span><Icon name="cloud_done" /> Cloudflare R2 Ready</span></div><div className="attendance-form-row"><label>Mata Kuliah &amp; Jadwal Sesi<div className="attendance-select"><Icon name="menu_book" /><span>Pemrograman Web Lanjut • Rabu,<br />08.00-10.30 WIB (R. Lab 3)</span><Icon name="expand_more" /></div></label><label className="status-field">Status Kehadiran<div className="status-options">{["Hadir", "Izin", "Sakit"].map((status) => <button className={attendanceStatus === status ? "selected" : ""} onClick={() => setAttendanceStatus(status)} type="button" key={status}>{status}</button>)}</div></label></div><div className="upload-label-row"><label>Foto Bukti Kelas / Papan Tulis / Surat Izin</label><span>Maks. 10MB (JPEG, PNG, HEIC)</span></div><div className="photo-upload-box"><div className="photo-preview"><img src={uploaded ? "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=700&q=82" : "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=700&q=82"} alt="Preview bukti presensi" /><div><span>● 08:14:02 WIB</span><span>GPS: Lab 3, Gedung Fasilkom</span></div><button type="button" aria-label="Putar foto"><Icon name="fullscreen" /></button></div><div className="photo-upload-copy"><h3><Icon name="camera_alt" /> Foto Terlampir Siap Diunggah</h3><p>Foto resolusi penuh akan dikompresi di sisi klien dan diunggah langsung ke penyimpanan Cloudflare R2 bukti pribadi melalui presigned URL berdurasi 15 menit.</p><div><button className="camera-action" onClick={() => fileRef.current?.click()} type="button"><Icon name="camera_alt" />Buka Kamera Langsung</button><button className="gallery-action" onClick={() => fileRef.current?.click()} type="button"><Icon name="folder_open" />Pilih dari Galeri</button></div></div></div><input ref={fileRef} className="hidden-file" type="file" accept="image/jpeg,image/png,image/heic" onChange={handleFile} /><label className="notes-label">Catatan Perkuliahan / Materi Singkat (Opsional)<div className="notes-input"><Icon name="notes" /><span>Pembahasan Server Actions, Revalidasi Cache, &amp; Optimasi Skema DB<br />PostgreSQL</span></div></label><div className="attendance-submit"><div><Icon name="lock" /> Enkripsi AES-256 via Cloudflare R2 Presigned<br />Pipeline</div><button type="button" onClick={() => setUploaded(true)}><Icon name="photo_camera" />Upload &amp; Simpan Bukti<br />Kehadiran</button></div></section>

          <aside className="attendance-side"><section className="panel threshold-card"><div className="side-card-heading"><h2>Ambang Batas Kehadiran</h2><span>Aman</span></div><div className="threshold-highlight"><div className="attendance-ring"><span>93.8%</span></div><p><strong>Syarat Ujian Akhir (UAS)</strong><br />Minimal kehadiran 75% per mata kuliah untuk validasi kartu ujian.</p></div><dl><div><dt>Maksimal Alpa Tersisa:</dt><dd>3 Pertemuan</dd></div><div><dt>Sisa Pertemuan Semester:</dt><dd>16 Minggu</dd></div></dl></section></aside>
        </div>

        <section className="gallery-section"><div className="gallery-heading"><div><h2>Galeri &amp; Log Bukti Presensi</h2><p>Seluruh rekam jejak visual kehadiran kelas yang telah tervalidasi pada<br className="desktop-only" /> semester ini.</p></div><div className="gallery-tabs">{["Semua Mata Kuliah", "Pemrograman Web", "Sistem Terdistribusi", "Kecerdasan Buatan"].map((filter) => <button className={galleryFilter === filter ? "active" : ""} onClick={() => setGalleryFilter(filter)} type="button" key={filter}>{filter}</button>)}</div></div><div className="gallery-grid">{galleryItems.filter((item) => galleryFilter === "Semua Mata Kuliah" || item.title.includes(galleryFilter.replace("Pemrograman Web", "Pemrograman Web Lanjut").replace("Kecerdasan Buatan", "Kecerdasan Buatan"))).map((item) => <GalleryCard key={item.title} {...item} />)}</div></section>
      </main>
    </div>
  </div>;
}

function MiniStat({ label, value, suffix, tone }: { label: string; value: string; suffix: string; tone: string }) { return <div className={`attendance-stat ${tone}`}><span>{label}</span><strong>{value}<small>{suffix}</small></strong></div>; }

function GalleryCard({ tone, status, image, time, room, date, credits, title, description, lecturer }: typeof galleryItems[number]) { return <article className="gallery-card"><div className="gallery-image"><img src={image} alt={title} /><span className={`gallery-status ${tone}`}>● {status}</span><div className="gallery-image-footer"><span>{time}</span><strong>{room}</strong></div></div><div className="gallery-card-body"><div className="gallery-meta"><span>{date}</span><span>{credits}</span></div><h3>{title}</h3><p>{description}</p><div className="lecturer"><Icon name="person" />Dosen: {lecturer}</div><div className="gallery-card-actions"><button type="button"><Icon name="fullscreen" /></button><button type="button"><Icon name="download" /></button><button className="edit-button" type="button"><Icon name="edit_note" />Edit Catatan</button></div></div></article>; }
