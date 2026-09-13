"use client";

import { useState, useRef } from "react";
import { formatTimeRange, getTimeUntil, isScheduleNow, isScheduleUpcoming, formatDeadline, getPriorityLabel } from '@/lib/utils';

type IconName =
  | "dashboard" | "calendar_today" | "check_box" | "photo_camera" | "menu_book" | "settings" | "logout"
  | "search" | "notifications" | "calendar_month" | "assignment_late" | "verified" | "school" | "arrow_forward"
  | "location_on" | "person" | "meeting_room" | "schedule" | "info" | "add_a_photo" | "camera_alt";

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return <span aria-hidden="true" className={`material-icons ${className}`}>{name}</span>;
}

interface Schedule {
  id: string;
  startTime: Date;
  endTime: Date;
  room: string | null;
  course: {
    id: string;
    name: string;
    lecturer: string | null;
    sks: number | null;
  };
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  deadline: Date | null;
  priority: string;
  status: string;
  course: {
    id: string;
    name: string;
  } | null;
}

interface AttendanceStat {
  courseId: string;
  courseName: string;
  percentage: string;
  attended: number;
  total: number;
  remainingSafeAbsences: number;
  status: string;
  tone: string;
}

interface DashboardClientProps {
  todaySchedules: Schedule[];
  tasks: Task[];
  attendanceStats: AttendanceStat[];
  formattedDate: string;
}

