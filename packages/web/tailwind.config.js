import { tailwindConfig } from '@myapp/tokens/tailwind';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', '../ui/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    ...tailwindConfig.theme,
  },
  plugins: [],
};
