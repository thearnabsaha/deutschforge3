/**
 * AppShell — universal chrome that wraps every mode.
 *
 * Usage:
 *   1. Wrap your app in <AppShellProvider>
 *   2. Each mode screen calls useShellTopBar({ left, right, accent }) to set the top bar
 *   3. _layout.tsx renders <AppShell activeTab onTabPress> around mode content
 *
 * Structure:
 *   TopBar (surface bg, hairline border)
 *     [left content] ·········· [right content] [ModeBadge]
 *   {children}
 *   BottomNav
 *     Dashboard · Study · Words · Profile
 */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  LayoutDashboard,
  BookOpen,
  Library,
  User,
} from "lucide-react-native";
import { useTheme } from "./theme";
import { ModeBadge } from "./ModeSwitcher";

// ─── Tab definitions ──────────────────────────────────────────────────────────

export type ShellTab = "dashboard" | "study" | "words" | "profile";

export const SHELL_TABS: { key: ShellTab; label: string; Icon: any }[] = [
  { key: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { key: "study",     label: "Study",     Icon: BookOpen },
  { key: "words",     label: "Words",     Icon: Library },
  { key: "profile",   label: "Profile",   Icon: User },
];

// ─── Top bar context ──────────────────────────────────────────────────────────

interface TopBarConfig {
  left: React.ReactNode;
  right?: React.ReactNode;
  accent?: string;
}

interface ShellContextValue {
  topBar: TopBarConfig;
  setTopBar: (cfg: TopBarConfig) => void;
}

const ShellContext = createContext<ShellContextValue>({
  topBar: { left: null },
  setTopBar: () => {},
});

export function AppShellProvider({ children }: { children: React.ReactNode }) {
  const [topBar, setTopBarState] = useState<TopBarConfig>({ left: null });
  const setTopBar = useCallback((cfg: TopBarConfig) => setTopBarState(cfg), []);
  return (
    <ShellContext.Provider value={{ topBar, setTopBar }}>
      {children}
    </ShellContext.Provider>
  );
}

/** Call this inside any mode screen to set the top bar content. */
export function useShellTopBar(cfg: TopBarConfig) {
  const { setTopBar } = useContext(ShellContext);
  // Use JSON key so effect only re-runs when content actually changes
  useEffect(() => {
    setTopBar(cfg);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// ─── AppShell wrapper ─────────────────────────────────────────────────────────

interface AppShellProps {
  activeTab: ShellTab;
  onTabPress: (tab: ShellTab) => void;
  children: React.ReactNode;
}

export function AppShell({ activeTab, onTabPress, children }: AppShellProps) {
  const { theme: t } = useTheme();
  const { topBar } = useContext(ShellContext);
  const accent = topBar.accent ?? t.primary;

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <StatusBar
        barStyle={t.dark ? "light-content" : "dark-content"}
        backgroundColor={t.surface}
      />

      {/* ── Top bar ── */}
      <SafeAreaView edges={["top"]} style={{ backgroundColor: t.surface }}>
        <View style={[sh.topBar, { borderBottomColor: t.border }]}>
          <View style={sh.topLeft}>{topBar.left}</View>
          <View style={sh.topRight}>
            {topBar.right}
            <ModeBadge />
          </View>
        </View>
      </SafeAreaView>

      {/* ── Mode content ── */}
      <View style={{ flex: 1 }}>{children}</View>

      {/* ── Bottom nav ── */}
      <SafeAreaView edges={["bottom"]} style={{ backgroundColor: t.tabBar }}>
        <View style={[sh.bottomBar, { borderTopColor: t.tabBarBorder }]}>
          {SHELL_TABS.map(({ key, label, Icon }) => {
            const active = activeTab === key;
            const color = active ? accent : t.textMuted;
            return (
              <TouchableOpacity
                key={key}
                style={sh.tabBtn}
                onPress={() => onTabPress(key)}
                activeOpacity={0.7}
              >
                {active && (
                  <View style={[sh.activePill, { backgroundColor: accent + "22" }]} />
                )}
                <Icon size={22} color={color} strokeWidth={active ? 2.5 : 2} />
                <Text style={[sh.tabLabel, { color }]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const sh = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bottomBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    height: 56,
    paddingBottom: 2,
    paddingTop: 2,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    position: "relative",
  },
  activePill: {
    position: "absolute",
    top: 2,
    width: 40,
    height: 28,
    borderRadius: 14,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
});
