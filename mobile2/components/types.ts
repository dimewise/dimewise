import type { ReactNode } from "react";

export type OptionListItem = {
  startIcon?: string;
  title: string;
  renderSecondaryAction?: ReactNode;
  onPress?: () => void;
  secondaryAction?: () => void;
};
