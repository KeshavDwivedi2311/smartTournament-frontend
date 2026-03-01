/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#667eea',
          600: '#5a6fd8',
          700: '#4f5bc4',
          800: '#4338ca',
          900: '#3730a3',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#764ba2',
          600: '#6a4190',
          700: '#5e377e',
          800: '#522d6c',
          900: '#46235a',
        },
        // SmartSport neon accent colors
        neon: {
          blue: '#00d4ff',
          green: '#00ff88',
          purple: '#8b5cf6',
        },
        dark: {
          900: '#060a13',
          800: '#0a0e1a',
          700: '#0f1628',
          600: '#151d30',
          500: '#1a2540',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
