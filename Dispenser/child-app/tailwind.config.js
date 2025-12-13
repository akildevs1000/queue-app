/** @type {import('tailwindcss').Config} */
module.exports = {
  // Ensure 'class' mode is active for dark mode if needed
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-navy-deep': '#0A1024',
        'brand-navy-mid': '#101836',
        'brand-navy-light': '#1C2A53',
        'brand-cyan': '#67E8F9',
        'brand-silver': '#C0C0C0',
        'brand-light-text': '#E0E0E0',
        'brand-gold': '#C5A352',
        'brand-dark-text': '#1A253C',
        'base-100': '#ffffff',
        'base-200': '#f2f2f2',
        'base-300': '#e6e6e6',
        'base-content': '#1f2937',
        primary: '#3b82f6',
        secondary: '#a855f7',
        accent: '#f59e0b',
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
      },
      animation: {
        'gradient-bg': 'gradient-bg 15s ease infinite',
        'update-highlight': 'update-highlight 2s ease-out',
        'scroll-left': 'scroll-left 45s linear infinite',
        marquee: 'marquee 30s linear infinite',
        'subtle-glow': 'subtle-glow 4s ease-in-out infinite alternate',
      },
      keyframes: {
        'gradient-bg': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'update-highlight': {
          '0%': {
            transform: 'scale(1)',
            opacity: 1,
          },
          '10%': {
            transform: 'scale(1.02)',
            boxShadow: '0 0 40px 10px rgba(103, 232, 249, 0.4)',
            backgroundColor: 'rgba(103, 232, 249, 0.05)',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: 1,
            boxShadow: 'none',
            backgroundColor: 'transparent',
          },
        },
        'scroll-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        marquee: {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        'subtle-glow': {
          from: {
            boxShadow:
              '0 0 10px -5px rgba(224, 224, 224, 0.1), 0 0 20px -10px rgba(224, 224, 224, 0.1)',
          },
          to: {
            boxShadow:
              '0 0 20px -5px rgba(224, 224, 224, 0.15), 0 0 40px -10px rgba(224, 224, 224, 0.1)',
          },
        },
      },
    },
  },
  plugins: [],
}