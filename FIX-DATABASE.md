# PERBAIKAN ERROR DATABASE

## Masalah
Error 500 saat menambahkan mata kuliah karena Prisma Client belum di-regenerate setelah menambahkan field baru (`totalSessions` dan `maxAbsences`).

## Solusi

### Langkah 1: Stop Dev Server
Tekan `Ctrl + C` di terminal yang menjalankan `npm run dev`

### Langkah 2: Regenerate Prisma Client
Jalankan command ini di terminal:

```bash
npm run prisma:generate
```

ATAU jika tidak bisa, coba:

```bash
npx prisma generate
```

### Langkah 3: Restart Dev Server
Setelah Prisma berhasil di-generate, jalankan:

```bash
npm run dev
```

### Langkah 4: Test
1. Buka `http://localhost:3000/courses`
2. Klik "Tambah Mata Kuliah"
3. Isi form dan klik "Simpan Mata Kuliah"
4. Seharusnya sudah berhasil!

## Jika Masih Error

Jika masih error setelah langkah di atas, coba:

```bash
# Stop dev server dulu (Ctrl+C)

# Hapus folder node_modules/.prisma
Remove-Item -Recurse -Force node_modules\.prisma

# Generate ulang
npm run prisma:generate

# Restart dev server
npm run dev
```

## Penjelasan
Field baru yang ditambahkan:
- **totalSessions**: Total sesi pertemuan dalam 1 semester (contoh: 14)
- **maxAbsences**: Jatah absen maksimal (contoh: 3). Jika mahasiswa absen melebihi ini, tidak bisa ikut ujian.

Fields ini sudah ditambahkan ke database tapi Prisma Client TypeScript belum tahu tentang field baru tersebut. Makanya perlu di-regenerate.
