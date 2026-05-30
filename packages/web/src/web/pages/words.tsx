import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Layout } from "../components/layout";
import { Plus, X, FolderPlus, Search, Check, Folder } from "lucide-react";

type Word = {
  id: string;
  german: string;
  displayGerman?: string | null;
  english: string;
  partOfSpeech: string | null;
  gender: string | null;
  genderCategory?: string | null;
  cefrLevel?: string | null;
  exampleSentence: string | null;
  exampleTranslation: string | null;
  aiNotes?: string | null;
  ipa?: string | null;
};

type WordSet = {
  id: string;
  name: string;
  wordIds: string[];
  wordCount: number;
  createdAt: number;
};

const POS_OPTIONS = ["all", "noun", "verb", "adjective", "adverb", "phrase", "other"];

const CEFR_COLORS: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-700",
  A2: "bg-green-100 text-green-700",
  B1: "bg-yellow-100 text-yellow-700",
  B2: "bg-orange-100 text-orange-700",
  C1: "bg-red-100 text-red-700",
  C2: "bg-purple-100 text-purple-700",
};

const GENDER_COLOR: Record<string, string> = {
  der: "bg-blue-100 text-blue-700",
  die: "bg-pink-100 text-pink-700",
  das: "bg-green-100 text-green-700",
};

