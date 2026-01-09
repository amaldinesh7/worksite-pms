import { tailwindTheme } from '@worksite/ui/tokens';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: tailwindTheme,
  },
  plugins: [],
};
