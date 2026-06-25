import { notFound } from 'next/navigation'
import { getProducts } from '@/lib/server-data'
import { getRelatedProducts } from '@/lib/utils'
import { ImageGallery } from '@/components/product/ImageGallery'
import { ProductInfo } from '@/components/product/ProductInfo'
import { RelatedProducts } from '@/components/product/RelatedProducts'

// Allow slugs not known at build time to be rendered on-demand (admin-added products)
export const dynamicParams = true

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((p) => ({ slug: p.slug }))
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const allProducts = await getProducts()
  const product = allProducts.find((p) => p.slug === slug)
  if (!product) notFound()

  const related = getRelatedProducts(allProducts, product)

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
