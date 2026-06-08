# Flora Cosmetics — Website Design Spec
_Date: 2026-06-08_

## Overview

A full e-commerce website for Flora Cosmetics, a perfume and cosmetics boutique. The site uses a **Clean Minimal** aesthetic (Aesop/Le Labo-inspired), **cash-on-delivery** ordering (no payment gateway), and is built with **Next.js + Tailwind CSS**.

---

## Design System

### Colors
| Token | Hex | Usage |
|---|---|---|
| `ivory` | `#f8f5f0` | Page background |
| `parchment` | `#ede8e0` | Cards, sections |
| `sand` | `#d4c9b8` | Image placeholders, hover states |
| `warm-gold` | `#c5a87a` | Accents, dividers, highlights |
| `stone` | `#888882` | Secondary text, labels |
| `charcoal` | `#1a1a1a` | Primary text, buttons |

### Typography
- **Headings / Display:** Cormorant Garamond (300, 400, 500 weights) — loaded from Google Fonts
- **Body / UI:** DM Sans (300, 400, 500 weights) — loaded from Google Fonts
- **Letter-spacing:** Heavy use of wide tracking (3–6px) on labels and nav items for a luxury feel

### Buttons
- **Primary:** `bg-charcoal text-ivory` — flat, 1px radius, uppercase DM Sans 10px tracking-widest
- **Outline:** `border-charcoal text-charcoal` — same sizing
- **Ghost:** text-only with underline on hover

### Motion
- Subtle fade-in on page load (opacity 0→1, 400ms)
- Product cards: slight translateY(-4px) on hover, shadow lift
- Cart drawer: slides in from right (300ms ease-out)

---

## Site Architecture

### Pages

| Route | Component | Description |
|---|---|---|
| `/` | `HomePage` | Editorial grid hero, featured products row, brand story strip, newsletter signup |
| `/shop` | `ShopPage` | Full product grid, category + scent family filters, sort |
| `/shop/[slug]` | `ProductPage` | Large imagery, scent notes, size/quantity selector, Add to Cart |
| `/about` | `AboutPage` | Brand story, values, ingredient philosophy, team |
| `/cart` | `CartPage` | Line items, quantity controls, subtotal, link to checkout |
| `/checkout` | `CheckoutPage` | Customer details form, order summary, Place Order button |
| `/order-confirmed` | `OrderConfirmedPage` | Order summary, "we'll contact you to confirm delivery" message |
| `/contact` | `ContactPage` | Contact form, social links, location/hours |

### Shared Layout Components
- `Navbar` — logo left, nav links center, cart icon right (shows item count badge)
- `Footer` — brand tagline, nav links, social icons, newsletter input
- `CartDrawer` — slide-in sidebar triggered by cart icon, shows items + subtotal + checkout CTA

---

## Page-by-Page Design

### Home (`/`)
1. **Navbar** — transparent over hero, switches to ivory background on scroll
2. **Editorial Grid Hero** — CSS Grid, 2 columns:
   - Left (60%): Large featured product image, fills height. Product name + "New Arrival" tag overlaid at bottom-left
   - Right (40%): Two stacked smaller product cards, each with image + product name tag
   - On mobile: stacks to single column, big card first
3. **Brand Strip** — full-width section, centered. Short headline in Cormorant Garamond 48px italic, 2-line tagline, "Discover the Collection" CTA button
4. **Featured Products Row** — 4-column grid of product cards (3 on tablet, 2 on mobile). Each card: image, product name, price, Add to Cart on hover
5. **Scent Categories** — horizontal scrollable row of category pills (Floral, Woody, Oriental, Fresh, Citrus)
6. **Brand Story Snippet** — 2-column layout: left = editorial photo, right = short paragraph + "Our Story" link
7. **Newsletter Section** — full-width, parchment background, email input + subscribe button
8. **Footer**

### Shop (`/shop`)
- Sticky sidebar (desktop) or top filter bar (mobile) with:
  - Category filter (All, Perfume, Body Care, Candles, Gift Sets)
  - Scent family filter (Floral, Woody, Oriental, Fresh, Citrus)
  - Sort (Newest, Price Low→High, Price High→Low, Bestsellers)
- Product grid: 3 columns desktop, 2 tablet, 1 mobile
- Each product card: image (aspect-ratio 3/4), name, price, subtle "Add to Cart" button that appears on hover
- Empty state when filters return no results

### Product Detail (`/shop/[slug]`)
- 2-column layout: left = image gallery (main + thumbnails), right = product info
- Product info: name, price, short description, scent notes (listed as tags), size selector (if applicable), quantity spinner, Add to Cart (primary button), "Continue Shopping" ghost link
- Below fold: full description, ingredients, how to use — in accordion tabs
- Related Products row at bottom (3 cards)

### About (`/about`)
- Full-width editorial header image with brand name overlay
- Alternating text/image sections: Our Story, Our Values, Our Ingredients
- Team section (optional, can be left as placeholder)

