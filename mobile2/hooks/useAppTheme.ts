import type { AppTheme } from "@/style/theme";
import { useTheme } from "react-native-paper";

export const useAppTheme = () => useTheme<AppTheme>();
