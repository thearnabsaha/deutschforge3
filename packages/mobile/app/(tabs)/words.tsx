import React, { useState, useCallback, memo, useRef, useEffect, useMemo } from "react";
import GrammarScreen from "../grammar";
import LearnScreen from "../learn";
import { useAppMode } from "../../lib/appMode";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
  Dimensions,
} from "react-native";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api, baseUrl } from "../../lib/api";
import { authClient } from "../../lib/auth";
import {
  getWords,
  addWordOffline,
  deleteWordLocally,
} from "../../lib/offlineStore";
import { subscribeSyncState } from "../../lib/syncEngine";
import { speakGerman, stopSpeaking } from "../../lib/tts";
import { Volume2, X, Trash2, Inbox, Plus, Filter, Lightbulb, ChevronRight, GraduationCap, Library } from "lucide-react-native";
import { useTheme } from "../../lib/theme";
import { useShellTopBar } from "../../lib/AppShell";
import {
  loadProgress as loadSyllabusProgress,
  getLearnedWords,
  type SyllabusProgress,
} from "../../lib/syllabusProgress";

const { height: SCREEN_H } = Dimensions.get("window");

// ---------- constants ----------

const POS_FILTERS = ["all", "noun", "verb", "adjective", "adverb", "pronoun", "other"] as const;
const GENDER_FILTERS = ["all", "masculine", "feminine", "neutral"] as const;
const CEFR_FILTERS = ["all", "A1", "A2", "B1", "B2", "C1", "C2"] as const;
const DIFFICULTY_FILTERS = ["all", "easy", "hard", "new"] as const;
const PRACTICED_FILTERS = ["all", "practiced", "not_practiced"] as const;

const CEFR_COLORS: Record<string, string> = {
  A1: "#58CC02", A2: "#45A800",
  B1: "#1CB0F6", B2: "#0082B9",
  C1: "#CE82FF", C2: "#9B3FCF",
};

const GENDER_COLORS: Record<string, string> = {
  masculine: "#1CB0F6",
  feminine: "#FF4B4B",
  neutral: "#888",
};

const POS_COLORS: Record<string, string> = {
  noun: "#CE82FF", verb: "#1CB0F6", adjective: "#FFC800",
  adverb: "#58CC02", pronoun: "#FF9F1C", preposition: "#FF4B4B",
  conjunction: "#888", article: "#aaa", unknown: "#ccc",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#58CC02",
  hard: "#FF4B4B",
  new: "#FFC800",
};

const ITEM_HEIGHT = 120;
const POS_WITH_GENDER = new Set(["noun", "pronoun"]);

// ---------- TTS helpers (shared from lib/tts) ----------
// speakGerman + stopSpeaking imported from ../../lib/tts

// ---------- FlashCard Modal ----------

interface WordFlashCardProps {
  word: any;
  onClose: () => void;
}

