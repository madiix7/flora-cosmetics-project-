import { NextRequest, NextResponse } from 'next/server'
import { getProducts, saveProducts } from '@/lib/server-data'
import { requireAdmin } from '@/lib/admin-auth'
import { sanitizeProduct } from '@/lib/validate'
import { auditLog } from '@/lib/audit'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req)
  if (auth) return auth
  const { id } = await params

  const products = await getProducts()
  const idx = products.findIndex((p) => p.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json().catch(() => null)
  // Preserve the original createdAt so edits cannot back-date products
  const result = sanitizeProduct(body, id, products[idx].createdAt)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  products[idx] = result.product
  await saveProducts(products)
  auditLog('product.updated', { id, name: result.product.name })
  return NextResponse.json(result.product)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(_req)
  if (auth) return auth
  const { id } = await params
  const products = await getProducts()
  const target = products.find((p) => p.id === id)
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await saveProducts(products.filter((p) => p.id !== id))
  auditLog('product.deleted', { id, name: target.name })
  return NextResponse.json({ ok: true })
}
