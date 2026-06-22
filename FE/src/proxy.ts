import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.get('hasSession')?.value === 'true'
  const pathname = request.nextUrl.pathname

  const authRoutes = ['/login', '/register', '/forgot-password', '/confirm-otp', '/reset-password']

  if (!hasSession && !authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (hasSession && authRoutes.includes(pathname)) {
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
    '/recruiter', // <--- Khớp trang recruiter gốc
    '/recruiter/:path*',
    '/candidate', // <--- Khớp trang candidate gốc
    '/candidate/:path*',
  ],
}
