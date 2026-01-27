/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // Tailwind v4: Theme is defined in globals.css via @theme directive
  // No need to extend here - CSS-first configuration
  plugins: [],
};
