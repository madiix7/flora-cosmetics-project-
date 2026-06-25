import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import { headers } from 'next/headers'
import Script from 'next/script'
import { CartProvider } from '@/context/CartContext'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/layout/CartDrawer'
import { getSettings } from '@/lib/server-data'
import './globals.css'

export const dynamic = 'force-dynamic'

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
    'Discover our curated collection of artisan perfumes, body care, and candles. Cash on delivery across Tunisia.',
}

// Validate tracking IDs to prevent script injection from malformed settings values
const GA_ID_RE = /^G-[A-Z0-9]{6,12}$/
const PIXEL_ID_RE = /^\d{10,20}$/

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()
  // Read the per-request nonce injected by middleware. Next.js propagates this
  // nonce automatically to its own generated inline scripts when it sees 'x-nonce'.
  const nonce = (await headers()).get('x-nonce') ?? ''

  const gaId = GA_ID_RE.test(settings.googleAnalyticsId ?? '') ? settings.googleAnalyticsId : ''
  const pixelId = PIXEL_ID_RE.test(settings.metaPixelId ?? '') ? settings.metaPixelId : ''

  const announcement = settings.announcementEnabled
    ? { text: settings.announcementText, link: settings.announcementLink || undefined }
    : undefined

  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <head>
        {pixelId ? (
          <script
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`,
            }}
          />
        ) : null}
      </head>
      <body>
        {gaId ? (
          <>
            <Script nonce={nonce} src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script nonce={nonce} id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        ) : null}

        <CartProvider
          initialFreeDeliveryThreshold={settings.freeDeliveryThreshold}
          initialDeliveryFee={settings.deliveryFee}
        >
          <Navbar announcement={announcement} />
          <CartDrawer />
          <main className="animate-fade-in">{children}</main>
          <Footer
            instagram={settings.instagram || undefined}
            facebook={settings.facebook || undefined}
            tiktok={settings.tiktok || undefined}
            storeTagline={settings.storeTagline || undefined}
          />
        </CartProvider>
      </body>
    </html>
  )
}
