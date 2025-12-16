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
        primary: "#4f46e5",
        "background-light": "#f8fafc",
        "background-dark": "#0f172a",
        "surface-light": "#ffffff",
        "surface-dark": "#1e293b",
        "primary-dark": "#4f46e5", // Indigo 600
        "primary-glow": "#818cf8", // Indigo 400
        "surface-darker": "#131520", // For contrast areas
        "accent-cyan": "#22d3ee",
        "accent-orange": "#f97316",
        "accent-green": "#22c55e",
        "text-secondary": "#94a3b8", // Slate 400
      },
      fontFamily: {
        display: ["Nunito", "sans-serif"],
        mono: ["Courier New", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
      },
      boxShadow: {
        'glow': '0 0 40px -10px rgba(79, 70, 229, 0.3)',
      },
    },
  },
  plugins: [
    // use try/catch at runtime if plugins may not be installed
    (function () {
      try { return require('@tailwindcss/forms'); } catch (e) { return function () {}; }
    })(),
    (function () {
      try { return require('@tailwindcss/container-queries'); } catch (e) { return function () {}; }
    })(),
  ],
}