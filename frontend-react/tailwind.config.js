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
          DEFAULT: '#ff6f61', // 1mg Coral/Orange
          light: '#ff8a7d',
          dark: '#e85c4d',
        },
        secondary: {
          DEFAULT: '#1a7f64', // Trusted Green
          light: '#e6fff5',
          dark: '#0f5c48',
        },
        slate: {
          50: '#f6f7fb', // Background
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 12px rgba(0,0,0,0.05)',
        'premium': '0 10px 25px rgba(0,0,0,0.1)',
      }
    },
  },
  plugins: [],
}
