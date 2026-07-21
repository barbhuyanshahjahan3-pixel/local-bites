/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#ea580c', dark: '#c2410c' },
      },
    },
  },
  plugins: [],
};
