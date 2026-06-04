import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get('refreshToken')
  console.log('middleware run')
  console.log(request.cookies.get('refreshToken'))

  if (!refreshToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
