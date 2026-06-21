import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#060d1f',
          card: '#0a1428',
          'card-hover': '#0d1a35',
          border: '#162040',
          'border-bright': '#1e3060',
          muted: '#1a2744',
        },
        market: {
          green: '#00e676',
          'green-dim': 'rgba(0,230,118,0.12)',
          'green-border': 'rgba(0,230,118,0.25)',
          red: '#ff4444',
          'red-dim': 'rgba(255,68,68,0.12)',
          'red-border': 'rgba(255,68,68,0.25)',
          yellow: '#ffc107',
          'yellow-dim': 'rgba(255,193,7,0.12)',
          blue: '#3d7eff',
          'blue-dim': 'rgba(61,126,255,0.12)',
          'blue-border': 'rgba(61,126,255,0.3)',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'slide-in': { '0%': { opacity: '0', transform: 'translateX(-12px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        'pulse-green': { '0%, 100%': { boxShadow: '0 0 0 0 rgba(0,230,118,0)' }, '50%': { boxShadow: '0 0 8px 2px rgba(0,230,118,0.3)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'slide-in': 'slide-in 0.25s ease-out forwards',
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
        shimmer: 'shimmer 1.5s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
