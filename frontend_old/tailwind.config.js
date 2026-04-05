/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0d3a7d',
          light: '#1b52a8',
          dark: '#072658',
        },
        secondary: {
          DEFAULT: '#009fe3',
        },
        accent: {
          DEFAULT: '#ff8f00',
        }
      },
    },
  },
  plugins: [],
}
