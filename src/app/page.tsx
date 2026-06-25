import { EditorialGrid } from '@/components/home/EditorialGrid'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { BrandStrip } from '@/components/home/BrandStrip'
import { ScentCategories } from '@/components/home/ScentCategories'
import { BrandStorySnippet } from '@/components/home/BrandStorySnippet'
import { NewsletterSection } from '@/components/home/NewsletterSection'
import { getProducts, getSettings } from '@/lib/server-data'

export default async function HomePage() {
  const [allProducts, settings] = await Promise.all([getProducts(), getSettings()])
  const featuredProducts = allProducts.filter((p) => p.isFeatured)
  // Fall back to newest products when no items are flagged yet
  const sourcePool = featuredProducts.length > 0 ? featuredProducts : allProducts
  const featured = sourcePool.slice(0, 3)
  const showcaseProducts = sourcePool.slice(0, 4)

  return (
    <>
      <EditorialGrid featured={featured} />
      <FeaturedProducts products={showcaseProducts} />
      <BrandStrip />
      <ScentCategories />
      <BrandStorySnippet
        title={settings.brandStoryTitle || undefined}
        body={settings.brandStoryBody || undefined}
      />
      <NewsletterSection />
    </>
  )
}
