import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Storage } from "./storage";

export type AppMode = "learn" | "words" | "grammar" | "exam";

export interface ModeConfig {
  key: AppMode;
  label: string;
  tagline: string;
  color: string;
  darkColor: string;
  available: boolean;
}

export const MODE_CONFIGS: Record<AppMode, ModeConfig> = {
  learn: {
    key: "learn",
    label: "Learn",
    tagline: "Your guided German path",
    color: "#1CB0F6",
    darkColor: "#0E8EC2",
    available: true,
  },
  words: {
    key: "words",
    label: "Words",
    tagline: "Build your vocabulary",
    color: "#58CC02",
    darkColor: "#45A800",
    available: true,
  },
  // Grammar takes over the full shell chrome, but we keep the default app mode on words.
  // The purple theme is driven by the active grammar screen styling.
  
  grammar: {
    key: "grammar",
    label: "Grammar",
    tagline: "Master German grammar",
    color: "#A855F7",
    darkColor: "#9333EA",
    available: true,
  },
  exam: {
    key: "exam",
    label: "Exam",
    tagline: "Test your knowledge",
    color: "#F59E0B",
    darkColor: "#D97706",
    available: false,
  },
};

const STORAGE_KEY = "deutschforge:appMode";

interface AppModeContextValue {
  mode: AppMode;
  modeConfig: ModeConfig;
  setMode: (mode: AppMode) => void;
}

const AppModeContext = createContext<AppModeContextValue>({
  mode: "learn",
  modeConfig: MODE_CONFIGS.learn,
  setMode: () => {},
});

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<AppMode>("words");

  useEffect(() => {
    Storage.getItem(STORAGE_KEY).then((val) => {
      if (val && val in MODE_CONFIGS) {
        setModeState(val as AppMode);
      }
    });
  }, []);

  const setMode = useCallback((m: AppMode) => {
    setModeState(m);
    Storage.setItem(STORAGE_KEY, m);
  }, []);

  const modeConfig = useMemo(() => MODE_CONFIGS[mode], [mode]);
  const value = useMemo(() => ({ mode, modeConfig, setMode }), [mode, modeConfig, setMode]);

  return <AppModeContext.Provider value={value}>{children}</AppModeContext.Provider>;
}

export function useAppMode() {
  return useContext(AppModeContext);
}
