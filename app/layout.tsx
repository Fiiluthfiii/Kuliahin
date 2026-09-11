import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kuliahin - Jadwal & Tugas Kuliah",
  description: "Aplikasi untuk mencatat jadwal kuliah, mengelola tugas, dan dokumentasi kehadiran",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}
