import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Volume2 } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import * as Speech from "expo-speech";
import { api } from "../../lib/api";
import { useTheme } from "../../lib/theme";
import type { StudyWord } from "../(tabs)/study";

const POS_COLORS: Record<string, string> = {
  noun: "#CE82FF", verb: "#1CB0F6", adjective: "#FFC800",
  adverb: "#58CC02", pronoun: "#FF9F1C", preposition: "#FF4B4B",
  conjunction: "#888", article: "#888", unknown: "#aaa",
};
const GENDER_COLORS: Record<string, string> = {
  masculine: "#1CB0F6", feminine: "#FF4B4B", neutral: "#888",
};
const CEFR_COLORS: Record<string, string> = {
  A1: "#58CC02", A2: "#45A800", B1: "#1CB0F6", B2: "#0082B9", C1: "#CE82FF", C2: "#9B3FCF",
};

// ─── Word row ──────────────────────────────────────────────────────────────────

const WordRow = React.memo(function WordRow({ word, theme: t }: { word: StudyWord; theme: any }) {
  const posColor = POS_COLORS[word.partOfSpeech] ?? "#aaa";
  const cefrColor = word.cefrLevel ? CEFR_COLORS[word.cefrLevel] ?? "#888" : null;
  const genderColor = word.genderCategory ? GENDER_COLORS[word.genderCategory] ?? "#888" : null;
  const display = word.displayGerman ?? word.german;

  const speak = () => { Speech.stop(); Speech.speak(display, { language: "de-DE", rate: 0.85 }); };

  return (
    <View style={[rowS.row, { backgroundColor: t.surface, borderColor: t.border }]}>
      <View style={rowS.left}>
        <View style={rowS.topLine}>
          <Text style={[rowS.german, { color: t.text }]}>{display}</Text>
          <TouchableOpacity onPress={speak} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Volume2 size={14} color={t.textMuted} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <Text style={[rowS.english, { color: t.textMuted }]}>{word.english}</Text>
        {word.ipa && <Text style={[rowS.ipa, { color: t.textMuted }]}>/{word.ipa}/</Text>}
        {word.exampleSentence && (
          <Text style={[rowS.example, { color: t.textMuted }]} numberOfLines={2}>
            {word.exampleSentence}
          </Text>
        )}
        <View style={rowS.chips}>
          <View style={[rowS.chip, { backgroundColor: posColor + "20", borderColor: posColor }]}>
            <Text style={[rowS.chipTxt, { color: posColor }]}>{word.partOfSpeech}</Text>
          </View>
          {cefrColor && word.cefrLevel && (
            <View style={[rowS.chip, { backgroundColor: cefrColor + "20", borderColor: cefrColor }]}>
              <Text style={[rowS.chipTxt, { color: cefrColor }]}>{word.cefrLevel}</Text>
            </View>
          )}
          {genderColor && word.genderCategory && (
            <View style={[rowS.chip, { backgroundColor: genderColor + "20", borderColor: genderColor }]}>
              <Text style={[rowS.chipTxt, { color: genderColor }]}>{word.genderCategory}</Text>
            </View>
          )}
          {word.gender && (
            <View style={[rowS.chip, { backgroundColor: "#88888820", borderColor: "#888" }]}>
              <Text style={[rowS.chipTxt, { color: "#888" }]}>{word.gender}</Text>
            </View>
          )}
          {(word.reps ?? 0) > 0 && (
            <View style={[rowS.chip, { backgroundColor: "#58CC0220", borderColor: "#58CC02" }]}>
              <Text style={[rowS.chipTxt, { color: "#58CC02" }]}>practiced</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
});

const rowS = StyleSheet.create({
  row: { marginHorizontal: 16, marginBottom: 8, borderRadius: 14, borderWidth: 1.5, padding: 12 },
  left: { flex: 1, gap: 3 },
  topLine: { flexDirection: "row", alignItems: "center", gap: 6 },
  german: { fontSize: 17, fontWeight: "800", flex: 1 },
  english: { fontSize: 13, fontWeight: "600" },
  ipa: { fontSize: 12, fontStyle: "italic" },
  example: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 4 },
  chip: { borderWidth: 1.5, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  chipTxt: { fontSize: 10, fontWeight: "700", textTransform: "capitalize" },
});

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function WordListScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{
    id: string; name: string; words: string; allWords: string;
  }>();

  const setWords: StudyWord[] = useMemo(() => {
    try { return JSON.parse(params.words ?? "[]"); } catch { return []; }
  }, [params.words]);

  const [localWords, setLocalWords] = useState<StudyWord[]>(setWords);
  useEffect(() => { setLocalWords(setWords); }, [params.words]);

  const [wordInput, setWordInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ added: number; skipped: number } | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleAddWords = async () => {
    const trimmed = wordInput.trim();
    if (!trimmed) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.words.add.$post({ json: { words: trimmed } });
      const data = await res.json() as any;
      queryClient.invalidateQueries({ queryKey: ["words"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["review"] });
      const added: StudyWord[] = (data.added ?? []) as StudyWord[];
      if (added.length > 0) setLocalWords((prev) => [...prev, ...added]);
      setResult({ added: added.length, skipped: data.skipped?.length ?? 0 });
      setWordInput("");
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(2500),
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    } catch {
      Alert.alert("Error", "Failed to add words");
    } finally {
      setLoading(false);
    }
  };

  const practiced = localWords.filter((w) => (w.reps ?? 0) > 0).length;
  const renderItem = useCallback(({ item }: { item: StudyWord }) => <WordRow word={item} theme={t} />, [t]);
  const keyExtractor = useCallback((item: StudyWord) => item.id, []);

  const Header = (
    <View>
      {/* Add words */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={[styles.addSection, { backgroundColor: t.surface, borderColor: t.border }]}>
          <TextInput
            style={[styles.addWordInput, { color: t.text }]}
            placeholder={'Add more words:\n"Hund, laufen, schön"'}
            placeholderTextColor={t.textMuted}
            value={wordInput}
            onChangeText={setWordInput}
            multiline
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.addWordBtn, { backgroundColor: loading || !wordInput.trim() ? t.border : t.primary }]}
            onPress={handleAddWords}
            disabled={loading || !wordInput.trim()}
            activeOpacity={0.8}
          >
            {loading && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 6 }} />}
            <Text style={[styles.addWordBtnTxt, { color: loading || !wordInput.trim() ? t.textMuted : "#fff" }]}>
              {loading ? "Adding…" : "Add Words to Library"}
            </Text>
          </TouchableOpacity>
          {result && (
            <Animated.View style={[styles.resultRow, { opacity: fadeAnim }]}>
              <Text style={styles.resultAdded}>+{result.added} added</Text>
              {result.skipped > 0 && <Text style={styles.resultSkipped}>{result.skipped} skipped</Text>}
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Stats */}
      <View style={[styles.statsRow, { borderColor: t.border }]}>
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: t.text }]}>{localWords.length}</Text>
          <Text style={[styles.statLabel, { color: t.textMuted }]}>Words</Text>
        </View>
        <View style={[styles.statDiv, { backgroundColor: t.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: "#58CC02" }]}>{practiced}</Text>
          <Text style={[styles.statLabel, { color: t.textMuted }]}>Practiced</Text>
        </View>
        <View style={[styles.statDiv, { backgroundColor: t.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: t.textMuted }]}>{localWords.length - practiced}</Text>
          <Text style={[styles.statLabel, { color: t.textMuted }]}>New</Text>
        </View>
      </View>

      {localWords.length > 0 && (
        <Text style={[styles.listLabel, { color: t.textMuted }]}>WORD LIST</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.background }]} edges={["top"]}>
      {/* Top bar */}
      <View style={[styles.topBar, { borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={t.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={[styles.topTitle, { color: t.text }]} numberOfLines={1}>{params.name}</Text>
          <Text style={[styles.topSub, { color: t.textMuted }]}>{localWords.length} words</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={localWords}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={Header}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTxt, { color: t.textMuted }]}>No words yet. Add some above!</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
      />
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

  list: { paddingBottom: 48 },

  addSection: {
    marginHorizontal: 16, marginTop: 16, marginBottom: 6,
    borderRadius: 16, borderWidth: 1.5,
    padding: 14, gap: 10,
  },
  addWordInput: { fontSize: 15, minHeight: 60, textAlignVertical: "top" },
  addWordBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderRadius: 12, paddingVertical: 12,
  },
  addWordBtnTxt: { fontSize: 15, fontWeight: "800" },

  resultRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  resultAdded: { fontSize: 13, fontWeight: "700", color: "#58CC02" },
  resultSkipped: { fontSize: 12, fontWeight: "600", color: "#999" },

  statsRow: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 16, marginBottom: 16, marginTop: 8,
    borderWidth: 1.5, borderRadius: 14, padding: 14,
  },
  stat: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 22, fontWeight: "900" },
  statLabel: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  statDiv: { width: 1, height: 32 },

  listLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1, paddingHorizontal: 20, marginBottom: 8 },
  emptyState: { alignItems: "center", paddingTop: 24, paddingHorizontal: 32 },
  emptyTxt: { fontSize: 15, fontWeight: "600", textAlign: "center" },
});
