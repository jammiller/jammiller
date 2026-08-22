/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#e8ecf2',
          100: '#c5cee0',
          200: '#9aacc4',
          300: '#6f87a8',
          400: '#4a6588',
          500: '#2d4568',
          600: '#1a3050',
          700: '#122540',
          800: '#0d1d35',
          900: '#0A1A2F',
          950: '#070f1f',
        },
        gold: {
          50:  '#fbf7ec',
          100: '#f6edd0',
          200: '#eddb9e',
          300: '#e4c972',
          400: '#dabd54',
          500: '#D4AF37',
          600: '#b8962e',
          700: '#947624',
          800: '#705a1c',
          900: '#4d3e14',
        },
        slate: {
          50:  '#f5f6f7',
          100: '#e3e5e7',
          200: '#c7cace',
          300: '#a2a6ac',
          400: '#7a7f87',
          500: '#565b62',
          600: '#3d4147',
          700: '#2a2d32',
          800: '#1A1D21',
          900: '#111316',
        },
        softgray: '#F2F6F9',
      },
      animation: {
        'scanline':      'scanline 6s linear infinite',
        'metric-in':     'metric-in 0.6s ease-out both',
        'card-float':    'card-float 4s ease-in-out infinite',
        'data-pulse':    'data-pulse 2s ease-in-out infinite',
        'bar-fill':      'bar-fill 1.2s ease-out both',
        'glow-pulse':    'glow-pulse 3s ease-in-out infinite',
        'gold-pulse':    'gold-pulse 2.5s ease-in-out infinite',
      },
      keyframes: {
        scanline: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'metric-in': {
          '0%':   { opacity: '0', transform: 'translateY(12px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'card-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'data-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        'bar-fill': {
          '0%':   { width: '0%' },
          '100%': { width: 'var(--bar-w)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212,175,55,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(212,175,55,0.6)' },
        },
        'gold-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'grid-navy':  'linear-gradient(rgba(212,175,55,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,0.06) 1px,transparent 1px)',
        'grid-light': 'linear-gradient(rgba(10,26,47,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(10,26,47,0.04) 1px,transparent 1px)',
        'grid-dark':  'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
};
