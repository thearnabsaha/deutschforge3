import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, CheckCircle2, Plus, Volume2 } from "lucide-react-native";
import * as Speech from "expo-speech";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../lib/theme";
import { Storage } from "../lib/storage";
import { api } from "../lib/api";
import {
  BOOK_SECTIONS,
  BOOK_ADDED_SETS_KEY,
  type BookProgress,
  type BookWord,
} from "../lib/vocabBook";
import { type CustomSet } from "./(tabs)/study";

const CUSTOM_SETS_KEY = "custom_sets_v1";

async function loadCustomSets(): Promise<CustomSet[]> {
  try { const r = await Storage.getItem(CUSTOM_SETS_KEY); return r ? JSON.parse(r) : []; }
  catch { return []; }
}
async function saveCustomSets(sets: CustomSet[]) {
  await Storage.setItem(CUSTOM_SETS_KEY, JSON.stringify(sets));
}

// ─── Word row ──────────────────────────────────────────────────────────────────

const WordRow = React.memo(function WordRow({ word, theme: t }: { word: BookWord; theme: any }) {
  const speak = () => {
    const bare = word.german.replace(/^(der|die|das|den|dem|des)\s/i, "");
    Speech.stop();
    Speech.speak(bare, { language: "de-DE", rate: 0.85 });
  };

  return (
    <View style={[rowS.row, { backgroundColor: t.surface, borderColor: t.border }]}>
      <View style={rowS.left}>
        <Text style={[rowS.german, { color: t.text }]}>{word.german}</Text>
        <Text style={[rowS.english, { color: t.textMuted }]}>{word.english}</Text>
      </View>
      <TouchableOpacity onPress={speak} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Volume2 size={16} color={t.textMuted} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
});

const rowS = StyleSheet.create({
  row: {
    marginHorizontal: 16, marginBottom: 6,
    borderRadius: 12, borderWidth: 1.5,
    padding: 12, flexDirection: "row", alignItems: "center",
  },
  left: { flex: 1, gap: 2 },
  german: { fontSize: 16, fontWeight: "800" },
  english: { fontSize: 13, fontWeight: "600" },
});

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function BookSectionScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ sectionId: string }>();

  const section = useMemo(
    () => BOOK_SECTIONS.find((s) => s.id === params.sectionId),
    [params.sectionId],
  );

  const [addedSets, setAddedSets] = useState<BookProgress>({});
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    Storage.getItem(BOOK_ADDED_SETS_KEY)
      .then((raw) => setAddedSets(raw ? JSON.parse(raw) : {}))
      .catch(() => {})
      .finally(() => setInitLoading(false));
  }, []);

  if (!section) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: t.background }]} edges={["top"]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 16 }}>
          <ChevronLeft size={24} color={t.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.centered}>
          <Text style={[styles.emptyTxt, { color: t.textMuted }]}>Section not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const alreadyAdded = !!addedSets[section.id];

  const handleAddToSets = async () => {
    if (alreadyAdded) return;
    setLoading(true);
    try {
      const wordList = section.words.map((w) => w.german).join(", ");
      const res = await api.words.add.$post({ json: { words: wordList } });
      const data = await res.json() as any;
      queryClient.invalidateQueries({ queryKey: ["words"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["review"] });

      const addedWords: any[] = data.added ?? [];
      const skippedWords: string[] = data.skipped ?? [];

      let allIds: string[] = addedWords.map((w: any) => w.id).filter(Boolean);

      if (skippedWords.length > 0) {
        try {
          const wordsRes = await api.words.$get();
          const wordsData = await wordsRes.json() as any;
          const library: any[] = wordsData.words ?? [];
          const stripArt = (s: string) =>
            s.replace(/^(der|die|das|den|dem|des)\s+/i, "").trim().toLowerCase();
          const skippedLower = new Set(skippedWords.map(stripArt));
          const skippedIds = library
            .filter((w: any) => skippedLower.has((w.german ?? "").toLowerCase()))
            .map((w: any) => w.id)
            .filter(Boolean);
          allIds = [...allIds, ...skippedIds];
        } catch {
          // proceed with just newly added IDs
        }
      }

      const newSet: CustomSet = {
        id: `book-${section.id}-${Date.now()}`,
        name: section.name,
        wordIds: allIds,
        createdAt: Date.now(),
      };

      const existingSets = await loadCustomSets();
      await saveCustomSets([...existingSets, newSet]);

      const updated = { ...addedSets, [section.id]: true };
      setAddedSets(updated);
      await Storage.setItem(BOOK_ADDED_SETS_KEY, JSON.stringify(updated));

      Alert.alert(
        "Added!",
        `"${section.name}" has been added to your sets with ${allIds.length} words.`,
        [{ text: "OK" }],
      );
    } catch (e) {
      Alert.alert("Error", "Failed to add section to your sets. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: BookWord }) => <WordRow word={item} theme={t} />,
    [t],
  );
  const keyExtractor = useCallback((_: BookWord, i: number) => String(i), []);

  const Header = (
    <View>
      <View style={[styles.infoCard, { backgroundColor: t.surface, borderColor: t.border }]}>
        <View style={styles.infoRow}>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: t.text }]}>{section.words.length}</Text>
            <Text style={[styles.statLabel, { color: t.textMuted }]}>Words</Text>
          </View>
          <View style={[styles.statDiv, { backgroundColor: t.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: t.primary }]}>A1/A2</Text>
            <Text style={[styles.statLabel, { color: t.textMuted }]}>Level</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.addBtn,
            {
              backgroundColor: alreadyAdded
                ? "#58CC02"
                : loading
                ? t.border
                : t.primary,
            },
          ]}
          onPress={handleAddToSets}
          disabled={alreadyAdded || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : alreadyAdded ? (
            <CheckCircle2 size={18} color="#fff" strokeWidth={2.5} />
          ) : (
            <Plus size={18} color="#fff" strokeWidth={2.5} />
          )}
          <Text style={styles.addBtnTxt}>
            {loading
              ? "Adding…"
              : alreadyAdded
              ? "Added to My Sets"
              : "Add This Set to My Sets"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.listLabel, { color: t.textMuted }]}>WORDS & MEANINGS</Text>
    </View>
  );

  if (initLoading) {
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
      <View style={[styles.topBar, { borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={t.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={[styles.topTitle, { color: t.text }]} numberOfLines={1}>{section.name}</Text>
          <Text style={[styles.topSub, { color: t.textMuted }]}>Section {section.number} of 28</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={section.words}
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
  topTitle: { fontSize: 17, fontWeight: "800" },
  topSub: { fontSize: 12, fontWeight: "600", marginTop: 1 },

  list: { paddingBottom: 48 },

  infoCard: {
    margin: 16, marginBottom: 8,
    borderRadius: 18, borderWidth: 1.5,
    padding: 16, gap: 14,
  },
  infoRow: { flexDirection: "row", alignItems: "center" },
  stat: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 24, fontWeight: "900" },
  statLabel: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  statDiv: { width: 1, height: 36 },

  addBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 14, paddingVertical: 14,
  },
  addBtnTxt: { color: "#fff", fontSize: 15, fontWeight: "800" },

  listLabel: {
    fontSize: 11, fontWeight: "800", letterSpacing: 1.1,
    paddingHorizontal: 20, marginBottom: 8, marginTop: 8,
  },
  emptyTxt: { fontSize: 16, fontWeight: "600" },
});
