import { type Theme, theme } from "@/style/theme";
import { type PropsWithChildren, createContext, useContext } from "react";

const ThemeContext = createContext<Theme | null>(null);

export const useTheme = () => {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return value;
};

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const contextValue: Theme = theme;
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
