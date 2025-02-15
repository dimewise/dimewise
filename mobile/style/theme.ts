import { color } from "./styles/color.styles";
import { fontSizes } from "./styles/font-sizes.styles";
import { spacing } from "./styles/spacing.styles";
import { typography } from "./styles/typography.styles";

export const theme = {
  color,
  typography,
  spacing,
  fontSizes,
};

export type Theme = typeof theme;
