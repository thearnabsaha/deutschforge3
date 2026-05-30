import React, { useCallback, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useShellTopBar } from "../../lib/AppShell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  BarChart2,
  Settings,
  ChevronRight,
  Flame,
  Zap,
  BookOpen,
  CheckCircle,
  Lock,
  Trash2,
  RefreshCw,
  LogOut,
  User,
  ArrowLeft,
} from "lucide-react-native";
import { api, baseUrl } from "../../lib/api";
import { authClient } from "../../lib/auth";
import { clearLocalData } from "../../lib/localDb";
import { clearQueue } from "../../lib/syncQueue";
import { useTheme } from "../../lib/theme";
import { useAppMode } from "../../lib/appMode";
import { Storage } from "../../lib/storage";
import { resetProgress } from "../../lib/syllabusProgress";
import { resetGrammarProgress } from "../../lib/grammarProgress";
import { DeutschForgeMascot } from "../../components/DeutschForgeMascot";
import { BadgeIcon, getBadgeTierAndType, TIER_LABELS } from "../../components/BadgeIcon";

const CUSTOM_SETS_KEY = "custom_sets_v1";
const CUSTOM_NAMES_KEY = "custom_set_names_v1";
const EXAM_HISTORY_KEY = "exam_history_v1";
const BOOK_ADDED_SETS_KEY = "vocab_book_added_sets_v1";

const LEVEL_NAMES: Record<number, string> = {
  1: "Beginner", 2: "Novice", 3: "Elementary",
  4: "Pre-Intermediate", 5: "Intermediate", 6: "Upper Intermediate",
  7: "Advanced", 8: "Proficient", 9: "Expert", 10: "Master",
};

function getLevelName(level: number): string {
  return LEVEL_NAMES[Math.min(level, 10)] ?? "Legend";
}

const BadgeItem = memo(function BadgeItem({ badge, t }: { badge: any; t: any }) {
  const { tier, type } = getBadgeTierAndType(badge.key);
  const tierLabel = TIER_LABELS[tier];

  const TIER_TAG_COLORS: Record<string, string> = {
    copper:   "#B87333",
    silver:   "#9E9E9E",
    gold:     "#C8920A",
    platinum: "#5B8EBD",
    diamond:  "#9B59B6",
    special:  "#E74C3C",
  };
  const tagColor = TIER_TAG_COLORS[tier] ?? "#888";

  return (
    <View
      style={[
        styles.badgeItem,
        { backgroundColor: t.surface },
        !badge.earned && { backgroundColor: t.surfaceAlt },
      ]}
    >
      <BadgeIcon type={type} tier={tier} size={44} earned={badge.earned} />
      {/* Tier chip */}
      <View style={[styles.tierChip, { backgroundColor: tagColor + "22", borderColor: tagColor }]}>
        <Text style={[styles.tierChipText, { color: tagColor }]}>{tierLabel}</Text>
      </View>
      <Text style={[styles.badgeName, { color: badge.earned ? t.text : t.textMuted }]} numberOfLines={2}>
        {badge.name}
      </Text>
      <Text style={[styles.badgeDesc, { color: badge.earned ? t.textSecondary : t.textMuted }]} numberOfLines={2}>
        {badge.description}
      </Text>
      {!badge.earned && (
        <View style={styles.lockOverlay}>
          <Lock size={14} color={t.textMuted} strokeWidth={2} />
        </View>
      )}
    </View>
  );
});

const CATEGORY_LABELS: Record<string, string> = {
  vocabulary: "Vocabulary",
  reviews: "Reviews",
  streak: "Streaks",
  level: "Levels",
  accuracy: "Accuracy",
  cefr: "CEFR Levels",
  variety: "Variety",
  special: "Special",
};

const CATEGORY_ORDER = ["vocabulary", "reviews", "streak", "level", "accuracy", "cefr", "variety", "special"];

