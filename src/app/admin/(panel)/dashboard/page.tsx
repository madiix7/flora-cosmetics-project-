import { getOrders, getProducts, getSettings } from '@/lib/server-data'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const STATUS_BAR: Record<string, string> = {
  pending: 'bg-amber-400',
  confirmed: 'bg-blue-400',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-400',
}

export default function DashboardPage() {
  const orders = getOrders()
  const products = getProducts()
  const settings = getSettings()

  const activeOrders = orders.filter((o) => o.status !== 'cancelled')
  const totalRevenue = activeOrders.reduce((sum, o) => sum + o.total, 0)
  const avgOrderValue = activeOrders.length > 0 ? totalRevenue / activeOrders.length : 0

  const pending = orders.filter((o) => o.status === 'pending').length
  const confirmed = orders.filter((o) => o.status === 'confirmed').length
  const delivered = orders.filter((o) => o.status === 'delivered').length
  const cancelled = orders.filter((o) => o.status === 'cancelled').length

  const recentOrders = orders.slice(0, 6)

  // Top products by quantity sold
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {}
  for (const order of orders) {
    if (order.status === 'cancelled') continue
    for (const item of order.items) {
      const id = item.product.id
      if (!productSales[id]) productSales[id] = { name: item.product.name, qty: 0, revenue: 0 }
      productSales[id].qty += item.quantity
      productSales[id].revenue += item.product.price * item.quantity
    }
  }
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)

  // Revenue by wilaya
  const wilayaRevenue: Record<string, number> = {}
  for (const order of activeOrders) {
    const w = order.customer.wilaya || 'Unknown'
    wilayaRevenue[w] = (wilayaRevenue[w] ?? 0) + order.total
  }
  const topWilayas = Object.entries(wilayaRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const maxWilayaRevenue = topWilayas[0]?.[1] ?? 1

  const statusGroups = [
    { label: 'Pending', count: pending, color: STATUS_BAR.pending },
    { label: 'Confirmed', count: confirmed, color: STATUS_BAR.confirmed },
    { label: 'Delivered', count: delivered, color: STATUS_BAR.delivered },
    { label: 'Cancelled', count: cancelled, color: STATUS_BAR.cancelled },
  ]
  const totalForBar = orders.length || 1

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-[10px] tracking-widest uppercase text-stone mb-1">Overview</p>
          <h1 className="font-serif font-light text-3xl text-charcoal">Dashboard</h1>
        </div>
        <p className="text-xs text-stone">
          {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        {pending > 0 && (
          <Link href="/admin/orders?filter=pending"
            className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded text-xs hover:bg-amber-100 transition-colors">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            {pending} pending order{pending !== 1 ? 's' : ''} — review now
          </Link>
        )}
        <Link href="/admin/products/new"
          className="flex items-center gap-2 bg-ivory border border-parchment text-stone px-4 py-2 rounded text-xs hover:border-charcoal hover:text-charcoal transition-colors">
          + Add product
        </Link>
        <Link href="/admin/content"
          className={`flex items-center gap-2 bg-ivory border px-4 py-2 rounded text-xs hover:border-charcoal hover:text-charcoal transition-colors ${
            !settings.announcementEnabled ? 'border-parchment text-stone' : 'border-charcoal text-charcoal'
          }`}>
          {settings.announcementEnabled ? '📢 Announcement active' : 'Set announcement bar'}
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Orders', value: orders.length.toString(), sub: `${delivered} delivered` },
          { label: 'Total Revenue', value: formatPrice(totalRevenue), sub: 'excl. cancelled' },
          { label: 'Avg Order Value', value: formatPrice(Math.round(avgOrderValue)), sub: `${activeOrders.length} active orders` },
          { label: 'Products', value: products.length.toString(), sub: `${products.filter(p => p.isFeatured).length} featured` },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-ivory rounded-lg p-5 border border-parchment">
            <p className="text-[9px] tracking-widest uppercase text-stone mb-2">{label}</p>
            <p className="font-serif text-2xl font-light text-charcoal">{value}</p>
            <p className="text-[10px] text-stone/60 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Order status distribution */}
      <div className="bg-ivory rounded-lg border border-parchment p-6 mb-8">
        <p className="text-[10px] tracking-widest uppercase text-charcoal mb-5">Order Status Distribution</p>
        <div className="flex h-3 rounded-full overflow-hidden mb-4 gap-px">
          {statusGroups.map(({ label, count, color }) =>
            count > 0 ? (
              <div
                key={label}
                className={`${color} transition-all`}
                style={{ width: `${(count / totalForBar) * 100}%` }}
                title={`${label}: ${count}`}
              />
            ) : null
          )}
        </div>
        <div className="grid grid-cols-4 gap-3">
          {statusGroups.map(({ label, count, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
              <div>
                <p className="text-xs font-medium text-charcoal">{count}</p>
                <p className="text-[9px] tracking-wider uppercase text-stone">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top products + Revenue by wilaya */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Top products */}
        <div className="bg-ivory rounded-lg border border-parchment">
          <div className="px-6 py-4 border-b border-parchment">
            <p className="text-[10px] tracking-widest uppercase text-charcoal">Top Products</p>
          </div>
          {topProducts.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-xs text-stone">No sales data yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-parchment">
              {topProducts.map(({ name, qty, revenue }, i) => (
                <div key={name} className="px-6 py-3.5 flex items-center gap-4">
                  <span className="text-[10px] font-mono text-stone/50 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-charcoal truncate">{name}</p>
                    <p className="text-[10px] text-stone mt-0.5">{qty} unit{qty !== 1 ? 's' : ''} sold</p>
                  </div>
                  <p className="text-xs text-charcoal font-mono shrink-0">{formatPrice(revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue by wilaya */}
        <div className="bg-ivory rounded-lg border border-parchment">
          <div className="px-6 py-4 border-b border-parchment">
            <p className="text-[10px] tracking-widest uppercase text-charcoal">Revenue by Gouvernorat</p>
          </div>
          {topWilayas.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-xs text-stone">No orders yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-parchment">
              {topWilayas.map(([wilaya, rev]) => (
                <div key={wilaya} className="px-6 py-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm text-charcoal">{wilaya}</p>
                    <p className="text-xs text-charcoal font-mono">{formatPrice(rev)}</p>
                  </div>
                  <div className="h-1.5 bg-parchment rounded-full overflow-hidden">
                    <div
                      className="h-full bg-charcoal/30 rounded-full transition-all"
                      style={{ width: `${(rev / maxWilayaRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-ivory rounded-lg border border-parchment">
        <div className="px-6 py-4 border-b border-parchment flex items-center justify-between">
          <p className="text-[10px] tracking-widest uppercase text-charcoal">Recent Orders</p>
          <Link href="/admin/orders" className="text-[10px] tracking-widest uppercase text-stone hover:text-charcoal transition-colors">
            View all →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-stone">No orders yet. Orders placed on the store will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-parchment">
                  {['Order ID', 'Customer', 'Gouvernorat', 'Total', 'Status', 'Date'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-[9px] tracking-widest uppercase text-stone font-normal whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-parchment/30 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-charcoal">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline">{order.id}</Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-charcoal">{order.customer.fullName}</td>
                    <td className="px-6 py-4 text-xs text-stone">{order.customer.wilaya}</td>
                    <td className="px-6 py-4 text-sm text-charcoal">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-[9px] tracking-wider uppercase rounded-full ${STATUS_COLOR[order.status] ?? ''}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-stone whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('fr-TN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
