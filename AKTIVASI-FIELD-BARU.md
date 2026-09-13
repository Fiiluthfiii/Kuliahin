# CARA MENGAKTIFKAN FIELD TOTAL SESI & JATAH ABSEN

## Status Saat Ini
✅ Field **Total Sesi Pertemuan** dan **Jatah Absen Maksimal** sudah ditambahkan di form
✅ Database sudah punya kolom `totalSessions` dan `maxAbsences`
⚠️ **SEMENTARA** field ini belum tersimpan ke database (di-comment di code)

## Kenapa?
Prisma Client belum di-regenerate, jadi tidak mengenali field baru. Dev server harus di-stop dulu untuk regenerate.

## Cara Aktivasi (Setelah Dev Server Bisa Di-Stop):

### 1. Stop Dev Server
Di terminal yang menjalankan `npm run dev`, tekan:
```
Ctrl + C
```

### 2. Regenerate Prisma Client
Jalankan salah satu command ini:

**Opsi 1 (Recommended):**
```bash
npm run prisma:generate
```

**Opsi 2:**
```bash
npx prisma generate
```

**Opsi 3 (Jika error permission):**
```bash
node regenerate-prisma.js
```

Tunggu sampai muncul pesan: **"✔ Generated Prisma Client"**

### 3. Aktifkan Code di API

#### File 1: `app/api/courses/route.ts`
Cari baris ini (sekitar line 85-92):
```typescript
// TEMPORARY: Comment out totalSessions and maxAbsences until Prisma is regenerated
// Uncomment after running: npm run prisma:generate
// if (totalSessions !== undefined && totalSessions !== null) {
//   courseData.totalSessions = parseInt(totalSessions);
// }
// if (maxAbsences !== undefined && maxAbsences !== null) {
//   courseData.maxAbsences = parseInt(maxAbsences);
// }
```

**UNCOMMENT** jadi seperti ini:
```typescript
// Prisma sudah di-regenerate, field aktif!
if (totalSessions !== undefined && totalSessions !== null) {
  courseData.totalSessions = parseInt(totalSessions);
}
if (maxAbsences !== undefined && maxAbsences !== null) {
  courseData.maxAbsences = parseInt(maxAbsences);
}
```

#### File 2: `app/api/schedules/route.ts`
Cari baris ini (sekitar line 83-84):
```typescript
// TEMPORARY: Comment out until Prisma regenerated
// totalSessions: totalSessions ? parseInt(totalSessions) : null,
// maxAbsences: maxAbsences ? parseInt(maxAbsences) : null,
```

**UNCOMMENT** jadi seperti ini:
```typescript
// Prisma sudah di-regenerate, field aktif!
totalSessions: totalSessions ? parseInt(totalSessions) : null,
maxAbsences: maxAbsences ? parseInt(maxAbsences) : null,
```

### 4. Restart Dev Server
```bash
npm run dev
```

### 5. Test!
1. Buka http://localhost:3000/courses
2. Klik "Tambah Mata Kuliah"
3. Isi semua field termasuk:
   - Total Sesi Pertemuan: 14 (atau angka lain)
   - Jatah Absen Maksimal: 3 (atau angka lain)
4. Klik "Simpan Mata Kuliah"
5. Sekarang field akan **TERSIMPAN KE DATABASE**! ✅

## Kenapa Tidak Langsung Diaktifkan?
Karena:
1. Dev server sedang jalan, tidak bisa regenerate Prisma
2. Jika dipaksa, akan error 500 (seperti yang terjadi tadi)
3. Dengan comment sementara, **form tetap bisa digunakan** untuk simpan mata kuliah (tanpa 2 field baru)

## Untuk Sementara
Form akan simpan mata kuliah **tanpa** Total Sesi dan Jatah Absen. Field-field lain (nama, kode, SKS, dosen, jadwal, dll) tetap tersimpan normal.

Setelah ikuti langkah aktivasi di atas, **semua field akan tersimpan lengkap**!
