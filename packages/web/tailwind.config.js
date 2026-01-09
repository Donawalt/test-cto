import { tailwindConfig } from '@myapp/tokens/tailwind';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    ...tailwindConfig.theme,
  },
  plugins: [],
};
