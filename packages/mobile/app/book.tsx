import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle2 } from "lucide-react-native";
import { useTheme } from "../lib/theme";
import { Storage } from "../lib/storage";
import { BOOK_SECTIONS, BOOK_ADDED_SETS_KEY, type BookProgress } from "../lib/vocabBook";

const SECTION_COLORS = [
  "#FF4B4B", "#FF9F1C", "#FFC800", "#58CC02", "#1CB0F6", "#CE82FF",
  "#FF4B4B", "#FF9F1C", "#FFC800", "#58CC02", "#1CB0F6", "#CE82FF",
  "#FF4B4B", "#FF9F1C", "#FFC800", "#58CC02", "#1CB0F6", "#CE82FF",
  "#FF4B4B", "#FF9F1C", "#FFC800", "#58CC02", "#1CB0F6", "#CE82FF",
  "#FF4B4B", "#FF9F1C", "#FFC800", "#58CC02",
];

export default function BookScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const [addedSets, setAddedSets] = useState<BookProgress>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Storage.getItem(BOOK_ADDED_SETS_KEY)
      .then((raw) => setAddedSets(raw ? JSON.parse(raw) : {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addedCount = Object.values(addedSets).filter(Boolean).length;
  const totalSections = BOOK_SECTIONS.length;
  const bookProgress = addedCount / totalSections;

  const openSection = useCallback((sectionId: string) => {
    router.push({ pathname: "/book-section" as any, params: { sectionId } });
  }, [router]);

  const renderItem = useCallback(({ item, index }: { item: typeof BOOK_SECTIONS[0]; index: number }) => {
    const color = SECTION_COLORS[index % SECTION_COLORS.length];
    const added = !!addedSets[item.id];
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: t.surface, borderColor: added ? color + "80" : t.border }]}
        onPress={() => openSection(item.id)}
        activeOpacity={0.85}
      >
        <View style={[styles.numBadge, { backgroundColor: color + "22" }]}>
          <Text style={[styles.numTxt, { color }]}>{item.number}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: t.text }]}>{item.name}</Text>
          <Text style={[styles.cardCount, { color: t.textMuted }]}>{item.words.length} words</Text>
        </View>
        {added ? (
          <CheckCircle2 size={20} color={color} strokeWidth={2.5} />
        ) : (
          <ChevronRight size={18} color={t.textMuted} strokeWidth={2} />
        )}
      </TouchableOpacity>
    );
  }, [addedSets, t, openSection]);

  const keyExtractor = useCallback((item: typeof BOOK_SECTIONS[0]) => item.id, []);

  const Header = (
    <View>
      {/* Book progress */}
      <View style={[styles.progressCard, { backgroundColor: t.surface, borderColor: t.border }]}>
        <View style={styles.progressHeader}>
          <View style={styles.progressLeft}>
            <BookOpen size={20} color={t.primary} strokeWidth={2.5} />
            <Text style={[styles.progressTitle, { color: t.text }]}>Book Progress</Text>
          </View>
          <Text style={[styles.progressPct, { color: t.primary }]}>
            {Math.round(bookProgress * 100)}%
          </Text>
        </View>
        <View style={[styles.barBg, { backgroundColor: t.border }]}>
          <View style={[styles.barFill, { width: `${bookProgress * 100}%` as any, backgroundColor: t.primary }]} />
        </View>
        <Text style={[styles.progressSub, { color: t.textMuted }]}>
          {addedCount} of {totalSections} sections added to your sets
        </Text>
      </View>

      <Text style={[styles.sectionLabel, { color: t.textMuted }]}>ALL SECTIONS</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: t.background }]} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={t.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.background }]} edges={["top"]}>
      {/* Top bar */}
      <View style={[styles.topBar, { borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={t.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={[styles.topTitle, { color: t.text }]}>Vocabulary Book</Text>
          <Text style={[styles.topSub, { color: t.textMuted }]}>28 sections · A1/A2</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={BOOK_SECTIONS}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={Header}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },

  topBar: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topCenter: { flex: 1, alignItems: "center" },
  topTitle: { fontSize: 22, fontWeight: "900" },
  topSub: { fontSize: 12, fontWeight: "600", marginTop: 1 },

  list: { paddingBottom: 48 },

  progressCard: {
    margin: 16, marginBottom: 8,
    borderRadius: 18, borderWidth: 1.5,
    padding: 16, gap: 10,
  },
  progressHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  progressLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  progressTitle: { fontSize: 16, fontWeight: "800" },
  progressPct: { fontSize: 22, fontWeight: "900" },
  barBg: { height: 10, borderRadius: 5, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 5 },
  progressSub: { fontSize: 12, fontWeight: "600" },

  sectionLabel: {
    fontSize: 11, fontWeight: "800", letterSpacing: 1.1,
    paddingHorizontal: 20, marginBottom: 8, marginTop: 8,
  },

  card: {
    marginHorizontal: 16, marginBottom: 8,
    borderRadius: 16, borderWidth: 1.5,
    padding: 14, flexDirection: "row", alignItems: "center", gap: 12,
  },
  numBadge: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  numTxt: { fontSize: 14, fontWeight: "900" },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: "800" },
  cardCount: { fontSize: 12, fontWeight: "600", marginTop: 2 },
});
