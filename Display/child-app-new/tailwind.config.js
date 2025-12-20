// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366F1",
        accent: "#D946EF",
        "background-light": "#F3F4F6",
        "background-dark": "#000000",
        "surface-light": "#FFFFFF",
        "surface-dark": "#09090b",
        "card-dark": "#18181b",
        "border-dark": "#27272a",
        "text-main": "#FFFFFF",
        "text-muted": "#A1A1AA",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(99, 102, 241, 0.5)',
      }
    },
  },
  plugins: [
    // use try/catch at runtime if plugins may not be installed
    (function () {
      try { return require('@tailwindcss/forms'); } catch (e) { return function () { }; }
    })(),
    (function () {
      try { return require('@tailwindcss/container-queries'); } catch (e) { return function () { }; }
    })(),
  ],
}