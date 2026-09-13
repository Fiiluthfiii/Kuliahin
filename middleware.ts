import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Halaman yang memerlukan autentikasi
        const protectedPaths = ["/dashboard", "/courses", "/tasks", "/schedule", "/attendance", "/settings"];
        const path = req.nextUrl.pathname;

        // Cek apakah path adalah protected
        const isProtected = protectedPaths.some(protectedPath => 
          path.startsWith(protectedPath)
        );

        // Jika protected dan tidak ada token, redirect ke login
        if (isProtected && !token) {
          return false;
        }

        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/courses/:path*", "/tasks/:path*", "/schedule/:path*", "/attendance/:path*", "/settings/:path*"],
};
