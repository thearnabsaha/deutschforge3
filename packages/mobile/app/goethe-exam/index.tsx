import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../lib/theme";
import { LEVEL_META } from "../../lib/goetheExamData";
import type { Level } from "../../lib/goetheExamData";

const LEVELS: Level[] = ["A1", "A2", "B1"];

export default function GoetheExamLevelScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }}>
      <StatusBar
        barStyle={t.dark ? "light-content" : "dark-content"}
        backgroundColor={t.background}
      />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerEmoji]}>🎓</Text>
          <Text style={[styles.title, { color: t.text }]}>Goethe Mock Exams</Text>
          <Text style={[styles.subtitle, { color: t.textSecondary }]}>
            30 original mock exams per section, faithful to the official Goethe-Zertifikat format
          </Text>
        </View>

        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
          <Text style={[styles.infoTitle, { color: t.text }]}>Exam Structure</Text>
          <Text style={[styles.infoText, { color: t.textSecondary }]}>
            Each level has 4 sections: Hören · Lesen · Schreiben · Sprechen{"\n"}
            Each section: 30 mock exams · Pass score: 60/100
          </Text>
        </View>

        {/* Level Cards */}
        <Text style={[styles.sectionLabel, { color: t.textMuted }]}>CHOOSE YOUR LEVEL</Text>
        {LEVELS.map((level) => {
          const meta = LEVEL_META[level];
          return (
            <TouchableOpacity
              key={level}
              style={[
                styles.levelCard,
                { backgroundColor: t.surface, borderColor: t.border },
              ]}
              onPress={() => router.push(`/goethe-exam/${level}` as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.levelBadge, { backgroundColor: meta.color }]}>
                <Text style={styles.levelBadgeText}>{level}</Text>
              </View>
              <View style={styles.levelInfo}>
                <Text style={[styles.levelTitle, { color: t.text }]}>{meta.label}</Text>
                <Text style={[styles.levelDesc, { color: t.textSecondary }]}>
                  {meta.description}
                </Text>
                <View style={styles.levelStats}>
                  <Text style={[styles.statChip, { backgroundColor: t.surfaceAlt, color: t.textMuted }]}>
                    4 sections
                  </Text>
                  <Text style={[styles.statChip, { backgroundColor: t.surfaceAlt, color: t.textMuted }]}>
                    30 exams each
                  </Text>
                  <Text style={[styles.statChip, { backgroundColor: t.surfaceAlt, color: t.textMuted }]}>
                    Pass: 60pts
                  </Text>
                </View>
              </View>
              <Text style={{ color: t.textMuted, fontSize: 20 }}>›</Text>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { alignItems: "center", marginBottom: 24, paddingTop: 8 },
  headerEmoji: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5, textAlign: "center" },
  subtitle: { fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 20, paddingHorizontal: 16 },
  infoBanner: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: { fontSize: 14, fontWeight: "700", marginBottom: 6 },
  infoText: { fontSize: 13, lineHeight: 20 },
  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 12 },
  levelCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 14,
  },
  levelBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  levelBadgeText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  levelInfo: { flex: 1 },
  levelTitle: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  levelDesc: { fontSize: 13, marginBottom: 8 },
  levelStats: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  statChip: { fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, fontWeight: "600" },
});
