import { getProducts, getSettings } from '@/lib/server-data'
import { ProductForm } from '@/components/admin/ProductForm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const products = getProducts()
  const product = products.find((p) => p.id === id)
  if (!product) notFound()
  const { audienceTags, seasonTags } = getSettings()

  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] tracking-widest uppercase text-stone mb-1">Products</p>
        <h1 className="font-serif font-light text-3xl text-charcoal">Edit — {product.name}</h1>
      </div>
      <ProductForm mode="edit" initial={product} audienceTags={audienceTags} seasonTags={seasonTags} />
    </div>
  )
}
