"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type IconName = "dashboard" | "calendar_today" | "check_box" | "photo_camera" | "menu_book" | "settings" | "logout" | "search" | "notifications" | "person" | "school" | "business" | "calendar_month" | "camera_alt" | "lock" | "save" | "refresh" | "warning" | "cloud_done" | "close" | "verified";

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

interface UserData {
  name: string;
  email: string;
  image: string | null;
  nim: string;
  major: string;
  ipk: string;
  ips: string;
  whatsapp: string;
  nickname: string;
  bio: string;
  yearEnrolled: string;
  currentSemester: string;
  academicAdvisor: string;
  targetIps: string;
  faculty: string;
  university: string;
}

interface SettingsClientProps {
  userData: UserData;
  formattedDate: string;
  semester: string;
  userInitials: string;
  totalSKS: number;
}

export default function SettingsClient({ 
  userData: initialUserData, 
  formattedDate, 
  semester, 
  userInitials,
  totalSKS 
}: SettingsClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"personal" | "academic">("personal");
  const [saved, setSaved] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // User data state
  const [userData, setUserData] = useState<UserData>(initialUserData);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        // Refresh the page to update data
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || 'Gagal menyimpan perubahan');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  }

  function handleChange(field: string, value: string) {
    setUserData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function resetData() {
    setUserData(initialUserData);
    setSaved(false);
  }

  return (
    <div className="dashboard-shell settings-shell">
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
              className={`nav-item ${item.label === "Profil & Pengaturan" ? "active" : ""}`} 
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

      <div className="dashboard-main">
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
                <img 
                  src={userData.image} 
                  alt={userData.name} 
                  className="avatar-img"
                />
              ) : (
                <div className="avatar">{userInitials}</div>
              )}
              <div>
                <div className="profile-name">{userData.name || 'User'}</div>
                <div className="profile-course">{userData.major || 'Teknik Informatika'}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="settings-content">
          <section className="settings-header">
            <div>
              <div className="settings-breadcrumb">
                AKADEMIK <b>›</b> PENGATURAN <b>›</b> <strong>PROFIL MAHASISWA</strong>
              </div>
              <h1>Profil Mahasiswa</h1>
              <p>
                Kelola informasi pribadi, identitas akademik, dan preferensi akun Kuliahin Anda secara terpusat dan
                <br className="desktop-only" /> aman.
              </p>
            </div>
            <div className="settings-header-actions">
              <button type="button" onClick={resetData}>
                Batal
              </button>
              <button className="save-settings" type="button" onClick={handleSave} disabled={saving}>
                <Icon name="save" />
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </section>

          <div className="settings-grid">
            <div className="settings-left">
              <ProfileCard userData={userData} totalSKS={totalSKS} />
              <DangerCard cacheCleared={cacheCleared} onClear={() => setCacheCleared(true)} />
            </div>

            <div className="settings-right">
              <div className="settings-tabs">
                <button 
                  className={tab === "personal" ? "active" : ""} 
                  onClick={() => setTab("personal")} 
                  type="button"
                >
                  <Icon name="person" />
                  Data Pribadi
                </button>
                <button 
                  className={tab === "academic" ? "active" : ""} 
                  onClick={() => setTab("academic")} 
                  type="button"
                >
                  <Icon name="school" />
                  Informasi Akademik
                </button>
              </div>

              {tab === "personal" ? (
                <>
                  <PersonalCard userData={userData} onChange={handleChange} />
                  <AcademicCard userData={userData} onChange={handleChange} />
                </>
              ) : (
                <>
                  <AcademicCard userData={userData} onChange={handleChange} />
                  <PersonalCard userData={userData} onChange={handleChange} />
                </>
              )}

              <div className="settings-footer">
                <span>
                  <Icon name="cloud_done" /> Semua perubahan tersimpan otomatis sebagai draft lokal browser
                </span>
                <div>
                  <button type="button" onClick={resetData}>
                    Reset ke Awal
                  </button>
                  <button className="save-settings" onClick={handleSave} disabled={saving} type="button">
                    <Icon name="verified" />
                    {saved ? "Tersimpan" : saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function ProfileCard({ userData, totalSKS }: { userData: UserData; totalSKS: number }) { 
  return (
    <section className="profile-card panel">
      <div className="profile-photo-wrap">
        <img 
          src={userData.image || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=85"} 
          alt={userData.name} 
        />
        <button type="button" aria-label="Ganti foto">
          <Icon name="camera_alt" />
        </button>
      </div>
      <p className="photo-help">Format JPG / PNG, maks. 5MB</p>
      <h2>{userData.name || 'Nama Pengguna'}</h2>
      <div className="profile-identifiers">
        <span>{userData.nim || 'Belum diisi'}</span>
        <b>● Mahasiswa Aktif</b>
      </div>
      <div className="profile-academic">
        <div>
          <Icon name="school" />
          <span>
            <strong>{userData.major || 'Jurusan belum diisi'}</strong>
            <small>{userData.faculty || 'Fakultas belum diisi'}</small>
          </span>
        </div>
        <div>
          <Icon name="business" />
          <span>{userData.university || 'Universitas belum diisi'}</span>
        </div>
        <div>
          <Icon name="calendar_month" />
          <span>{userData.currentSemester || 'Semester belum diisi'}</span>
        </div>
      </div>
      <div className="profile-stats">
        <div>
          <strong>{userData.ipk || '-'}</strong>
          <span>IPK Kumulatif</span>
        </div>
        <div>
          <strong>{totalSKS}</strong>
          <span>SKS Aktif</span>
        </div>
      </div>
    </section>
  ); 
}

function DangerCard({ cacheCleared, onClear }: { cacheCleared: boolean; onClear: () => void }) { 
  return (
    <section className="danger-card">
      <h3>
        <Icon name="warning" /> Zona Bahaya &amp; Cache
      </h3>
      <p>
        {cacheCleared 
          ? "Cache lokal dan preferensi berhasil dibersihkan." 
          : "Bersihkan cache offline dan preferensi tersimpan di perangkat ini bila mengalami kendala sinkronisasi."
        }
      </p>
      <button onClick={onClear} type="button">
        {cacheCleared ? "Cache Berhasil Dibersihkan" : "Reset Cache Sesi & Preferensi Lokal"}
      </button>
      <form action="/api/auth/signout" method="POST">
        <button className="danger-logout" type="submit">
          <Icon name="logout" />
          Keluar
        </button>
      </form>
    </section>
  ); 
}

function PersonalCard({ userData, onChange }: { userData: UserData; onChange: (field: string, value: string) => void }) { 
  return (
    <section className="settings-card panel">
      <div className="settings-card-heading">
        <div>
          <h2>Data Pribadi &amp; Kontak</h2>
          <p>Informasi dasar yang digunakan untuk identitas profil dan notifikasi sistem</p>
        </div>
        <span>Langkah 1 dari 3</span>
      </div>
      <div className="settings-fields">
        <EditableField 
          label="Nama Lengkap Mahasiswa" 
          value={userData.name} 
          onChange={(v) => onChange('name', v)} 
          placeholder="Contoh: Dimas Pratama"
        />
        <Field label="Email Kampus (SSO)" value={userData.email} locked google />
        <EditableField 
          label="Nomor WhatsApp" 
          value={userData.whatsapp} 
          onChange={(v) => onChange('whatsapp', v)} 
          hint="Untuk reminder tenggat tugas" 
          placeholder="Contoh: +62 812-3456-7890"
        />
        <EditableField 
          label="Nama Panggilan di Dashboard" 
          value={userData.nickname} 
          onChange={(v) => onChange('nickname', v)} 
          placeholder="Contoh: Dimas"
        />
        <div className="full-field">
          <label>Bio / Catatan Rencana Akademik</label>
          <textarea 
            value={userData.bio} 
            onChange={(e) => onChange('bio', e.target.value)}
            placeholder="Tertarik pada Software Engineering, Cloud Computing & Distributed Systems. Target lulus 3.5 tahun dengan predikat Cum Laude."
            style={{ 
              width: '100%', 
              minHeight: '100px',
              padding: '0.5rem', 
              border: '1px solid #e0e0e0', 
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <span>{userData.bio.length} / 250 karakter</span>
        </div>
      </div>
    </section>
  ); 
}

function AcademicCard({ userData, onChange }: { userData: UserData; onChange: (field: string, value: string) => void }) { 
  return (
    <section className="settings-card panel academic-settings-card">
      <div className="settings-card-heading">
        <div>
          <h2>Data Akademik &amp; Perkuliahan</h2>
          <p>Sinkronisasi data kurikulum, bimbingan dosen, dan kalkulasi IPS semester</p>
        </div>
      </div>
      <div className="settings-fields">
        <EditableField 
          label="Nomor Induk Mahasiswa (NIM)" 
          value={userData.nim} 
          onChange={(v) => onChange('nim', v)} 
          placeholder="Contoh: 2210511042" 
        />
        <EditableField 
          label="Program Studi" 
          value={userData.major} 
          onChange={(v) => onChange('major', v)} 
          placeholder="Contoh: S1 - Teknik Informatika" 
        />
        <EditableField 
          label="Fakultas" 
          value={userData.faculty} 
          onChange={(v) => onChange('faculty', v)} 
          placeholder="Contoh: Fakultas Ilmu Komputer" 
        />
        <EditableField 
          label="Universitas / Institut" 
          value={userData.university} 
          onChange={(v) => onChange('university', v)} 
          placeholder="Contoh: Universitas Pembangunan Nasional" 
        />
        <EditableField 
          label="Tahun Masuk (Angkatan)" 
          value={userData.yearEnrolled} 
          onChange={(v) => onChange('yearEnrolled', v)} 
          placeholder="Contoh: 2022"
        />
        <EditableField 
          label="Semester Saat Ini" 
          value={userData.currentSemester} 
          onChange={(v) => onChange('currentSemester', v)} 
          suffix="Aktif" 
          placeholder="Contoh: Semester 5 (Genap 2024/2025)"
        />
        <EditableField 
          label="Dosen Pembimbing Akademik (DPA)" 
          value={userData.academicAdvisor} 
          onChange={(v) => onChange('academicAdvisor', v)} 
          placeholder="Contoh: Dr. Hendra Wijaya, S.T., M.T."
        />
        <EditableField 
          label="IPK Kumulatif Saat Ini" 
          value={userData.ipk} 
          onChange={(v) => onChange('ipk', v)} 
          suffix="Skala 4.00" 
          placeholder="Contoh: 3.82" 
        />
        <EditableField 
          label="IPS (Indeks Prestasi Semester) Terakhir / Saat Ini" 
          value={userData.ips} 
          onChange={(v) => onChange('ips', v)} 
          suffix="Skala 4.00" 
          placeholder="Contoh: 3.75" 
        />
        <EditableField 
          label="Target Indeks Prestasi Semester (IPS)" 
          value={userData.targetIps} 
          onChange={(v) => onChange('targetIps', v)} 
          suffix="Ekspektasi" 
          placeholder="Contoh: 3.85"
        />
        <div className="full-field credit-limit">
          <label>Batas Beban SKS Semester Ini</label>
          <div>
            <strong>Maks. 24 SKS</strong>
            <span>Memenuhi Syarat</span>
          </div>
        </div>
      </div>
    </section>
  ); 
}

function Field({ label, value, hint, locked, google, muted, suffix }: { label: string; value: string; hint?: string; locked?: boolean; google?: boolean; muted?: boolean; suffix?: string }) { 
  return (
    <div className="settings-field">
      <label>
        {label}
        {hint && <small>{hint}</small>}
        {google && <b>◉ Google OAuth</b>}
        {suffix && <b>{suffix}</b>}
      </label>
      <div className={`field-value ${muted ? "muted" : ""}`}>
        {value}
        {locked && <Icon name="lock" />}
      </div>
    </div>
  ); 
}

function EditableField({ label, value, onChange, suffix, placeholder, hint }: { label: string; value: string; onChange: (value: string) => void; suffix?: string; placeholder?: string; hint?: string }) {
  return (
    <div className="settings-field">
      <label>
        {label}
        {hint && <small>{hint}</small>}
        {suffix && <b>{suffix}</b>}
      </label>
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        className="field-value"
        style={{ 
          width: '100%', 
          padding: '0.5rem', 
          border: '1px solid #e0e0e0', 
          borderRadius: '4px',
          fontSize: '0.875rem'
        }}
      />
    </div>
  );
}
