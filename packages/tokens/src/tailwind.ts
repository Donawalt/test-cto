import { colors, spacing, fontSize, fontWeight, borderRadius, shadows, breakpoints } from './index';

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
