import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export function CartSummary({ total }: { total: number }) {
  return (
    <div className="bg-parchment p-8 h-fit sticky top-24">
      <p className="text-[10px] tracking-widest uppercase text-stone mb-6">Order Summary</p>
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-stone">Subtotal</span>
          <span className="text-charcoal">{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-stone">Delivery</span>
          <span className="text-charcoal">{total >= 5000 ? 'Free' : formatPrice(500)}</span>
        </div>
        <div className="border-t border-sand pt-3 flex justify-between">
          <span className="text-[10px] tracking-widest uppercase text-stone">Total</span>
          <span className="font-serif text-xl text-charcoal">
            {formatPrice(total >= 5000 ? total : total + 500)}
          </span>
        </div>
      </div>
      <Link href="/checkout">
        <Button className="w-full justify-center">Proceed to Checkout</Button>
      </Link>
      <p className="text-[10px] text-stone text-center mt-4 tracking-wide">
        Cash on delivery · Secure ordering
      </p>
    </div>
  )
}
