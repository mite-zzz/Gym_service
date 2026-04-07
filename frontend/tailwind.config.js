/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#fff0f6',
          100: '#ffe0ed',
          200: '#ffc2d9',
          300: '#ff94bf',
          400: '#ff5fa3',
          500: '#ff2d87',
          600: '#f0006b',
          700: '#cc0059',
          800: '#a8004a',
          900: '#8a0040',
        },
      },
    },
  },
  plugins: [],
};
