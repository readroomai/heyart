import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#F6F2EA',
        ink: '#111111',
        'ink-soft': '#68645F',
        coral: '#F26445',
        cobalt: '#2855D9',
        sunlight: '#F2E66D',
        mist: '#DDE7F8',
        stone: '#DDD3C4',
        line: 'rgba(17, 17, 17, 0.10)',
        'line-strong': 'rgba(17, 17, 17, 0.22)',
        'line-invert': 'rgba(246, 242, 234, 0.16)',
      },
      fontFamily: {
        sans: ['var(--font-geist)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-editorial)', 'Georgia', 'ui-serif', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display-lg': [
          'clamp(2.75rem, 6vw, 5.25rem)',
          { lineHeight: '1.0', letterSpacing: '-0.03em' },
        ],
        display: [
          'clamp(2.5rem, 5.5vw, 4.375rem)',
          { lineHeight: '1.02', letterSpacing: '-0.025em' },
        ],
        section: ['clamp(1.9rem, 3.6vw, 3rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        lede: ['clamp(1.0625rem, 1.3vw, 1.25rem)', { lineHeight: '1.6' }],
        label: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.16em' }],
      },
      maxWidth: {
        shell: '1320px',
        prose: '68ch',
      },
      spacing: {
        section: 'clamp(4.5rem, 9vw, 9.5rem)',
      },
      borderRadius: {
        frame: '2px',
      },
      boxShadow: {
        frame: '0 1px 2px rgba(17,17,17,0.04), 0 18px 50px -28px rgba(17,17,17,0.28)',
        lift: '0 2px 4px rgba(17,17,17,0.03), 0 32px 80px -40px rgba(17,17,17,0.4)',
      },
      keyframes: {
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        sweep: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(300%)' },
        },
        'marker-pop': {
          '0%': { opacity: '0', transform: 'scale(0.6)' },
          '60%': { opacity: '1', transform: 'scale(1.08)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'rise-in': 'rise-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.6s ease both',
        sweep: 'sweep 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'marker-pop': 'marker-pop 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}

export default config
