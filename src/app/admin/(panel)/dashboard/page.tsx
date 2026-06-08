import { getOrders, getProducts } from '@/lib/server-data'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const orders = getOrders()
  const products = getProducts()

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0)

  const pending = orders.filter((o) => o.status === 'pending').length
  const confirmed = orders.filter((o) => o.status === 'confirmed').length
  const delivered = orders.filter((o) => o.status === 'delivered').length

  const recentOrders = orders.slice(0, 5)

  const STATUS_COLOR: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] tracking-widest uppercase text-stone mb-1">Overview</p>
        <h1 className="font-serif font-light text-3xl text-charcoal">Dashboard</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Orders', value: orders.length.toString() },
          { label: 'Revenue', value: formatPrice(totalRevenue) },
          { label: 'Pending', value: pending.toString() },
          { label: 'Products', value: products.length.toString() },
        ].map(({ label, value }) => (
          <div key={label} className="bg-ivory rounded p-5 border border-parchment">
            <p className="text-[9px] tracking-widest uppercase text-stone mb-2">{label}</p>
            <p className="font-serif text-2xl font-light text-charcoal">{value}</p>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Confirmed', value: confirmed, color: 'border-l-blue-400' },
          { label: 'Delivered', value: delivered, color: 'border-l-green-400' },
          { label: 'Pending', value: pending, color: 'border-l-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-ivory rounded p-4 border border-parchment border-l-4 ${color}`}>
            <p className="text-[9px] tracking-widest uppercase text-stone mb-1">{label}</p>
            <p className="font-serif text-xl font-light text-charcoal">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-ivory rounded border border-parchment">
        <div className="px-6 py-4 border-b border-parchment flex items-center justify-between">
          <p className="text-[10px] tracking-widest uppercase text-charcoal">Recent Orders</p>
          <a href="/admin/orders" className="text-[10px] tracking-widest uppercase text-stone hover:text-charcoal transition-colors">
            View all →
          </a>
        </div>
        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-stone">No orders yet. Orders placed on the store will appear here.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-parchment">
                {['Order ID', 'Customer', 'Total', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-[9px] tracking-widest uppercase text-stone font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-parchment/30 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-charcoal">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-charcoal">{order.customer.fullName}</td>
                  <td className="px-6 py-4 text-sm text-charcoal">{formatPrice(order.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-[9px] tracking-wider uppercase rounded-full ${STATUS_COLOR[order.status] ?? ''}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-stone">
                    {new Date(order.createdAt).toLocaleDateString('fr-DZ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
