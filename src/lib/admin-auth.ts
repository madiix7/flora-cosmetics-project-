import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from './sessions'

/**
 * Returns a 403 response if the Origin header is present and does not match
 * the Host header. Blocks browser-based CSRF on state-mutating requests while
 * allowing non-browser clients (curl, mobile) that send no Origin.
 */
function originAllowed(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true
  const host = req.headers.get('host') ?? ''
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

export async function requireAdmin(req?: NextRequest): Promise<NextResponse | null> {
  const store = await cookies()
  const token = store.get('admin_session')?.value
  if (!(await validateSession(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (req && !originAllowed(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}