const BadgeGrid = memo(function BadgeGrid({ badges, t }: { badges: any[]; t: any }) {
  const grouped: Record<string, any[]> = {};
  for (const b of badges) {
    const cat = b.category ?? "special";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat]!.push(b);
  }

  return (
    <View>
      {CATEGORY_ORDER.filter((cat) => (grouped[cat]?.length ?? 0) > 0).map((cat) => (
        <View key={cat} style={styles.badgeCategorySection}>
          <Text style={[styles.badgeCategoryLabel, { color: t.textMuted }]}>
            {CATEGORY_LABELS[cat] ?? cat}
          </Text>
          <View style={styles.badgeGrid}>
            {(grouped[cat] ?? []).map((badge) => (
              <BadgeItem key={badge.key} badge={badge} t={t} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
});

export default function ProfileScreen() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const { theme: t } = useTheme();
  const router = useRouter();
  const { mode, modeConfig } = useAppMode();
  const modeColor = modeConfig.color;

  const stats = useQuery({
    queryKey: ["stats"],
    queryFn: async () => (await api.stats.$get()).json(),
    staleTime: 60_000,
  });

  const badges = useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/api/stats/badges`, { credentials: "include" });
      return res.json();
    },
    staleTime: 120_000,
  });

  const handleLogout = useCallback(() => {
    Alert.alert("Log Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await authClient.signOut();
          } catch (_) {}
          // Clear local SQLite data + pending sync queue so next user starts fresh
          clearLocalData();
          clearQueue();
          queryClient.clear();
          // AuthGate's session→null effect handles the redirect naturally
        },
      },
    ]);
  }, [queryClient]);

  const handleResetVocabulary = useCallback(() => {
    Alert.alert(
      "Reset Vocabulary",
      "This will permanently delete ALL your words and flashcards. Your stats and XP will remain. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All Words",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${baseUrl}/api/words/reset`, {
                method: "DELETE",
                credentials: "include",
              });
              if (!res.ok) throw new Error("Failed");
              // Also clear local storage (custom sets, exam history)
              await Storage.removeItem(CUSTOM_SETS_KEY);
              await Storage.removeItem(CUSTOM_NAMES_KEY);
              await Storage.removeItem(EXAM_HISTORY_KEY);
              await Storage.removeItem(BOOK_ADDED_SETS_KEY);
              await resetProgress();
              await resetGrammarProgress();
              queryClient.invalidateQueries({ queryKey: ["words"] });
              queryClient.invalidateQueries({ queryKey: ["stats"] });
              queryClient.invalidateQueries({ queryKey: ["review"] });
              Alert.alert("Done", "All words have been deleted.");
            } catch {
              Alert.alert("Error", "Failed to reset vocabulary.");
            }
          },
        },
      ]
    );
  }, [queryClient]);

  const handleResetProfile = useCallback(() => {
    Alert.alert(
      "Reset Profile",
      "This will reset ALL your XP, level, streak, reviews, and badges back to zero. Your words will remain. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Everything",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${baseUrl}/api/stats/reset`, {
                method: "DELETE",
                credentials: "include",
              });
              if (!res.ok) throw new Error("Failed");
              // Clear exam history and book progress from local storage
              await Storage.removeItem(EXAM_HISTORY_KEY);
              await Storage.removeItem(BOOK_ADDED_SETS_KEY);
              queryClient.invalidateQueries({ queryKey: ["stats"] });
              queryClient.invalidateQueries({ queryKey: ["badges"] });
              queryClient.invalidateQueries({ queryKey: ["review"] });
              Alert.alert("Done", "Profile has been reset to level 1.");
            } catch {
              Alert.alert("Error", "Failed to reset profile.");
            }
          },
        },
      ]
    );
  }, [queryClient]);

  const handleSettings = useCallback(() => router.push("/settings"), [router]);
  const handleDashboard = useCallback(() => router.push("/dashboard"), [router]);
  const handleBook = useCallback(() => router.push("/book" as any), [router]);

  const data = stats.data;
  const xpForCurrent = data?.xpForCurrentLevel ?? 0;
  const xpForNext = data?.xpForNextLevel ?? 100;
  const xpProgress = xpForNext > xpForCurrent
    ? ((data?.xp ?? 0) - xpForCurrent) / (xpForNext - xpForCurrent)
    : 0;

  const earnedCount = badges.data?.badges?.filter((b: any) => b.earned).length ?? 0;
  const totalBadges = badges.data?.badges?.length ?? 0;

  const statItems = [
    { icon: <Flame size={20} color={modeColor} strokeWidth={2} />, num: data?.streak ?? 0, label: "Current Streak" },
    { icon: <Zap size={20} color={modeColor} strokeWidth={2} />, num: data?.longestStreak ?? 0, label: "Best Streak" },
    { icon: <BookOpen size={20} color={modeColor} strokeWidth={2} />, num: data?.wordCount ?? 0, label: "Total Words" },
    { icon: <CheckCircle size={20} color={modeColor} strokeWidth={2} />, num: data?.totalReviews ?? 0, label: "Total Reviews" },
  ];

  useShellTopBar({
    left: (
      <>
        {mode === "grammar" && (
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ marginRight: 4 }}
          >
            <ArrowLeft size={22} color={t.text} strokeWidth={2.5} />
          </TouchableOpacity>
        )}
        <User size={22} color={modeColor} strokeWidth={2.5} />
        <Text style={[styles.headerTitle, { color: t.text }]}>Profile</Text>
      </>
    ),
    accent: modeColor,
  });

  return (
    <View style={[styles.safe, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <DeutschForgeMascot mood="happy" size={100} style={{ marginBottom: 8 }} />
          <Text style={[styles.userName, { color: t.text }]}>{session?.user?.name ?? "Learner"}</Text>
          <Text style={[styles.userEmail, { color: t.textMuted }]}>{session?.user?.email}</Text>
        </View>

        {/* Nav Buttons */}
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: t.surface, borderColor: t.border }]}
          onPress={handleDashboard}
          activeOpacity={0.8}
        >
          <BarChart2 size={18} color={t.textSecondary} strokeWidth={2} />
          <Text style={[styles.navBtnText, { color: t.text }]}>Analytics Dashboard</Text>
          <ChevronRight size={16} color={t.textMuted} strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: t.surface, borderColor: t.border }]}
          onPress={handleBook}
          activeOpacity={0.8}
        >
          <BookOpen size={18} color={t.textSecondary} strokeWidth={2} />
          <Text style={[styles.navBtnText, { color: t.text }]}>Vocabulary Book</Text>
          <ChevronRight size={16} color={t.textMuted} strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: t.surface, borderColor: t.border }]}
          onPress={handleSettings}
          activeOpacity={0.8}
        >
          <Settings size={18} color={t.textSecondary} strokeWidth={2} />
          <Text style={[styles.navBtnText, { color: t.text }]}>Settings</Text>
          <ChevronRight size={16} color={t.textMuted} strokeWidth={2} />
        </TouchableOpacity>

        {/* XP Progress */}
        <View style={[styles.card, { backgroundColor: t.surface }]}>
          <View style={styles.xpHeader}>
            <Text style={[styles.cardTitle, { color: t.text }]}>XP Progress</Text>
            <Text style={[styles.xpTotal, { color: modeColor }]}>{data?.xp ?? 0} XP</Text>
          </View>
          <View style={[styles.xpBarBg, { backgroundColor: t.surfaceAlt }]}>
            <View style={[styles.xpBarFill, { width: `${Math.min(xpProgress * 100, 100)}%` as any, backgroundColor: modeColor }]} />
          </View>
          <Text style={[styles.xpSub, { color: t.textMuted }]}>
            {(xpForNext - (data?.xp ?? 0))} XP to Level {(data?.level ?? 1) + 1}
          </Text>
        </View>

        {/* Stats Grid */}
        <Text style={[styles.sectionTitle, { color: t.text }]}>Stats</Text>
        <View style={styles.statsGrid}>
          {statItems.map(({ icon, num, label }) => (
            <View key={label} style={[styles.statCard, { backgroundColor: t.surface }]}>
              {icon}
              <Text style={[styles.statNum, { color: t.text }]}>{num}</Text>
              <Text style={[styles.statLabel, { color: t.textMuted }]}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Badges */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: t.text }]}>Badges</Text>
          <Text style={[styles.badgeCount, { color: t.textMuted }]}>{earnedCount}/{totalBadges}</Text>
        </View>

        {badges.isLoading ? (
          <ActivityIndicator color={modeColor} style={{ marginVertical: 20 }} />
        ) : (
          <BadgeGrid badges={badges.data?.badges ?? []} t={t} />
        )}

        {/* Danger Zone */}
        <Text style={[styles.sectionTitle, { color: t.text, marginTop: 8 }]}>Danger Zone</Text>
        <TouchableOpacity
          style={[styles.dangerBtn, { borderColor: "#FF9500" }]}
          onPress={handleResetVocabulary}
          activeOpacity={0.8}
        >
          <Trash2 size={16} color="#FF9500" strokeWidth={2} style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.dangerBtnText, { color: "#FF9500" }]}>Reset Vocabulary</Text>
            <Text style={[styles.dangerBtnSub, { color: t.textMuted }]}>Delete all words & flashcards</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dangerBtn, { borderColor: "#FF4B4B" }]}
          onPress={handleResetProfile}
          activeOpacity={0.8}
        >
          <RefreshCw size={16} color="#FF4B4B" strokeWidth={2} style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.dangerBtnText, { color: "#FF4B4B" }]}>Reset Profile Stats</Text>
            <Text style={[styles.dangerBtnSub, { color: t.textMuted }]}>Reset XP, streak, badges to zero</Text>
          </View>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: t.danger }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={16} color={t.danger} strokeWidth={2} style={{ marginRight: 8 }} />
          <Text style={[styles.logoutBtnText, { color: t.danger }]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: "900" },
  container: { padding: 16, paddingBottom: 40 },

  profileHeader: { alignItems: "center", marginBottom: 20, paddingTop: 8 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: "center", justifyContent: "center",
    marginBottom: 12, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  avatarText: { fontSize: 36, fontWeight: "800", color: "#fff" },
  userName: { fontSize: 22, fontWeight: "800", marginBottom: 2 },
  userEmail: { fontSize: 14, marginBottom: 10 },
  levelBadge: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  levelBadgeText: { fontWeight: "800", fontSize: 13 },

  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  navBtnText: { flex: 1, fontSize: 15, fontWeight: "600" },

  card: {
    borderRadius: 16, padding: 16, marginBottom: 20,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06,
    shadowRadius: 6, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: "800" },
  xpHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  xpTotal: { fontSize: 16, fontWeight: "800" },
  xpBarBg: { height: 10, borderRadius: 5, overflow: "hidden", marginBottom: 6 },
  xpBarFill: { height: "100%", borderRadius: 5 },
  xpSub: { fontSize: 12 },

  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "900", marginBottom: 12 },
  badgeCount: { fontSize: 13, fontWeight: "600" },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, minWidth: "45%", borderRadius: 16, padding: 14,
    alignItems: "center", gap: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  statNum: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, fontWeight: "600", textAlign: "center" },

  badgeCategorySection: { marginBottom: 16 },
  badgeCategoryLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8, marginLeft: 2 },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badgeItem: {
    width: "30%", borderRadius: 14, padding: 10, alignItems: "center",
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
    position: "relative",
  },
  tierChip: {
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1,
    marginTop: 5, marginBottom: 3,
  },
  tierChipText: { fontSize: 8, fontWeight: "800", letterSpacing: 0.5 },
  badgeIcon: { fontSize: 26, marginBottom: 5 },
  badgeName: { fontSize: 10, fontWeight: "700", textAlign: "center", marginBottom: 2 },
  badgeDesc: { fontSize: 9, textAlign: "center" },
  lockOverlay: {
    position: "absolute", top: 6, right: 6,
    backgroundColor: "rgba(0,0,0,0.1)", borderRadius: 8,
    padding: 3,
  },

  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1.5, backgroundColor: "transparent",
  },
  dangerBtnText: { fontWeight: "700", fontSize: 14, marginBottom: 2 },
  dangerBtnSub: { fontSize: 12 },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14, paddingVertical: 14,
    borderWidth: 1.5, marginTop: 8, gap: 8,
  },
  logoutBtnText: { fontWeight: "700", fontSize: 15 },
});
