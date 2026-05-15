import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Layout } from "../components/layout";

type Word = {
  id: string;
  german: string;
  english: string;
  partOfSpeech: string | null;
  gender: string | null;
  exampleSentence: string | null;
  exampleTranslation: string | null;
};

const POS_OPTIONS = ["all", "noun", "verb", "adjective", "adverb", "phrase", "other"];

export default function WordsPage() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [pos, setPos] = useState("all");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const qc = useQueryClient();

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
      if (data.added?.length) msgs.push(`Added: ${data.added.map((w: Word) => w.german).join(", ")}`);
      if (data.skipped?.length) msgs.push(`Skipped (duplicates): ${data.skipped.join(", ")}`);
      setAddSuccess(msgs.join(" | "));
      setAddError("");
      setTimeout(() => setAddSuccess(""), 4000);
    },
    onError: () => {
      setAddError("Failed to add words. Try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/words/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["words"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  const words = wordsQuery.data?.words ?? [];

  const GENDER_COLOR: Record<string, string> = {
    der: "bg-blue-100 text-blue-700",
    die: "bg-pink-100 text-pink-700",
    das: "bg-green-100 text-green-700",
  };

  return (
    <Layout>
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Words</h1>
          <p className="text-gray-500 mt-1">Add German words and let AI fetch their meaning</p>
        </div>

        {/* Add words */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">Add Words</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim()) {
                  addMutation.mutate(input.trim());
                }
              }}
              placeholder="Hund, Katze, spielen..."
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
          <p className="text-xs text-gray-400 mt-2">Separate multiple words with commas</p>
          {addSuccess && <p className="text-green-600 text-sm mt-2">{addSuccess}</p>}
          {addError && <p className="text-red-600 text-sm mt-2">{addError}</p>}
        </div>

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
            <div className="text-5xl mb-3">📚</div>
            <p>No words yet. Add some German words above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {words.map((word: Word) => (
              <div
                key={word.id}
                className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-lg font-bold text-gray-900">{word.german}</span>
                    {word.gender && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${GENDER_COLOR[word.gender] ?? "bg-gray-100 text-gray-600"}`}>
                        {word.gender}
                      </span>
                    )}
                    {word.partOfSpeech && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                        {word.partOfSpeech}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{word.english}</p>
                  {word.exampleSentence && (
                    <p className="text-sm text-gray-400 mt-1 italic">
                      "{word.exampleSentence}" — {word.exampleTranslation}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteMutation.mutate(word.id)}
                  disabled={deleteMutation.isPending}
                  className="text-gray-300 hover:text-red-500 transition-colors text-lg flex-shrink-0"
                  title="Delete word"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
