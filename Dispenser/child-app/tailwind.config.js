/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {

        primary: "#6366f1", // Indigo
        "surface-dark": "#151E32", // Slightly lighter navy for cards
        "surface-hover": "#1E293B",


        "background-light": "#f8fafc",
        "background-dark": "#0f172a",
        "card-dark": "#1e293b",
        "card-border": "#334155",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "glow-teal": "0 0 20px rgba(45, 212, 191, 0.15)",
        "glow-blue": "0 0 20px rgba(59, 130, 246, 0.15)",
        "glow-purple": "0 0 20px rgba(168, 85, 247, 0.15)",
        "glow-orange": "0 0 20px rgba(249, 115, 22, 0.15)",
        "glow-pink": "0 0 20px rgba(236, 72, 153, 0.15)",
        "glow-cyan": "0 0 20px rgba(6, 182, 212, 0.15)",
      },
    },
  },
  plugins: [],
}
