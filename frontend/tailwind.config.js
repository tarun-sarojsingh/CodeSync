/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F1115",
        surface: "#161B22",
        border: "#21262D",
        primary: "#E6EDF3",
        secondary: "#7D8590",
        brand: "#8957E5",
        userA: "#FF7849",
        userB: "#3FB950",
        userC: "#58A6FF",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
