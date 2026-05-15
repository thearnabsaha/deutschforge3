import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  BookOpen, Tag, AlignLeft, Mic, Shuffle, Trophy, List,
} from "lucide-react-native";
import { useTheme } from "../../lib/theme";
import type { StudyWord } from "../(tabs)/study";

const MODES = [
  { key: "flashcard", label: "Word Rep",   icon: BookOpen, color: "#58CC02", route: "/study/flashcard" },
  { key: "article",   label: "Articles",   icon: Tag,      color: "#1CB0F6", route: "/study/article"   },
  { key: "meaning",   label: "Meaning",    icon: AlignLeft,color: "#CE82FF", route: "/study/meaning"   },
  { key: "speaking",  label: "Speaking",   icon: Mic,      color: "#FF9500", route: "/study/speaking"  },
  { key: "mixed",     label: "Mixed",      icon: Shuffle,  color: "#FFC800", route: "/study/mixed"     },
  { key: "exam",      label: "Final Exam", icon: Trophy,   color: "#FF4B4B", route: "/study/exam"      },
] as const;

export default function SetDetailScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string; name: string; words: string; allWords: string;
  }>();

  const words: StudyWord[] = useMemo(() => {
    try { return JSON.parse(params.words ?? "[]"); } catch { return []; }
  }, [params.words]);

  const practiced = words.filter((w) => (w.reps ?? 0) > 0).length;

  const openMode = (route: string) => {
    router.push({
      pathname: route as any,
      params: {
        setId: params.id,
        setName: params.name,
        words: params.words,
        allWords: params.allWords,
      },
    });
  };

  const openWordList = () => {
    router.push({
      pathname: "/study/wordlist" as any,
      params: {
        id: params.id,
        name: params.name,
        words: params.words,
        allWords: params.allWords,
      },
    });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.background }]} edges={["top"]}>
      {/* Top bar */}
      <View style={[styles.topBar, { borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={t.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={[styles.topTitle, { color: t.text }]} numberOfLines={1}>{params.name}</Text>
          <Text style={[styles.topSub, { color: t.textMuted }]}>{words.length} words</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Stats strip */}
        <View style={[styles.statsRow, { borderColor: t.border }]}>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: t.text }]}>{words.length}</Text>
            <Text style={[styles.statLabel, { color: t.textMuted }]}>Words</Text>
          </View>
          <View style={[styles.statDiv, { backgroundColor: t.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: "#58CC02" }]}>{practiced}</Text>
            <Text style={[styles.statLabel, { color: t.textMuted }]}>Practiced</Text>
          </View>
          <View style={[styles.statDiv, { backgroundColor: t.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: t.textMuted }]}>{words.length - practiced}</Text>
            <Text style={[styles.statLabel, { color: t.textMuted }]}>New</Text>
          </View>
        </View>

        {/* Section label */}
        <Text style={[styles.sectionLabel, { color: t.textMuted }]}>CHOOSE A MODE</Text>

        {/* Mode grid */}
        <View style={styles.grid}>
          {MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <TouchableOpacity
                key={mode.key}
                style={[styles.modeCard, { backgroundColor: t.surface, borderColor: mode.color + "60" }]}
                onPress={() => openMode(mode.route)}
                activeOpacity={0.75}
              >
                <View style={[styles.modeIcon, { backgroundColor: mode.color + "20" }]}>
                  <Icon size={26} color={mode.color} strokeWidth={2.5} />
                </View>
                <Text style={[styles.modeLabel, { color: t.text }]}>{mode.label}</Text>
              </TouchableOpacity>
            );
          })}

          {/* Word List */}
          <TouchableOpacity
            style={[styles.modeCard, { backgroundColor: t.surface, borderColor: t.primary + "60" }]}
            onPress={openWordList}
            activeOpacity={0.75}
          >
            <View style={[styles.modeIcon, { backgroundColor: t.primary + "20" }]}>
              <List size={26} color={t.primary} strokeWidth={2.5} />
            </View>
            <Text style={[styles.modeLabel, { color: t.text }]}>Word List</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  topBar: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topCenter: { flex: 1, alignItems: "center" },
  topTitle: { fontSize: 17, fontWeight: "800" },
  topSub: { fontSize: 12, fontWeight: "600", marginTop: 1 },

  scroll: { paddingBottom: 48 },

  statsRow: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 16, marginTop: 20, marginBottom: 24,
    borderWidth: 1.5, borderRadius: 16, padding: 16,
  },
  stat: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 26, fontWeight: "900" },
  statLabel: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  statDiv: { width: 1, height: 36 },

  sectionLabel: {
    fontSize: 11, fontWeight: "800", letterSpacing: 1.1,
    paddingHorizontal: 20, marginBottom: 12,
  },

  grid: {
    flexDirection: "row", flexWrap: "wrap",
    paddingHorizontal: 12, gap: 10,
  },
  modeCard: {
    width: "46%",
    borderRadius: 18, borderWidth: 1.5,
    padding: 18, alignItems: "center", gap: 10,
    marginLeft: "2%",
  },
  modeIcon: {
    width: 52, height: 52, borderRadius: 15,
    alignItems: "center", justifyContent: "center",
  },
  modeLabel: { fontSize: 14, fontWeight: "800", textAlign: "center" },
});
