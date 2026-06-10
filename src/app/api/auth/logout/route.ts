import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { destroySession } from '@/lib/sessions'

export async function POST() {
  const store = await cookies()
  const token = store.get('admin_session')?.value
  destroySession(token) // server-side revocation
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_session', '', {
    maxAge: 0,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  return res
}
