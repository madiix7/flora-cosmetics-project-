import { NextRequest, NextResponse } from 'next/server'
import { getOrders, saveOrders } from '@/lib/server-data'
import { requireAdmin } from '@/lib/admin-auth'
import { auditLog } from '@/lib/audit'
import type { OrderStatus } from '@/types'

const VALID_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'delivered', 'cancelled']

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (auth) return auth
  const { id } = await params
  const order = getOrders().find((o) => o.id === id)
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req)
  if (auth) return auth
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const { status } = body as { status?: OrderStatus }

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid or missing status' }, { status: 400 })
  }

  const orders = getOrders()
  const idx = orders.findIndex((o) => o.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const prev = orders[idx].status
  // Only allow status updates — no other fields can be overwritten via PATCH
  orders[idx] = { ...orders[idx], status }
  saveOrders(orders)
  auditLog('order.status_changed', { id, from: prev, to: status })
  return NextResponse.json(orders[idx])
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(_req)
  if (auth) return auth
  const { id } = await params
  const orders = getOrders()
  const filtered = orders.filter((o) => o.id !== id)
  if (filtered.length === orders.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  saveOrders(filtered)
  auditLog('order.deleted', { id })
  return NextResponse.json({ ok: true })
}
