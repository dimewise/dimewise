import type { ReactNode } from "react";

export type OptionListItem = {
  startIcon?: ReactNode;
  title: string;
  renderSecondaryAction?: ReactNode;
  onPress?: () => void;
  secondaryAction?: () => void;
};
