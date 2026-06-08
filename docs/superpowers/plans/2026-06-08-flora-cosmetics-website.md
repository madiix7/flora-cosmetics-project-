# Flora Cosmetics Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full e-commerce website for Flora Cosmetics — a perfume boutique — with cash-on-delivery ordering, editorial grid homepage, and 8 pages.

**Architecture:** Next.js 15 App Router with static TypeScript product data. Cart state managed via React Context + localStorage. Orders saved to localStorage on submit, no backend or payment gateway required.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, Google Fonts (Cormorant Garamond + DM Sans), React Context

---

## File Map

```
src/
├── app/
│   ├── layout.tsx                    # Root layout — Navbar + Footer + CartProvider
│   ├── page.tsx                      # Home page
│   ├── globals.css                   # Tailwind directives + base styles
│   ├── shop/
│   │   ├── page.tsx                  # Shop/catalog page
│   │   └── [slug]/page.tsx           # Product detail page
│   ├── about/page.tsx
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   ├── order-confirmed/page.tsx
│   └── contact/page.tsx
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── CartDrawer.tsx
│   ├── home/
│   │   ├── EditorialGrid.tsx
│   │   ├── FeaturedProducts.tsx
│   │   ├── BrandStrip.tsx
│   │   ├── ScentCategories.tsx
│   │   ├── BrandStorySnippet.tsx
│   │   └── NewsletterSection.tsx
│   ├── shop/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   └── FilterSidebar.tsx
│   ├── product/
│   │   ├── ImageGallery.tsx
│   │   ├── ProductInfo.tsx
│   │   ├── ScentNotes.tsx
│   │   └── RelatedProducts.tsx
│   ├── cart/
│   │   ├── CartItem.tsx
│   │   └── CartSummary.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Badge.tsx
│       └── Accordion.tsx
├── context/
│   └── CartContext.tsx
├── data/
│   └── products.ts
├── types/
│   └── index.ts
└── lib/
    └── utils.ts
```

---

## Task 1: Project Initialization

**Files:**
- Create: `package.json` (via CLI)
- Create: `tailwind.config.ts`
- Create: `src/app/globals.css`
- Create: `next.config.ts`

- [ ] **Step 1: Scaffold Next.js project**

Run in `C:\Users\asus\Desktop\flora cosmetics`:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```
Answer prompts: accept all defaults.

- [ ] **Step 2: Install Google Fonts dependency (none needed — loaded via next/font)**

Tailwind v4 is already included by `create-next-app`. Verify:
```bash
cat package.json | grep tailwindcss
```
Expected: `"tailwindcss": "^4.x.x"`

- [ ] **Step 3: Configure Tailwind custom tokens**

Replace `tailwind.config.ts` with:
```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#f8f5f0',
        parchment: '#ede8e0',
        sand: '#d4c9b8',
        'warm-gold': '#c5a87a',
        stone: '#888882',
        charcoal: '#1a1a1a',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 4: Set up globals.css**

Replace `src/app/globals.css` with:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
  body {
    @apply bg-ivory text-charcoal font-sans;
  }
  h1, h2, h3, h4 {
    @apply font-serif;
  }
}

@layer utilities {
  .tracking-luxury {
    letter-spacing: 0.25em;
  }
}
```

- [ ] **Step 5: Configure next.config.ts**

Replace `next.config.ts` with:
```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```
Expected: `✓ Ready on http://localhost:3000` — default Next.js page loads.

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "feat: initialize Next.js project with Tailwind and custom design tokens"
```

---

## Task 2: Types, Utilities & Seed Data

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/utils.ts`
- Create: `src/data/products.ts`

- [ ] **Step 1: Define TypeScript types**

Create `src/types/index.ts`:
```ts
export type Category = 'perfume' | 'body-care' | 'candle' | 'gift-set'
export type ScentFamily = 'floral' | 'woody' | 'oriental' | 'fresh' | 'citrus'

export type ScentNotes = {
  top: string[]
  heart: string[]
  base: string[]
}

export type Product = {
  id: string
  slug: string
  name: string
  price: number
  images: string[]
  category: Category
  scentFamily: ScentFamily[]
  sizes: string[]
  shortDescription: string
  description: string
  scentNotes: ScentNotes
  isFeatured: boolean
  isNew: boolean
  isBestseller: boolean
  createdAt: string
}

export type CartItem = {
  product: Product
  size: string
  quantity: number
}

export type Order = {
  id: string
  items: CartItem[]
  customer: {
    fullName: string
    phone: string
    wilaya: string
    address: string
    notes: string
  }
  total: number
  createdAt: string
}
```

- [ ] **Step 2: Create utility functions**

Create `src/lib/utils.ts`:
```ts
export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('fr-DZ')} DZD`
}

export function calculateTotal(items: import('@/types').CartItem[]): number {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
}

