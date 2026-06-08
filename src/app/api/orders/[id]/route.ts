import { NextRequest, NextResponse } from 'next/server'
import { getOrders, saveOrders } from '@/lib/server-data'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const orders = getOrders()
  const idx = orders.findIndex((o) => o.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  orders[idx] = { ...orders[idx], ...body }
  saveOrders(orders)
  return NextResponse.json(orders[idx])
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const orders = getOrders()
  const filtered = orders.filter((o) => o.id !== id)
  if (filtered.length === orders.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  saveOrders(filtered)
  return NextResponse.json({ ok: true })
}
