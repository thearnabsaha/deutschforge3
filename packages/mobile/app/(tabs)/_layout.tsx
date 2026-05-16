import React, { useCallback } from "react";
import { Stack, useRouter, usePathname } from "expo-router";
import {
  AppShell,
  AppShellProvider,
  type ShellTab,
} from "../../lib/AppShell";

function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();

  // Derive active tab from current route
  const activeTab: ShellTab =
    pathname.includes("/study")   ? "study"   :
    pathname.includes("/words")   ? "words"   :
    pathname.includes("/profile") ? "profile" : "dashboard";

  const handleTabPress = useCallback((tab: ShellTab) => {
    switch (tab) {
      case "study":     router.replace("/(tabs)/study");   break;
      case "words":     router.replace("/(tabs)/words");   break;
      case "profile":   router.replace("/(tabs)/profile"); break;
      default:          router.replace("/(tabs)");         break;
    }
  }, [router]);

  return (
    <AppShell activeTab={activeTab} onTabPress={handleTabPress}>
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
