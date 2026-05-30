import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useAppMode } from "../../lib/appMode";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useFocusEffect } from "expo-router";
import { authClient } from "../../lib/auth";
import { getWords, addWordOffline } from "../../lib/offlineStore";
import { subscribeSyncState } from "../../lib/syncEngine";
import {
  Plus,
  Layers,
  Pencil,
  Check,
  X,
  BookOpen,
} from "lucide-react-native";
// api import removed — all data goes through offlineStore
import { useTheme } from "../../lib/theme";
import { useShellTopBar } from "../../lib/AppShell";
import { Storage } from "../../lib/storage";
import { setConfidence, confidenceColor, EXAM_HISTORY_KEY } from "../../lib/confidence";
import type { ExamHistoryEntry } from "../../lib/confidence";

const SET_SIZE_DEFAULT = 20;
const CUSTOM_SETS_KEY = "custom_sets_v1";
const CUSTOM_NAMES_KEY = "custom_set_names_v1";

export interface StudyWord {
  id: string;
  german: string;
  displayGerman: string | null;
  english: string;
  partOfSpeech: string;
  gender: string | null;
  genderCategory: string | null;
  cefrLevel: string | null;
  exampleSentence: string | null;
  exampleTranslation: string | null;
  aiNotes: string | null;
  ipa: string | null;
  reps: number | null;
  lapses: number | null;
  stability: number | null;
  state: number | null;
}

export interface CustomSet {
  id: string;
  name: string;
  wordIds: string[];
  createdAt: number;
}


// ─── Persistence ──────────────────────────────────────────────────────────────

async function loadCustomSets(): Promise<CustomSet[]> {
  try { const r = await Storage.getItem(CUSTOM_SETS_KEY); return r ? JSON.parse(r) : []; }
  catch { return []; }
}
async function saveCustomSets(sets: CustomSet[]) {
  await Storage.setItem(CUSTOM_SETS_KEY, JSON.stringify(sets));
}
async function loadCustomNames(): Promise<Record<string, string>> {
  try { const r = await Storage.getItem(CUSTOM_NAMES_KEY); return r ? JSON.parse(r) : {}; }
  catch { return {}; }
}
async function saveCustomNames(names: Record<string, string>) {
  await Storage.setItem(CUSTOM_NAMES_KEY, JSON.stringify(names));
}

// ─── Progress bar ────────────────────────────────────────────────────────────

function SetProgress({ words, setId, examHistory }: {
  words: StudyWord[];
  setId: string;
  examHistory: ExamHistoryEntry[];
}) {
  const practiced = words.filter((w) => (w.reps ?? 0) > 0).length;
  const pct = words.length > 0 ? (practiced / words.length) * 100 : 0;
  const conf = setConfidence(words, examHistory, setId);
  const cColor = confidenceColor(conf);
  return (
    <View style={prog.row}>
      <View style={prog.bar}>
        <View style={[prog.fill, { width: `${pct}%` as any }]} />
      </View>
      <Text style={prog.label}>{practiced}/{words.length}</Text>
      {practiced > 0 && (
        <View style={[prog.chip, { backgroundColor: cColor + "20", borderColor: cColor }]}>
          <Text style={[prog.chipTxt, { color: cColor }]}>{conf}%</Text>
        </View>
      )}
    </View>
  );
}
const prog = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  bar: { flex: 1, height: 5, borderRadius: 3, backgroundColor: "#E5E5E5", overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3, backgroundColor: "#58CC02" },
  label: { fontSize: 11, fontWeight: "700", color: "#888", minWidth: 30 },
  chip: { borderRadius: 7, borderWidth: 1.5, paddingHorizontal: 6, paddingVertical: 1 },
  chipTxt: { fontSize: 10, fontWeight: "800" },
});

// ─── Rename inline ────────────────────────────────────────────────────────────

function RenameInput({ value, onSave, onCancel, color }: {
  value: string; onSave: (v: string) => void; onCancel: () => void; color: string;
}) {
  const [text, setText] = useState(value);
  const ref = useRef<TextInput>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <View style={renS.row}>
      <TextInput
        ref={ref}
        style={[renS.input, { borderColor: color }]}
        value={text}
        onChangeText={setText}
        returnKeyType="done"
        onSubmitEditing={() => text.trim() && onSave(text.trim())}
        selectTextOnFocus
      />
      <TouchableOpacity onPress={() => text.trim() && onSave(text.trim())}
        style={[renS.btn, { backgroundColor: color }]}>
        <Check size={14} color="#fff" strokeWidth={3} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onCancel} style={renS.cancel}>
        <X size={14} color="#999" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}
