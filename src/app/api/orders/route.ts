import { NextRequest, NextResponse } from 'next/server'
import { getOrders, saveOrders, getSettings, getProducts } from '@/lib/server-data'
import { requireAdmin } from '@/lib/admin-auth'
import { generateOrderId } from '@/lib/utils'
import { auditLog } from '@/lib/audit'
import type { Order, CartItem } from '@/types'

// 10 order submissions per IP per hour — prevents order-flood DoS
const orderAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ORDERS = 10
const ORDER_WINDOW_MS = 60 * 60 * 1000

function checkOrderRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = orderAttempts.get(ip)
  if (!entry || now > entry.resetAt) {
    if (orderAttempts.size > 1000) {
      for (const [k, v] of orderAttempts) if (now > v.resetAt) orderAttempts.delete(k)
    }
    orderAttempts.set(ip, { count: 1, resetAt: now + ORDER_WINDOW_MS })
    return true
  }
  if (entry.count >= MAX_ORDERS) return false
  entry.count++
  return true
}

export async function GET() {
  const auth = await requireAdmin()
  if (auth) return auth
  return NextResponse.json(getOrders())
}

export async function POST(req: NextRequest) {
  // Rate-limit order submissions by IP
  const forwarded = req.headers.get('x-forwarded-for')
  const ip =
    req.headers.get('x-real-ip') ??
    (forwarded ? forwarded.split(',')[0].trim() : null) ??
    'unknown'
  if (!checkOrderRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)

  if (
    !body?.customer?.fullName ||
    !body?.customer?.phone ||
    !Array.isArray(body?.items) ||
    body.items.length === 0
  ) {
    return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 })
  }

  if (body.items.length > 50) {
    return NextResponse.json({ error: 'Order exceeds maximum item count' }, { status: 400 })
  }

  const settings = getSettings()
  const allProducts = getProducts()

  // Resolve every item from AUTHORITATIVE server-side product data.
  // Client-supplied product fields (name, description, images, etc.) are discarded.
  const resolvedItems: CartItem[] = []
  for (const rawItem of body.items as Array<Record<string, unknown>>) {
    const productId = String((rawItem.product as Record<string, unknown>)?.id ?? '')
    if (!productId) {
      return NextResponse.json({ error: 'Missing product id' }, { status: 400 })
    }
    const qty = rawItem.quantity
    if (!Number.isInteger(qty) || (qty as number) < 1 || (qty as number) > 99) {
      return NextResponse.json({ error: 'Item quantity must be between 1 and 99' }, { status: 400 })
    }
    const authoritative = allProducts.find((p) => p.id === productId)
    if (!authoritative) {
      return NextResponse.json({ error: `Unknown product: ${productId}` }, { status: 400 })
    }
    const requestedSize = typeof rawItem.size === 'string' ? rawItem.size : ''
    const size = authoritative.sizes.includes(requestedSize)
      ? requestedSize
      : authoritative.sizes[0]
    resolvedItems.push({ product: authoritative, size, quantity: qty as number })
  }

  const subtotal = resolvedItems.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  )
  const delivery = subtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryFee

  const VALID_GOUVERNORATS = new Set([
    'Ariana', 'Béja', 'Ben Arous', 'Bizerte',
    'Gabès', 'Gafsa', 'Jendouba', 'Kairouan',
    'Kasserine', 'Kébili', 'Le Kef', 'Mahdia',
    'Manouba', 'Médenine', 'Monastir', 'Nabeul',
    'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse',
    'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan',
  ])

  // Whitelist-extract customer fields — reject unknown keys
  const { fullName, phone, wilaya, address, notes } = body.customer as Record<string, unknown>
  if (
    typeof fullName !== 'string' || !fullName.trim() ||
    typeof phone !== 'string' || !phone.trim() ||
    typeof wilaya !== 'string' || !wilaya.trim() ||
    typeof address !== 'string' || !address.trim()
  ) {
    return NextResponse.json({ error: 'Missing required customer fields' }, { status: 400 })
  }
  if (!VALID_GOUVERNORATS.has(String(wilaya).trim())) {
    return NextResponse.json({ error: 'Invalid gouvernorat' }, { status: 400 })
  }

  // Phone: only digits, spaces, +, -, (, ); 7–15 digits total (E.164 max)
  const phoneStr = String(phone).trim()
  const digitCount = (phoneStr.match(/\d/g) ?? []).length
  if (!/^[+\d\s\-().]+$/.test(phoneStr) || digitCount < 7 || digitCount > 15) {
    return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
  }

  const order: Order = {
    id: generateOrderId(),
    items: resolvedItems,
    customer: {
      fullName: String(fullName).slice(0, 200).trim(),
      phone: String(phone).slice(0, 30).trim(),
      wilaya: String(wilaya).slice(0, 100).trim(),
      address: String(address).slice(0, 500).trim(),
      notes: typeof notes === 'string' ? notes.slice(0, 1000).trim() : '',
    },
    total: subtotal + delivery,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  const orders = getOrders()
  orders.unshift(order)
  saveOrders(orders)
  auditLog('order.created', { id: order.id, total: order.total, items: order.items.length })
  return NextResponse.json(order, { status: 201 })
}
