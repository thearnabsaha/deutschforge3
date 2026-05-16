import React, { useState, useCallback } from "react";
import { useTheme } from "../../lib/theme";
import { useAppMode } from "../../lib/appMode";
import {
  AppShell,
  AppShellProvider,
  type ShellTab,
} from "../../lib/AppShell";

// ── Mode screens (content only — they register their own top bar via useShellTopBar)
import LearnScreen from "../learn";
import GrammarScreen from "../grammar";
import ExamNavigator from "../goethe-exam/ExamNavigator";
import HomeScreen from "./index";
import StudyScreen from "./study";
import WordsScreen from "./words";
import ProfileScreen from "./profile";

// Tab → mode routing:
//   "dashboard" renders the Home screen (dashboard) regardless of mode
//   "study" / "words" / "profile" render their own screens regardless of mode
//   The top-level mode (learn / grammar / exam / words) only affects
//   which screen shows under "dashboard"

function ModeContent({ mode, tab }: { mode: string; tab: ShellTab }) {
  if (tab === "study")   return <StudyScreen />;
  if (tab === "words")   return <WordsScreen />;
  if (tab === "profile") return <ProfileScreen />;

  // dashboard tab — show mode-appropriate main screen
  if (mode === "learn")   return <LearnScreen />;
  if (mode === "grammar") return <GrammarScreen />;
  if (mode === "exam")    return <ExamNavigator />;
  // words / default → home dashboard
  return <HomeScreen />;
}

function TabLayout() {
  const { theme: t } = useTheme();
  const { mode } = useAppMode();
  const [activeTab, setActiveTab] = useState<ShellTab>("dashboard");

  // accent follows mode colour
  const accentMap: Record<string, string> = {
    learn:   "#1CB0F6",
    grammar: "#A855F7",
    exam:    "#F59E0B",
    words:   "#58CC02",
  };
  const accent = accentMap[mode] ?? t.primary;

  const handleTabPress = useCallback((tab: ShellTab) => {
    setActiveTab(tab);
  }, []);

  return (
    <AppShell activeTab={activeTab} onTabPress={handleTabPress}>
      <ModeContent mode={mode} tab={activeTab} />
    </AppShell>
  );
}

export default function RootLayout() {
  return (
    <AppShellProvider>
      <TabLayout />
    </AppShellProvider>
  );
}
