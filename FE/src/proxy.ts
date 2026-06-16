import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get('refreshToken')
  const pathname = request.nextUrl.pathname

  const authRoutes = ['/login', '/register', '/forgot-password', '/confirm-otp', '/reset-password']

  if (!refreshToken && !authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (refreshToken && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
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
    '/company', // <--- Khớp trang company gốc
    '/company/:path*',
    '/candidate', // <--- Khớp trang candidate gốc
    '/candidate/:path*',
  ],
}
