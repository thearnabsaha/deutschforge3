/**
 * AppShell — universal chrome that wraps every mode.
 *
 * Tab sets are mode-aware:
 *   words/exam  → Dashboard · Study · Words   · Profile
 *   grammar     → Dashboard · Lessons         · Profile
 *   learn       → Dashboard · Lessons         · Profile
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
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  LayoutDashboard,
  BookOpen,
  Library,
  User,
  GraduationCap,
  WifiOff,
  RefreshCw,
} from "lucide-react-native";
import { useTheme } from "./theme";
import { ModeBadge } from "./ModeSwitcher";
import { useIsOnline } from "./useNetwork";
import { subscribeSyncState, type SyncState } from "./syncEngine";

// ─── Tab definitions ──────────────────────────────────────────────────────────

export type ShellTab = "dashboard" | "study" | "words" | "profile" | "lessons" | "exams";

export const WORDS_TABS: { key: ShellTab; label: string; Icon: any }[] = [
  { key: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { key: "study",     label: "Study",     Icon: BookOpen },
  { key: "words",     label: "Words",     Icon: Library },
  { key: "profile",   label: "Profile",   Icon: User },
];

export const MODE_TABS: { key: ShellTab; label: string; Icon: any }[] = [
  { key: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { key: "lessons",   label: "Lessons",   Icon: GraduationCap },
  { key: "profile",   label: "Profile",   Icon: User },
];

export const EXAM_TABS: { key: ShellTab; label: string; Icon: any }[] = [
  { key: "dashboard", label: "Analytics", Icon: LayoutDashboard },
  { key: "exams",     label: "Exams",     Icon: GraduationCap },
  { key: "profile",   label: "Profile",   Icon: User },
];

/** @deprecated use WORDS_TABS or MODE_TABS */
export const SHELL_TABS = WORDS_TABS;

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

export function useShellTopBar(cfg: TopBarConfig) {
  const { setTopBar } = useContext(ShellContext);
  useEffect(() => {
    setTopBar(cfg);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.accent]);
}

// ─── Offline Banner ───────────────────────────────────────────────────────────

function OfflineBanner() {
  const isOnline = useIsOnline();
  const [syncState, setSyncState] = useState<SyncState>({ status: "idle", pendingCount: 0, lastSync: null });
  const spinAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-40)).current;

  useEffect(() => {
    const unsub = subscribeSyncState(setSyncState);
    return unsub;
  }, []);

  const syncing = syncState.status === "syncing";
  const pending = syncState.pendingCount ?? 0;
  const showBanner = !isOnline || syncing || syncState.status === "error";

  // Slide in/out
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: showBanner ? 0 : -40,
      useNativeDriver: true,
      friction: 10,
      tension: 120,
    }).start();
  }, [showBanner, slideAnim]);

  // Spin animation when syncing
  useEffect(() => {
    if (syncing) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.stopAnimation();
      spinAnim.setValue(0);
    }
  }, [syncing, spinAnim]);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  let bgColor = "#F59E0B"; // offline = amber
  let label = pending > 0 ? `Offline — ${pending} change${pending !== 1 ? "s" : ""} pending` : "Offline";
  let Icon: any = WifiOff;

  if (syncing) {
    bgColor = "#3B82F6";
    label = "Syncing...";
    Icon = RefreshCw;
  } else if (syncState.status === "error") {
    bgColor = "#EF4444";
    label = "Sync failed";
    Icon = WifiOff;
  }

  if (!showBanner) return null;

  return (
    <Animated.View
      style={[banner.bar, { backgroundColor: bgColor, transform: [{ translateY: slideAnim }] }]}
    >
      {syncing ? (
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Icon size={12} color="#fff" strokeWidth={2.5} />
        </Animated.View>
      ) : (
        <Icon size={12} color="#fff" strokeWidth={2.5} />
      )}
      <Text style={banner.text}>{label}</Text>
    </Animated.View>
  );
}

const banner = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});

// ─── AppShell wrapper ─────────────────────────────────────────────────────────

interface AppShellProps {
  activeTab: ShellTab;
  onTabPress: (tab: ShellTab) => void;
  children: React.ReactNode;
  tabSet?: "words" | "mode" | "exam";
}

export function AppShell({ activeTab, onTabPress, children, tabSet = "words" }: AppShellProps) {
  const { theme: t } = useTheme();
  const { topBar } = useContext(ShellContext);
  const accent = topBar.accent ?? t.primary;
  const tabs = tabSet === "mode" ? MODE_TABS : tabSet === "exam" ? EXAM_TABS : WORDS_TABS;
  const surface = t.surface;
  const border = t.border;
  const tabBar = t.tabBar;
  const tabBarBorder = t.tabBarBorder;
  const muted = t.textMuted;

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <StatusBar
        barStyle={t.dark ? "light-content" : "dark-content"}
        backgroundColor={surface}
      />

      {/* ── Top bar ── */}
      <SafeAreaView edges={["top"]} style={{ backgroundColor: t.surface }}>
        <View style={[sh.topBar, { borderBottomColor: border }]}>
          <View style={sh.topLeft}>{topBar.left}</View>
          <View style={sh.topRight}>
            {topBar.right}
            <ModeBadge />
          </View>
        </View>
        {/* ── Offline / sync banner ── */}
        <OfflineBanner />
      </SafeAreaView>

      {/* ── Mode content ── */}
      <View style={{ flex: 1 }}>{children}</View>

      {/* ── Bottom nav ── */}
      <SafeAreaView edges={["bottom"]} style={{ backgroundColor: tabBar }}>
        <View style={[sh.bottomBar, { borderTopColor: tabBarBorder }]}>
          {tabs.map(({ key, label, Icon }) => {
            const active = activeTab === key;
            const color = active ? accent : muted;
            return (
              <TouchableOpacity
                key={key}
                style={sh.tabBtn}
                onPress={() => onTabPress(key)}
                activeOpacity={0.7}
              >
                <Icon size={22} color={color} strokeWidth={active ? 2.8 : 2} />
                <Text style={[sh.tabLabel, { color, fontWeight: active ? "800" : "600" }]}>{label}</Text>
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
  tabLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
});
