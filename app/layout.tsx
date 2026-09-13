import type { Metadata } from "next";
import "./globals.css";
import "./course-modal.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Kuliahin - Jadwal & Tugas Kuliah",
  description: "Aplikasi untuk mencatat jadwal kuliah, mengelola tugas, dan dokumentasi kehadiran",
  icons: {
    icon: '/images/logos/LOGO-KULIAHIN.png',
    shortcut: '/images/logos/LOGO-KULIAHIN.png',
    apple: '/images/logos/LOGO-KULIAHIN.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
