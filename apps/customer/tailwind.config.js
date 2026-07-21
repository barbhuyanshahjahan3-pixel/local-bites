/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#dc2626', dark: '#b91c1c' },
      },
    },
  },
  plugins: [],
};