export function generateOrderId(): string {
  return `FL-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

export function getRelatedProducts(
  products: import('@/types').Product[],
  current: import('@/types').Product,
  limit = 3
): import('@/types').Product[] {
  return products
    .filter(
      (p) =>
        p.id !== current.id &&
        (p.category === current.category ||
          p.scentFamily.some((s) => current.scentFamily.includes(s)))
    )
    .slice(0, limit)
}
```

- [ ] **Step 3: Create seed product data**

Create `src/data/products.ts`:
```ts
import type { Product } from '@/types'

export const products: Product[] = [
  {
    id: '1',
    slug: 'oud-intense',
    name: 'Oud Intense',
    price: 4500,
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800',
    ],
    category: 'perfume',
    scentFamily: ['woody', 'oriental'],
    sizes: ['30ml', '50ml', '100ml'],
    shortDescription: 'A deep, resinous oud anchored by smoky woods and amber.',
    description:
      'Oud Intense is an olfactory journey to the heart of the Middle East. Opening with a whisper of saffron, the fragrance settles into a rich oud accord layered with patchouli and vetiver, before resting on a warm amber and musk base. Long-lasting and deeply personal.',
    scentNotes: {
      top: ['Saffron', 'Cardamom'],
      heart: ['Oud', 'Patchouli', 'Rose'],
      base: ['Amber', 'Vetiver', 'White Musk'],
    },
    isFeatured: true,
    isNew: true,
    isBestseller: false,
    createdAt: '2026-01-01',
  },
  {
    id: '2',
    slug: 'rose-sillage',
    name: 'Rose Sillage',
    price: 3800,
    images: [
      'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800',
      'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800',
    ],
    category: 'perfume',
    scentFamily: ['floral', 'fresh'],
    sizes: ['30ml', '50ml', '100ml'],
    shortDescription: 'A luminous rose with a trail that lingers in memory.',
    description:
      'Rose Sillage captures the essence of a rose garden at dawn — dewy, radiant, and alive. Turkish rose absolute meets white peony and litchi for an airy floral heart, underpinned by cedarwood and soft musk.',
    scentNotes: {
      top: ['Litchi', 'Pink Pepper'],
      heart: ['Turkish Rose', 'White Peony', 'Magnolia'],
      base: ['Cedarwood', 'Musk', 'Sandalwood'],
    },
    isFeatured: true,
    isNew: false,
    isBestseller: true,
    createdAt: '2025-09-01',
  },
  {
    id: '3',
    slug: 'amber-noir',
    name: 'Amber Noir',
    price: 4200,
    images: [
      'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800',
    ],
    category: 'perfume',
    scentFamily: ['oriental', 'woody'],
    sizes: ['50ml', '100ml'],
    shortDescription: 'Warm amber and dark vanilla wrapped in smoky incense.',
    description:
      'Amber Noir is a seductive fragrance for the night. Incense and labdanum open dramatically, giving way to a heart of dark rose and benzoin, before a deep base of tonka bean, vanilla, and dark musk envelops the skin.',
    scentNotes: {
      top: ['Incense', 'Bergamot'],
      heart: ['Labdanum', 'Dark Rose', 'Benzoin'],
      base: ['Tonka Bean', 'Vanilla', 'Dark Musk'],
    },
    isFeatured: true,
    isNew: false,
    isBestseller: false,
    createdAt: '2025-06-01',
  },
  {
    id: '4',
    slug: 'jasmine-lumiere',
    name: 'Jasmine Lumière',
    price: 3500,
    images: [
      'https://images.unsplash.com/photo-1598662957563-ee4965d4d72c?w=800',
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800',
    ],
    category: 'perfume',
    scentFamily: ['floral', 'citrus'],
    sizes: ['30ml', '50ml', '100ml'],
    shortDescription: 'Sun-drenched jasmine brightened with citrus and neroli.',
    description:
      'Jasmine Lumière is the scent of golden afternoons. Sparkling bergamot and neroli introduce a radiant jasmine sambac heart, warmed gently by ylang-ylang and finished with a clean musk and white wood base.',
    scentNotes: {
      top: ['Bergamot', 'Neroli', 'Lemon'],
      heart: ['Jasmine Sambac', 'Ylang-Ylang', 'Orange Blossom'],
      base: ['White Musk', 'White Wood', 'Ambrette'],
    },
    isFeatured: false,
    isNew: true,
    isBestseller: false,
    createdAt: '2026-03-01',
  },
  {
    id: '5',
    slug: 'velvet-body-lotion',
    name: 'Velvet Body Lotion',
    price: 1800,
    images: [
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800',
    ],
    category: 'body-care',
    scentFamily: ['floral', 'fresh'],
    sizes: ['200ml', '400ml'],
    shortDescription: 'Rich moisturising lotion infused with rose and shea.',
    description:
      'A luxuriously thick yet fast-absorbing body lotion. Shea butter and vitamin E nourish deeply while a delicate rose and jasmine fragrance lingers softly on the skin.',
    scentNotes: {
      top: ['Rose', 'Jasmine'],
      heart: ['Shea', 'Vanilla'],
      base: ['Musk'],
    },
    isFeatured: false,
    isNew: false,
    isBestseller: true,
    createdAt: '2025-04-01',
  },
  {
    id: '6',
    slug: 'silk-shower-oil',
    name: 'Silk Shower Oil',
    price: 2200,
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    ],
    category: 'body-care',
    scentFamily: ['fresh', 'citrus'],
    sizes: ['200ml'],
    shortDescription: 'A silky shower oil that transforms to milk on skin.',
    description:
      'Crafted with sweet almond oil and argan oil, this shower oil transforms into a milky lather that cleanses while leaving skin deeply moisturised. Scented with bergamot and white tea.',
    scentNotes: {
      top: ['Bergamot', 'Green Tea'],
      heart: ['White Tea', 'Cucumber'],
      base: ['Sandalwood', 'Musk'],
    },
    isFeatured: false,
    isNew: false,
    isBestseller: false,
    createdAt: '2025-04-01',
  },
  {
    id: '7',
    slug: 'cedarwood-vanilla-candle',
    name: 'Cedarwood & Vanilla',
    price: 2800,
    images: [
      'https://images.unsplash.com/photo-1602874801007-bd458bb1a972?w=800',
    ],
    category: 'candle',
    scentFamily: ['woody', 'oriental'],
    sizes: ['200g', '350g'],
    shortDescription: 'Warm cedarwood and sweet vanilla for cosy evenings.',
    description:
      'A hand-poured soy wax candle with a wooden wick. Cedarwood and sandalwood create a grounding base, while Madagascar vanilla adds warmth and sweetness. Burn time: 45–60 hours (200g).',
    scentNotes: {
      top: ['Cedarwood', 'Cypress'],
      heart: ['Sandalwood', 'Labdanum'],
      base: ['Vanilla', 'Tonka Bean'],
    },
    isFeatured: false,
    isNew: false,
    isBestseller: true,
    createdAt: '2025-10-01',
  },
  {
    id: '8',
    slug: 'white-tea-iris-candle',
    name: 'White Tea & Iris',
    price: 2800,
    images: [
      'https://images.unsplash.com/photo-1612540139153-41a3d4b02f56?w=800',
    ],
    category: 'candle',
    scentFamily: ['fresh', 'floral'],
    sizes: ['200g', '350g'],
    shortDescription: 'Serene white tea and powdery iris for calm spaces.',
    description:
      'Light, clean, and effortlessly chic. This hand-poured candle combines white tea with a powdery iris and violet accord, finishing on a base of white musk and amberwood.',
    scentNotes: {
      top: ['White Tea', 'Green Accord'],
      heart: ['Iris', 'Violet', 'Peony'],
      base: ['White Musk', 'Amberwood'],
    },
    isFeatured: false,
    isNew: true,
    isBestseller: false,
    createdAt: '2026-02-01',
  },
  {
    id: '9',
    slug: 'the-signature-set',
    name: 'The Signature Set',
    price: 8500,
    images: [
      'https://images.unsplash.com/photo-1619451683957-bfccd40ba70a?w=800',
    ],
    category: 'gift-set',
    scentFamily: ['floral', 'woody', 'oriental'],
    sizes: ['One Size'],
    shortDescription: 'Our three bestselling perfumes in a luxury gift box.',
    description:
      'The Signature Set brings together Rose Sillage, Amber Noir, and Oud Intense — three of our most celebrated fragrances — in a beautifully crafted gift box. The perfect introduction to the Flora Cosmetics universe.',
    scentNotes: {
      top: ['Rose', 'Amber', 'Oud'],
      heart: [],
      base: [],
    },
    isFeatured: false,
    isNew: false,
    isBestseller: true,
    createdAt: '2025-11-01',
  },
  {
    id: '10',
    slug: 'the-discovery-set',
    name: 'The Discovery Set',
    price: 5500,
    images: [
      'https://images.unsplash.com/photo-1547887538-047f814e0a27?w=800',
    ],
    category: 'gift-set',
    scentFamily: ['floral', 'fresh', 'citrus'],
    sizes: ['One Size'],
    shortDescription: 'Five 10ml travel sizes to explore our full range.',
    description:
      'Not sure where to start? The Discovery Set includes five 10ml travel-sized perfumes across all scent families, presented in a Flora-branded zip pouch. Ideal as a first gift or a personal sampling journey.',
    scentNotes: {
      top: ['Various'],
      heart: [],
      base: [],
    },
    isFeatured: false,
    isNew: false,
    isBestseller: false,
    createdAt: '2025-11-01',
  },
]

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.isFeatured)
}
```

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts src/lib/utils.ts src/data/products.ts
git commit -m "feat: add types, utilities, and 10 seed products"
```

---

## Task 3: Cart Context

**Files:**
- Create: `src/context/CartContext.tsx`

- [ ] **Step 1: Create CartContext**

Create `src/context/CartContext.tsx`:
```tsx
'use client'

import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react'
import type { CartItem, Product } from '@/types'

type CartState = {
  items: CartItem[]
  isDrawerOpen: boolean
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; size: string }
  | { type: 'REMOVE_ITEM'; productId: string; size: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; size: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'OPEN_DRAWER' }
  | { type: 'CLOSE_DRAWER' }
  | { type: 'LOAD_FROM_STORAGE'; items: CartItem[] }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'LOAD_FROM_STORAGE':
      return { ...state, items: action.items }
    case 'ADD_ITEM': {
      const existing = state.items.find(
        (i) => i.product.id === action.product.id && i.size === action.size
      )
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product.id === action.product.id && i.size === action.size
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, { product: action.product, size: action.size, quantity: 1 }],
      }
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(
          (i) => !(i.product.id === action.productId && i.size === action.size)
        ),
      }
    case 'UPDATE_QUANTITY':
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (i) => !(i.product.id === action.productId && i.size === action.size)
          ),
        }
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.productId && i.size === action.size
            ? { ...i, quantity: action.quantity }
            : i
        ),
      }
    case 'CLEAR_CART':
      return { ...state, items: [] }
    case 'OPEN_DRAWER':
      return { ...state, isDrawerOpen: true }
    case 'CLOSE_DRAWER':
      return { ...state, isDrawerOpen: false }
    default:
      return state
  }
}

