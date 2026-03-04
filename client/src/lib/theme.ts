import {
	createContext,
	createElement,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

export type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContext = {
	theme: Theme;
	resolvedTheme: ResolvedTheme;
	setTheme: (theme: Theme) => void;
};

const STORAGE_KEY = "dimewise-theme";
const DARK_CLASS = "dark";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";
const THEME_COLORS: Record<ResolvedTheme, string> = {
	light: "#ffffff",
	dark: "#1a1a1f",
};

const ThemeCtx = createContext<ThemeContext | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
	return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
}

function resolve(theme: Theme): ResolvedTheme {
	return theme === "system" ? getSystemTheme() : theme;
}

function applyTheme(resolved: ResolvedTheme) {
	const root = document.documentElement;
	if (resolved === "dark") {
		root.classList.add(DARK_CLASS);
	} else {
		root.classList.remove(DARK_CLASS);
	}
	const meta = document.querySelector('meta[name="theme-color"]');
	if (meta) {
		meta.setAttribute("content", THEME_COLORS[resolved]);
	}
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = useState<Theme>(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		return (stored as Theme) || "system";
	});

	const resolvedTheme = resolve(theme);

	const setTheme = useCallback((next: Theme) => {
		localStorage.setItem(STORAGE_KEY, next);
		setThemeState(next);
	}, []);

	// Apply theme on mount and when it changes
	useEffect(() => {
		applyTheme(resolve(theme));
	}, [theme]);

	// Listen for system preference changes
	useEffect(() => {
		if (theme !== "system") return;
		const mq = window.matchMedia(MEDIA_QUERY);
		const handler = () => applyTheme(getSystemTheme());
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, [theme]);

	const value = useMemo(
		() => ({ theme, resolvedTheme, setTheme }),
		[theme, resolvedTheme, setTheme],
	);

	return createElement(ThemeCtx.Provider, { value }, children);
}

export function useTheme(): ThemeContext {
	const ctx = useContext(ThemeCtx);
	if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
	return ctx;
}
