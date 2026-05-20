/**
 * Learn Page — Zigzag path (web port from mobile learn.tsx)
 */
import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { GraduationCap, Flame, Star, Lock, CheckCircle2 } from "lucide-react";
import { SYLLABUS_UNITS, type SyllabusLevel, type SyllabusUnit } from "../lib/syllabusData";
import {
  loadProgress,
  isLevelUnlocked,
  isLessonUnlocked,
  getLevelCompletionPercent,
  getOverallPercent,
  type SyllabusProgress,
} from "../lib/syllabusProgress";

const ZIGZAG: Array<"left" | "center" | "right"> = [
  "center", "left", "center", "right",
  "center", "left", "center", "right",
];

type PathItem =
  | { type: "unit"; unit: SyllabusUnit; unitIndex: number }
  | { type: "level"; level: SyllabusLevel; unit: SyllabusUnit; levelIndexInUnit: number; globalIndex: number };

function buildPath(): PathItem[] {
  const items: PathItem[] = [];
  let globalIndex = 0;
  for (let ui = 0; ui < SYLLABUS_UNITS.length; ui++) {
    const unit = SYLLABUS_UNITS[ui];
    items.push({ type: "unit", unit, unitIndex: ui });
    for (let li = 0; li < unit.levels.length; li++) {
      items.push({ type: "level", level: unit.levels[li], unit, levelIndexInUnit: li, globalIndex: globalIndex++ });
    }
  }
  return items;
}

const PATH_ITEMS = buildPath();

const DEFAULT_PROGRESS: SyllabusProgress = {
  lessons: {},
  completedLessonIds: [],
  completedLevelIds: [],
  completedUnitIds: [],
  completedGrammarTopicIds: [],
  currentLessonId: null,
  learnedWordIds: [],
  xp: 0,
  streak: 0,
  lastStreakDate: null,
};

export default function LearnPage() {
  const [, navigate] = useLocation();
  const [progress, setProgress] = useState<SyllabusProgress>(DEFAULT_PROGRESS);

  const reload = useCallback(async () => {
    setProgress(await loadProgress());
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const overallPct = getOverallPercent(progress);
  let zigzagIdx = 0;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="flex items-center gap-2">
          <GraduationCap size={22} className="text-blue-500" strokeWidth={2.5} />
          <span className="text-xl font-black text-gray-900 dark:text-white">A1 Course</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 rounded-full px-3 py-1.5">
            <Star size={13} className="text-yellow-500 fill-yellow-500" strokeWidth={2.5} />
            <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">{progress.xp}</span>
          </div>
          <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 rounded-full px-3 py-1.5">
            <Flame size={13} className="text-orange-500 fill-orange-500" strokeWidth={2.5} />
            <span className="text-xs font-bold text-orange-700 dark:text-orange-400">{progress.streak}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1.5">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 font-semibold">
          {progress.completedLessonIds.length} lessons done · {overallPct}% complete
        </span>
      </div>

      {/* Scrollable path */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center py-4 pb-24 min-h-full">
          {PATH_ITEMS.map((item, itemIdx) => {
            if (item.type === "unit") {
              return (
                <div
                  key={item.unit.unitId}
                  className="flex items-center gap-3 mx-5 mt-7 mb-1 px-4 py-3.5 rounded-2xl border-2 w-full max-w-md"
                  style={{
                    borderColor: item.unit.color + "55",
                    backgroundColor: item.unit.color + "10",
                  }}
                >
                  <span className="text-3xl">{item.unit.icon}</span>
                  <div className="flex-1">
                    <div className="text-[10px] font-black tracking-wider text-gray-400 mb-0.5">
                      UNIT {item.unitIndex + 1}
                    </div>
                    <div className="text-base font-black text-gray-900 dark:text-white">{item.unit.title}</div>
                    <div className="text-xs font-medium text-gray-500 mt-0.5">{item.unit.subtitle}</div>
                  </div>
                </div>
              );
            }

            const { level, unit, levelIndexInUnit, globalIndex } = item;
            const unlocked = isLevelUnlocked(level.levelId, progress);
            const completed = progress.completedLevelIds.includes(level.levelId);
            const isActive = unlocked && !completed;
            const pct = getLevelCompletionPercent(level.levelId, progress);
            const side = ZIGZAG[zigzagIdx % ZIGZAG.length];
            zigzagIdx++;

            const prevItem = PATH_ITEMS[itemIdx - 1];
            const showConnector = prevItem?.type === "level";

            const alignClass =
              side === "left" ? "self-start ml-11" :
              side === "right" ? "self-end mr-11" :
              "self-center";

            return (
              <React.Fragment key={level.levelId}>
                {showConnector && (
                  <div
                    className="w-0.5 border-l-2 border-dashed my-0"
                    style={{
                      height: 40,
                      borderColor: unlocked ? unit.color + "66" : "#D0D0D033",
                    }}
                  />
                )}
                <div className={`flex flex-col items-center w-36 my-1 ${alignClass}`}>
                  {/* Pulse ring for active */}
                  <div
                    className={`rounded-full p-1 ${isActive ? "animate-pulse" : ""}`}
                    style={{ border: isActive ? `3px solid ${unit.color}55` : "3px solid transparent" }}
                  >
                    <button
                      onClick={() => {
                        if (!unlocked) return;
                        // In web, just show alert since lesson runner isn't ported yet
                        alert(`Starting: ${level.title}\nOpen the mobile app to take lessons!`);
                      }}
                      disabled={!unlocked}
                      className="w-20 h-20 rounded-full border-[3px] flex items-center justify-center transition-all"
                      style={{
                        backgroundColor: completed ? unit.color : unlocked ? unit.color + "20" : "#f3f4f6",
                        borderColor: unlocked ? unit.color : "#d1d5db",
                        boxShadow: isActive ? `0 4px 20px ${unit.color}55` : undefined,
                        cursor: unlocked ? "pointer" : "not-allowed",
                      }}
                    >
                      {completed ? (
                        <CheckCircle2 size={30} color="#fff" strokeWidth={2.5} />
                      ) : !unlocked ? (
                        <Lock size={26} color="#9ca3af" strokeWidth={2.5} />
                      ) : (
                        <span className="text-3xl">{unit.icon}</span>
                      )}
                    </button>
                  </div>

                  {/* Label */}
                  <div className="flex flex-col items-center mt-2 gap-0.5 w-full">
                    <span
                      className="text-[13px] font-extrabold text-center leading-tight"
                      style={{ color: unlocked ? undefined : "#9ca3af" }}
                    >
                      {level.title}
                    </span>
                    {unlocked && !completed && pct > 0 && (
                      <div className="h-1 w-[72px] bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: unit.color }}
                        />
                      </div>
                    )}
                    {unlocked && !completed && pct === 0 && (
                      <span className="text-[11px] font-bold" style={{ color: unit.color }}>5 lessons</span>
                    )}
                    {completed && (
                      <span className="text-[11px] font-bold" style={{ color: unit.color }}>Completed ✓</span>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          <div className="h-20" />
        </div>
      </div>
    </div>
  );
}
