/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#135bec',
          hover: '#1a4ed8',
          dim: 'rgba(19,91,236,0.08)',
        },
        surface: {
          900: '#09090b',
          800: '#0f0f11',
          700: '#141416',
          600: '#18181b',
          500: '#1c1c20',
          400: '#232328',
        },
        border: {
          DEFAULT: '#27272a',
          zinc: '#27272a',
          slate: '#2e2e33',
          zincLight: '#3f3f46',
        },
        text: {
          primary: '#f4f4f5',
          secondary: '#a1a1aa',
          muted: '#71717a',
          dim: '#52525b',
        },
        green: {
          chain: '#22c55e',
        },
        amber: {
          chain: '#f59e0b',
          light: '#fbbf24',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      borderRadius: {
        pill: '9999px',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