export default function DashboardClient({ todaySchedules, tasks, attendanceStats, formattedDate }: DashboardClientProps) {
  const [selectedTab, setSelectedTab] = useState("Belum Selesai");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputGalleryRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file maksimal 10MB');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Pilih foto terlebih dahulu');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('type', 'attendance');

      const res = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        alert('✅ Foto berhasil diunggah!');
        
        // Reset state
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputGalleryRef.current) {
          fileInputGalleryRef.current.value = '';
        }
      } else {
        const error = await res.json();
        alert(error.error || 'Gagal mengunggah foto');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Terjadi kesalahan saat mengunggah foto');
    } finally {
      setUploading(false);
    }
  };

  const openGallery = () => {
    fileInputGalleryRef.current?.click();
  };

  const openCamera = async () => {
    try {
      // Request camera access using getUserMedia API
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera on mobile
        } 
      });
      
      setStream(mediaStream);
      setShowCamera(true);
      
      // Wait for video element to be ready, then set stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin akses kamera.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) return;

      // Create file from blob
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setSelectedFile(file);

      // Create preview URL
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);

      // Close camera
      closeCamera();
    }, 'image/jpeg', 0.9);
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  return (
    <div className="dashboard-grid">
      <div className="left-column">
        <section className="panel schedule-panel">
          <div className="panel-heading">
            <div className="heading-title">
              <i className="section-bar indigo-bar" />
              <div>
                <h2>Jadwal Kuliah Hari Ini</h2>
                <p>{formattedDate} <b>•</b> {todaySchedules.length} Sesi Pertemuan</p>
              </div>
            </div>
            <button className="text-link" type="button">
              Lihat Kalender Lengkap <Icon name="arrow_forward" />
            </button>
          </div>
          <div className="class-list">
            {todaySchedules.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                Tidak ada jadwal kuliah hari ini
              </div>
            ) : (
              todaySchedules.map((schedule) => {
                const isNow = isScheduleNow(schedule.startTime, schedule.endTime);
                const isUpcoming = !isNow && isScheduleUpcoming(schedule.startTime);
                
                return (
                  <article key={schedule.id} className={`class-card ${isNow ? 'current' : isUpcoming ? 'upcoming' : ''}`}>
                    <div className="class-info">
                      <div className="class-meta">
                        {isNow ? (
                          <span className="pill live">● Sedang Berlangsung</span>
                        ) : isUpcoming ? (
                          <span className="pill upcoming-pill">Akan Datang</span>
                        ) : null}
                        <span className="time-pill">
                          {formatTimeRange(schedule.startTime, schedule.endTime)} ({schedule.course.sks || 3} SKS)
                        </span>
                      </div>
                      <h3>{schedule.course.name}</h3>
                      <div className="class-details">
                        <span>
                          <Icon name="location_on" />
                          {schedule.room || 'Ruang belum ditentukan'}
                        </span>
                        <span>
                          <Icon name="person" />
                          {schedule.course.lecturer || 'Dosen belum ditentukan'}
                        </span>
                      </div>
                    </div>
                    {isNow ? (
                      <button className="primary-button attendance-button" type="button">
                        <Icon name="camera_alt" />Ambil Foto Absensi
                      </button>
                    ) : isUpcoming ? (
                      <div className="countdown">
                        <Icon name="schedule" />
                        Mulai dalam {getTimeUntil(schedule.startTime)}
                      </div>
                    ) : null}
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section className="panel tasks-panel">
          <div className="panel-heading task-heading">
            <div className="heading-title">
              <i className="section-bar red-bar" />
              <div>
                <h2>Tugas Prioritas Tinggi &amp; Mendatang</h2>
                <p>Kelola tenggat waktu agar tidak tertinggal</p>
              </div>
            </div>
            <div className="task-tabs">
              <button
                className={selectedTab === "Semua" ? "selected" : ""}
                onClick={() => setSelectedTab("Semua")}
                type="button"
              >
                Semua
              </button>
              <button
                className={selectedTab === "Belum Selesai" ? "selected" : ""}
                onClick={() => setSelectedTab("Belum Selesai")}
                type="button"
              >
                Belum Selesai
              </button>
            </div>
          </div>
          <div className="task-list">
            {tasks.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                Tidak ada tugas yang tersedia
              </div>
            ) : (
              tasks.map((task) => {
                const priority = task.deadline ? getPriorityLabel(task.deadline) : { label: 'Normal', tone: 'normal' as const };
                
                return (
                  <TaskItem
                    key={task.id}
                    title={task.title}
                    due={task.deadline ? formatDeadline(task.deadline) : 'Tidak ada deadline'}
                    course={task.course?.name || 'Tanpa Mata Kuliah'}
                    priority={priority.label}
                    type="Tugas Individu"
                    priorityTone={priority.tone}
                  />
                );
              })
            )}
          </div>
        </section>
      </div>

      <div className="right-column">
        <section className="panel attendance-panel">
          <div className="panel-heading compact-heading">
            <div className="heading-title">
              <i className="section-bar teal-bar" />
              <h2>Rekap Kehadiran</h2>
            </div>
            <span className="minimum-badge">Batas Min 75%</span>
          </div>
          <p className="panel-intro">
            Pantau sisa jatah absen per mata kuliah agar<br /> tetap memenuhi syarat ujian akhir.
          </p>
          <div className="attendance-list">
            {attendanceStats.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                Belum ada data kehadiran
              </div>
            ) : (
              attendanceStats.map((stat) => (
                <AttendanceRow
                  key={stat.courseId}
                  name={stat.courseName}
                  value={`${stat.percentage}%`}
                  count={`(${stat.attended}/${stat.total})`}
                  safe={`Sisa absen aman: ${stat.remainingSafeAbsences}x`}
                  status={stat.status}
                  tone={stat.tone}
                  width={`${stat.percentage}%`}
                />
              ))
            )}
          </div>
          <div className="info-note">
            <Icon name="info" />
            <span>Presensi minimal 75% per mata kuliah diwajibkan oleh BAAK untuk mengikuti UAS.</span>
          </div>
        </section>

        <section className="panel upload-panel">
          <div className="heading-title">
            <i className="section-bar purple-bar" />
            <h2>Unggah Cepat Bukti Foto</h2>
          </div>
          <p className="panel-intro">
            Ambil swafoto atau bukti presensi di ruang kuliah. Timestamp &amp; geotag disematkan otomatis.
          </p>
          
          {/* Hidden file input for gallery */}
          <input 
            ref={fileInputGalleryRef}
            type="file" 
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />

          {/* Hidden video and canvas for camera */}
          <video 
            ref={videoRef}
            style={{ display: 'none' }}
            playsInline
            autoPlay
          />
          <canvas 
            ref={canvasRef}
            style={{ display: 'none' }}
          />

          {showCamera ? (
            // Camera View - Live camera feed
            <div className="camera-view" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <video 
                ref={videoRef}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '400px', 
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  background: '#000',
                  display: 'block',
                  margin: '0 auto 1rem'
                }} 
                autoPlay
                playsInline
              />
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button 
                  className="primary-button" 
                  onClick={capturePhoto}
                  type="button"
                  style={{ flex: 1 }}
                >
                  <Icon name="camera_alt" />
                  Ambil Foto
                </button>
                <button 
                  className="secondary-button" 
                  onClick={closeCamera}
                  type="button"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : previewUrl ? (
            <div className="upload-preview" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <img 
                src={previewUrl} 
                alt="Preview" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '300px', 
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }} 
              />
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button 
                  className="primary-button" 
                  onClick={handleUpload}
                  disabled={uploading}
                  type="button"
                  style={{ flex: 1 }}
                >
                  <Icon name="photo_camera" />
                  {uploading ? 'Mengunggah...' : 'Upload Foto'}
                </button>
                <button 
                  className="secondary-button" 
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    if (fileInputGalleryRef.current) fileInputGalleryRef.current.value = '';
                  }}
                  disabled={uploading}
                  type="button"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div className="upload-dropzone">
              <div className="upload-icon">
                <Icon name="add_a_photo" />
              </div>
              <strong>Ketuk atau seret foto presensi</strong>
              <span>Mendukung JPEG, PNG hingga 10MB</span>
              
              <div style={{ 
                display: 'flex', 
                gap: '0.75rem', 
                marginTop: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <button 
                  className="camera-link" 
                  type="button" 
                  onClick={openCamera}
                  style={{
                    flex: '1 1 auto',
                    minWidth: '140px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Icon name="camera_alt" />
                  Buka Kamera
                </button>
                
                <button 
                  className="camera-link" 
                  type="button" 
                  onClick={openGallery}
                  style={{
                    flex: '1 1 auto',
                    minWidth: '140px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Icon name="photo_camera" />
                  Pilih dari Galeri
                </button>
              </div>
            </div>
          )}
          
          {todaySchedules.length > 0 && (
            <div className="selected-course">
              <div className="selected-label">Mata Kuliah<br />Terpilih:</div>
              <div>{todaySchedules[0].course.name}</div>
              <div className="selected-label">Dosen Verifikator:</div>
              <strong>{todaySchedules[0].course.lecturer || 'Belum ditentukan'}</strong>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function TaskItem({
  title,
  due,
  course,
  priority,
  type,
  priorityTone,
  group = false
}: {
  title: string;
  due: string;
  course: string;
  priority: string;
  type: string;
  priorityTone: "urgent" | "medium" | "normal";
  group?: boolean;
}) {
  return (
    <article className="task-item">
      <input type="checkbox" aria-label={`Tandai ${title} selesai`} />
      <div className="task-content">
        <h3>{title}</h3>
        <div className={`task-due ${priorityTone}`}>{due}</div>
        <div className="task-tags">
          <span>{course}</span>
          <span className={`priority ${priorityTone}`}>{priority}</span>
        </div>
      </div>
      {group ? (
        <div className="group-label">
          <div className="group-avatars">
            <i>R</i><i>A</i><i>D</i>
          </div>
          {type}
        </div>
      ) : (
        <div className="individual-label">
          <Icon name="person" />
          {type}
        </div>
      )}
    </article>
  );
}

function AttendanceRow({
  name,
  value,
  count,
  safe,
  status,
  tone,
  width
}: {
  name: string;
  value: string;
  count: string;
  safe: string;
  status: string;
  tone: string;
  width: string;
}) {
  return (
    <div className={`attendance-row ${tone}`}>
      <div className="attendance-name">
        <span>{name}</span>
        <strong>{value} <small>{count}</small></strong>
      </div>
      <div className="progress-track">
        <div style={{ width }} />
      </div>
      <div className="attendance-bottom">
        <span>{safe}</span>
        <b>{status}</b>
      </div>
    </div>
  );
}
