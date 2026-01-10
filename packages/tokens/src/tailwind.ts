import { colors, spacing, fontSize, fontWeight, borderRadius, shadows, breakpoints } from './index';

/** @type {import('tailwindcss').Config} */
export const tailwindConfig = {
  theme: {
    extend: {
      colors,
      spacing,
      fontSize,
      fontWeight,
      borderRadius,
      boxShadow: shadows,
      screens: breakpoints,
    },
  },
};

export default tailwindConfig;
