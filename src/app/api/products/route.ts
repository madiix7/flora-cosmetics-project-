import { NextRequest, NextResponse } from 'next/server'
import { getProducts, saveProducts } from '@/lib/server-data'
import type { Product } from '@/types'

export async function GET() {
  return NextResponse.json(getProducts())
}

export async function POST(req: NextRequest) {
  const product: Product = await req.json()
  const products = getProducts()
  if (products.find((p) => p.id === product.id)) {
    return NextResponse.json({ error: 'Duplicate id' }, { status: 409 })
  }
  products.push(product)
  saveProducts(products)
  return NextResponse.json(product, { status: 201 })
}
