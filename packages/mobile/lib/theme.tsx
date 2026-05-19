import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Storage } from "./storage";

export type ThemeKey = "light" | "dark" | "forest" | "ocean" | "sunset" | "system";

export interface Theme {
  key: ThemeKey;
  name: string;
  emoji: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryDark: string;
  accent: string;
  danger: string;
  tabBar: string;
  tabBarBorder: string;
  card: string;
  grammarTabBar?: string;
  grammarTabBarBorder?: string;
  grammarSurface?: string;
  grammarSurfaceAlt?: string;
  grammarBorder?: string;
  grammarText?: string;
  grammarTextSecondary?: string;
  grammarTextMuted?: string;
  grammarPrimary?: string;
  grammarPrimaryDark?: string;
  grammarAccent?: string;
  dark: boolean;
}

export const THEMES: Record<Exclude<ThemeKey, "system">, Theme> = {
  light: {
    key: "light",
    name: "Classic",
    emoji: "☀️",
    background: "#F7F7F7",
    surface: "#FFFFFF",
    surfaceAlt: "#F0F0F0",
    border: "#E5E5E5",
    text: "#1F1F1F",
    textSecondary: "#555555",
    textMuted: "#888888",
    primary: "#58CC02",
    primaryDark: "#45A800",
    accent: "#FFC800",
    danger: "#FF4B4B",
    tabBar: "#FFFFFF",
    tabBarBorder: "#E5E5E5",
    card: "#FFFFFF",
    grammarTabBar: "#F4EDFF",
    grammarTabBarBorder: "#D9B8FF",
    grammarSurface: "#FBF7FF",
    grammarSurfaceAlt: "#F3E8FF",
    grammarBorder: "#C084FC",
    grammarText: "#2B124C",
    grammarTextSecondary: "#5B3B7A",
    grammarTextMuted: "#8B6AA8",
    grammarPrimary: "#A855F7",
    grammarPrimaryDark: "#9333EA",
    grammarAccent: "#C084FC",
    dark: false,
  },
  dark: {
    key: "dark",
    name: "Dark",
    emoji: "🌙",
    background: "#121212",
    surface: "#1E1E1E",
    surfaceAlt: "#2A2A2A",
    border: "#333333",
    text: "#FFFFFF",
    textSecondary: "#CCCCCC",
    textMuted: "#777777",
    primary: "#58CC02",
    primaryDark: "#45A800",
    accent: "#FFC800",
    danger: "#FF4B4B",
    tabBar: "#1E1E1E",
    tabBarBorder: "#333333",
    card: "#1E1E1E",
    grammarTabBar: "#2A153D",
    grammarTabBarBorder: "#5B21B6",
    grammarSurface: "#231033",
    grammarSurfaceAlt: "#31164A",
    grammarBorder: "#7C3AED",
    grammarText: "#F6EBFF",
    grammarTextSecondary: "#D8B4FE",
    grammarTextMuted: "#B88AE8",
    grammarPrimary: "#C084FC",
    grammarPrimaryDark: "#A855F7",
    grammarAccent: "#E879F9",
    dark: true,
  },
  forest: {
    key: "forest",
    name: "Forest",
    emoji: "🌿",
    background: "#0F1F0F",
    surface: "#1A2E1A",
    surfaceAlt: "#243824",
    border: "#2E472E",
    text: "#E8F5E8",
    textSecondary: "#B8D4B8",
    textMuted: "#6B936B",
    primary: "#4CAF50",
    primaryDark: "#388E3C",
    accent: "#8BC34A",
    danger: "#EF5350",
    tabBar: "#1A2E1A",
    tabBarBorder: "#2E472E",
    card: "#1A2E1A",
    grammarTabBar: "#2A153D",
    grammarTabBarBorder: "#5B21B6",
    grammarSurface: "#231033",
    grammarSurfaceAlt: "#31164A",
    grammarBorder: "#7C3AED",
    grammarText: "#F6EBFF",
    grammarTextSecondary: "#D8B4FE",
    grammarTextMuted: "#B88AE8",
    grammarPrimary: "#C084FC",
    grammarPrimaryDark: "#A855F7",
    grammarAccent: "#E879F9",
    dark: true,
  },
  ocean: {
    key: "ocean",
    name: "Ocean",
    emoji: "🌊",
    background: "#0A1628",
    surface: "#0D1F3C",
    surfaceAlt: "#112850",
    border: "#1A3A6B",
    text: "#E8F4FF",
    textSecondary: "#A8CCEE",
    textMuted: "#557AAA",
    primary: "#1CB0F6",
    primaryDark: "#0D8BC4",
    accent: "#00E5FF",
    danger: "#FF5252",
    tabBar: "#0D1F3C",
    tabBarBorder: "#1A3A6B",
    card: "#0D1F3C",
    grammarTabBar: "#2A153D",
    grammarTabBarBorder: "#5B21B6",
    grammarSurface: "#231033",
    grammarSurfaceAlt: "#31164A",
    grammarBorder: "#7C3AED",
    grammarText: "#F6EBFF",
    grammarTextSecondary: "#D8B4FE",
    grammarTextMuted: "#B88AE8",
    grammarPrimary: "#C084FC",
    grammarPrimaryDark: "#A855F7",
    grammarAccent: "#E879F9",
    dark: true,
  },
  sunset: {
    key: "sunset",
    name: "Sunset",
    emoji: "🌅",
    background: "#FFF5EE",
    surface: "#FFFFFF",
    surfaceAlt: "#FFF0E6",
    border: "#FFD7B5",
    text: "#2D1A00",
    textSecondary: "#5C3B1A",
    textMuted: "#AA7755",
    primary: "#FF6B35",
    primaryDark: "#E55A25",
    accent: "#FFB347",
    danger: "#E53935",
    tabBar: "#FFFFFF",
    tabBarBorder: "#FFD7B5",
    card: "#FFFFFF",
    grammarTabBar: "#F4EDFF",
    grammarTabBarBorder: "#D9B8FF",
    grammarSurface: "#FBF7FF",
    grammarSurfaceAlt: "#F3E8FF",
    grammarBorder: "#C084FC",
    grammarText: "#2B124C",
    grammarTextSecondary: "#5B3B7A",
    grammarTextMuted: "#8B6AA8",
    grammarPrimary: "#A855F7",
    grammarPrimaryDark: "#9333EA",
    grammarAccent: "#C084FC",
    dark: false,
  },
};

const STORAGE_KEY = "deutschforge:theme";

interface ThemeContextValue {
  theme: Theme;
  themeKey: ThemeKey;
  setTheme: (key: ThemeKey) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: THEMES.light,
  themeKey: "light",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeKey, setThemeKey] = useState<ThemeKey>("light");

  useEffect(() => {
    Storage.getItem(STORAGE_KEY).then((val) => {
      if (val && (val in THEMES || val === "system")) {
        setThemeKey(val as ThemeKey);
      }
    });
  }, []);

  const setTheme = useCallback((key: ThemeKey) => {
    setThemeKey(key);
    Storage.setItem(STORAGE_KEY, key);
  }, []);

  const theme = useMemo(
    () => THEMES[themeKey === "system" ? "light" : themeKey] ?? THEMES.light,
    [themeKey]
  );

  const value = useMemo(() => ({ theme, themeKey, setTheme }), [theme, themeKey, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
