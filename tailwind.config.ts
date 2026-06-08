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
