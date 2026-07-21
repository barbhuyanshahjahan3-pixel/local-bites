/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#e11d48',
          dark: '#be123c',
        },
        ink: '#0f172a',
      },
    },
  },
  plugins: [],
};
