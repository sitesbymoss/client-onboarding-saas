/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0e0e0eff',
        primary: '#1a1a1aff',
        secondary: '#b0b0b0ff',
        textMuted: '#e9e9e9ff',
        accent: '#646c4cff',
        textMain: '#ffffffff',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
        display: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