const renS = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  input: {
    flex: 1, borderWidth: 2, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    fontSize: 15, fontWeight: "700", color: "#1F1F1F", backgroundColor: "#fff",
  },
  btn: { width: 28, height: 28, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  cancel: { width: 28, height: 28, borderRadius: 7, alignItems: "center", justifyContent: "center", backgroundColor: "#F0F0F0" },
});

// ─── Create Set Modal ─────────────────────────────────────────────────────────

function CreateSetModal({ visible, onClose, onCreated, allWords, userId }: {
  visible: boolean;
  onClose: () => void;
  onCreated: (set: CustomSet, addedWords: StudyWord[]) => void;
  allWords: StudyWord[];
  userId: string;
}) {
  const { theme: t } = useTheme();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [wordInput, setWordInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setWordInput("");
    setLoading(false);
    setStatus(null);
  };

  const handleClose = () => {
    if (loading) return; // block close while working
    reset();
    onClose();
  };

  // Single button: adds words to library, then creates set — all in one tap
  const handleCreateSet = async () => {
    const trimName = name.trim();
    if (!trimName) { Alert.alert("", "Please enter a set name"); return; }

    setLoading(true);
    let addedWords: StudyWord[] = [];

    try {
      // Step 1: add words to library if any were entered (offline-first)
      if (wordInput.trim() && userId) {
        setStatus("Adding words to library…");
        const added = addWordOffline(userId, wordInput.trim());
        queryClient.invalidateQueries({ queryKey: ["words"] });
        // Shape to StudyWord-compatible (minimal — set only needs IDs)
        addedWords = added.map((w) => ({
          id: w.id,
          german: w.german,
          displayGerman: null,
          english: "(syncing...)",
          partOfSpeech: "unknown",
          gender: null,
          genderCategory: null,
          cefrLevel: null,
          exampleSentence: null,
          exampleTranslation: null,
          aiNotes: null,
          ipa: null,
          reps: 0,
          lapses: 0,
          stability: null,
          state: null,
        }));
      }

      // Step 2: create the set
      setStatus("Creating set…");
      const newSet: CustomSet = {
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: trimName,
        wordIds: addedWords.map((w) => w.id),
        createdAt: Date.now(),
      };

      onCreated(newSet, addedWords);
      reset();
    } catch {
      setLoading(false);
      setStatus(null);
      Alert.alert("Error", "Failed to create set. Please try again.");
    }
  };

  const canCreate = name.trim().length > 0 && !loading;

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={cs.overlay}>
        {/* backdrop only dismisses if not loading */}
        <TouchableOpacity style={cs.backdrop} onPress={handleClose} activeOpacity={1} />

        <View style={[cs.sheet, { backgroundColor: t.background }]}>
          <View style={[cs.handle, { backgroundColor: t.border }]} />

          <Text style={[cs.title, { color: t.text }]}>Create Set</Text>
          <Text style={[cs.sub, { color: t.textMuted }]}>
            Enter a name, paste your words, and tap Create — everything happens at once.
          </Text>

          {/* Set name */}
          <Text style={[cs.label, { color: t.textMuted }]}>SET NAME *</Text>
          <TextInput
            style={[cs.nameInput, { borderColor: name.trim() ? t.primary : t.border, color: t.text, backgroundColor: t.surface }]}
            placeholder="e.g. Travel Vocabulary"
            placeholderTextColor={t.textMuted}
            value={name}
            onChangeText={setName}
            returnKeyType="next"
            editable={!loading}
          />

          {/* Words */}
          <Text style={[cs.label, { color: t.textMuted }]}>WORDS (comma or space separated)</Text>
          <View style={[cs.wordRow, { borderColor: t.border, backgroundColor: t.surface }]}>
            <TextInput
              style={[cs.wordInput, { color: t.text }]}
              placeholder="Hund, schön, gehen, laufen…"
              placeholderTextColor={t.textMuted}
              value={wordInput}
              onChangeText={setWordInput}
              multiline
              numberOfLines={4}
              editable={!loading}
            />
          </View>

          {/* Single action button */}
          <TouchableOpacity
            style={[cs.createBtn, { backgroundColor: canCreate ? "#58CC02" : t.border }]}
            onPress={handleCreateSet}
            disabled={!canCreate}
            activeOpacity={0.85}
          >
            {loading ? (
              <View style={cs.loadingRow}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={cs.createBtnTxt}>{status ?? "Working…"}</Text>
              </View>
            ) : (
              <Text style={[cs.createBtnTxt, { color: canCreate ? "#fff" : t.textMuted }]}>
                {wordInput.trim() ? "Add Words & Create Set" : "Create Set"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const cs = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 44, gap: 12,
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 6 },
  title: { fontSize: 22, fontWeight: "900" },
  sub: { fontSize: 13, fontWeight: "500", marginTop: -6 },
  label: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  nameInput: {
    borderWidth: 2, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 16, fontWeight: "700",
  },
  wordRow: {
    borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  wordInput: {
    fontSize: 15, minHeight: 80, textAlignVertical: "top",
  },
  createBtn: {
    borderRadius: 16, paddingVertical: 15,
    alignItems: "center", justifyContent: "center", marginTop: 4,
  },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  createBtnTxt: { color: "#fff", fontWeight: "900", fontSize: 16 },
});

// ─── Mode buttons row ─────────────────────────────────────────────────────────

// ─── Set Card ─────────────────────────────────────────────────────────────────

interface SetCardProps {
  id: string;
  name: string;
  words: StudyWord[];
  iconColor: string;
  isRenaming: boolean;
  examHistory: ExamHistoryEntry[];
  onRenameStart: () => void;
  onRenameCancel: () => void;
  onRenameSave: (v: string) => void;
  onOpen: () => void;
  onLongPress?: () => void;
  theme: any;
}

function SetCard({
  id, name, words, iconColor, isRenaming, examHistory,
  onRenameStart, onRenameCancel, onRenameSave,
  onOpen, onLongPress, theme: t,
}: SetCardProps) {
  return (
    <TouchableOpacity
      style={[sc.card, { backgroundColor: t.surface, borderColor: t.border }]}
      onPress={onOpen}
      onLongPress={onLongPress}
      activeOpacity={0.9}
      delayLongPress={500}
    >
      {/* Header row */}
      <View style={sc.headerRow}>
        <View style={[sc.icon, { backgroundColor: iconColor + "1A" }]}>
          <Layers size={18} color={iconColor} strokeWidth={2} />
        </View>
        <View style={sc.info}>
          {isRenaming ? (
            <RenameInput value={name} onSave={onRenameSave} onCancel={onRenameCancel} color={iconColor} />
          ) : (
            <View style={sc.nameRow}>
              <Text style={[sc.name, { color: t.text }]} numberOfLines={1}>{name}</Text>
              <TouchableOpacity onPress={onRenameStart} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Pencil size={12} color={t.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          )}
          <Text style={[sc.count, { color: t.textMuted }]}>{words.length} words</Text>
        </View>
      </View>

      {/* Progress */}
      <SetProgress words={words} setId={id} examHistory={examHistory} />
    </TouchableOpacity>
  );
}

const sc = StyleSheet.create({
  card: {
    marginHorizontal: 16, marginBottom: 12,
    borderRadius: 20, borderWidth: 1.5,
    padding: 16,
  },
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  info: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  name: { fontSize: 16, fontWeight: "800", flex: 1 },

  count: { fontSize: 12, fontWeight: "600" },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

function StudyScreenInner() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const session = authClient.useSession();
  const userId = session.data?.user?.id ?? "";

  const [customSets, setCustomSets] = useState<CustomSet[]>([]);
  const [customNames, setCustomNames] = useState<Record<string, string>>({});
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [examHistory, setExamHistory] = useState<ExamHistoryEntry[]>([]);
  const [syncVersion, setSyncVersion] = useState(0);

  // ── Shell top bar (must be before any early returns) ──
  useShellTopBar({
    left: (
      <>
        <Layers size={22} color={t.primary} strokeWidth={2.5} />
        <Text style={[styles.title, { color: t.text }]}>Study</Text>
      </>
    ),
    right: (
      <TouchableOpacity
        style={[styles.createBtn, { backgroundColor: t.primary }]}
        onPress={() => setShowCreate(true)}
      >
        <Plus size={16} color="#fff" strokeWidth={3} />
        <Text style={styles.createBtnTxt}>Set</Text>
      </TouchableOpacity>
    ),
    accent: t.primary,
  });

  useEffect(() => {
    Promise.all([loadCustomSets(), loadCustomNames()]).then(([sets, names]) => {
      setCustomSets(sets);
      setCustomNames(names);
      setSettingsLoaded(true);
    });
    Storage.getItem(EXAM_HISTORY_KEY).then((raw) => {
      setExamHistory(raw ? JSON.parse(raw) : []);
    }).catch(() => {});

    // Refresh words list when sync completes
    const unsub = subscribeSyncState((s) => {
      if (s.status === "idle") setSyncVersion((v) => v + 1);
    });
    return unsub;
  }, []);

  // Also bump syncVersion every time this tab gains focus so stale data is never shown
  useFocusEffect(
    useCallback(() => {
      setSyncVersion((v) => v + 1);
    }, [])
  );

  const wordsQuery = useQuery({
    queryKey: ["words", "study-hub", syncVersion, userId],
    queryFn: () => {
      if (!userId) return { words: [] };
      return { words: getWords(userId) };
    },
    staleTime: 5_000,
    gcTime: 10 * 60_000,
    placeholderData: (prev: any) => prev,
  });

  const allWords: StudyWord[] = useMemo(
    () => (wordsQuery.data?.words ?? []) as StudyWord[],
    [wordsQuery.data],
  );

  // IDs of words already in custom sets — excluded from auto sets
  const customSetWordIds = useMemo(() => {
    const ids = new Set<string>();
    for (const set of customSets) {
      for (const id of set.wordIds) ids.add(id);
    }
    return ids;
  }, [customSets]);

  // Auto-generated 20-word sets — only words NOT in any custom set
  const autoSets = useMemo(() => {
    const freeWords = customSetWordIds.size > 0
      ? allWords.filter((w) => !customSetWordIds.has(w.id))
      : allWords;
    const sets: { id: string; name: string; words: StudyWord[] }[] = [];
    for (let i = 0; i < freeWords.length; i += SET_SIZE_DEFAULT) {
      const idx = Math.floor(i / SET_SIZE_DEFAULT);
      sets.push({
        id: `auto-${idx + 1}`,
        name: `Set ${idx + 1}`,
        words: freeWords.slice(i, i + SET_SIZE_DEFAULT),
      });
    }
    return sets;
  }, [allWords, customSetWordIds]);

  // Resolve words for a custom set
  const resolveCustomWords = useCallback((set: CustomSet): StudyWord[] => {
    if (set.wordIds.length === 0) return allWords;
    const idSet = new Set(set.wordIds);
    const matched = allWords.filter((w) => idSet.has(w.id));
    return matched.length > 0 ? matched : allWords;
  }, [allWords]);

  const getSetName = (id: string, fallback: string) => customNames[id] ?? fallback;

  const handleRename = async (id: string, newName: string) => {
    const updated = { ...customNames, [id]: newName };
    setCustomNames(updated);
    await saveCustomNames(updated);
    setRenamingId(null);
  };

  const handleCreated = async (newSet: CustomSet, addedWords: StudyWord[]) => {
    const updated = [...customSets, newSet];
    setCustomSets(updated);
    await saveCustomSets(updated);
    setShowCreate(false);
  };

  const handleDeleteSet = (id: string) => {
    Alert.alert("Delete Set", "Remove this set? Words stay in your library.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          const updated = customSets.filter((s) => s.id !== id);
          setCustomSets(updated);
          await saveCustomSets(updated);
        },
      },
    ]);
  };

  const openSet = useCallback((setId: string, setName: string, words: StudyWord[]) => {
    router.push({
      pathname: "/study/set" as any,
      params: { id: setId, name: setName, words: JSON.stringify(words), allWords: JSON.stringify(allWords) },
    });
  }, [router, allWords]);

  if (wordsQuery.isLoading || !settingsLoaded) {
    return (
      <View style={[styles.safe, { backgroundColor: t.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={t.primary} />
        </View>
      </View>
    );
  }

  if (allWords.length === 0) {
    return (
      <View style={[styles.safe, { backgroundColor: t.background }]}>
        <View style={styles.centered}>
          <Layers size={56} color={t.primary} strokeWidth={1.5} />
          <Text style={[styles.emptyTitle, { color: t.text }]}>No words yet</Text>
          <Text style={[styles.emptySub, { color: t.textMuted }]}>
            Create a set and add words to start practicing all modes
          </Text>
          <TouchableOpacity
            style={[styles.createEmptyBtn, { backgroundColor: t.primary }]}
            onPress={() => setShowCreate(true)}
          >
            <Plus size={18} color="#fff" strokeWidth={2.5} />
            <Text style={styles.createEmptyBtnTxt}>Create Set</Text>
          </TouchableOpacity>
        </View>
        <CreateSetModal
          visible={showCreate}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
          allWords={allWords}
          userId={userId}
        />
      </View>
    );
  }

  return (
    <View style={[styles.safe, { backgroundColor: t.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: t.textMuted, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }]}>
          {allWords.length} words · {autoSets.length + customSets.length} sets
        </Text>

        {/* My Sets */}
        {customSets.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: t.textMuted }]}>MY SETS</Text>
            {customSets.map((set) => {
              const name = getSetName(set.id, set.name);
              const words = resolveCustomWords(set);
              return (
                <SetCard
                  key={set.id}
                  id={set.id}
                  name={name}
                  words={words}
                  iconColor="#CE82FF"
                  isRenaming={renamingId === set.id}
                  examHistory={examHistory}
                  onRenameStart={() => setRenamingId(set.id)}
                  onRenameCancel={() => setRenamingId(null)}
                  onRenameSave={(v) => handleRename(set.id, v)}
                  onOpen={() => openSet(set.id, name, words)}
                  onLongPress={() => handleDeleteSet(set.id)}
                  theme={t}
                />
              );
            })}
          </>
        )}

        {/* All words auto-sets */}
        <Text style={[styles.sectionLabel, { color: t.textMuted, marginTop: customSets.length > 0 ? 20 : 0 }]}>
          ALL WORDS
        </Text>
        {autoSets.map((set) => {
          const name = getSetName(set.id, set.name);
          return (
            <SetCard
              key={set.id}
              id={set.id}
              name={name}
              words={set.words}
              iconColor={t.primary}
              isRenaming={renamingId === set.id}
              examHistory={examHistory}
              onRenameStart={() => setRenamingId(set.id)}
              onRenameCancel={() => setRenamingId(null)}
              onRenameSave={(v) => handleRename(set.id, v)}
              onOpen={() => openSet(set.id, name, set.words)}
              onLongPress={undefined}
              theme={t}
            />
          );
        })}
      </ScrollView>

      <CreateSetModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
        allWords={allWords}
        userId={userId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  emptyTitle: { fontSize: 24, fontWeight: "800", textAlign: "center" },
  emptySub: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  createEmptyBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 24, paddingVertical: 14, paddingHorizontal: 28, marginTop: 8,
  },
  createEmptyBtnTxt: { color: "#fff", fontWeight: "800", fontSize: 16 },

  scroll: { paddingBottom: 48 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12,
  },
  title: { fontSize: 30, fontWeight: "900" },
  subtitle: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  createBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14,
  },
  createBtnTxt: { color: "#fff", fontWeight: "800", fontSize: 13 },
  sectionLabel: {
    fontSize: 11, fontWeight: "800", letterSpacing: 1.2,
    paddingHorizontal: 20, marginBottom: 8,
  },
});

// Grammar Study placeholder
function GrammarStudyPlaceholder() {
  const { theme: t } = useTheme();
  useShellTopBar({
    left: (
      <>
        <BookOpen size={22} color="#A855F7" strokeWidth={2.5} />
        <Text style={{ fontSize: 20, fontWeight: "900", color: t.text }}>Study</Text>
      </>
    ),
    accent: "#A855F7",
  });
  return (
    <View style={{ flex: 1, backgroundColor: t.background, alignItems: "center", justifyContent: "center", padding: 32 }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>🚧</Text>
      <Text style={{ fontSize: 22, fontWeight: "900", color: t.text, textAlign: "center", marginBottom: 8 }}>Coming Soon</Text>
      <Text style={{ fontSize: 15, color: t.textMuted, textAlign: "center", lineHeight: 22 }}>Grammar study sessions will be available here soon.</Text>
    </View>
  );
}

export default function StudyScreen() {
  const { mode } = useAppMode();
  if (mode === "grammar") return <GrammarStudyPlaceholder />;
  return <StudyScreenInner />;
}
