import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/sessions'

// Lightweight guard: redirect unauthenticated browsers away from /admin pages.
// The API routes and admin layout each call requireAdmin() as the authoritative check.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return NextResponse.next()
  }
  const token = req.cookies.get('admin_session')?.value
  if (!(await validateSession(token))) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
