# ⚠️ PENTING: DATA MAXABSENCES DAN TOTALSESSIONS BELUM TERSIMPAN

## Masalah Saat Ini
Anda sudah input:
- ✅ Total Sesi Pertemuan: 16 (untuk Kapita Selekta)
- ✅ Jatah Absen Maksimal: 3 (untuk Kapita Selekta)

Tapi data ini **BELUM TERSIMPAN** ke database karena Prisma Client belum di-regenerate.

**Bukti:**
- Di Dashboard menampilkan "Sisa absen aman: 0x" → SALAH! Seharusnya 3x
- Di halaman Courses card menampilkan "0% (0/0 Sesi)" → SALAH! Seharusnya pakai 16 sesi

## Kenapa Ini Terjadi?
Field `totalSessions` dan `maxAbsences`:
1. ✅ Sudah ditambahkan ke database (migration berhasil)
2. ✅ Sudah ada di form input (bisa diisi)
3. ❌ **BELUM bisa tersimpan** karena Prisma Client belum tahu tentang field baru ini

## Solusi (HARUS DILAKUKAN SEKARANG):

### Step 1: Stop Dev Server
Di terminal yang running `npm run dev`, tekan:
```
Ctrl + C
```

### Step 2: Regenerate Prisma Client
Jalankan salah satu command ini:

**Opsi A (Recommended):**
```bash
npm run prisma:generate
```

**Opsi B:**
```bash
npx prisma generate
```

**Opsi C (Jika error):**
```bash
node regenerate-prisma.js
```

Tunggu sampai muncul: ✅ **"Generated Prisma Client"**

### Step 3: Aktifkan Code di API
Setelah Prisma berhasil di-regenerate, **UNCOMMENT** code berikut:

#### File: `app/api/courses/route.ts` (line 85-92)
**CARI:**
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

**GANTI JADI:**
```typescript
// Prisma sudah di-regenerate!
if (totalSessions !== undefined && totalSessions !== null) {
  courseData.totalSessions = parseInt(totalSessions);
}
if (maxAbsences !== undefined && maxAbsences !== null) {
  courseData.maxAbsences = parseInt(maxAbsences);
}
```

#### File: `app/api/schedules/route.ts` (line 83-84)
**CARI:**
```typescript
// TEMPORARY: Comment out until Prisma regenerated
// totalSessions: totalSessions ? parseInt(totalSessions) : null,
// maxAbsences: maxAbsences ? parseInt(maxAbsences) : null,
```

**GANTI JADI:**
```typescript
// Prisma sudah di-regenerate!
totalSessions: totalSessions ? parseInt(totalSessions) : null,
maxAbsences: maxAbsences ? parseInt(maxAbsences) : null,
```

### Step 4: Restart Dev Server
```bash
npm run dev
```

### Step 5: Input Ulang Data Kapita Selekta
Karena data sebelumnya TIDAK tersimpan, Anda HARUS:

1. Buka halaman **Mata Kuliah** (`http://localhost:3000/courses`)
2. Cari mata kuliah **"Kapita Selekta"**
3. Klik icon **titik tiga (⋮)** 
4. Klik **"Hapus"** untuk hapus data lama
5. Klik **"Tambah Mata Kuliah"** untuk buat baru
6. Isi form lengkap:
   - Nama: Kapita Selekta
   - Kode: IG1233 (atau kode asli)
   - SKS: 3
   - Dosen: RAIDAH
   - **Total Sesi Pertemuan: 16** ← PENTING!
   - **Jatah Absen Maksimal: 3** ← PENTING!
   - Hari: Senin
   - Jam: 13:00 - 15:40
   - Ruang: LAB IOT
7. Klik **"Simpan Mata Kuliah"**

Sekarang data akan **TERSIMPAN LENGKAP** dengan totalSessions dan maxAbsences!

### Step 6: Verifikasi
Setelah input ulang, cek:

1. **Dashboard** → Card "Rekap Kehadiran"
   - Seharusnya menampilkan: "Sisa absen aman: 3x" ✅

2. **Halaman Courses** → Card Kapita Selekta
   - Seharusnya menampilkan: "0% (0/16 Sesi)" ✅

3. **Halaman Schedule** → Card di kalender
   - Sudah benar (tidak terpengaruh)

## Ringkasan
1. ❌ **SEBELUM** regenerate: Data maxAbsences TIDAK tersimpan → Dashboard salah
2. ✅ **SETELAH** regenerate + uncomment + input ulang: Semua data tersimpan → Dashboard benar!

## File Panduan
- Instruksi regenerate: `FIX-DATABASE.md`
- Instruksi aktivasi field: `AKTIVASI-FIELD-BARU.md`
- File ini: `PENTING-BACA-INI.md`
