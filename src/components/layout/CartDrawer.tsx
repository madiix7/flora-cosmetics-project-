'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { formatPrice, calculateTotal } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQuantity, totalItems, freeDeliveryThreshold } = useCart()
  const total = calculateTotal(items)

  return (
    <>
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-50 backdrop-blur-sm"
          onClick={closeDrawer}
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-ivory z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-parchment">
          <p className="text-[10px] tracking-widest uppercase text-charcoal">
            Your Cart ({totalItems})
          </p>
          <button onClick={closeDrawer} aria-label="Close cart" className="text-stone hover:text-charcoal text-2xl leading-none">
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
            <p className="font-serif text-2xl font-light text-charcoal">Your cart is empty</p>
            <p className="text-xs text-stone text-center">
              Discover our collection of artisan perfumes and cosmetics.
            </p>
            <Button variant="outline" onClick={closeDrawer} className="mt-2">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {items.map((item) => (
                <li key={`${item.product.id}-${item.size}`} className="flex gap-4">
                  <div className="relative w-20 h-24 bg-parchment shrink-0">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm text-charcoal">{item.product.name}</p>
                    <p className="text-[10px] tracking-wider text-stone mt-0.5">{item.size}</p>
                    <p className="text-xs text-charcoal mt-1">{formatPrice(item.product.price)}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="w-6 h-6 border border-parchment text-stone hover:border-charcoal text-sm"
                      >
                        −
                      </button>
                      <span className="text-xs w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="w-6 h-6 border border-parchment text-stone hover:border-charcoal text-sm"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.product.id, item.size)}
                        className="ml-auto text-[10px] tracking-wider text-stone hover:text-charcoal uppercase"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="px-8 py-6 border-t border-parchment space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] tracking-widest uppercase text-stone">Subtotal</span>
                <span className="font-serif text-lg text-charcoal">{formatPrice(total)}</span>
              </div>
              <p className="text-[10px] text-stone tracking-wide">
                Cash on delivery · Free delivery on orders over {formatPrice(freeDeliveryThreshold)}
              </p>
              <Link href="/checkout" onClick={closeDrawer}>
                <Button className="w-full justify-center">Proceed to Checkout</Button>
              </Link>
              <button
                onClick={closeDrawer}
                className="w-full text-[10px] tracking-widest uppercase text-stone hover:text-charcoal text-center py-2"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
