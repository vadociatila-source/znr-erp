import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ZNR Brand colors
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        // Alarm colors (konzistentno kroz cijeli sustav)
        alarm: {
          critical: '#ef4444', // isteklo, 48h hitno
          urgent:   '#f97316', // uskoro (<30d)
          warning:  '#eab308', // nadomak (<60d)
          info:     '#3b82f6', // informacija
          ok:       '#22c55e', // uredano
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
} satisfies Config
