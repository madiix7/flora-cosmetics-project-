import { NextRequest, NextResponse } from 'next/server'
import { getOrders, saveOrders } from '@/lib/server-data'
import type { Order } from '@/types'

export async function GET() {
  const orders = getOrders()
  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const order: Order = await req.json()
  const orders = getOrders()
  orders.unshift(order) // newest first
  saveOrders(orders)
  return NextResponse.json(order, { status: 201 })
}
