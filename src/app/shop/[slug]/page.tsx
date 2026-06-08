import { notFound } from 'next/navigation'
import { products, getProductBySlug } from '@/data/products'
import { getRelatedProducts } from '@/lib/utils'
import { ImageGallery } from '@/components/product/ImageGallery'
import { ProductInfo } from '@/components/product/ProductInfo'
import { RelatedProducts } from '@/components/product/RelatedProducts'

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) notFound()

  const related = getRelatedProducts(products, product)

  return (
    <div className="pt-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          <ImageGallery product={product} />
          <ProductInfo product={product} />
        </div>
        <RelatedProducts products={related} />
      </div>
    </div>
  )
}
