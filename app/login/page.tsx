"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      setError("Terjadi kesalahan saat login dengan Google");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4" suppressHydrationWarning>
      {/* Main Content */}
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-6 items-center" suppressHydrationWarning>
        {/* Left Side - Info */}
        <div className="bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] rounded-2xl p-6">
          <div className="inline-block px-2.5 py-1 bg-white/80 rounded-full text-[10px] font-bold text-[#4338CA] uppercase tracking-wide mb-4">
            Platform Akademik Cerdas
          </div>
          
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0F172A] mb-2 leading-tight">
            Ruang Fokus & Teratur Menuju <span className="text-[#4338CA]">Kelulusan Tepat Waktu.</span>
          </h1>
          
          <p className="text-sm text-[#475569] mb-8">
            Sinkronkan perkuliahan, pantau persentase batas absen per mata kuliah, dan jangan biarkan satu pun tugas terlewat.
          </p>

          {/* Feature Cards */}
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#EEF2FF] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#4338CA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm text-[#0F172A]">Jadwal Kuliah Presisi</h3>
                    <span className="text-[10px] font-bold text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded-full">24 SKS Aktif</span>
                  </div>
                  <p className="text-xs text-[#475569]">Ruang lab, gedung fakultas, dan reminder 15 menit sebelum kelas dimulai.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#ECFDF5] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#047857]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm text-[#0F172A]">Presensi & Bukti Foto</h3>
                    <span className="text-[10px] font-bold text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded-full">Cloud Secure</span>
                  </div>
                  <p className="text-xs text-[#475569]">Arsip foto geotagged tersimpan aman tanpa memenuhi penyimpanan lokal.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#FEF2F2] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#B91C1C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm text-[#0F172A]">Pelacak Tugas & Deadline</h3>
                    <span className="text-[10px] font-bold text-[#B91C1C] bg-[#FEF2F2] px-2 py-0.5 rounded-full">Tenggat Ketat</span>
                  </div>
                  <p className="text-xs text-[#475569]">Dikelompokkan otomatis berdasarkan urgensi waktu dan bobot mata kuliah.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div>
          <div className="bg-white rounded-2xl shadow-lg border border-[#E2E8F0] p-6">
            <div className="mb-4">
              <div className="inline-block px-2.5 py-1 bg-[#EEF2FF] rounded-full text-[10px] font-bold text-[#4338CA] uppercase mb-3">
                Portal Mahasiswa
              </div>
              <div className="flex items-baseline justify-between mb-1">
                <h2 className="text-xl font-extrabold text-[#0F172A]">
                  Selamat Datang Kembali di Kuliahin
                </h2>
                <span className="text-[10px] text-[#94A3B8] whitespace-nowrap ml-2">Semester Ganjil 2024/2025</span>
              </div>
              <p className="text-sm text-[#475569]">
                Masuk untuk mengelola jadwal kuliah, tugas, dan presensi foto Anda.
              </p>
            </div>

            {/* Google SSO Button */}
            <button 
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-[#4338CA] hover:bg-[#3730A3] text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md mb-2 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" opacity="0.8"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity="0.8"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" opacity="0.8"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" opacity="0.8"/>
              </svg>
              <span>{loading ? "Memproses..." : "Gunakan Akun Google"}</span>
            </button>

            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EEF2FF] text-[10px] font-semibold text-[#4338CA]">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Rekomendasi: Akun Kampus SSO
              </span>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E2E8F0]"></div>
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="px-2 bg-white text-[#94A3B8] font-medium uppercase tracking-wide">Atau Masuk dengan Email & Password</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Email Mahasiswa / Akun Kampus
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="admin@seacant.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-transparent transition-all bg-[#F8FAFC] disabled:opacity-50"
                  />
                </div>
                <p className="mt-1 text-[10px] text-[#94A3B8]">Gunakan domain .ac.id bila ada</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#0F172A]">
                    Kata Sandi
                  </label>
                  <a href="#" className="text-xs font-semibold text-[#4338CA] hover:text-[#3730A3]">
                    Lupa kata sandi?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-10 py-2.5 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-transparent transition-all bg-[#F8FAFC] disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569]"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center pt-1">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#4338CA] focus:ring-[#4338CA] focus:ring-offset-0"
                />
                <label htmlFor="remember" className="ml-2 text-xs text-[#475569]">
                  Ingat saya di perangkat ini (30 hari)
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4338CA] hover:bg-[#3730A3] text-white font-bold py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Memproses..." : "Masuk ke Akun"}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-[#475569]">
                Belum punya akun Kuliahin?{' '}
                <a href="/register" className="font-bold text-[#4338CA] hover:text-[#3730A3] inline-flex items-center gap-1">
                  Daftar Sekarang
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
              <p className="text-[10px] text-center text-[#94A3B8]">
                Memiliki kendala login SSO kampus Anda? Hubungi admin akademik via{' '}
                <a href="#" className="text-[#4338CA] hover:underline font-semibold">
                  Pusat Bantuan Kuliahin
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
