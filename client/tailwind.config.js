/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#0052FF',
          50: '#E6EEFF',
          500: '#0052FF',
        },
        accent: {
          DEFAULT: '#6366F1',
          500: '#6366F1',
        },
        bg: {
          primary: { light: '#F8FAFC', dark: '#020617' },
          card: { light: '#FFFFFF', dark: '#0F172A' },
          glass: { light: 'rgba(0,0,0,0.03)', dark: 'rgba(255,255,255,0.05)' },
        },
        text: {
          primary: { light: '#0F172A', dark: '#F1F5F9' },
          secondary: { light: '#64748B', dark: '#94A3B8' },
        },
        border: {
          light: '#E2E8F0',
          dark: 'rgba(255,255,255,0.1)',
        }
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 4px 12px -2px rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'gemini': 'linear-gradient(135deg, #0052FF 0%, #6366F1 50%, #EC4899 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