### Cart (`/cart`)
- List of cart items: thumbnail, name, size, price, quantity stepper, remove button
- Order subtotal
- "Proceed to Checkout" primary CTA
- "Continue Shopping" ghost link
- Empty cart state with illustration/message

### Checkout (`/checkout`)
- Order summary on the right (sticky on desktop)
- Customer form on the left:
  - Full name (required)
  - Phone number (required)
  - Wilaya / City (required)
  - Delivery address (required)
  - Order notes (optional)
- "Place Order" button — on submit, saves order to a local JSON file or `localStorage`, clears cart, redirects to `/order-confirmed`
- No payment fields — cash on delivery only, stated clearly above the form

### Order Confirmed (`/order-confirmed`)
- Checkmark icon + "Order Placed Successfully"
- Order number (timestamp-based)
- Summary of items ordered
- "We will contact you shortly to confirm your delivery"
- "Continue Shopping" button

### Contact (`/contact`)
- Contact form: name, email, message
- Store info: address, phone, email, hours
- Social media links

---

## Data Model

### Product
```ts
type Product = {
  id: string
  slug: string
  name: string
  price: number          // in local currency (DZD)
  images: string[]       // paths to /public/images/products/
  category: 'perfume' | 'body-care' | 'candle' | 'gift-set'
  scentFamily: ('floral' | 'woody' | 'oriental' | 'fresh' | 'citrus')[]
  sizes: string[]        // e.g. ['30ml', '50ml', '100ml']
  shortDescription: string
  description: string
  scentNotes: { top: string[], heart: string[], base: string[] }
  isFeatured: boolean
  isNew: boolean
  isBestseller: boolean
  createdAt: string
}
```

Products are stored in `/src/data/products.ts` as a typed array — no database needed. Adding a new product = adding an entry to that array and dropping an image in `/public/images/products/`.

### Cart State
Managed with React Context + `localStorage` for persistence. Cart items are `{ product, size, quantity }` tuples.

### Order
On "Place Order", an order object is written to `localStorage` under a key like `flora_orders`. In future this can be replaced with an API route that emails or stores orders server-side.

---

## File Structure

```
flora-cosmetics/
├── public/
│   └── images/
│       ├── products/       # product photos
│       └── brand/          # editorial, about page photos
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── page.tsx        # Home
│   │   ├── shop/
│   │   │   ├── page.tsx    # Shop
│   │   │   └── [slug]/
│   │   │       └── page.tsx # Product detail
│   │   ├── about/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── order-confirmed/page.tsx
│   │   ├── contact/page.tsx
│   │   └── layout.tsx      # Root layout (Navbar + Footer + CartProvider)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── CartDrawer.tsx
│   │   ├── home/
│   │   │   ├── EditorialGrid.tsx
│   │   │   ├── FeaturedProducts.tsx
│   │   │   ├── BrandStrip.tsx
│   │   │   ├── ScentCategories.tsx
│   │   │   ├── BrandStorySnippet.tsx
│   │   │   └── NewsletterSection.tsx
│   │   ├── shop/
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   └── FilterSidebar.tsx
│   │   ├── product/
│   │   │   ├── ImageGallery.tsx
│   │   │   ├── ProductInfo.tsx
│   │   │   ├── ScentNotes.tsx
│   │   │   └── RelatedProducts.tsx
│   │   ├── cart/
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Badge.tsx
│   │       └── Accordion.tsx
│   ├── context/
│   │   └── CartContext.tsx
│   ├── data/
│   │   └── products.ts
│   ├── types/
│   │   └── index.ts
│   └── lib/
│       └── utils.ts
├── tailwind.config.ts      # Custom tokens (colors, fonts)
├── next.config.ts
└── package.json
```

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 |
| Fonts | Google Fonts (Cormorant Garamond + DM Sans) |
| State | React Context (cart) |
| Data | Static TypeScript array (`/src/data/products.ts`) |
| Images | Next.js `<Image>` component (optimized) |
| Deployment | Vercel (free tier) |

---

## Sample Products (seed data)

10 placeholder products spanning all categories will be included so the site renders with real content from day one:
- 4 perfumes (Oud Intense, Rose Sillage, Amber Noir, Jasmine Lumière)
- 2 body care (Velvet Body Lotion, Silk Shower Oil)
- 2 candles (Cedarwood & Vanilla, White Tea & Iris)
- 2 gift sets (The Signature Set, The Discovery Set)

---

## Verification

1. `npm run dev` — site loads at localhost:3000, all pages render without errors
2. Home editorial grid displays correctly on desktop and mobile
3. Shop page filters work (clicking a category shows only matching products)
4. Product detail page: size selector updates correctly, Add to Cart increments cart count in navbar
5. Cart page: quantity stepper works, remove button works, subtotal updates
6. Checkout: form validation rejects empty required fields, successful submit redirects to `/order-confirmed`
7. Order confirmed page shows correct order summary
8. Cart persists on page refresh (localStorage)
9. `npm run build` — no TypeScript errors, build succeeds
