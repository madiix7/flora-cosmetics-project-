import { Suspense } from 'react'
import { ShopClient } from './ShopClient'
import { getProducts, getSettings } from '@/lib/server-data'

export default function ShopPage() {
  const { audienceTags, seasonTags } = getSettings()
  const products = getProducts()
  return (
    <Suspense fallback={<div className="pt-32 text-center text-stone">Loading…</div>}>
      <ShopClient products={products} audienceTags={audienceTags} seasonTags={seasonTags} />
    </Suspense>
  )
}
