# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Flora Cosmetics — a full e-commerce website for a perfume and cosmetics boutique. Clean Minimal aesthetic, cash-on-delivery ordering (no payment gateway), built with Next.js 15 + Tailwind CSS v4.

## Commands

```bash
npm run dev       # start dev server at localhost:3000
npm run build     # production build (run before declaring anything done)
npm run start     # serve production build
npx tsc --noEmit  # type-check without emitting files
```

## Architecture

**Framework:** Next.js 15 App Router — all pages live under `src/app/`. Dynamic routes use async params (`params: Promise<{ slug: string }>`).

**Data layer:** No database. Products are a static TypeScript array in `src/data/products.ts`. Adding a product = adding an entry there and dropping an image in `public/images/products/`. Orders are saved to `localStorage` under `flora_orders`; the last order is also stored under `flora_last_order` for the confirmation page.

**State:** Cart is managed by `src/context/CartContext.tsx` (React Context + `useReducer`) with `localStorage` persistence. `CartProvider` wraps the entire app in the root layout. `useCart()` is the only hook consumers need.

**Client/server boundary:** Pages that need cart access (`FeaturedProducts`, `ProductInfo`, `CartDrawer`, cart/checkout pages) are `'use client'`. Static pages (Home assembly, About, product page shell) are server components. The Shop page uses `useSearchParams` and must be wrapped in `<Suspense>` — the pattern is a server `page.tsx` that renders a `'use client'` `ShopClient.tsx`.

**Styling:** Tailwind CSS v4 with custom tokens defined in `tailwind.config.ts`:
- Colors: `ivory`, `parchment`, `sand`, `warm-gold`, `stone`, `charcoal`
- Fonts: `font-serif` (Cormorant Garamond, loaded via `next/font/google`) and `font-sans` (DM Sans)
- UI convention: labels use `text-[10px] tracking-widest uppercase text-stone`; headings use `font-serif font-light`

**Utilities (`src/lib/utils.ts`):** `formatPrice(n)` → DZD string, `calculateTotal(items)`, `generateOrderId()`, `getRelatedProducts(products, current, limit)`. Use these rather than inlining the logic.

**UI primitives (`src/components/ui/`):** `Button` (variants: `primary`, `outline`, `ghost`; sizes: `sm`, `md`, `lg`), `Badge`, `Accordion`. Use the `cn()` helper from `src/lib/cn.ts` for conditional class merging.

## Key Conventions

- Free shipping threshold is 5,000 DZD — reflected in `CartSummary`, `CartDrawer`, and `ProductInfo`.
- Prices are stored as plain integers in DZD; always render through `formatPrice()`.
- `isFeatured` products populate the homepage `EditorialGrid` (first 3) and `FeaturedProducts` row (first 4).
- The Navbar is transparent over the homepage hero and switches to `bg-ivory` after 40px scroll.
- Images from Unsplash are whitelisted in `next.config.ts`; local product images go in `public/images/products/`.

## Spec & Plan

Full design spec: `docs/superpowers/specs/2026-06-08-flora-cosmetics-website-design.md`  
Implementation plan: `docs/superpowers/plans/2026-06-08-flora-cosmetics-website.md`
