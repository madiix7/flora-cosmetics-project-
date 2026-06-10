import { EditorialGrid } from '@/components/home/EditorialGrid'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { BrandStrip } from '@/components/home/BrandStrip'
import { ScentCategories } from '@/components/home/ScentCategories'
import { BrandStorySnippet } from '@/components/home/BrandStorySnippet'
import { NewsletterSection } from '@/components/home/NewsletterSection'
import { getProducts, getSettings } from '@/lib/server-data'

export default function HomePage() {
  const allProducts = getProducts()
  const featured = allProducts.filter((p) => p.isFeatured).slice(0, 3)
  const showcaseProducts = allProducts.slice(0, 4)
  const settings = getSettings()

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
