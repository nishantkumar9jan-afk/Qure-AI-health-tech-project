/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        hospital: {
          50: '#f0fdf9',
          100: '#ccfbef',
          200: '#9af5df',
          300: '#5ce8cb',
          400: '#2ad2b2',
          500: '#10b798',
          600: '#09937c',
          700: '#0b7565',
          800: '#0d5d51',
          900: '#0f4d44',
          950: '#042e2a',
        },
        medical: {
          blue: '#1e40af',
          lightBlue: '#eff6ff',
          accent: '#0284c7'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
