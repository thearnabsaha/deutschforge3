import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Layout } from "../components/layout";

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

export default function WordsPage() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [pos, setPos] = useState("all");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [activeSetId, setActiveSetId] = useState<string | null>(null); // null = "All Words"
  const [newSetName, setNewSetName] = useState("");
  const [showNewSetInput, setShowNewSetInput] = useState(false);
  const [expandedWordId, setExpandedWordId] = useState<string | null>(null);
  const [addToSetWordId, setAddToSetWordId] = useState<string | null>(null);
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
    mutationFn: async ({ setId, wordId }: { setId: string; wordId: string }) => {
      const res = await fetch(`/api/sets/${setId}/words`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordIds: [wordId] }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sets"] });
      setAddToSetWordId(null);
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sets"] }),
  });

  // ─── Derived data ───────────────────────────────────────────────
  const allWords: Word[] = wordsQuery.data?.words ?? [];
  const sets: WordSet[] = setsQuery.data?.sets ?? [];

  // If a set is active, filter words to only those in the set
  const activeSet = sets.find((s) => s.id === activeSetId) ?? null;
  const activeSetWordIds = new Set(activeSet?.wordIds ?? []);

  const words = activeSet
    ? allWords.filter((w) => activeSetWordIds.has(w.id))
    : allWords;

  return (
    <Layout>
      <div className="max-w-5xl flex gap-6">
        {/* ── Left: Sets Sidebar ──────────────────────────────── */}
        <div className="w-52 flex-shrink-0">
          <div className="sticky top-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Word Sets</h2>

            {/* All Words */}
            <button
              onClick={() => setActiveSetId(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium mb-1 transition-colors ${
                !activeSetId
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100"
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
                    activeSetId === set.id
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="truncate block">{set.name}</span>
                  <span className="text-xs text-gray-400">{set.wordCount} words</span>
                </button>
                <button
                  onClick={() => deleteSetMutation.mutate(set.id)}
                  className="absolute right-2 top-2.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-base leading-none"
                  title="Delete set"
                >
                  ×
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
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors mt-1"
              >
                + New Set
              </button>
            )}
          </div>
        </div>

        {/* ── Right: Main Content ─────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {activeSet ? activeSet.name : "My Words"}
            </h1>
            <p className="text-gray-500 mt-1">
              {activeSet
                ? `${words.length} word${words.length !== 1 ? "s" : ""} in this set`
                : "Add German words and let AI fetch their meaning"}
            </p>
          </div>

          {/* Add words (only shown in All Words view) */}
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
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search words..."
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
            />
            <div className="flex gap-2 flex-wrap">
              {POS_OPTIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPos(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                    pos === p
                      ? "bg-indigo-600 text-white"
                      : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
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
              <p>
                {activeSet
                  ? "No words in this set yet. Add words from All Words view."
                  : "No words yet. Add some German words above!"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {words.map((word: Word) => {
                const isExpanded = expandedWordId === word.id;
                const isAddingToSet = addToSetWordId === word.id;
                const wordInSets = sets.filter((s) => s.wordIds.includes(word.id));

                return (
                  <div
                    key={word.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
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
                            <span className="text-xs text-indigo-400">
                              {wordInSets.map((s) => s.name).join(", ")}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{word.english}</p>
                      </button>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Add to set button */}
                        <button
                          onClick={() => setAddToSetWordId(isAddingToSet ? null : word.id)}
                          className="text-xs text-gray-400 hover:text-indigo-500 transition-colors px-1.5 py-1 rounded"
                          title="Add to set"
                        >
                          📂
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => deleteMutation.mutate(word.id)}
                          disabled={deleteMutation.isPending}
                          className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
                          title="Delete word"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    {/* Set picker dropdown */}
                    {isAddingToSet && sets.length > 0 && (
                      <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                        <p className="text-xs text-gray-400 mb-2">Add to set:</p>
                        <div className="flex flex-wrap gap-2">
                          {sets.map((set) => {
                            const inSet = set.wordIds.includes(word.id);
                            return (
                              <button
                                key={set.id}
                                onClick={() => {
                                  if (inSet) {
                                    removeFromSetMutation.mutate({ setId: set.id, wordId: word.id });
                                  } else {
                                    addToSetMutation.mutate({ setId: set.id, wordId: word.id });
                                  }
                                }}
                                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                                  inSet
                                    ? "bg-indigo-100 border-indigo-300 text-indigo-700"
                                    : "bg-white border-gray-300 text-gray-600 hover:border-indigo-300"
                                }`}
                              >
                                {inSet ? "✓ " : ""}{set.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {isAddingToSet && sets.length === 0 && (
                      <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 text-xs text-gray-400">
                        No sets yet — create one in the sidebar.
                      </div>
                    )}

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
    </Layout>
  );
}
