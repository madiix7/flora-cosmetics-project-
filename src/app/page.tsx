import { EditorialGrid } from '@/components/home/EditorialGrid'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { BrandStrip } from '@/components/home/BrandStrip'
import { ScentCategories } from '@/components/home/ScentCategories'
import { BrandStorySnippet } from '@/components/home/BrandStorySnippet'
import { NewsletterSection } from '@/components/home/NewsletterSection'
import { getFeaturedProducts, products } from '@/data/products'

export default function HomePage() {
  const featured = getFeaturedProducts()
  const showcaseProducts = products.slice(0, 4)

  return (
    <>
      <EditorialGrid featured={featured} />
      <FeaturedProducts products={showcaseProducts} />
      <BrandStrip />
      <ScentCategories />
      <BrandStorySnippet />
      <NewsletterSection />
    </>
  )
}
