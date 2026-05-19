import React, { useCallback, useEffect, useRef } from "react";
import { Stack, useRouter, usePathname } from "expo-router";
import {
  AppShell,
  AppShellProvider,
  type ShellTab,
} from "../../lib/AppShell";
import { useAppMode } from "../../lib/appMode";

function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { mode } = useAppMode();

  const isModeTab = mode === "grammar" || mode === "learn";
  const isExamTab = mode === "exam";
  const prevMode = useRef(mode);
  useEffect(() => {
    if (mode === "learn" && prevMode.current !== "learn") {
      router.replace("/(tabs)/words");
    }
    if (mode === "exam" && prevMode.current !== "exam") {
      router.replace("/(tabs)/exams");
    }
    prevMode.current = mode;
  }, [mode]);

  // Active tab
  const activeTab: ShellTab = (() => {
    if (pathname.includes("/profile")) return "profile";
    if (isExamTab) {
      if (pathname.includes("/exams")) return "exams";
      if (pathname.includes("/exam-dashboard")) return "dashboard";
      return "dashboard";
    }
    if (isModeTab) {
      if (pathname.includes("/words")) return "lessons";
      return "dashboard";
    }
    if (pathname.includes("/study")) return "study";
    if (pathname.includes("/words")) return "words";
    return "dashboard";
  })();

  const handleTabPress = useCallback((tab: ShellTab) => {
    switch (tab) {
      case "dashboard":
        if (isExamTab) router.replace("/(tabs)/exam-dashboard");
        else           router.replace("/(tabs)");
        break;
      case "study":    router.replace("/(tabs)/study");         break;
      case "words":    router.replace("/(tabs)/words");         break;
      case "lessons":  router.replace("/(tabs)/words");         break;
      case "exams":    router.replace("/(tabs)/exams");         break;
      case "profile":  router.replace("/(tabs)/profile");       break;
    }
  }, [router, isExamTab]);

  return (
    <AppShell
      activeTab={activeTab}
      onTabPress={handleTabPress}
      tabSet={isExamTab ? "exam" : isModeTab ? "mode" : "words"}
    >
      <Stack screenOptions={{ headerShown: false, animation: "none" }} />
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
