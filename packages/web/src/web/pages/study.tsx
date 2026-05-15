import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { api } from "../lib/api";
import { Layout } from "../components/layout";

type Card = {
  card: {
    id: string;
    wordId: string;
    state: number;
    reps: number;
  };
  word: {
    german: string;
    english: string;
    partOfSpeech: string | null;
    gender: string | null;
    exampleSentence: string | null;
    exampleTranslation: string | null;
  };
};

const RATINGS = [
  { value: 1, label: "Again", emoji: "😕", color: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200" },
  { value: 2, label: "Hard", emoji: "😐", color: "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200" },
  { value: 3, label: "Good", emoji: "🙂", color: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200" },
  { value: 4, label: "Easy", emoji: "😄", color: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200" },
];

export default function StudyPage() {
  const [flipped, setFlipped] = useState(false);
  const [sessionDone, setSessionDone] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  const dueQuery = useQuery({
    queryKey: ["due-cards"],
    queryFn: async () => {
      const res = await api.review.due.$get({ query: { limit: "20" } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const submitMutation = useMutation({
    mutationFn: async ({ cardId, rating }: { cardId: string; rating: number }) => {
      const res = await api.review.submit.$post({ json: { cardId, rating } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => {
      setXpGained((prev) => prev + (data.xpEarned ?? 0));
      setSessionDone((prev) => prev + 1);
      setFlipped(false);
      qc.invalidateQueries({ queryKey: ["due-cards"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["review-count"] });
    },
  });

  const cards: Card[] = dueQuery.data?.cards ?? [];
  const current = cards[0];

  if (dueQuery.isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>
      </Layout>
    );
  }

  if (!current) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto text-center py-20">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">All done!</h1>
          {sessionDone > 0 && (
            <p className="text-gray-500 mb-1">
              Reviewed <strong>{sessionDone}</strong> cards this session
            </p>
          )}
          {xpGained > 0 && (
            <p className="text-indigo-600 font-semibold mb-6">+{xpGained} XP earned</p>
          )}
          <p className="text-gray-400 mb-8">No more cards due right now. Come back later!</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/words")}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Add More Words
            </button>
            <button
              onClick={() => navigate("/")}
              className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const { word, card } = current;

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Study</h1>
          <div className="text-sm text-gray-500">
            {cards.length} card{cards.length !== 1 ? "s" : ""} remaining
          </div>
        </div>

        {/* Session stats */}
        {(sessionDone > 0 || xpGained > 0) && (
          <div className="flex gap-4 mb-4 text-sm">
            <span className="text-gray-500">Reviewed: <strong className="text-gray-800">{sessionDone}</strong></span>
            <span className="text-indigo-600 font-semibold">+{xpGained} XP</span>
          </div>
        )}

        {/* Flashcard */}
        <div
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 cursor-pointer select-none min-h-[280px] flex flex-col items-center justify-center"
          onClick={() => !flipped && setFlipped(true)}
        >
          {/* Front */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {word.gender && (
                <span className={`text-sm px-2 py-0.5 rounded-full font-medium ${
                  word.gender === "der" ? "bg-blue-100 text-blue-700" :
                  word.gender === "die" ? "bg-pink-100 text-pink-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  {word.gender}
                </span>
              )}
              {word.partOfSpeech && (
                <span className="text-sm px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">
                  {word.partOfSpeech}
                </span>
              )}
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-2">{word.german}</p>
            {!flipped && (
              <p className="text-gray-400 text-sm mt-4">Tap to reveal translation</p>
            )}
          </div>

          {/* Back */}
          {flipped && (
            <div className="text-center mt-6 pt-6 border-t border-gray-100 w-full">
              <p className="text-2xl font-semibold text-gray-700">{word.english}</p>
              {word.exampleSentence && (
                <p className="text-sm text-gray-400 mt-3 italic">
                  "{word.exampleSentence}"
                </p>
              )}
              {word.exampleTranslation && (
                <p className="text-sm text-gray-400">{word.exampleTranslation}</p>
              )}
            </div>
          )}
        </div>

        {/* Rating buttons */}
        {flipped && (
          <div className="mt-6">
            <p className="text-center text-sm text-gray-500 mb-3">How well did you remember?</p>
            <div className="grid grid-cols-4 gap-3">
              {RATINGS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => submitMutation.mutate({ cardId: card.id, rating: r.value })}
                  disabled={submitMutation.isPending}
                  className={`flex flex-col items-center py-3 px-2 rounded-xl border font-medium text-sm transition-colors disabled:opacity-60 ${r.color}`}
                >
                  <span className="text-xl mb-1">{r.emoji}</span>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {!flipped && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setFlipped(true)}
              className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Show Answer
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
