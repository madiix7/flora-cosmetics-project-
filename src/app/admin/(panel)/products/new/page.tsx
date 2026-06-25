import { getSettings } from '@/lib/server-data'
import { ProductForm } from '@/components/admin/ProductForm'

export default async function NewProductPage() {
  const { audienceTags, seasonTags } = await getSettings()
  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] tracking-widest uppercase text-stone mb-1">Products</p>
        <h1 className="font-serif font-light text-3xl text-charcoal">Add New Product</h1>
      </div>
      <ProductForm mode="new" audienceTags={audienceTags} seasonTags={seasonTags} />
    </div>
  )
}
