import type { Product } from '@/types'
import { ProductCard } from './ProductCard'

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
        <p className="font-serif text-2xl font-light text-charcoal mb-3">No products found</p>
        <p className="text-sm text-stone">Try adjusting your filters.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