type CartContextValue = {
  items: CartItem[]
  isDrawerOpen: boolean
  totalItems: number
  addItem: (product: Product, size: string) => void
  removeItem: (productId: string, size: string) => void
  updateQuantity: (productId: string, size: string, quantity: number) => void
  clearCart: () => void
  openDrawer: () => void
  closeDrawer: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isDrawerOpen: false })

  useEffect(() => {
    const stored = localStorage.getItem('flora_cart')
    if (stored) {
      try {
        dispatch({ type: 'LOAD_FROM_STORAGE', items: JSON.parse(stored) })
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('flora_cart', JSON.stringify(state.items))
  }, [state.items])

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isDrawerOpen: state.isDrawerOpen,
        totalItems,
        addItem: (product, size) => {
          dispatch({ type: 'ADD_ITEM', product, size })
          dispatch({ type: 'OPEN_DRAWER' })
        },
        removeItem: (productId, size) => dispatch({ type: 'REMOVE_ITEM', productId, size }),
        updateQuantity: (productId, size, quantity) =>
          dispatch({ type: 'UPDATE_QUANTITY', productId, size, quantity }),
        clearCart: () => dispatch({ type: 'CLEAR_CART' }),
        openDrawer: () => dispatch({ type: 'OPEN_DRAWER' }),
        closeDrawer: () => dispatch({ type: 'CLOSE_DRAWER' }),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/context/CartContext.tsx
git commit -m "feat: add cart context with localStorage persistence"
```

---

## Task 4: UI Primitive Components

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/Accordion.tsx`

- [ ] **Step 1: Create Button component**

Create `src/components/ui/Button.tsx`:
```tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'outline' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
}

const variants: Record<Variant, string> = {
  primary: 'bg-charcoal text-ivory hover:bg-charcoal/80',
  outline: 'border border-charcoal text-charcoal hover:bg-charcoal hover:text-ivory',
  ghost: 'text-charcoal hover:text-stone underline-offset-2 hover:underline',
}

const sizes = {
  sm: 'px-4 py-2 text-[10px]',
  md: 'px-6 py-3 text-[10px]',
  lg: 'px-8 py-4 text-[11px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center tracking-widest uppercase font-sans font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)
Button.displayName = 'Button'
```

- [ ] **Step 2: Create cn utility**

Create `src/lib/cn.ts`:
```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Install dependencies:
```bash
npm install clsx tailwind-merge
```

- [ ] **Step 3: Create Badge component**

Create `src/components/ui/Badge.tsx`:
```tsx
import { cn } from '@/lib/cn'

type BadgeProps = {
  children: React.ReactNode
  className?: string
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-block px-2 py-0.5 text-[9px] tracking-widest uppercase font-sans bg-charcoal text-ivory',
        className
      )}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 4: Create Accordion component**

Create `src/components/ui/Accordion.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'

type AccordionItem = {
  title: string
  content: React.ReactNode
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="divide-y divide-parchment">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between py-4 text-left"
          >
            <span className="text-[11px] tracking-widest uppercase font-sans text-charcoal">
              {item.title}
            </span>
            <span className="text-stone text-lg leading-none">
              {open === i ? '−' : '+'}
            </span>
          </button>
          <div
            className={cn(
              'overflow-hidden transition-all duration-300',
              open === i ? 'max-h-96 pb-4' : 'max-h-0'
            )}
          >
            <div className="text-sm text-stone leading-relaxed font-light">{item.content}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/ src/lib/cn.ts
git commit -m "feat: add Button, Badge, Accordion UI primitives and cn utility"
```

---

## Task 5: Root Layout & Fonts

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update root layout with fonts and providers**

Replace `src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import { CartProvider } from '@/context/CartContext'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/layout/CartDrawer'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
  title: 'Flora Cosmetics — Artisan Perfumerie',
  description:
    'Discover our curated collection of artisan perfumes, body care, and candles. Cash on delivery across Algeria.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
```

Note: `Navbar`, `Footer`, `CartDrawer` components are imported here — they will be created in the next task. TypeScript will error until those files exist; that's expected. Run `npx tsc --noEmit` only after Task 6 is complete.

- [ ] **Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: set up root layout with Google Fonts and providers"
```

---

## Task 6: Navbar, Footer & CartDrawer

**Files:**
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/layout/Footer.tsx`
- Create: `src/components/layout/CartDrawer.tsx`

- [ ] **Step 1: Create Navbar**

Create `src/components/layout/Navbar.tsx`:
```tsx
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart } from '@/context/CartContext'

export function Navbar() {
  const { totalItems, openDrawer } = useCart()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-ivory border-b border-parchment' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif font-light text-xl tracking-[0.25em] uppercase text-charcoal"
        >
          Flora
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {[
            { href: '/shop', label: 'Shop' },
            { href: '/about', label: 'About' },
            { href: '/contact', label: 'Contact' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[10px] tracking-widest uppercase text-stone hover:text-charcoal transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <button
          onClick={openDrawer}
          className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-stone hover:text-charcoal transition-colors"
        >
          <span>Cart</span>
          {totalItems > 0 && (
            <span className="w-5 h-5 bg-charcoal text-ivory text-[9px] flex items-center justify-center rounded-full">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Create Footer**

Create `src/components/layout/Footer.tsx`:
```tsx
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-charcoal text-ivory/70 mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <p className="font-serif font-light text-2xl tracking-[0.2em] uppercase text-ivory mb-4">
            Flora
          </p>
          <p className="text-xs leading-relaxed font-light max-w-xs">
            Artisan perfumes and cosmetics crafted with intention. Each fragrance is a
            carefully composed narrative.
          </p>
        </div>

        <div>
          <p className="text-[10px] tracking-widest uppercase text-ivory/40 mb-5">Navigate</p>
          <ul className="space-y-3">
            {[
              { href: '/shop', label: 'Shop' },
              { href: '/about', label: 'Our Story' },
              { href: '/contact', label: 'Contact' },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-xs tracking-wider hover:text-ivory transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[10px] tracking-widest uppercase text-ivory/40 mb-5">Follow</p>
          <ul className="space-y-3">
            {[
              { href: '#', label: 'Instagram' },
              { href: '#', label: 'Facebook' },
              { href: '#', label: 'TikTok' },
            ].map(({ href, label }) => (
              <li key={label}>
                <a href={href} className="text-xs tracking-wider hover:text-ivory transition-colors">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-ivory/10 px-6 lg:px-12 py-6">
        <p className="text-[10px] tracking-widest uppercase text-ivory/30 text-center">
          © {new Date().getFullYear()} Flora Cosmetics — All rights reserved
        </p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Create CartDrawer**

Create `src/components/layout/CartDrawer.tsx`:
```tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { formatPrice, calculateTotal } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQuantity } = useCart()
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
            Your Cart ({items.length})
          </p>
          <button onClick={closeDrawer} className="text-stone hover:text-charcoal text-2xl leading-none">
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
                        className="w-6 h-6 border border-parchment text-stone hover:border-charcoal text-sm"
                      >
                        −
                      </button>
                      <span className="text-xs w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
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
                Cash on delivery · Free shipping on orders over 5,000 DZD
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
```

- [ ] **Step 4: Verify dev server and TypeScript**

```bash
npx tsc --noEmit
npm run dev
```
Expected: no TypeScript errors, site loads with navbar and footer. Clicking "Cart" opens the empty drawer.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/
git commit -m "feat: add Navbar, Footer, and CartDrawer layout components"
```

---

## Task 7: Home Page — Editorial Grid & Hero

**Files:**
- Create: `src/components/home/EditorialGrid.tsx`
- Create: `src/app/page.tsx` (partial — assembled fully in Task 8)

- [ ] **Step 1: Create EditorialGrid component**

Create `src/components/home/EditorialGrid.tsx`:
```tsx
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

type Props = {
  featured: Product[]
}

export function EditorialGrid({ featured }: Props) {
  const [main, ...rest] = featured.slice(0, 3)
  if (!main) return null

  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-[3fr_2fr] min-h-[90vh]">
      {/* Main large card */}
      <Link
        href={`/shop/${main.slug}`}
        className="relative overflow-hidden group bg-sand block"
      >
        <Image
          src={main.images[0]}
          alt={main.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 md:p-12">
          {main.isNew && <Badge className="mb-3">New Arrival</Badge>}
          {main.isBestseller && !main.isNew && <Badge className="mb-3">Bestseller</Badge>}
          <h1 className="font-serif font-light text-4xl md:text-5xl text-ivory leading-tight mb-2">
            {main.name}
          </h1>
          <div className="w-8 h-px bg-warm-gold mb-4" />
          <p className="text-ivory/70 text-sm font-light max-w-xs mb-6">
            {main.shortDescription}
          </p>
          <Button size="lg">Discover</Button>
        </div>
      </Link>

      {/* Two stacked smaller cards */}
      <div className="grid grid-rows-2">
        {rest.map((product, i) => (
          <Link
            key={product.id}
            href={`/shop/${product.slug}`}
            className={`relative overflow-hidden group block ${
              i === 0 ? 'bg-parchment' : 'bg-sand/60'
            }`}
          >
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-8">
              {product.isNew && <Badge className="mb-2 text-[8px]">New</Badge>}
              {product.isBestseller && !product.isNew && (
                <Badge className="mb-2 text-[8px]">Bestseller</Badge>
              )}
              <p className="font-serif font-light text-xl md:text-2xl text-ivory">
                {product.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/home/EditorialGrid.tsx
git commit -m "feat: add EditorialGrid hero component"
```

---

## Task 8: Home Page — All Sections

**Files:**
- Create: `src/components/home/FeaturedProducts.tsx`
- Create: `src/components/home/BrandStrip.tsx`
- Create: `src/components/home/ScentCategories.tsx`
- Create: `src/components/home/BrandStorySnippet.tsx`
- Create: `src/components/home/NewsletterSection.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create FeaturedProducts**

Create `src/components/home/FeaturedProducts.tsx`:
```tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { Badge } from '@/components/ui/Badge'

export function FeaturedProducts({ products }: { products: Product[] }) {
  const { addItem } = useCart()

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="text-[10px] tracking-widest uppercase text-stone mb-2">Curated for you</p>
          <h2 className="font-serif font-light text-3xl md:text-4xl text-charcoal">
            Featured Collection
          </h2>
        </div>
        <Link
          href="/shop"
          className="text-[10px] tracking-widest uppercase text-stone hover:text-charcoal transition-colors hidden md:block"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="group">
            <Link href={`/shop/${product.slug}`} className="block">
              <div className="relative aspect-[3/4] bg-parchment overflow-hidden mb-4">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product.isNew && (
                  <div className="absolute top-3 left-3">
                    <Badge>New</Badge>
                  </div>
                )}
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/5 transition-colors duration-300" />
              </div>
              <p className="font-serif font-light text-lg text-charcoal mb-1">{product.name}</p>
              <p className="text-xs text-stone mb-3">{formatPrice(product.price)}</p>
            </Link>
            <button
              onClick={() => addItem(product, product.sizes[0])}
              className="text-[9px] tracking-widest uppercase text-stone hover:text-charcoal transition-colors opacity-0 group-hover:opacity-100"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create BrandStrip**

Create `src/components/home/BrandStrip.tsx`:
```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function BrandStrip() {
  return (
    <section className="bg-charcoal text-ivory py-24 px-6 text-center">
      <p className="text-[10px] tracking-widest uppercase text-ivory/40 mb-6">The Flora Philosophy</p>
      <h2 className="font-serif font-light text-3xl md:text-5xl italic max-w-2xl mx-auto leading-tight mb-4">
        Every scent tells a story you carry with you
      </h2>
      <div className="w-8 h-px bg-warm-gold mx-auto mb-8" />
      <p className="text-ivory/60 text-sm font-light max-w-md mx-auto mb-10 leading-relaxed">
        We believe fragrance is the most personal luxury. Our collection is built for those who
        choose their signature with intention.
      </p>
      <Link href="/shop">
        <Button variant="outline" className="border-ivory/40 text-ivory hover:bg-ivory hover:text-charcoal">
          Discover the Collection
        </Button>
      </Link>
    </section>
  )
}
```

- [ ] **Step 3: Create ScentCategories**

Create `src/components/home/ScentCategories.tsx`:
```tsx
import Link from 'next/link'

const categories = [
  { label: 'Floral', emoji: '🌹', query: 'floral' },
  { label: 'Woody', emoji: '🪵', query: 'woody' },
  { label: 'Oriental', emoji: '✨', query: 'oriental' },
  { label: 'Fresh', emoji: '🍃', query: 'fresh' },
  { label: 'Citrus', emoji: '🍊', query: 'citrus' },
]

export function ScentCategories() {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
      <p className="text-[10px] tracking-widest uppercase text-stone mb-8 text-center">
        Shop by Scent Family
      </p>
      <div className="flex gap-4 overflow-x-auto pb-2 justify-center flex-wrap">
        {categories.map((cat) => (
          <Link
            key={cat.query}
            href={`/shop?scent=${cat.query}`}
            className="flex flex-col items-center gap-2 px-8 py-5 bg-parchment hover:bg-sand transition-colors duration-200 min-w-[100px]"
          >
            <span className="text-2xl">{cat.emoji}</span>
            <span className="text-[10px] tracking-widest uppercase text-stone">{cat.label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Create BrandStorySnippet**

Create `src/components/home/BrandStorySnippet.tsx`:
```tsx
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function BrandStorySnippet() {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
      <div className="relative aspect-[4/5] bg-parchment overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1619451683957-bfccd40ba70a?w=800"
          alt="Flora Cosmetics studio"
          fill
          className="object-cover"
        />
      </div>
      <div>
        <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Our Story</p>
        <h2 className="font-serif font-light text-3xl md:text-4xl text-charcoal mb-6 leading-tight">
          Born from a passion for authentic fragrance
        </h2>
        <div className="w-8 h-px bg-warm-gold mb-6" />
        <p className="text-sm text-stone leading-relaxed font-light mb-4">
          Flora Cosmetics was founded with a single conviction: that fragrance should be personal,
          intentional, and enduring. Each formula is developed with rare raw materials sourced
          from trusted suppliers around the world.
        </p>
        <p className="text-sm text-stone leading-relaxed font-light mb-8">
          We do not mass-produce. We craft in small batches, with care, for people who notice the
          difference.
        </p>
        <Link href="/about">
          <Button variant="outline">Our Full Story</Button>
        </Link>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Create NewsletterSection**

Create `src/components/home/NewsletterSection.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <section className="bg-parchment py-20 px-6 text-center">
      <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Stay in the know</p>
      <h2 className="font-serif font-light text-2xl md:text-3xl text-charcoal mb-3">
        New arrivals, first.
      </h2>
      <p className="text-sm text-stone font-light mb-8 max-w-sm mx-auto">
        Subscribe to receive early access to new collections and exclusive offers.
      </p>
      {submitted ? (
        <p className="text-sm text-warm-gold tracking-wider">Thank you — we'll be in touch.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-sm mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            className="flex-1 bg-ivory border border-sand px-4 py-3 text-sm text-charcoal placeholder:text-stone/60 outline-none focus:border-charcoal transition-colors"
          />
          <Button type="submit">Subscribe</Button>
        </form>
      )}
    </section>
  )
}
```

- [ ] **Step 6: Assemble HomePage**

Replace `src/app/page.tsx`:
```tsx
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
```

- [ ] **Step 7: Test in browser**

```bash
npm run dev
```
Open http://localhost:3000. Verify:
- Editorial grid shows with 3 products
- Featured products row shows 4 items
- All sections render without errors
- Clicking cart opens the drawer

- [ ] **Step 8: Commit**

```bash
git add src/components/home/ src/app/page.tsx
git commit -m "feat: complete homepage with editorial grid and all sections"
```

---

## Task 9: Shop Page

**Files:**
- Create: `src/components/shop/ProductCard.tsx`
- Create: `src/components/shop/FilterSidebar.tsx`
- Create: `src/components/shop/ProductGrid.tsx`
- Create: `src/app/shop/page.tsx`

- [ ] **Step 1: Create ProductCard**

Create `src/components/shop/ProductCard.tsx`:
```tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { Badge } from '@/components/ui/Badge'

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()

  return (
    <div className="group">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] bg-parchment overflow-hidden mb-4">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.isNew && <Badge>New</Badge>}
            {product.isBestseller && <Badge className="bg-warm-gold">Bestseller</Badge>}
          </div>
        </div>
        <p className="font-serif font-light text-lg text-charcoal mb-1">{product.name}</p>
        <p className="text-[10px] tracking-widest uppercase text-stone mb-1">{product.category.replace('-', ' ')}</p>
        <p className="text-sm text-charcoal">{formatPrice(product.price)}</p>
      </Link>
      <button
        onClick={() => addItem(product, product.sizes[0])}
        className="mt-3 text-[9px] tracking-widest uppercase text-stone hover:text-charcoal transition-colors"
      >
        Quick Add
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Create FilterSidebar**

Create `src/components/shop/FilterSidebar.tsx`:
```tsx
'use client'

import type { Category, ScentFamily } from '@/types'

type Filters = {
  category: Category | 'all'
  scent: ScentFamily | 'all'
  sort: 'newest' | 'price-asc' | 'price-desc' | 'bestsellers'
}

type Props = {
  filters: Filters
  onChange: (filters: Filters) => void
}

const categories: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'All Products' },
  { value: 'perfume', label: 'Perfume' },
  { value: 'body-care', label: 'Body Care' },
  { value: 'candle', label: 'Candles' },
  { value: 'gift-set', label: 'Gift Sets' },
]

const scents: { value: ScentFamily | 'all'; label: string }[] = [
  { value: 'all', label: 'All Scents' },
  { value: 'floral', label: 'Floral' },
  { value: 'woody', label: 'Woody' },
  { value: 'oriental', label: 'Oriental' },
  { value: 'fresh', label: 'Fresh' },
  { value: 'citrus', label: 'Citrus' },
]

export function FilterSidebar({ filters, onChange }: Props) {
  return (
    <aside className="w-full md:w-56 shrink-0 space-y-8">
      <div>
        <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Category</p>
        <ul className="space-y-2">
          {categories.map(({ value, label }) => (
            <li key={value}>
              <button
                onClick={() => onChange({ ...filters, category: value })}
                className={`text-sm transition-colors ${
                  filters.category === value
                    ? 'text-charcoal font-medium'
                    : 'text-stone hover:text-charcoal'
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Scent Family</p>
        <ul className="space-y-2">
          {scents.map(({ value, label }) => (
            <li key={value}>
              <button
                onClick={() => onChange({ ...filters, scent: value })}
                className={`text-sm transition-colors ${
                  filters.scent === value
                    ? 'text-charcoal font-medium'
                    : 'text-stone hover:text-charcoal'
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Sort</p>
        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as Filters['sort'] })}
          className="text-sm text-charcoal bg-transparent border-b border-parchment pb-1 outline-none w-full"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="bestsellers">Bestsellers</option>
        </select>
      </div>
    </aside>
  )
}
```

- [ ] **Step 3: Create ProductGrid**

Create `src/components/shop/ProductGrid.tsx`:
```tsx
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
```

- [ ] **Step 4: Create Shop page**

Create `src/app/shop/page.tsx`:
```tsx
import { Suspense } from 'react'
import { ShopClient } from './ShopClient'

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center text-stone">Loading…</div>}>
      <ShopClient />
    </Suspense>
  )
}
```

Also create `src/app/shop/ShopClient.tsx`:
```tsx
'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { products } from '@/data/products'
import { FilterSidebar } from '@/components/shop/FilterSidebar'
import { ProductGrid } from '@/components/shop/ProductGrid'
import type { Category, ScentFamily } from '@/types'

type Filters = {
  category: Category | 'all'
  scent: ScentFamily | 'all'
  sort: 'newest' | 'price-asc' | 'price-desc' | 'bestsellers'
}

export function ShopClient() {
  const searchParams = useSearchParams()
  const initialScent = (searchParams.get('scent') as ScentFamily) || 'all'

  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    scent: initialScent,
    sort: 'newest',
  })

  const filtered = useMemo(() => {
    let result = [...products]
    if (filters.category !== 'all') result = result.filter((p) => p.category === filters.category)
    if (filters.scent !== 'all') result = result.filter((p) => p.scentFamily.includes(filters.scent as ScentFamily))
    if (filters.sort === 'price-asc') result.sort((a, b) => a.price - b.price)
    if (filters.sort === 'price-desc') result.sort((a, b) => b.price - a.price)
    if (filters.sort === 'newest') result.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (filters.sort === 'bestsellers') result = result.filter((p) => p.isBestseller).concat(result.filter((p) => !p.isBestseller))
    return result
  }, [filters])

  return (
    <div className="pt-16">
      <div className="bg-parchment py-16 text-center">
        <p className="text-[10px] tracking-widest uppercase text-stone mb-2">Explore</p>
        <h1 className="font-serif font-light text-4xl md:text-5xl text-charcoal">The Collection</h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 flex flex-col md:flex-row gap-12">
        <FilterSidebar filters={filters} onChange={setFilters} />
        <ProductGrid products={filtered} />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Test shop page**

```bash
npm run dev
```
Open http://localhost:3000/shop. Verify:
- All 10 products render
- Category filter narrows the list
- Sort changes product order
- Clicking a product navigates to `/shop/[slug]` (404 for now — that's expected until Task 10)

- [ ] **Step 6: Commit**

```bash
git add src/components/shop/ src/app/shop/
git commit -m "feat: add shop page with filtering and product grid"
```

---

## Task 10: Product Detail Page

**Files:**
- Create: `src/components/product/ImageGallery.tsx`
- Create: `src/components/product/ProductInfo.tsx`
- Create: `src/components/product/ScentNotes.tsx`
- Create: `src/components/product/RelatedProducts.tsx`
- Create: `src/app/shop/[slug]/page.tsx`

- [ ] **Step 1: Create ImageGallery**

Create `src/components/product/ImageGallery.tsx`:
```tsx
'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { Product } from '@/types'

export function ImageGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0)

  return (
    <div className="space-y-4">
      <div className="relative aspect-[3/4] bg-parchment overflow-hidden">
        <Image
          src={product.images[active]}
          alt={product.name}
          fill
          className="object-cover transition-opacity duration-300"
          priority
        />
      </div>
      {product.images.length > 1 && (
        <div className="flex gap-3">
          {product.images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative w-20 h-20 bg-parchment overflow-hidden border-2 transition-colors ${
                active === i ? 'border-charcoal' : 'border-transparent'
              }`}
            >
              <Image src={src} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create ScentNotes**

Create `src/components/product/ScentNotes.tsx`:
```tsx
import type { ScentNotes as ScentNotesType } from '@/types'

export function ScentNotes({ notes }: { notes: ScentNotesType }) {
  const rows: { label: string; items: string[] }[] = [
    { label: 'Top', items: notes.top },
    { label: 'Heart', items: notes.heart },
    { label: 'Base', items: notes.base },
  ].filter((r) => r.items.length > 0)

  if (rows.length === 0) return null

  return (
    <div className="space-y-3">
      {rows.map(({ label, items }) => (
        <div key={label} className="flex gap-4 items-baseline">
          <span className="text-[9px] tracking-widest uppercase text-stone w-10 shrink-0">
            {label}
          </span>
          <div className="flex flex-wrap gap-2">
            {items.map((note) => (
              <span
                key={note}
                className="text-xs text-charcoal px-3 py-1 bg-parchment"
              >
                {note}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create ProductInfo**

Create `src/components/product/ProductInfo.tsx`:
```tsx
'use client'

import { useState } from 'react'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ScentNotes } from './ScentNotes'
import { Accordion } from '@/components/ui/Accordion'

export function ProductInfo({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [selectedSize, setSelectedSize] = useState(product.sizes[0])
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addItem(product, selectedSize)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        {product.isNew && <Badge className="mb-3">New Arrival</Badge>}
        {product.isBestseller && !product.isNew && <Badge className="mb-3 bg-warm-gold">Bestseller</Badge>}
        <h1 className="font-serif font-light text-3xl md:text-4xl text-charcoal mb-2">
          {product.name}
        </h1>
        <p className="font-serif text-2xl text-charcoal">{formatPrice(product.price)}</p>
      </div>

      <div className="w-8 h-px bg-warm-gold" />

      <p className="text-sm text-stone leading-relaxed font-light">{product.shortDescription}</p>

      {product.scentNotes.top.length > 0 && (
        <div>
          <p className="text-[10px] tracking-widest uppercase text-stone mb-3">Scent Notes</p>
          <ScentNotes notes={product.scentNotes} />
        </div>
      )}

      {product.sizes.length > 1 && (
        <div>
          <p className="text-[10px] tracking-widest uppercase text-stone mb-3">Size</p>
          <div className="flex gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 text-xs border transition-colors ${
                  selectedSize === size
                    ? 'border-charcoal bg-charcoal text-ivory'
                    : 'border-parchment text-stone hover:border-charcoal'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-[10px] tracking-widest uppercase text-stone mb-3">Quantity</p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-8 border border-parchment text-stone hover:border-charcoal text-lg flex items-center justify-center"
          >
            −
          </button>
          <span className="text-sm w-6 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-8 h-8 border border-parchment text-stone hover:border-charcoal text-lg flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      <Button size="lg" onClick={handleAddToCart} className="mt-2">
        Add to Cart
      </Button>

      <p className="text-[10px] tracking-widest text-stone">
        Cash on delivery · Free shipping over 5,000 DZD
      </p>

      <Accordion
        items={[
          {
            title: 'Description',
            content: <p className="text-sm leading-relaxed">{product.description}</p>,
          },
          {
            title: 'How to Use',
            content: (
              <p className="text-sm leading-relaxed">
                Apply to pulse points — wrists, neck, and behind the ears. For longer-lasting
                fragrance, apply to moisturised skin or layer with our matching body lotion.
              </p>
            ),
          },
          {
            title: 'Delivery',
            content: (
              <p className="text-sm leading-relaxed">
                We deliver across Algeria via cash on delivery. Standard delivery: 3–5 business
                days. Express delivery available in Algiers: 1–2 business days.
              </p>
            ),
          },
        ]}
      />
    </div>
  )
}
```

- [ ] **Step 4: Create RelatedProducts**

Create `src/components/product/RelatedProducts.tsx`:
```tsx
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/utils'

export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null

  return (
    <section className="border-t border-parchment pt-16 mt-16">
      <p className="text-[10px] tracking-widest uppercase text-stone mb-8 text-center">
        You May Also Like
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <Link key={p.id} href={`/shop/${p.slug}`} className="group">
            <div className="relative aspect-[3/4] bg-parchment overflow-hidden mb-3">
              <Image
                src={p.images[0]}
                alt={p.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <p className="font-serif font-light text-base text-charcoal mb-1">{p.name}</p>
            <p className="text-xs text-stone">{formatPrice(p.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Create Product Detail page**

Create `src/app/shop/[slug]/page.tsx`:
```tsx
import { notFound } from 'next/navigation'
import { products, getProductBySlug } from '@/data/products'
import { getRelatedProducts } from '@/lib/utils'
import { ImageGallery } from '@/components/product/ImageGallery'
import { ProductInfo } from '@/components/product/ProductInfo'
import { RelatedProducts } from '@/components/product/RelatedProducts'

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) notFound()

  const related = getRelatedProducts(products, product)

  return (
    <div className="pt-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          <ImageGallery product={product} />
          <ProductInfo product={product} />
        </div>
        <RelatedProducts products={related} />
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Test product detail**

```bash
npm run dev
```
Open http://localhost:3000/shop/oud-intense. Verify:
- Images display, thumbnail switcher works
- Size buttons highlight on click
- Quantity stepper works
- Add to Cart opens cart drawer and increments badge
- Accordion sections open/close
- Related products show at bottom

- [ ] **Step 7: Commit**

```bash
git add src/components/product/ src/app/shop/
git commit -m "feat: add product detail page with gallery, info, and related products"
```

---

## Task 11: Cart Page

**Files:**
- Create: `src/components/cart/CartItem.tsx`
- Create: `src/components/cart/CartSummary.tsx`
- Create: `src/app/cart/page.tsx`

- [ ] **Step 1: Create CartItem**

Create `src/components/cart/CartItem.tsx`:
```tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { CartItem as CartItemType } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/context/CartContext'

export function CartItem({ item }: { item: CartItemType }) {
  const { removeItem, updateQuantity } = useCart()

  return (
    <div className="flex gap-6 py-6 border-b border-parchment">
      <Link href={`/shop/${item.product.slug}`} className="relative w-24 h-32 bg-parchment shrink-0">
        <Image
          src={item.product.images[0]}
          alt={item.product.name}
          fill
          className="object-cover"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-4">
          <div>
            <Link href={`/shop/${item.product.slug}`}>
              <p className="font-serif text-lg text-charcoal hover:text-stone transition-colors">
                {item.product.name}
              </p>
            </Link>
            <p className="text-[10px] tracking-widest uppercase text-stone mt-1">{item.size}</p>
          </div>
          <p className="font-serif text-lg text-charcoal shrink-0">
            {formatPrice(item.product.price * item.quantity)}
          </p>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center border border-parchment">
            <button
              onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
              className="w-8 h-8 text-stone hover:text-charcoal flex items-center justify-center"
            >
              −
            </button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
              className="w-8 h-8 text-stone hover:text-charcoal flex items-center justify-center"
            >
              +
            </button>
          </div>
          <button
            onClick={() => removeItem(item.product.id, item.size)}
            className="text-[10px] tracking-widest uppercase text-stone hover:text-charcoal transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create CartSummary**

Create `src/components/cart/CartSummary.tsx`:
```tsx
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
```

- [ ] **Step 3: Create Cart page**

Create `src/app/cart/page.tsx`:
```tsx
'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { calculateTotal } from '@/lib/utils'
import { CartItem } from '@/components/cart/CartItem'
import { CartSummary } from '@/components/cart/CartSummary'
import { Button } from '@/components/ui/Button'

export default function CartPage() {
  const { items } = useCart()
  const total = calculateTotal(items)

  return (
    <div className="pt-16">
      <div className="bg-parchment py-16 text-center">
        <h1 className="font-serif font-light text-4xl md:text-5xl text-charcoal">Your Cart</h1>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-16">
        {items.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-serif text-3xl font-light text-charcoal mb-4">Your cart is empty</p>
            <p className="text-sm text-stone mb-8">Discover our collection of artisan fragrances.</p>
            <Link href="/shop">
              <Button>Shop the Collection</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-stone mb-2">
                {items.length} {items.length === 1 ? 'Item' : 'Items'}
              </p>
              {items.map((item) => (
                <CartItem key={`${item.product.id}-${item.size}`} item={item} />
              ))}
              <Link
                href="/shop"
                className="inline-block mt-6 text-[10px] tracking-widest uppercase text-stone hover:text-charcoal"
              >
                ← Continue Shopping
              </Link>
            </div>
            <CartSummary total={total} />
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/cart/ src/app/cart/
git commit -m "feat: add cart page with line items and order summary"
```

---

## Task 12: Checkout & Order Confirmed Pages

**Files:**
- Create: `src/app/checkout/page.tsx`
- Create: `src/app/order-confirmed/page.tsx`

- [ ] **Step 1: Create Checkout page**

Create `src/app/checkout/page.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { calculateTotal, formatPrice, generateOrderId } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import type { Order } from '@/types'

type FormData = {
  fullName: string
  phone: string
  wilaya: string
  address: string
  notes: string
}

type FormErrors = Partial<Record<keyof FormData, string>>

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {}
  if (!data.fullName.trim()) errors.fullName = 'Full name is required'
  if (!data.phone.trim()) errors.phone = 'Phone number is required'
  if (!data.wilaya.trim()) errors.wilaya = 'Wilaya is required'
  if (!data.address.trim()) errors.address = 'Delivery address is required'
  return errors
}

export default function CheckoutPage() {
  const { items, clearCart } = useCart()
  const router = useRouter()
  const total = calculateTotal(items)

  const [form, setForm] = useState<FormData>({
    fullName: '',
    phone: '',
    wilaya: '',
    address: '',
    notes: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name as keyof FormData]) {
      setErrors({ ...errors, [e.target.name]: undefined })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    const order: Order = {
      id: generateOrderId(),
      items,
      customer: form,
      total: total >= 5000 ? total : total + 500,
      createdAt: new Date().toISOString(),
    }

    const existing: Order[] = JSON.parse(localStorage.getItem('flora_orders') || '[]')
    localStorage.setItem('flora_orders', JSON.stringify([...existing, order]))
    localStorage.setItem('flora_last_order', JSON.stringify(order))

    clearCart()
    router.push('/order-confirmed')
  }

  const inputClass = (field: keyof FormData) =>
    `w-full bg-transparent border-b py-3 text-sm text-charcoal placeholder:text-stone/50 outline-none transition-colors ${
      errors[field] ? 'border-red-400' : 'border-parchment focus:border-charcoal'
    }`

  return (
    <div className="pt-16">
      <div className="bg-parchment py-16 text-center">
        <h1 className="font-serif font-light text-4xl md:text-5xl text-charcoal">Checkout</h1>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-stone mb-6">
              Delivery Information
            </p>
            <div className="space-y-6">
              <div>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Full Name *"
                  className={inputClass('fullName')}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>
                )}
              </div>
              <div>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone Number *"
                  className={inputClass('phone')}
                />
                {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <input
                  name="wilaya"
                  value={form.wilaya}
                  onChange={handleChange}
                  placeholder="Wilaya / City *"
                  className={inputClass('wilaya')}
                />
                {errors.wilaya && <p className="text-xs text-red-400 mt-1">{errors.wilaya}</p>}
              </div>
              <div>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Delivery Address *"
                  className={inputClass('address')}
                />
                {errors.address && (
                  <p className="text-xs text-red-400 mt-1">{errors.address}</p>
                )}
              </div>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Order Notes (optional)"
                rows={3}
                className="w-full bg-transparent border-b border-parchment focus:border-charcoal py-3 text-sm text-charcoal placeholder:text-stone/50 outline-none resize-none transition-colors"
              />
            </div>
          </div>

          <div className="bg-parchment p-4">
            <p className="text-[10px] tracking-widest uppercase text-stone mb-2">
              Payment Method
            </p>
            <p className="text-sm text-charcoal">Cash on Delivery</p>
            <p className="text-xs text-stone mt-1">
              You pay when your order arrives. No card details required.
            </p>
          </div>

          <Button type="submit" size="lg" className="w-full justify-center">
            Place Order
          </Button>
        </form>

        <div className="bg-parchment p-8 h-fit sticky top-24">
          <p className="text-[10px] tracking-widest uppercase text-stone mb-6">Order Summary</p>
          <ul className="space-y-4 mb-6">
            {items.map((item) => (
              <li key={`${item.product.id}-${item.size}`} className="flex gap-3">
                <div className="relative w-14 h-18 bg-sand shrink-0">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    width={56}
                    height={72}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-charcoal font-serif">{item.product.name}</p>
                  <p className="text-[10px] tracking-wider text-stone">{item.size} × {item.quantity}</p>
                </div>
                <p className="text-sm text-charcoal shrink-0">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <div className="border-t border-sand pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-stone">Delivery</span>
              <span>{total >= 5000 ? 'Free' : formatPrice(500)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] tracking-widest uppercase text-stone">Total</span>
              <span className="font-serif text-xl text-charcoal">
                {formatPrice(total >= 5000 ? total : total + 500)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create Order Confirmed page**

Create `src/app/order-confirmed/page.tsx`:
```tsx
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Order } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export default function OrderConfirmedPage() {
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('flora_last_order')
    if (stored) setOrder(JSON.parse(stored))
  }, [])

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="w-16 h-16 bg-parchment rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-2xl">✓</span>
        </div>
        <h1 className="font-serif font-light text-4xl text-charcoal mb-4">Order Placed</h1>
        <div className="w-8 h-px bg-warm-gold mx-auto mb-6" />
        <p className="text-sm text-stone leading-relaxed mb-8">
          Thank you for your order. We will contact you shortly on the number provided to confirm
          your delivery details. Cash on delivery — you pay when it arrives.
        </p>

        {order && (
          <div className="bg-parchment p-8 text-left mb-8">
            <p className="text-[10px] tracking-widest uppercase text-stone mb-4">
              Order #{order.id}
            </p>
            <ul className="space-y-3 mb-6">
              {order.items.map((item) => (
                <li key={`${item.product.id}-${item.size}`} className="flex justify-between text-sm">
                  <span className="text-charcoal">
                    {item.product.name} ({item.size}) × {item.quantity}
                  </span>
                  <span className="text-stone">{formatPrice(item.product.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-sand pt-4 flex justify-between">
              <span className="text-[10px] tracking-widest uppercase text-stone">Total</span>
              <span className="font-serif text-lg text-charcoal">{formatPrice(order.total)}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-sand">
              <p className="text-xs text-stone">Delivering to: {order.customer.address}, {order.customer.wilaya}</p>
              <p className="text-xs text-stone mt-1">Contact: {order.customer.phone}</p>
            </div>
          </div>
        )}

        <Link href="/shop">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Test checkout flow**

```bash
npm run dev
```
1. Add a product to cart
2. Go to /checkout
3. Try submitting with empty fields — verify error messages appear
4. Fill in all fields and submit — verify redirect to /order-confirmed
5. Verify order summary shows correct items and total
6. Verify cart is now empty (cart badge shows 0)

- [ ] **Step 4: Commit**

```bash
git add src/app/checkout/ src/app/order-confirmed/
git commit -m "feat: add checkout form with validation and order confirmed page"
```

---

## Task 13: About & Contact Pages

**Files:**
- Create: `src/app/about/page.tsx`
- Create: `src/app/contact/page.tsx`

- [ ] **Step 1: Create About page**

Create `src/app/about/page.tsx`:
```tsx
import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="pt-16">
      <div className="relative h-[60vh] bg-sand overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=1600"
          alt="Flora Cosmetics"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-charcoal/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-[10px] tracking-widest uppercase text-ivory/60 mb-4">Our Story</p>
          <h1 className="font-serif font-light text-5xl md:text-7xl text-ivory">Flora Cosmetics</h1>
          <div className="w-8 h-px bg-warm-gold mt-6" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-24 space-y-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Origins</p>
            <h2 className="font-serif font-light text-3xl text-charcoal mb-6">
              Born from a love of authentic fragrance
            </h2>
            <div className="w-8 h-px bg-warm-gold mb-6" />
            <p className="text-sm text-stone leading-relaxed font-light mb-4">
              Flora Cosmetics was founded with a conviction: that fragrance should be personal,
              intentional, and enduring. We started small — a studio, a few formulas, and an
              obsession with quality that has never wavered.
            </p>
            <p className="text-sm text-stone leading-relaxed font-light">
              Today, our collection spans perfumes, body care, and home fragrance — each product
              developed with rare raw materials from trusted suppliers around the world.
            </p>
          </div>
          <div className="relative aspect-square bg-parchment overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800"
              alt="Flora studio"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-square bg-parchment overflow-hidden order-2 md:order-1">
            <Image
              src="https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800"
              alt="Flora ingredients"
              fill
              className="object-cover"
            />
          </div>
          <div className="order-1 md:order-2">
            <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Philosophy</p>
            <h2 className="font-serif font-light text-3xl text-charcoal mb-6">
              Small batches. No shortcuts.
            </h2>
            <div className="w-8 h-px bg-warm-gold mb-6" />
            <p className="text-sm text-stone leading-relaxed font-light mb-4">
              We do not mass-produce. Every batch is limited, every formula is ours. We believe
              the best fragrance experiences come from restraint — fewer, better ingredients,
              given the time they need.
            </p>
            <p className="text-sm text-stone leading-relaxed font-light">
              Our products are free from parabens, artificial colourants, and unnecessary fillers.
              What you smell is what is in the bottle.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { number: '10+', label: 'Original Fragrances' },
            { number: '100%', label: 'Natural Raw Materials' },
            { number: 'COD', label: 'Cash on Delivery' },
          ].map(({ number, label }) => (
            <div key={label} className="bg-parchment py-10 px-6">
              <p className="font-serif text-4xl font-light text-charcoal mb-2">{number}</p>
              <div className="w-6 h-px bg-warm-gold mx-auto mb-3" />
              <p className="text-[10px] tracking-widest uppercase text-stone">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create Contact page**

Create `src/app/contact/page.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="pt-16">
      <div className="bg-parchment py-16 text-center">
        <p className="text-[10px] tracking-widest uppercase text-stone mb-2">Get in Touch</p>
        <h1 className="font-serif font-light text-4xl md:text-5xl text-charcoal">Contact</h1>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-24 grid grid-cols-1 md:grid-cols-2 gap-20">
        <div>
          <p className="text-[10px] tracking-widest uppercase text-stone mb-8">Send a Message</p>
          {submitted ? (
            <div>
              <p className="font-serif text-2xl font-light text-charcoal mb-3">Thank you</p>
              <p className="text-sm text-stone">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your Name"
                required
                className="w-full bg-transparent border-b border-parchment focus:border-charcoal py-3 text-sm text-charcoal placeholder:text-stone/50 outline-none transition-colors"
              />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email Address"
                required
                className="w-full bg-transparent border-b border-parchment focus:border-charcoal py-3 text-sm text-charcoal placeholder:text-stone/50 outline-none transition-colors"
              />
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Your Message"
                required
                rows={5}
                className="w-full bg-transparent border-b border-parchment focus:border-charcoal py-3 text-sm text-charcoal placeholder:text-stone/50 outline-none resize-none transition-colors"
              />
              <Button type="submit">Send Message</Button>
            </form>
          )}
        </div>

        <div className="space-y-10">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Visit Us</p>
            <p className="text-sm text-charcoal font-serif">Flora Cosmetics</p>
            <p className="text-sm text-stone mt-1">Rue Didouche Mourad, Algiers</p>
            <p className="text-sm text-stone">Algeria</p>
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Hours</p>
            <p className="text-sm text-stone">Saturday – Thursday: 10:00 – 20:00</p>
            <p className="text-sm text-stone">Friday: Closed</p>
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Reach Us</p>
            <p className="text-sm text-stone">+213 555 000 000</p>
            <p className="text-sm text-stone mt-1">hello@floracosmetics.dz</p>
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase text-stone mb-4">Follow</p>
            <div className="flex gap-4">
              {['Instagram', 'Facebook', 'TikTok'].map((platform) => (
                <a
                  key={platform}
                  href="#"
                  className="text-xs tracking-wider text-stone hover:text-charcoal transition-colors"
                >
                  {platform}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/about/ src/app/contact/
git commit -m "feat: add About and Contact pages"
```

---

## Task 14: Final Polish & Build Verification

**Files:**
- Modify: `src/app/globals.css` (smooth transitions)
- Modify: `src/app/layout.tsx` (viewport meta, favicon)

- [ ] **Step 1: Add page transition and animation utilities to globals.css**

Append to `src/app/globals.css`:
```css
@layer utilities {
  .animate-fade-in {
    animation: fadeIn 0.4s ease-in-out;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 2: Add fade-in to main pages**

In `src/app/layout.tsx`, wrap the `<main>` tag:
```tsx
<main className="animate-fade-in">{children}</main>
```

- [ ] **Step 3: Run full TypeScript check**

```bash
npx tsc --noEmit
```
Expected: 0 errors. Fix any type errors before proceeding.

- [ ] **Step 4: Run production build**

```bash
npm run build
```
Expected: `✓ Compiled successfully` with no errors. All routes listed under the build output.

- [ ] **Step 5: Full manual test on built app**

```bash
npm run start
```
Test the following in the browser at http://localhost:3000:

1. **Home** — Editorial grid loads with 3 products, all sections visible, newsletter form submits
2. **Shop** — All 10 products visible, category filter works, sort works, empty state shows when no results
3. **Product detail** (`/shop/oud-intense`) — Images show, size selector works, quantity stepper works, Add to Cart opens drawer
4. **Cart drawer** — Item appears, quantity can be incremented/decremented, Remove works
5. **Cart page** (`/cart`) — Same items shown, subtotal correct, empty state works
6. **Checkout** — Empty submit shows validation errors, filled form submits successfully
7. **Order confirmed** — Shows correct order details
8. **About** — Full page renders, all images load
9. **Contact** — Form submits and shows thank-you message
10. **Responsive** — Check all pages at 375px width (mobile): no horizontal scroll, navigation readable

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat: final polish, fade-in animation, and build verification"
```

---

## Summary

| Task | Deliverable |
|---|---|
| 1 | Next.js project with Tailwind and design tokens |
| 2 | Types, utilities, 10 seed products |
| 3 | Cart context with localStorage |
| 4 | Button, Badge, Accordion UI primitives |
| 5 | Root layout with fonts |
| 6 | Navbar, Footer, CartDrawer |
| 7 | EditorialGrid hero |
| 8 | Full homepage with all sections |
| 9 | Shop page with filters |
| 10 | Product detail page |
| 11 | Cart page |
| 12 | Checkout + Order confirmed |
| 13 | About + Contact |
| 14 | Polish + build verification |
