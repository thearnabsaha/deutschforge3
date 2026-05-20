import { useState, useEffect } from "react";
import { Layout } from "../components/layout";
import {
  GRAMMAR_CHAPTERS,
  A2_GRAMMAR_CHAPTERS,
  B1_GRAMMAR_CHAPTERS,
  type GrammarChapter,
} from "../lib/grammarData";
import {
  loadGrammarProgress,
  recordChapterVisit as markChapterVisited,
  toggleChapterComplete,
  type GrammarProgress,
} from "../lib/grammarProgress";

const LEVELS = [
  { id: "a1", label: "A1", title: "Beginner", color: "#A855F7", chapters: GRAMMAR_CHAPTERS },
  { id: "a2", label: "A2", title: "Elementary", color: "#1CB0F6", chapters: A2_GRAMMAR_CHAPTERS },
  { id: "b1", label: "B1", title: "Intermediate", color: "#22C55E", chapters: B1_GRAMMAR_CHAPTERS },
];

function difficultyColor(d?: string) {
  if (d === "hard") return "#EF4444";
  if (d === "medium") return "#F59E0B";
  return "#22C55E";
}

function ChapterModal({ chapter, onClose, progress }: {
  chapter: GrammarChapter;
  onClose: () => void;
  progress: GrammarProgress | null;
}) {
  const [tab, setTab] = useState<"theory" | "examples" | "exercises">("theory");
  const done = !!progress?.chapters[chapter.id]?.completedAt;

  useEffect(() => {
    markChapterVisited(chapter.id);
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [chapter.id]);

  const handleComplete = async () => {
    await toggleChapterComplete(chapter.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full md:max-w-2xl md:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                Ch. {chapter.number}
              </span>
              {chapter.difficulty && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: difficultyColor(chapter.difficulty) + "22", color: difficultyColor(chapter.difficulty) }}>
                  {chapter.difficulty}
                </span>
              )}
              {done && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓ Done</span>}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{chapter.title}</h2>
            <p className="text-sm text-gray-500">{chapter.subtitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none p-1">×</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(["theory", "examples", "exercises"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors ${
                tab === t ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {tab === "theory" && (
            <div className="space-y-4">
              {chapter.explanation && (
                <div className="bg-indigo-50 rounded-xl p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">{chapter.explanation}</p>
                </div>
              )}
              {chapter.rule && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-amber-700 mb-1 uppercase tracking-wider">Rule</p>
                  <p className="text-sm text-gray-800 font-medium">{chapter.rule}</p>
                </div>
              )}
              {chapter.theory?.map((section, i) => (
                <div key={i} className="space-y-2">
                  <h3 className="font-bold text-gray-900">{section.heading}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{section.body}</p>
                </div>
              ))}
              {chapter.table && (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {chapter.table.headers.map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {chapter.table.rows.map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                          {row.map((cell, j) => (
                            <td key={j} className="px-3 py-2 text-gray-700">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {chapter.notes && chapter.notes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notes</p>
                  {chapter.notes.map((note, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
                      <p className="text-sm text-gray-600">{note}</p>
                    </div>
                  ))}
                </div>
              )}
              {chapter.summary && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-green-700 mb-1 uppercase tracking-wider">Summary</p>
                  <p className="text-sm text-gray-700">{chapter.summary}</p>
                </div>
              )}
            </div>
          )}

          {tab === "examples" && (
            <div className="space-y-3">
              {chapter.examples.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No examples yet</p>
              ) : chapter.examples.map((ex, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="font-semibold text-gray-900">{ex.de}</p>
                  <p className="text-sm text-gray-500 mt-1">{ex.en}</p>
                </div>
              ))}
              {chapter.mistakes && chapter.mistakes.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Common Mistakes</p>
                  {chapter.mistakes.map((m, i) => (
                    <div key={i} className="flex gap-2 bg-red-50 rounded-lg p-3 mb-2">
                      <span className="text-red-400 flex-shrink-0">✗</span>
                      <p className="text-sm text-gray-700">{m}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "exercises" && (
            <div className="space-y-4">
              {chapter.exercises.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No exercises yet</p>
              ) : chapter.exercises.map((ex, i) => (
                <ExerciseCard key={i} index={i} prompt={ex.prompt} answer={ex.answer} />
              ))}
              {chapter.speakingPrompts && chapter.speakingPrompts.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-2">Speaking Prompts</p>
                  {chapter.speakingPrompts.map((p, i) => (
                    <div key={i} className="flex gap-2 bg-purple-50 rounded-lg p-3 mb-2">
                      <span className="text-purple-400 flex-shrink-0">🎤</span>
                      <p className="text-sm text-gray-700">{p}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {!done && (
            <button
              onClick={handleComplete}
              className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              Mark as Done ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ExerciseCard({ index, prompt, answer }: { index: number; prompt: string; answer: string }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs font-bold text-gray-400 mb-2">Exercise {index + 1}</p>
      <p className="text-gray-800 font-medium mb-3">{prompt}</p>
      {revealed ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs font-bold text-green-600 mb-1">Answer</p>
          <p className="text-gray-800">{answer}</p>
        </div>
      ) : (
        <button
          onClick={() => setRevealed(true)}
          className="text-sm text-indigo-600 font-medium hover:underline"
        >
          Reveal answer →
        </button>
      )}
    </div>
  );
}

export default function GrammarPage() {
  const [selectedLevel, setSelectedLevel] = useState("a1");
  const [selectedChapter, setSelectedChapter] = useState<GrammarChapter | null>(null);
  const [progress, setProgress] = useState<GrammarProgress | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadGrammarProgress().then(setProgress);
  }, [selectedChapter]);

  const currentLevel = LEVELS.find((l) => l.id === selectedLevel)!;
  const chapters = currentLevel.chapters.filter(
    (c) => !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.subtitle.toLowerCase().includes(search.toLowerCase())
  );

  const totalDone = LEVELS.reduce((sum, lvl) => {
    return sum + lvl.chapters.filter((c) => progress?.chapters[c.id]?.completedAt).length;
  }, 0);
  const totalChapters = LEVELS.reduce((s, l) => s + l.chapters.length, 0);

  return (
    <Layout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">📖</span>
            <h1 className="text-2xl font-bold text-gray-900">Grammar</h1>
          </div>
          <p className="text-gray-500">
            {totalDone}/{totalChapters} chapters completed
          </p>
          {/* Overall progress bar */}
          <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-indigo-600 transition-all"
              style={{ width: `${totalChapters > 0 ? (totalDone / totalChapters) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Level tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {LEVELS.map((lvl) => {
            const done = lvl.chapters.filter((c) => progress?.chapters[c.id]?.completedAt).length;
            return (
              <button
                key={lvl.id}
                onClick={() => setSelectedLevel(lvl.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors border-2 ${
                  selectedLevel === lvl.id
                    ? "text-white border-transparent"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
                style={selectedLevel === lvl.id ? { backgroundColor: lvl.color, borderColor: lvl.color } : {}}
              >
                {lvl.label} · {lvl.title}
                <span className="ml-2 opacity-70 font-normal">{done}/{lvl.chapters.length}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chapters..."
            className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Chapter list */}
        <div className="space-y-2">
          {chapters.map((chapter) => {
            const done = !!progress?.chapters[chapter.id]?.completedAt;
            const visited = (progress?.chapters[chapter.id]?.visitCount ?? 0) > 0;
            return (
              <button
                key={chapter.id}
                onClick={() => setSelectedChapter(chapter)}
                className={`w-full text-left bg-white border rounded-xl px-4 py-3.5 flex items-center gap-3 hover:border-indigo-200 hover:shadow-sm transition-all group ${
                  done ? "border-green-200 bg-green-50/50" : "border-gray-200"
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: (done ? "#22C55E" : currentLevel.color) + "22", color: done ? "#22C55E" : currentLevel.color }}
                >
                  {done ? "✓" : String(chapter.number).padStart(2, "0")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-semibold truncate ${done ? "text-green-800" : "text-gray-900"}`}>{chapter.title}</p>
                    {chapter.difficulty && (
                      <span className="text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0" style={{ backgroundColor: difficultyColor(chapter.difficulty) + "22", color: difficultyColor(chapter.difficulty) }}>
                        {chapter.difficulty}
                      </span>
                    )}
                    {visited && !done && <span className="text-xs text-indigo-400">visited</span>}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{chapter.subtitle}</p>
                </div>
                <span className="text-gray-300 group-hover:text-indigo-400 transition-colors text-lg flex-shrink-0">›</span>
              </button>
            );
          })}
        </div>

        {chapters.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">🔍</div>
            <p>No chapters match "{search}"</p>
          </div>
        )}
      </div>

      {selectedChapter && (
        <ChapterModal
          chapter={selectedChapter}
          onClose={() => { setSelectedChapter(null); loadGrammarProgress().then(setProgress); }}
          progress={progress}
        />
      )}
    </Layout>
  );
}
