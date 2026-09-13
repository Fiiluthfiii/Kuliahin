import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" suppressHydrationWarning>
      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/images/logos/logo-kuliahin.png" 
              alt="Logo Kuliahin" 
              width={40} 
              height={40}
              className="object-contain"
            />
            <span className="text-xl font-bold text-[#0F172A]">Kuliahin</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="px-4 py-2 text-sm font-semibold text-[#4338CA] hover:text-[#3730A3] transition-colors">
              Masuk
            </a>
            <a href="/register" className="px-4 py-2 bg-[#4338CA] hover:bg-[#3730A3] text-white text-sm font-semibold rounded-lg transition-colors">
              Daftar Gratis
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#F8FAFC] via-[#EEF2FF] to-[#E0E7FF]">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="inline-block px-3 py-1 bg-white/80 rounded-full text-xs font-bold text-[#4338CA] uppercase tracking-wide mb-6">
            Platform Akademik Mahasiswa
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-extrabold text-[#0F172A] mb-6 leading-tight">
            Kelola Jadwal Kuliah, Tugas & Kehadiran dalam{' '}
            <span className="text-[#4338CA]">Satu Platform</span>
          </h1>
          
          <p className="text-lg text-[#475569] mb-8 max-w-2xl mx-auto">
            Sinkronkan perkuliahan, pantau batas absen, kelola deadline tugas, dan simpan bukti kehadiran foto secara aman di cloud.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a href="/register" className="px-8 py-3 bg-[#4338CA] hover:bg-[#3730A3] text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2">
              Mulai Gratis Sekarang
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a href="/login" className="px-8 py-3 bg-white hover:bg-gray-50 text-[#4338CA] font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg border-2 border-[#4338CA]">
              Sudah Punya Akun? Masuk
            </a>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-[#EEF2FF] rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#4338CA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-[#0F172A] mb-2">Jadwal Terstruktur</h3>
              <p className="text-sm text-[#475569]">Tampilan kalender mingguan dengan reminder otomatis sebelum kuliah dimulai</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-[#ECFDF5] rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#047857]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-[#0F172A] mb-2">Bukti Kehadiran Foto</h3>
              <p className="text-sm text-[#475569]">Dokumentasi kehadiran dengan foto tersimpan aman di Cloudflare R2</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-[#FEF2F2] rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#B91C1C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="font-bold text-[#0F172A] mb-2">Pelacak Deadline</h3>
              <p className="text-sm text-[#475569]">Kelola tugas dengan prioritas dan notifikasi mendekati deadline</p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 flex items-center justify-center gap-8">
            <div>
              <div className="text-3xl font-extrabold text-[#4338CA]">14,200+</div>
              <div className="text-sm text-[#475569]">Mahasiswa Aktif</div>
            </div>
            <div className="w-px h-12 bg-[#E2E8F0]"></div>
            <div>
              <div className="text-3xl font-extrabold text-[#4338CA]">50+</div>
              <div className="text-sm text-[#475569]">Kampus Indonesia</div>
            </div>
            <div className="w-px h-12 bg-[#E2E8F0]"></div>
            <div>
              <div className="text-3xl font-extrabold text-[#4338CA]">100%</div>
              <div className="text-sm text-[#475569]">Data Terisolasi</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-[#94A3B8]">
          <p>&copy; 2024 Kuliahin. Platform manajemen akademik untuk mahasiswa Indonesia.</p>
        </div>
      </footer>
    </div>
  );
}
