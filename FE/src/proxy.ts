import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.get('hasSession')?.value === 'true'
  const userRole = request.cookies.get('userRole')?.value
  const pathname = request.nextUrl.pathname

  const authRoutes = ['/login', '/register', '/forgot-password', '/confirm-otp', '/reset-password']

  // 1. Chưa đăng nhập: Nếu cố truy cập route cần auth -> Redirect về /login
  if (!hasSession && !authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Đã đăng nhập:
  if (hasSession) {
    // Nếu truy cập trang auth -> Redirect về /dashboard để định tuyến tự động
    if (authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Bảo mật phân quyền: Candidate không được vào /recruiter hay /admin, v.v.
    if (userRole) {
      if (pathname.startsWith('/admin') && userRole !== 'ADMIN_SYSTEM') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      if (pathname.startsWith('/recruiter') && userRole !== 'RECRUITER') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      if (pathname.startsWith('/candidate') && userRole !== 'CANDIDATE') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/forgot-password',
    '/confirm-otp',
    '/reset-password',
    '/dashboard', // <--- Khớp trang dashboard gốc
    '/admin', // <--- Khớp trang admin gốc
    '/admin/:path*',
    '/recruiter', // <--- Khớp trang recruiter gốc
    '/recruiter/:path*',
    '/candidate', // <--- Khớp trang candidate gốc
    '/candidate/:path*',
  ],
}
