import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts}',
    './hooks/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      keyframes: {
        'modal-in': {
          '0%': { opacity: '0', transform: 'translateY(16px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(139,92,246,0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(139,92,246,0.7)' },
        },
      },
      animation: {
        'modal-in': 'modal-in 0.2s ease-out forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