// ── Word picker modal for adding words to a set ───────────────────────────────
function AddWordsToSetModal({
  set,
  allWords,
  isLoadingWords,
  onAdd,
  onClose,
  isPending,
}: {
  set: WordSet;
  allWords: Word[];
  isLoadingWords: boolean;
  onAdd: (wordIds: string[]) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const alreadyIn = new Set(set.wordIds);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allWords.filter(
      (w) =>
        !alreadyIn.has(w.id) &&
        (q === "" ||
          (w.displayGerman ?? w.german).toLowerCase().includes(q) ||
          w.english.toLowerCase().includes(q))
    );
  }, [search, allWords, set.wordIds]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Add words to "{set.name}"</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {filtered.length} available · {selected.size} selected
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search words..."
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Word list */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {isLoadingWords ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading words...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              {search ? "No matches" : "All words already in this set"}
            </div>
          ) : (
            filtered.map((word) => {
              const isSelected = selected.has(word.id);
              return (
                <button
                  key={word.id}
                  onClick={() => toggle(word.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-left transition-colors ${
                    isSelected ? "bg-indigo-50 border border-indigo-200" : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? "bg-indigo-600 border-indigo-600" : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Check size={10} strokeWidth={3} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {word.displayGerman ?? word.german}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{word.english}</p>
                  </div>
                  {word.cefrLevel && (
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${CEFR_COLORS[word.cefrLevel] ?? "bg-gray-100 text-gray-600"}`}>
                      {word.cefrLevel}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onAdd([...selected])}
            disabled={selected.size === 0 || isPending}
            className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Adding..." : `Add ${selected.size > 0 ? selected.size : ""} word${selected.size !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WordsPage() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [pos, setPos] = useState("all");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [newSetName, setNewSetName] = useState("");
  const [showNewSetInput, setShowNewSetInput] = useState(false);
  const [expandedWordId, setExpandedWordId] = useState<string | null>(null);
  const [showAddToSetModal, setShowAddToSetModal] = useState(false);
  // Per-word set dropdown (in All Words view)
  const [setDropdownWordId, setSetDropdownWordId] = useState<string | null>(null);
  const qc = useQueryClient();

  // ─── Queries ────────────────────────────────────────────────────
  const wordsQuery = useQuery({
    queryKey: ["words", pos, search],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (pos !== "all") params.pos = pos;
      if (search) params.search = search;
      const res = await api.words.$get({ query: params });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  // Fetch ALL words for the modal picker (no filters) — always enabled so modal has data instantly
  const allWordsQuery = useQuery({
    queryKey: ["words-all"],
    queryFn: async () => {
      const res = await api.words.$get({ query: {} });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 60_000,
  });

  const setsQuery = useQuery({
    queryKey: ["sets"],
    queryFn: async () => {
      const res = await fetch("/api/sets", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ sets: WordSet[] }>;
    },
  });

  // ─── Mutations ──────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: async (words: string) => {
      const res = await api.words.add.$post({ json: { words } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["words"] });
      qc.invalidateQueries({ queryKey: ["words-all"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["review-count"] });
      setInput("");
      const msgs = [];
      if (data.added?.length) msgs.push(`Added: ${data.added.map((w: Word) => w.displayGerman || w.german).join(", ")}`);
      if (data.skipped?.length) msgs.push(`Skipped (duplicates): ${data.skipped.join(", ")}`);
      setAddSuccess(msgs.join(" | "));
      setAddError("");
      setTimeout(() => setAddSuccess(""), 5000);
    },
    onError: () => setAddError("Failed to add words. Try again."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/words/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["words"] });
      qc.invalidateQueries({ queryKey: ["words-all"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["sets"] });
    },
  });

  const createSetMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/sets", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ set: WordSet }>;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["sets"] });
      setActiveSetId(data.set.id);
      setNewSetName("");
      setShowNewSetInput(false);
    },
  });

  const deleteSetMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sets/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["sets"] });
      if (activeSetId === id) setActiveSetId(null);
    },
  });

  const addToSetMutation = useMutation({
    mutationFn: async ({ setId, wordIds }: { setId: string; wordIds: string[] }) => {
      const res = await fetch(`/api/sets/${setId}/words`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordIds }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sets"] });
      setShowAddToSetModal(false);
      setSetDropdownWordId(null);
    },
  });

  const removeFromSetMutation = useMutation({
    mutationFn: async ({ setId, wordId }: { setId: string; wordId: string }) => {
      const res = await fetch(`/api/sets/${setId}/words/${wordId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sets"] });
      setSetDropdownWordId(null);
    },
  });

  // ─── Derived data ───────────────────────────────────────────────
  const allWords: Word[] = wordsQuery.data?.words ?? [];
  // allWordsForModal is always unfiltered — used both for modal picker AND for set word list
  const allWordsForModal: Word[] = allWordsQuery.data?.words ?? [];
  const sets: WordSet[] = setsQuery.data?.sets ?? [];
  const activeSet = sets.find((s) => s.id === activeSetId) ?? null;
  const activeSetWordIds = new Set(activeSet?.wordIds ?? []);
  // When viewing a set: use the unfiltered allWordsForModal as the source so set words always show
  // regardless of pos/search filters active in the sidebar
  const words = activeSet
    ? allWordsForModal.filter((w) => activeSetWordIds.has(w.id))
    : allWords;

  return (
    <Layout>
      {/* Add words to set modal */}
      {showAddToSetModal && activeSet && (
        <AddWordsToSetModal
          set={activeSet}
          allWords={allWordsForModal}
          isLoadingWords={allWordsQuery.isLoading}
          onAdd={(wordIds) => addToSetMutation.mutate({ setId: activeSet.id, wordIds })}
          onClose={() => setShowAddToSetModal(false)}
          isPending={addToSetMutation.isPending}
        />
      )}

      <div className="max-w-5xl flex gap-6">
        {/* ── Left: Sets Sidebar ──────────────────────────────── */}
        <div className="w-52 flex-shrink-0">
          <div className="sticky top-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Word Sets</h2>

            {/* All Words */}
            <button
              onClick={() => setActiveSetId(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium mb-1 transition-colors ${
                !activeSetId ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All Words
              <span className="ml-1 text-xs text-gray-400">({allWords.length})</span>
            </button>

            {/* Set list */}
            {sets.map((set) => (
              <div key={set.id} className="group relative">
                <button
                  onClick={() => setActiveSetId(set.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium mb-1 transition-colors pr-8 ${
                    activeSetId === set.id ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="truncate block">{set.name}</span>
                  <span className="text-xs text-gray-400">{set.wordCount} words</span>
                </button>
                <button
                  onClick={() => deleteSetMutation.mutate(set.id)}
                  className="absolute right-2 top-2.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete set"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {/* New set input */}
            {showNewSetInput ? (
              <div className="mt-2">
                <input
                  autoFocus
                  type="text"
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newSetName.trim()) createSetMutation.mutate(newSetName.trim());
                    if (e.key === "Escape") { setShowNewSetInput(false); setNewSetName(""); }
                  }}
                  placeholder="Set name..."
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex gap-1 mt-1">
                  <button
                    onClick={() => newSetName.trim() && createSetMutation.mutate(newSetName.trim())}
                    disabled={!newSetName.trim() || createSetMutation.isPending}
                    className="flex-1 text-xs bg-indigo-600 text-white py-1 rounded-md disabled:opacity-50"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => { setShowNewSetInput(false); setNewSetName(""); }}
                    className="flex-1 text-xs bg-gray-100 text-gray-600 py-1 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewSetInput(true)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors mt-1 flex items-center gap-1.5"
              >
                <FolderPlus size={14} />
                New Set
              </button>
            )}
          </div>
        </div>

        {/* ── Right: Main Content ─────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeSet ? activeSet.name : "My Words"}
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                {activeSet
                  ? `${words.length} word${words.length !== 1 ? "s" : ""} in this set`
                  : "Add German words and let AI fetch their meaning"}
              </p>
            </div>

            {/* Add words to set button — shown when viewing a set */}
            {activeSet && (
              <button
                onClick={() => setShowAddToSetModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
              >
                <Plus size={15} />
                Add Words
              </button>
            )}
          </div>

          {/* Add words input (only in All Words view) */}
          {!activeSet && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="font-semibold text-gray-800 mb-3">Add Words</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && input.trim()) addMutation.mutate(input.trim());
                  }}
                  placeholder="Hund, sich waschen, spielen..."
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => input.trim() && addMutation.mutate(input.trim())}
                  disabled={addMutation.isPending || !input.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                  {addMutation.isPending ? "Adding..." : "Add"}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Separate with commas. Supports reflexive verbs: "sich waschen"</p>
              {addSuccess && <p className="text-green-600 text-sm mt-2">{addSuccess}</p>}
              {addError && <p className="text-red-600 text-sm mt-2">{addError}</p>}
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 w-48">
              <Search size={14} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {POS_OPTIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPos(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                    pos === p ? "bg-indigo-600 text-white" : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Word list */}
          {wordsQuery.isLoading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : words.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-3">{activeSet ? "📂" : "📚"}</div>
              <p className="mb-4">
                {activeSet ? "No words in this set yet." : "No words yet. Add some German words above!"}
              </p>
              {activeSet && (
                <button
                  onClick={() => setShowAddToSetModal(true)}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={15} />
                  Add Words to Set
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {words.map((word: Word) => {
                const isExpanded = expandedWordId === word.id;
                const wordInSets = sets.filter((s) => s.wordIds.includes(word.id));
                const isDropdownOpen = setDropdownWordId === word.id;

                return (
                  <div key={word.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Main row */}
                    <div className="p-4 flex items-start justify-between gap-4">
                      <button
                        className="flex-1 min-w-0 text-left"
                        onClick={() => setExpandedWordId(isExpanded ? null : word.id)}
                      >
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-base font-bold text-gray-900">
                            {word.displayGerman || word.german}
                          </span>
                          {word.gender && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${GENDER_COLOR[word.gender] ?? "bg-gray-100 text-gray-600"}`}>
                              {word.gender}
                            </span>
                          )}
                          {word.partOfSpeech && word.partOfSpeech !== "unknown" && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                              {word.partOfSpeech}
                            </span>
                          )}
                          {word.cefrLevel && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CEFR_COLORS[word.cefrLevel] ?? "bg-gray-100 text-gray-600"}`}>
                              {word.cefrLevel}
                            </span>
                          )}
                          {wordInSets.length > 0 && (
                            <span className="text-xs text-indigo-400 flex items-center gap-1">
                              <Folder size={10} />
                              {wordInSets.map((s) => s.name).join(", ")}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{word.english}</p>
                      </button>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* If viewing a set — show inline remove button */}
                        {activeSet ? (
                          <button
                            onClick={() => removeFromSetMutation.mutate({ setId: activeSet.id, wordId: word.id })}
                            disabled={removeFromSetMutation.isPending}
                            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors flex items-center gap-1"
                            title="Remove from set"
                          >
                            <X size={12} />
                            Remove
                          </button>
                        ) : (
                          /* In All Words view — folder dropdown to assign to sets */
                          <div className="relative">
                            <button
                              onClick={() => setSetDropdownWordId(isDropdownOpen ? null : word.id)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isDropdownOpen || wordInSets.length > 0
                                  ? "border-indigo-300 text-indigo-500 bg-indigo-50"
                                  : "border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-500"
                              }`}
                              title="Manage sets"
                            >
                              <Folder size={14} />
                            </button>

                            {/* Set dropdown */}
                            {isDropdownOpen && (
                              <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-3 min-w-[160px]">
                                <p className="text-xs text-gray-400 mb-2 font-medium">Add to set:</p>
                                {sets.length === 0 ? (
                                  <p className="text-xs text-gray-400 py-1">No sets yet</p>
                                ) : (
                                  sets.map((set) => {
                                    const inSet = set.wordIds.includes(word.id);
                                    return (
                                      <button
                                        key={set.id}
                                        onClick={() => {
                                          if (inSet) {
                                            removeFromSetMutation.mutate({ setId: set.id, wordId: word.id });
                                          } else {
                                            addToSetMutation.mutate({ setId: set.id, wordIds: [word.id] });
                                          }
                                        }}
                                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left transition-colors mb-0.5 ${
                                          inSet
                                            ? "bg-indigo-50 text-indigo-700"
                                            : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                      >
                                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${inSet ? "bg-indigo-600 border-indigo-600" : "border-gray-300"}`}>
                                          {inSet && <Check size={8} strokeWidth={3} className="text-white" />}
                                        </div>
                                        <span className="truncate">{set.name}</span>
                                      </button>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Delete word */}
                        <button
                          onClick={() => deleteMutation.mutate(word.id)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors"
                          title="Delete word"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-2">
                        {word.ipa && (
                          <p className="text-sm text-gray-500 font-mono">{word.ipa}</p>
                        )}
                        {word.exampleSentence && (
                          <div>
                            <p className="text-sm text-gray-600 italic">"{word.exampleSentence}"</p>
                            {word.exampleTranslation && (
                              <p className="text-xs text-gray-400 mt-0.5">{word.exampleTranslation}</p>
                            )}
                          </div>
                        )}
                        {word.aiNotes && (
                          <p className="text-xs text-gray-500 bg-white rounded-lg px-3 py-2 border border-gray-200">
                            💡 {word.aiNotes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Close set dropdown on outside click */}
      {setDropdownWordId && (
        <div className="fixed inset-0 z-10" onClick={() => setSetDropdownWordId(null)} />
      )}
    </Layout>
  );
}