const WordFlashCardModal = memo(function WordFlashCardModal({ word, onClose }: WordFlashCardProps) {
  const { theme: t } = useTheme();
  const [flipped, setFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const posColor = POS_COLORS[word.partOfSpeech] ?? "#aaa";
  const cefrColor = CEFR_COLORS[word.cefrLevel ?? "B1"] ?? "#888";
  const genderColor = word.genderCategory ? (GENDER_COLORS[word.genderCategory] ?? "#aaa") : null;
  const displayWord = word.displayGerman ?? word.german;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSpeaking(true);
      speakGerman(displayWord, { onDone: () => setIsSpeaking(false) });
    }, 300);
    return () => {
      clearTimeout(timer);
      stopSpeaking();
      setIsSpeaking(false);
    };
  }, [displayWord]);

  const speak = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    speakGerman(displayWord, { onDone: () => setIsSpeaking(false) });
  }, [displayWord, isSpeaking]);

  const flip = useCallback(() => {
    const next = !flipped;
    setFlipped(next);
    Animated.spring(flipAnim, {
      toValue: next ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  }, [flipped, flipAnim]);

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [0, 0.45, 0.5], outputRange: [1, 1, 0] });
  const backOpacity = flipAnim.interpolate({ inputRange: [0.5, 0.55, 1], outputRange: [0, 1, 1] });

  const AudioButton = (
    <TouchableOpacity onPress={speak} style={[fcStyles.audioBtn, { backgroundColor: t.surfaceAlt }]} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      {isSpeaking
        ? <ActivityIndicator size="small" color={t.primary} />
        : <Volume2 size={20} color={t.textMuted} strokeWidth={2} />
      }
    </TouchableOpacity>
  );

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={fcStyles.overlay}>
        <View style={[fcStyles.container, { backgroundColor: t.surface, minHeight: SCREEN_H * 0.62 }]}>
          <View style={fcStyles.header}>
            <Text style={[fcStyles.headerLabel, { color: t.textMuted }]}>{flipped ? "BACK" : "FRONT"}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {AudioButton}
              <TouchableOpacity onPress={onClose} style={[fcStyles.closeBtn, { backgroundColor: t.surfaceAlt }]}>
                <X size={16} color={t.textMuted} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={fcStyles.badgeRow}>
            {word.cefrLevel && (
              <View style={[fcStyles.badge, { backgroundColor: cefrColor + "22", borderColor: cefrColor }]}>
                <Text style={[fcStyles.badgeText, { color: cefrColor }]}>{word.cefrLevel}</Text>
              </View>
            )}
            {word.genderCategory && POS_WITH_GENDER.has(word.partOfSpeech) && (
              <View style={[fcStyles.badge, { backgroundColor: (genderColor ?? "#888") + "22", borderColor: genderColor ?? "#888" }]}>
                <Text style={[fcStyles.badgeText, { color: genderColor ?? "#888" }]}>{word.genderCategory}</Text>
              </View>
            )}
            <View style={[fcStyles.badge, { backgroundColor: posColor + "22", borderColor: posColor }]}>
              <Text style={[fcStyles.badgeText, { color: posColor }]}>{word.partOfSpeech}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={flip} activeOpacity={0.95} style={fcStyles.cardWrapper}>
            <Animated.View
              style={[fcStyles.card, { backgroundColor: t.card, transform: [{ rotateY: frontRotate }], opacity: frontOpacity }]}
              pointerEvents={flipped ? "none" : "auto"}
            >
              <View style={fcStyles.cardCenter}>
                <Text style={[fcStyles.germanWord, { color: t.text }]}>{displayWord}</Text>
                {word.gender && POS_WITH_GENDER.has(word.partOfSpeech) && (
                  <View style={[fcStyles.genderPill, { backgroundColor: (genderColor ?? "#888") + "22", borderColor: genderColor ?? "#888" }]}>
                    <Text style={[fcStyles.genderPillText, { color: genderColor ?? "#888" }]}>{word.gender}</Text>
                  </View>
                )}
              </View>
              {word.exampleSentence && (
                <View style={[fcStyles.exampleBox, { backgroundColor: t.dark ? "#112040" : "#F0F4FF" }]}>
                  <Text style={fcStyles.exampleLabel}>Example</Text>
                  <Text style={[fcStyles.exampleText, { color: t.textSecondary }]}>"{word.exampleSentence}"</Text>
                </View>
              )}
              <Text style={[fcStyles.tapHint, { color: t.textMuted }]}>Tap card to reveal meaning →</Text>
            </Animated.View>

            <Animated.View
              style={[fcStyles.card, fcStyles.cardBack, { backgroundColor: t.card, transform: [{ rotateY: backRotate }], opacity: backOpacity }]}
              pointerEvents={flipped ? "auto" : "none"}
            >
              <View style={fcStyles.cardCenter}>
                <Text style={[fcStyles.germanWordSmall, { color: t.textMuted }]}>{displayWord}</Text>
                <Text style={[fcStyles.englishMeaning, { color: t.text }]}>{word.english}</Text>
              </View>
              {word.exampleSentence && (
                <View style={[fcStyles.exampleBox, { backgroundColor: t.dark ? "#112040" : "#F0F4FF" }]}>
                  <Text style={fcStyles.exampleLabel}>Example</Text>
                  <Text style={[fcStyles.exampleText, { color: t.textSecondary }]}>"{word.exampleSentence}"</Text>
                  {word.exampleTranslation && (
                    <Text style={[fcStyles.exampleTranslation, { color: t.textMuted }]}>"{word.exampleTranslation}"</Text>
                  )}
                </View>
              )}
              {word.aiNotes && (
                <View style={[fcStyles.notesBox, { backgroundColor: t.dark ? "#1F1A00" : "#FFFBEC" }]}>
                  <Text style={fcStyles.notesLabel}>💡 Tip</Text>
                  <Text style={[fcStyles.notesText, { color: t.dark ? "#D4B800" : "#554400" }]}>{word.aiNotes}</Text>
                </View>
              )}
              <Text style={[fcStyles.tapHint, { color: t.textMuted }]}>← Tap card to flip back</Text>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={[fcStyles.doneBtn, { backgroundColor: t.primary }]}>
            <Text style={fcStyles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

// ---------- WordCard ----------

const WordCard = memo(function WordCard({
  word,
  onDelete,
  onTap,
}: {
  word: any;
  onDelete: (id: string) => void;
  onTap: (word: any) => void;
}) {
  const { theme: t } = useTheme();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const posColor = POS_COLORS[word.partOfSpeech] ?? "#ccc";
  const cefrColor = CEFR_COLORS[word.cefrLevel ?? ""] ?? "#888";
  const genderColor = word.genderCategory ? (GENDER_COLORS[word.genderCategory] ?? "#888") : null;
  const showGender = word.genderCategory && POS_WITH_GENDER.has(word.partOfSpeech);
  const displayWord = word.displayGerman ?? word.german;

  const handleDelete = useCallback(() => {
    Alert.alert("Delete word?", displayWord, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDelete(word.id) },
    ]);
  }, [word.id, displayWord, onDelete]);

  const handleTap = useCallback(() => onTap(word), [word, onTap]);

  const handleSpeak = useCallback((e: any) => {
    e.stopPropagation?.();
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    speakGerman(displayWord, { onDone: () => setIsSpeaking(false) });
  }, [displayWord, isSpeaking]);

  return (
    <TouchableOpacity style={[listStyles.wordCard, { backgroundColor: t.surface }]} onPress={handleTap} activeOpacity={0.8}>
      <View style={listStyles.wordCardLeft}>
        <View style={listStyles.wordCardHeader}>
          <Text style={[listStyles.germanWord, { color: t.text }]}>{displayWord}</Text>
          {word.cefrLevel && (
            <View style={[listStyles.cefrBadge, { backgroundColor: cefrColor + "22", borderColor: cefrColor }]}>
              <Text style={[listStyles.cefrBadgeText, { color: cefrColor }]}>{word.cefrLevel}</Text>
            </View>
          )}
        </View>
        <Text style={[listStyles.englishWord, { color: t.textSecondary }]}>{word.english}</Text>
        <View style={listStyles.tagsRow}>
          <View style={[listStyles.posChip, { backgroundColor: posColor + "22", borderColor: posColor }]}>
            <Text style={[listStyles.posChipText, { color: posColor }]}>{word.partOfSpeech}</Text>
          </View>
          {showGender && (
            <View style={[listStyles.posChip, { backgroundColor: (genderColor ?? "#888") + "22", borderColor: genderColor ?? "#888" }]}>
              <Text style={[listStyles.posChipText, { color: genderColor ?? "#888" }]}>{word.genderCategory}</Text>
            </View>
          )}
        </View>
        {word.exampleSentence && (
          <Text style={[listStyles.example, { color: t.textMuted }]} numberOfLines={1}>"{word.exampleSentence}"</Text>
        )}
        {word.aiNotes && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 }}>
            <Lightbulb size={10} color="#AA8800" strokeWidth={2} />
            <Text style={listStyles.aiNotesPreview} numberOfLines={1}>{word.aiNotes}</Text>
          </View>
        )}
      </View>
      <View style={listStyles.wordCardActions}>
        <TouchableOpacity
          onPress={handleSpeak}
          style={[listStyles.actionBtn, { backgroundColor: t.surfaceAlt }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {isSpeaking
            ? <ActivityIndicator size="small" color={t.primary} />
            : <Volume2 size={15} color="#1CB0F6" strokeWidth={2} />
          }
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDelete}
          style={[listStyles.actionBtn, { backgroundColor: t.surfaceAlt }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Trash2 size={15} color="#FF4B4B" strokeWidth={2} />
        </TouchableOpacity>
        <ChevronRight size={16} color={t.textMuted} strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
});

// ---------- AddWordsModal ----------

const AddWordsModal = memo(function AddWordsModal({
  visible,
  onClose,
  onAdd,
  isLoading,
  lastResult,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (words: string) => Promise<void>;
  isLoading: boolean;
  lastResult: { added: number; skipped: number; badges: string[] } | null;
}) {
  const { theme: t } = useTheme();
  const [input, setInput] = useState("");

  const handleAdd = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const words = input.trim();
    setInput("");
    await onAdd(words);
  }, [input, isLoading, onAdd]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={modalStyles.kav}
        >
          <View style={[modalStyles.content, { backgroundColor: t.surface }]}>
            <View style={modalStyles.headerRow}>
              <Text style={[modalStyles.title, { color: t.text }]}>Add German Words</Text>
              <TouchableOpacity onPress={onClose} style={[modalStyles.closeBtn, { backgroundColor: t.surfaceAlt }]}>
                <X size={14} color={t.textSecondary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <Text style={[modalStyles.sub, { color: t.textSecondary }]}>Enter words separated by commas</Text>
            <Text style={[modalStyles.hint, { color: t.textMuted }]}>e.g. Hund, laufen, schön, der Apfel, das Haus</Text>
            <Text style={[modalStyles.hint, { color: t.textMuted }]}>Articles (der/die/das) are optional — we handle gender automatically</Text>

            <TextInput
              style={[modalStyles.input, { backgroundColor: t.surfaceAlt, color: t.text, borderColor: t.border }]}
              value={input}
              onChangeText={setInput}
              placeholder="Hund, laufen, schön, der Apfel..."
              placeholderTextColor={t.textMuted}
              multiline
              numberOfLines={3}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />

            {lastResult && (
              <View style={[modalStyles.resultBox, { backgroundColor: t.dark ? "#0A2A12" : "#E8F8F0", borderColor: t.primary }]}>
                <Text style={[modalStyles.resultText, { color: t.text }]}>
                  ✅ Added {lastResult.added}{lastResult.skipped > 0 ? `, ${lastResult.skipped} already existed` : ""}
                </Text>
                {lastResult.badges.length > 0 && (
                  <Text style={[modalStyles.resultBadge, { color: t.textSecondary }]}>🎖️ {lastResult.badges.join(", ")}</Text>
                )}
              </View>
            )}

            <View style={modalStyles.btnRow}>
              <TouchableOpacity
                style={[modalStyles.addBtn, { backgroundColor: t.primary }, (!input.trim() || isLoading) && modalStyles.addBtnDisabled]}
                onPress={handleAdd}
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={modalStyles.addBtnText}>Add Words ✓</Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[modalStyles.doneBtn, { backgroundColor: t.surfaceAlt, borderColor: t.border }]} onPress={onClose}>
              <Text style={[modalStyles.doneBtnText, { color: t.textMuted }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
});

// ---------- Filter Chips ----------

const FilterChips = memo(function FilterChips<T extends string>({
  options,
  selected,
  onSelect,
  colorMap,
}: {
  options: readonly T[];
  selected: T;
  onSelect: (v: T) => void;
  colorMap?: Record<string, string>;
}) {
  const { theme: t } = useTheme();
  return (
    <FlatList
      horizontal
      data={options}
      keyExtractor={(item) => item}
      showsHorizontalScrollIndicator={false}
      style={filterStyles.list}
      contentContainerStyle={filterStyles.content}
      renderItem={({ item }) => {
        const color = colorMap?.[item];
        const isActive = selected === item;
        const label = item === "all" ? "All" : item.charAt(0).toUpperCase() + item.slice(1).replace(/_/g, " ");
        return (
          <TouchableOpacity
            style={[
              filterStyles.chip,
              { backgroundColor: t.surface, borderColor: t.border },
              isActive && (color
                ? { backgroundColor: color, borderColor: color }
                : { backgroundColor: t.primary, borderColor: t.primaryDark }
              ),
            ]}
            onPress={() => onSelect(item)}
          >
            <Text style={[filterStyles.chipText, { color: t.textMuted }, isActive && { color: "#fff" }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
});

// ---------- Advanced Filters Panel ----------

const AdvancedFilters = memo(function AdvancedFilters({
  visible,
  selectedCefr,
  onCefrSelect,
  selectedDifficulty,
  onDifficultySelect,
  selectedPracticed,
  onPracticedSelect,
  onReset,
  activeCount,
}: {
  visible: boolean;
  selectedCefr: string;
  onCefrSelect: (v: string) => void;
  selectedDifficulty: string;
  onDifficultySelect: (v: string) => void;
  selectedPracticed: string;
  onPracticedSelect: (v: string) => void;
  onReset: () => void;
  activeCount: number;
}) {
  const { theme: t } = useTheme();
  if (!visible) return null;

  return (
    <View style={[filterStyles.panel, { backgroundColor: t.surface, borderColor: t.border }]}>
      <View style={filterStyles.panelHeader}>
        <Text style={[filterStyles.panelTitle, { color: t.text }]}>Advanced Filters</Text>
        {activeCount > 0 && (
          <TouchableOpacity onPress={onReset} style={filterStyles.resetBtn}>
            <Text style={filterStyles.resetBtnText}>Reset ({activeCount})</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={[filterStyles.sectionLabel, { color: t.textMuted }]}>CEFR Level</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={filterStyles.list} contentContainerStyle={filterStyles.content}>
        {CEFR_FILTERS.map((item) => {
          const color = CEFR_COLORS[item];
          const isActive = selectedCefr === item;
          return (
            <TouchableOpacity
              key={item}
              style={[
                filterStyles.chip,
                { backgroundColor: t.surface, borderColor: t.border },
                isActive && (color ? { backgroundColor: color, borderColor: color } : { backgroundColor: t.primary, borderColor: t.primaryDark }),
              ]}
              onPress={() => onCefrSelect(item)}
            >
              <Text style={[filterStyles.chipText, { color: t.textMuted }, isActive && { color: "#fff" }]}>
                {item === "all" ? "All" : item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={[filterStyles.sectionLabel, { color: t.textMuted }]}>Difficulty</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={filterStyles.list} contentContainerStyle={filterStyles.content}>
        {DIFFICULTY_FILTERS.map((item) => {
          const color = DIFFICULTY_COLORS[item];
          const isActive = selectedDifficulty === item;
          const labels: Record<string, string> = { all: "All", easy: "Easy 🟢", hard: "Hard 🔴", new: "New ✨" };
          return (
            <TouchableOpacity
              key={item}
              style={[
                filterStyles.chip,
                { backgroundColor: t.surface, borderColor: t.border },
                isActive && (color ? { backgroundColor: color, borderColor: color } : { backgroundColor: t.primary, borderColor: t.primaryDark }),
              ]}
              onPress={() => onDifficultySelect(item)}
            >
              <Text style={[filterStyles.chipText, { color: t.textMuted }, isActive && { color: "#fff" }]}>
                {labels[item]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={[filterStyles.sectionLabel, { color: t.textMuted }]}>Practice Status</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={filterStyles.list} contentContainerStyle={filterStyles.content}>
        {PRACTICED_FILTERS.map((item) => {
          const isActive = selectedPracticed === item;
          const labels: Record<string, string> = { all: "All", practiced: "Practiced ✅", not_practiced: "Not practiced ⏳" };
          return (
            <TouchableOpacity
              key={item}
              style={[
                filterStyles.chip,
                { backgroundColor: t.surface, borderColor: t.border },
                isActive && { backgroundColor: t.primary, borderColor: t.primaryDark },
              ]}
              onPress={() => onPracticedSelect(item)}
            >
              <Text style={[filterStyles.chipText, { color: t.textMuted }, isActive && { color: "#fff" }]}>
                {labels[item]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

// ---------- Main Screen ----------

// ─── Course Words Tab ─────────────────────────────────────────────────────────

function CourseWordsTab({ t }: { t: any }) {
  const [syllabusProgress, setSyllabusProgress] = useState<SyllabusProgress | null>(null);

  useEffect(() => {
    loadSyllabusProgress().then(setSyllabusProgress);
  }, []);

  if (!syllabusProgress) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={t.primary} />
      </View>
    );
  }

  const groups = getLearnedWords(syllabusProgress);

  if (groups.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
        <GraduationCap size={56} color={t.textMuted} strokeWidth={1.5} />
        <Text style={{ color: t.text, fontSize: 18, fontWeight: "900", marginTop: 16 }}>
          No course words yet
        </Text>
        <Text style={{ color: t.textMuted, fontSize: 14, textAlign: "center", marginTop: 8 }}>
          Complete units in the A1 course to unlock vocabulary here.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      {groups.map((group) => (
        <View key={group.unitId} style={{ marginBottom: 20 }}>
          <Text style={{ color: t.textMuted, fontSize: 11, fontWeight: "800", letterSpacing: 1.2, marginBottom: 10 }}>
            {group.unitTitle.toUpperCase()} ({group.words.length})
          </Text>
          {group.words.map((word) => (
            <View
              key={word.id}
              style={{
                backgroundColor: t.surface,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: t.border,
                padding: 14,
                marginBottom: 8,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontSize: 16, fontWeight: "800" }}>
                  {word.article ? `${word.article} ` : ""}{word.german}
                  {word.plural ? ` · ${word.plural}` : ""}
                </Text>
                <Text style={{ color: t.textMuted, fontSize: 13, fontWeight: "500", marginTop: 2 }}>
                  {word.english}
                </Text>
                <Text style={{ color: t.textMuted, fontSize: 11, fontStyle: "italic", marginTop: 4 }}>
                  {word.example_de}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => speakGerman(word.german)}
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: t.surfaceAlt, alignItems: "center", justifyContent: "center" }}
              >
                <Volume2 size={16} color={t.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

// ─── Tab switcher ─────────────────────────────────────────────────────────────

function WordsTabBar({
  active,
  onSelect,
  t,
}: {
  active: "vocab" | "course";
  onSelect: (tab: "vocab" | "course") => void;
  t: any;
}) {
  return (
    <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: t.border, backgroundColor: t.surface }}>
      {[
        { id: "vocab" as const, label: "Word List" },
        { id: "course" as const, label: "Course Words" },
      ].map(({ id, label }) => {
        const isActive = active === id;
        return (
          <TouchableOpacity
            key={id}
            onPress={() => onSelect(id)}
            style={{
              flex: 1,
              paddingVertical: 13,
              alignItems: "center",
              borderBottomWidth: 3,
              borderBottomColor: isActive ? t.primary : "transparent",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "800", color: isActive ? t.primary : t.textMuted }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

function VocabScreen() {
  const { theme: t } = useTheme();
  const queryClient = useQueryClient();
  const session = authClient.useSession();
  const userId = session.data?.user?.id ?? "";

  const [activeWordTab, setActiveWordTab] = useState<"vocab" | "course">("vocab");
  const [selectedPos, setSelectedPos] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedCefr, setSelectedCefr] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedPracticed, setSelectedPracticed] = useState("all");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{ added: number; skipped: number; badges: string[] } | null>(null);
  const [flashcardWord, setFlashcardWord] = useState<any | null>(null);
  // Bump this to force re-read from local DB after sync completes
  const [syncVersion, setSyncVersion] = useState(0);

  // Subscribe to sync state changes so the word list refreshes after sync
  useEffect(() => {
    const unsub = subscribeSyncState((s) => {
      if (s.status === "idle" && s.pendingCount === 0) {
        setSyncVersion((v) => v + 1);
      }
    });
    return unsub;
  }, []);

  const genderFilterApplicable = selectedPos === "all" || POS_WITH_GENDER.has(selectedPos);

  const advancedActiveCount = [
    selectedCefr !== "all" ? 1 : 0,
    selectedDifficulty !== "all" ? 1 : 0,
    selectedPracticed !== "all" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const handlePosSelect = useCallback((pos: string) => {
    setSelectedPos(pos);
    if (!POS_WITH_GENDER.has(pos) && pos !== "all") setSelectedGender("all");
  }, []);

  const handleResetAdvanced = useCallback(() => {
    setSelectedCefr("all");
    setSelectedDifficulty("all");
    setSelectedPracticed("all");
  }, []);

  // Read words from local SQLite (offline-first)
  const words = useQuery({
    queryKey: ["words", selectedPos, selectedGender, selectedCefr, search, syncVersion, userId],
    queryFn: () => {
      if (!userId) return { words: [] };
      const filters: Record<string, string> = {};
      if (selectedPos !== "all") filters.pos = selectedPos;
      if (selectedGender !== "all" && genderFilterApplicable) filters.gender = selectedGender;
      if (selectedCefr !== "all") filters.cefr = selectedCefr;
      if (search) filters.search = search;
      return { words: getWords(userId, filters) };
    },
    staleTime: 5_000,
    placeholderData: keepPreviousData,
  });

  const handleAddWords = useCallback(async (wordInput: string) => {
    if (!userId) return;
    setAddLoading(true);
    setLastResult(null);
    try {
      const added = addWordOffline(userId, wordInput);
      // Refresh local list immediately
      queryClient.invalidateQueries({ queryKey: ["words"] });
      setLastResult({ added: added.length, skipped: 0, badges: [] });
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to add words");
    } finally {
      setAddLoading(false);
    }
  }, [userId, queryClient]);

  const handleDelete = useCallback((id: string) => {
    if (!userId) return;
    try {
      deleteWordLocally(userId, id);
      queryClient.invalidateQueries({ queryKey: ["words"] });
    } catch {
      Alert.alert("Error", "Failed to delete word");
    }
  }, [userId, queryClient]);

  const handleWordTap = useCallback((word: any) => setFlashcardWord(word), []);
  const handleCloseFlashcard = useCallback(() => setFlashcardWord(null), []);
  const handleCloseAdd = useCallback(() => { setShowAdd(false); setLastResult(null); }, []);

  const renderWord = useCallback(({ item }: { item: any }) => (
    <WordCard word={item} onDelete={handleDelete} onTap={handleWordTap} />
  ), [handleDelete, handleWordTap]);

  const keyExtractor = useCallback((item: any) => item.id, []);
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index,
  }), []);

  let wordList = (words.data as any)?.words ?? [];

  if (selectedDifficulty !== "all") {
    wordList = wordList.filter((w: any) => {
      const reps = w.reps ?? 0;
      const lapses = w.lapses ?? 0;
      if (selectedDifficulty === "new") return reps === 0;
      if (selectedDifficulty === "easy") return reps >= 3 && lapses === 0;
      if (selectedDifficulty === "hard") return lapses >= 2;
      return true;
    });
  }

  if (selectedPracticed !== "all") {
    wordList = wordList.filter((w: any) => {
      const practiced = (w.reps ?? 0) > 0;
      return selectedPracticed === "practiced" ? practiced : !practiced;
    });
  }

  const filtersActive = showAdvanced || advancedActiveCount > 0;

  useShellTopBar({
    left: (
      <>
        <Library size={22} color={t.primary} strokeWidth={2.5} />
        <Text style={[screenStyles.title, { color: t.text }]}>Words</Text>
      </>
    ),
    right: (
      <TouchableOpacity
        style={[screenStyles.addFab, { backgroundColor: t.primary }]}
        onPress={() => setShowAdd(true)}
        activeOpacity={0.85}
      >
        <Plus size={15} color="#fff" strokeWidth={2.5} />
        <Text style={screenStyles.addFabText}>Add</Text>
      </TouchableOpacity>
    ),
    accent: "#58CC02",
  });

  return (
    <View style={[screenStyles.safe, { backgroundColor: t.background }]}>
      {/* ─── Tab switcher ─── */}
      <WordsTabBar active={activeWordTab} onSelect={setActiveWordTab} t={t} />

      {/* ─── Course Words Tab ─── */}
      {activeWordTab === "course" && <CourseWordsTab t={t} />}

      {/* ─── Vocab Book Tab ─── */}
      {activeWordTab === "vocab" && (<>
      {/* ─── Fixed header + filters ─── */}
      <View style={[screenStyles.stickyTop, { backgroundColor: t.background }]}>
        {/* Header */}
        <View style={screenStyles.header}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={[screenStyles.wordCountInline, { color: t.textMuted }]}>
              {wordList.length} word{wordList.length !== 1 ? "s" : ""}
            </Text>
            {words.isFetching && <ActivityIndicator size="small" color={t.primary} />}
          </View>
          <TouchableOpacity
            style={[
              screenStyles.filtersBtn,
              { borderColor: t.border, backgroundColor: t.surface },
              filtersActive && { backgroundColor: t.text, borderColor: t.text },
            ]}
            onPress={() => setShowAdvanced((v) => !v)}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Filter size={13} color={filtersActive ? t.background : t.textSecondary} strokeWidth={2} />
              <Text style={[screenStyles.filtersBtnText, { color: filtersActive ? t.background : t.textSecondary }]}>
                Filters{advancedActiveCount > 0 ? ` (${advancedActiveCount})` : ""}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={screenStyles.searchContainer}>
          <TextInput
            style={[screenStyles.searchInput, { backgroundColor: t.surface, color: t.text, borderColor: t.border }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Search words..."
            placeholderTextColor={t.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* POS filter */}
        <FilterChips options={POS_FILTERS} selected={selectedPos as any} onSelect={handlePosSelect as any} />

        {/* Gender filter */}
        {genderFilterApplicable && (
          <FilterChips
            options={GENDER_FILTERS}
            selected={selectedGender as any}
            onSelect={setSelectedGender as any}
            colorMap={GENDER_COLORS}
          />
        )}

        {/* Advanced filters panel */}
        <AdvancedFilters
          visible={showAdvanced}
          selectedCefr={selectedCefr}
          onCefrSelect={setSelectedCefr}
          selectedDifficulty={selectedDifficulty}
          onDifficultySelect={setSelectedDifficulty}
          selectedPracticed={selectedPracticed}
          onPracticedSelect={setSelectedPracticed}
          onReset={handleResetAdvanced}
          activeCount={advancedActiveCount}
        />

        {/* Info row */}
        {wordList.length > 0 && (
          <View style={screenStyles.infoRow}>
            <Text style={[screenStyles.wordCount, { color: t.textMuted }]}>
              tap any word to flip
            </Text>
          </View>
        )}
      </View>

      {/* ─── Scrollable word list ─── */}
      {words.isLoading && !words.data ? (
        <View style={screenStyles.centered}>
          <ActivityIndicator size="large" color={t.primary} />
        </View>
      ) : wordList.length === 0 ? (
        <View style={screenStyles.emptyState}>
          <Inbox size={56} color={t.textMuted} strokeWidth={1.5} style={{ marginBottom: 12 }} />
          <Text style={[screenStyles.emptyTitle, { color: t.text }]}>No words yet</Text>
          <Text style={[screenStyles.emptySub, { color: t.textMuted }]}>Add German words to start learning</Text>
          <TouchableOpacity style={[screenStyles.emptyBtn, { backgroundColor: t.primary }]} onPress={() => setShowAdd(true)}>
            <Text style={screenStyles.emptyBtnText}>Add Your First Words</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wordList}
          keyExtractor={keyExtractor}
          renderItem={renderWord}
          contentContainerStyle={screenStyles.listContent}
          getItemLayout={getItemLayout}
          removeClippedSubviews
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={5}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* Modals */}
      <AddWordsModal
        visible={showAdd}
        onClose={handleCloseAdd}
        onAdd={handleAddWords}
        isLoading={addLoading}
        lastResult={lastResult}
      />

      {flashcardWord && (
        <WordFlashCardModal word={flashcardWord} onClose={handleCloseFlashcard} />
      )}
      </>)}
    </View>
  );
}

// ---------- Static StyleSheets (no theme-dependent values) ----------

const fcStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  container: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  headerLabel: { fontSize: 12, fontWeight: "800", letterSpacing: 1.5 },
  audioBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  badgeRow: { flexDirection: "row", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  badge: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  cardWrapper: { flex: 1, justifyContent: "center", minHeight: 220 },
  card: {
    borderRadius: 24, padding: 24,
    justifyContent: "space-between", minHeight: 220,
    backfaceVisibility: "hidden",
  },
  cardBack: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  cardCenter: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 12 },
  germanWord: { fontSize: 40, fontWeight: "900", textAlign: "center", marginBottom: 8 },
  genderPill: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 5, marginTop: 4 },
  genderPillText: { fontSize: 13, fontWeight: "800" },
  germanWordSmall: { fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: 12 },
  englishMeaning: { fontSize: 32, fontWeight: "900", textAlign: "center" },
  tapHint: { textAlign: "center", fontSize: 12, fontWeight: "600", marginTop: 6 },
  exampleBox: { borderRadius: 14, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: "#1CB0F6" },
  exampleLabel: { fontSize: 10, fontWeight: "800", color: "#1CB0F6", marginBottom: 4, letterSpacing: 1 },
  exampleText: { fontSize: 13, fontStyle: "italic", lineHeight: 18 },
  exampleTranslation: { fontSize: 12, lineHeight: 16, marginTop: 4 },
  notesBox: { borderRadius: 14, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: "#FFC800" },
  notesLabel: { fontSize: 10, fontWeight: "800", color: "#AA8800", marginBottom: 4, letterSpacing: 1 },
  notesText: { fontSize: 12, lineHeight: 17 },
  doneBtn: {
    borderRadius: 20, paddingVertical: 16, alignItems: "center", marginTop: 20,
  },
  doneBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});

const listStyles = StyleSheet.create({
  wordCard: {
    borderRadius: 16, padding: 14, marginBottom: 10,
    flexDirection: "row", minHeight: ITEM_HEIGHT - 10,
  },
  wordCardLeft: { flex: 1 },
  wordCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" },
  germanWord: { fontSize: 19, fontWeight: "800" },
  cefrBadge: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  cefrBadgeText: { fontSize: 11, fontWeight: "800" },
  englishWord: { fontSize: 14, marginBottom: 6 },
  tagsRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginBottom: 4 },
  posChip: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, alignSelf: "flex-start" },
  posChipText: { fontSize: 10, fontWeight: "700", textTransform: "capitalize" },
  example: { fontSize: 11, fontStyle: "italic" },
  aiNotesPreview: { fontSize: 10, color: "#AA8800", marginTop: 2 },
  wordCardActions: { gap: 6, justifyContent: "center", alignItems: "center", paddingLeft: 8, minWidth: 40 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
});

const filterStyles = StyleSheet.create({
  list: { maxHeight: 44 },
  content: { paddingHorizontal: 16, gap: 8, paddingVertical: 4 },
  chip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1.5 },
  chipText: { fontSize: 13, fontWeight: "700" },
  panel: { marginHorizontal: 12, marginBottom: 6, borderRadius: 16, padding: 12, borderWidth: 1.5 },
  panelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  panelTitle: { fontSize: 13, fontWeight: "800" },
  resetBtn: { backgroundColor: "#FF4B4B22", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: "#FF4B4B" },
  resetBtnText: { fontSize: 11, fontWeight: "700", color: "#FF4B4B" },
  sectionLabel: { fontSize: 11, fontWeight: "800", marginTop: 8, marginBottom: 2, marginLeft: 4, letterSpacing: 1.2 },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  kav: { backgroundColor: "transparent" },
  content: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "800" },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  sub: { fontSize: 14, marginBottom: 2 },
  hint: { fontSize: 12, marginBottom: 4 },
  input: { borderRadius: 14, padding: 14, fontSize: 15, borderWidth: 1.5, minHeight: 80, textAlignVertical: "top", marginTop: 12, marginBottom: 12 },
  resultBox: { borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1 },
  resultText: { fontSize: 14, fontWeight: "700" },
  resultBadge: { fontSize: 13, marginTop: 4 },
  btnRow: { flexDirection: "row" },
  addBtn: { flex: 1, borderRadius: 20, paddingVertical: 14, alignItems: "center" },
  addBtnDisabled: { opacity: 0.5 },
  addBtnText: { fontWeight: "800", color: "#fff", fontSize: 15 },
  doneBtn: { marginTop: 12, borderRadius: 20, paddingVertical: 12, alignItems: "center", borderWidth: 1.5 },
  doneBtnText: { fontWeight: "700", fontSize: 14 },
});

const screenStyles = StyleSheet.create({
  safe: { flex: 1 },
  stickyTop: { paddingBottom: 4 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: "900" },
  wordCountInline: { fontSize: 13, fontWeight: "700" },
  addFab: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9 },
  addFabText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  filtersBtn: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1.5 },
  filtersBtnText: { fontWeight: "700", fontSize: 13 },
  searchContainer: { paddingHorizontal: 16, paddingBottom: 8 },
  searchInput: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, borderWidth: 1.5 },
  infoRow: { paddingHorizontal: 16, paddingBottom: 4 },
  wordCount: { fontSize: 12, fontWeight: "600" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyTitle: { fontSize: 22, fontWeight: "900", marginBottom: 8 },
  emptySub: { fontSize: 15, textAlign: "center", marginBottom: 24 },
  emptyBtn: { borderRadius: 20, paddingVertical: 14, paddingHorizontal: 28 },
  emptyBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});

export default function WordsScreen() {
  const { mode } = useAppMode();
  if (mode === "grammar") return <GrammarScreen />;
  if (mode === "learn")   return <LearnScreen />;
  return <VocabScreen />;
}
