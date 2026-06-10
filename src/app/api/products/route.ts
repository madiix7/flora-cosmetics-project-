import { NextRequest, NextResponse } from 'next/server'
import { getProducts, saveProducts } from '@/lib/server-data'
import { requireAdmin } from '@/lib/admin-auth'
import { sanitizeProduct } from '@/lib/validate'
import { auditLog } from '@/lib/audit'

export async function GET() {
  const auth = await requireAdmin()
  if (auth) return auth
  return NextResponse.json(getProducts())
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (auth) return auth

  const body = await req.json().catch(() => null)
  // crypto.randomUUID() is available in Node.js ≥ 14.17 and all Edge runtimes
  const id = crypto.randomUUID()
  const result = sanitizeProduct(body, id)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  const products = getProducts()
  if (products.find((p) => p.id === result.product.id || p.slug === result.product.slug)) {
    return NextResponse.json({ error: 'Duplicate id or slug' }, { status: 409 })
  }
  products.push(result.product)
  saveProducts(products)
  auditLog('product.created', { id: result.product.id, name: result.product.name })
  return NextResponse.json(result.product, { status: 201 })
}
