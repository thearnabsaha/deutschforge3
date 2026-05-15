import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../../../lib/theme";
import { SECTION_META, LEVEL_META } from "../../../lib/goetheExamData";
import type { Section, Level } from "../../../lib/goetheExamData";

const SECTIONS: Section[] = ["hoeren", "lesen", "schreiben", "sprechen"];

const SECTION_DETAILS: Record<Section, { duration: Record<Level, string>; parts: Record<Level, string> }> = {
  hoeren: {
    duration: { A1: "20 min", A2: "30 min", B1: "40 min" },
    parts: { A1: "3 parts", A2: "3 parts", B1: "4 parts" },
  },
  lesen: {
    duration: { A1: "25 min", A2: "25 min", B1: "65 min" },
    parts: { A1: "3 parts", A2: "3 parts", B1: "5 parts" },
  },
  schreiben: {
    duration: { A1: "20 min", A2: "30 min", B1: "60 min" },
    parts: { A1: "2 tasks", A2: "2 tasks", B1: "2 tasks" },
  },
  sprechen: {
    duration: { A1: "15 min", A2: "15 min", B1: "15 min" },
    parts: { A1: "3 parts", A2: "3 parts", B1: "3 parts" },
  },
};

export default function GoetheExamSectionScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const { level } = useLocalSearchParams<{ level: string }>();
  const lvl = (level as Level) || "A1";
  const levelMeta = LEVEL_META[lvl];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }}>
      <StatusBar barStyle={t.dark ? "light-content" : "dark-content"} backgroundColor={t.background} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={[styles.backText, { color: t.primary }]}>‹ Levels</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.levelBadge, { backgroundColor: levelMeta.color }]}>
            <Text style={styles.levelBadgeText}>{lvl}</Text>
          </View>
          <Text style={[styles.title, { color: t.text }]}>{levelMeta.label}</Text>
          <Text style={[styles.subtitle, { color: t.textSecondary }]}>
            {levelMeta.description} · Pass: {levelMeta.passScore}/100
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: t.textMuted }]}>CHOOSE A SECTION</Text>

        {SECTIONS.map((sec) => {
          const meta = SECTION_META[sec];
          const details = SECTION_DETAILS[sec];
          return (
            <TouchableOpacity
              key={sec}
              style={[styles.sectionCard, { backgroundColor: t.surface, borderColor: t.border }]}
              onPress={() => router.push(`/goethe-exam/${lvl}/${sec}` as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, { backgroundColor: meta.color + "20" }]}>
                <Text style={styles.icon}>{meta.icon}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, { color: t.text }]}>{meta.label}</Text>
                <Text style={[styles.cardDesc, { color: t.textSecondary }]}>{meta.description}</Text>
                <View style={styles.chips}>
                  <View style={[styles.chip, { backgroundColor: meta.color + "20" }]}>
                    <Text style={[styles.chipText, { color: meta.color }]}>⏱ {details.duration[lvl]}</Text>
                  </View>
                  <View style={[styles.chip, { backgroundColor: meta.color + "20" }]}>
                    <Text style={[styles.chipText, { color: meta.color }]}>📋 {details.parts[lvl]}</Text>
                  </View>
                  <View style={[styles.chip, { backgroundColor: meta.color + "20" }]}>
                    <Text style={[styles.chipText, { color: meta.color }]}>30 exams</Text>
                  </View>
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
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 16, fontWeight: "600" },
  header: { alignItems: "center", marginBottom: 28 },
  levelBadge: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  levelBadgeText: { color: "#fff", fontSize: 22, fontWeight: "800" },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 14, textAlign: "center" },
  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 12 },
  sectionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 14,
  },
  iconBox: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 26 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: "700", marginBottom: 2 },
  cardDesc: { fontSize: 13, marginBottom: 8 },
  chips: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  chipText: { fontSize: 11, fontWeight: "600" },
});
