// possible options for theme switching
export type ThemeOptions = "dark" | "light";

// interface for initial state of theme redux slice
export interface ThemeState {
  mode: ThemeOptions;
}

// type guard for ThemeOptions
export const IsThemeOptions = (str: string): str is ThemeOptions => {
  return str === "dark" || str === "light";
};
