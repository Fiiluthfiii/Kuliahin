# Kuliahin - Student Companion App

Aplikasi manajemen perkuliahan untuk mahasiswa yang terintegrasi dengan database real-time.

## Fitur Dashboard yang Telah Diaktifkan

✅ **Statistik Real-time**
- Jadwal kuliah hari ini dari database
- Jumlah tugas yang belum selesai
- Rata-rata kehadiran per mata kuliah
- Total SKS semester aktif

✅ **Jadwal Kuliah Hari Ini**
- Menampilkan jadwal sesuai hari ini
- Status: Sedang Berlangsung / Akan Datang
- Informasi ruangan dan dosen
- Countdown waktu mulai kelas

✅ **Daftar Tugas**
- Tugas terurut berdasarkan deadline
- Prioritas otomatis (Urgent/Medium/Normal)
- Filter: Semua / Belum Selesai
- Informasi mata kuliah terkait

✅ **Rekap Kehadiran**
- Persentase kehadiran per mata kuliah
- Sisa jatah absen aman
- Status: Sempurna/Aman/Waspada/Bahaya
- Progress bar visual

✅ **Upload Bukti Foto**
- Interface untuk upload foto presensi
- Auto-select mata kuliah dari jadwal hari ini

## Setup dan Instalasi

### 1. Persiapan Database

Pastikan file `.env` sudah diisi dengan benar:

\`\`\`env
DATABASE_URL="your-postgresql-connection-string"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
\`\`\`

### 2. Migrasi Database

Jalankan migrasi untuk membuat tabel di database:

\`\`\`bash
npx prisma generate
npx prisma migrate deploy
\`\`\`

### 3. Seed Database dengan Data Contoh

Isi database dengan data contoh (user, courses, schedules, tasks, attendance):

\`\`\`bash
npm run db:seed
\`\`\`

Script ini akan membuat:
- 1 user (Dimas Pratama)
- 6 mata kuliah (Pemrograman Web Lanjut, Basis Data Lanjut, dll)
- 9 jadwal perkuliahan (Senin-Jumat)
- Record kehadiran 4 minggu terakhir
- 5 tugas dengan berbagai deadline

### 4. Jalankan Aplikasi

\`\`\`bash
npm run dev
\`\`\`

Buka [http://localhost:3000/dashboard](http://localhost:3000/dashboard) di browser.

## Struktur Data

### User
- name, email, password
- Relasi: courses, tasks, attendances

### Course
- name, code, lecturer, sks, semester
- Relasi: schedules, tasks, attendances

### Schedule
- dayOfWeek, startTime, endTime, room
- Relasi ke course

### Task
- title, description, deadline, priority, status
- Relasi ke course dan user

### Attendance
- sessionDate, photoKey, status
- Relasi ke user, course, schedule

## API Endpoints

### GET /api/dashboard?userId={userId}
Mendapatkan semua data dashboard:
- User info
- Statistics (today's classes, pending tasks, attendance)
- Today's schedules
- Pending tasks (top 5)
- Attendance statistics per course

## Komponen

- **app/dashboard/page.tsx** - Server component, fetch data dari database
- **app/dashboard/DashboardClient.tsx** - Client component, handle interaktivitas
- **lib/utils.ts** - Helper functions (format date, time, dll)
- **lib/prisma.ts** - Prisma client instance
- **app/api/dashboard/route.ts** - API route untuk dashboard data

## Teknologi

- **Next.js 15** - React framework dengan App Router
- **Prisma** - ORM untuk PostgreSQL
- **PostgreSQL** (Neon) - Database
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling (via globals.css)

## Troubleshooting

### Database Connection Error
- Pastikan DATABASE_URL di `.env` sudah benar
- Cek koneksi internet untuk Neon database

### No Data Showing
- Jalankan `npm run db:seed` untuk mengisi data contoh
- Cek console browser untuk error

### TypeScript Errors
- Jalankan `npx prisma generate` untuk regenerate Prisma client

## Next Steps

Fitur yang bisa dikembangkan selanjutnya:
- [ ] Authentication dengan NextAuth
- [ ] Upload foto presensi ke Cloudflare R2
- [ ] Edit/Delete tasks
- [ ] Calendar view untuk jadwal
- [ ] Notifikasi deadline tugas
- [ ] Export data ke PDF

## Kontribusi

Untuk menambahkan fitur baru, buat branch baru dan submit pull request.

## Lisensi

MIT License
