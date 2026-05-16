/**
 * DeutschForge Syllabus Progress Tracker
 * Hierarchy: Unit → Level → Lesson (5 lessons × 15q each)
 * Grammar detours: mid-level pit-stops that redirect to grammar screen then back.
 */

import { Storage } from "./storage";
import {
  SYLLABUS_UNITS,
  UNIT_MAP,
  LEVEL_MAP,
  LESSON_MAP,
  ALL_LEVELS,
  ALL_LESSONS,
  getLevelUnit,
  getLessonLevel,
  type SyllabusUnit,
  type SyllabusLevel,
  type SyllabusLesson,
} from "./syllabusData";

const STORAGE_KEY = "syllabus_progress_v2";

// ─── Progress shape ───────────────────────────────────────────────────────────

export interface LessonProgress {
  completed: boolean;
  stars: number;      // 0–3 based on score
  bestScore: number;  // 0–15
  attempts: number;
}

export interface SyllabusProgress {
  // granular lesson progress
  lessons: Record<string, LessonProgress>; // lessonId → progress

  // completed sets (derived but cached for speed)
  completedLessonIds: string[];
  completedLevelIds: string[];
  completedUnitIds: string[];

  // grammar detours completed
  completedGrammarTopicIds: string[];

  // current position (what to highlight as "active")
  currentLessonId: string | null;

  // words learned = all words in completed levels
  learnedWordIds: string[];

  // gamification
  xp: number;
  streak: number;
  lastStreakDate: string | null; // ISO date YYYY-MM-DD
}

const DEFAULT_PROGRESS: SyllabusProgress = {
  lessons: {},
  completedLessonIds: [],
  completedLevelIds: [],
  completedUnitIds: [],
  completedGrammarTopicIds: [],
  currentLessonId: SYLLABUS_UNITS[0]?.levels[0]?.lessons[0]?.lessonId ?? null,
  learnedWordIds: [],
  xp: 0,
  streak: 0,
  lastStreakDate: null,
};

// ─── Storage ──────────────────────────────────────────────────────────────────

export async function loadProgress(): Promise<SyllabusProgress> {
  try {
    const raw = await Storage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export async function saveProgress(p: SyllabusProgress): Promise<void> {
  await Storage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export async function resetProgress(): Promise<SyllabusProgress> {
  await Storage.removeItem(STORAGE_KEY);
  return { ...DEFAULT_PROGRESS };
}

// ─── Unlock logic ─────────────────────────────────────────────────────────────

/** First lesson of first level of first unit is always unlocked */
export function isLessonUnlocked(lessonId: string, p: SyllabusProgress): boolean {
  const lesson = LESSON_MAP[lessonId];
  if (!lesson) return false;

  const level = getLessonLevel(lessonId);
  if (!level) return false;

  const unit = getLevelUnit(level.levelId);
  if (!unit) return false;

  // First lesson of entire course is always unlocked
  const firstLesson = SYLLABUS_UNITS[0]?.levels[0]?.lessons[0];
  if (firstLesson && lessonId === firstLesson.lessonId) return true;

  // A lesson is unlocked if the previous lesson in its level is completed
  const lessonIdx = level.lessons.findIndex((l) => l.lessonId === lessonId);

  if (lessonIdx === 0) {
    // First lesson of this level — level must be unlocked
    return isLevelUnlocked(level.levelId, p);
  }

  // Check if there's a grammar detour BEFORE this lesson
  if (level.grammarDetour && lessonIdx > level.grammarDetour.afterLessonIndex) {
    // Lessons after the detour require grammar topic to be completed
    const grammarDone = p.completedGrammarTopicIds.includes(level.grammarDetour.topicId);
    if (!grammarDone) return false;
  }

  const prevLesson = level.lessons[lessonIdx - 1];
  return p.completedLessonIds.includes(prevLesson.lessonId);
}

export function isLevelUnlocked(levelId: string, p: SyllabusProgress): boolean {
  const level = LEVEL_MAP[levelId];
  if (!level) return false;

  const unit = getLevelUnit(levelId);
  if (!unit) return false;

  // First level of first unit always unlocked
  if (unit.unitId === SYLLABUS_UNITS[0].unitId && level.levelNumber === 1) return true;

  const levelIdx = unit.levels.findIndex((lv) => lv.levelId === levelId);

  if (levelIdx === 0) {
    // First level of this unit — previous unit must be completed
    const unitIdx = SYLLABUS_UNITS.findIndex((u) => u.unitId === unit.unitId);
    if (unitIdx === 0) return true;
    const prevUnit = SYLLABUS_UNITS[unitIdx - 1];
    return p.completedUnitIds.includes(prevUnit.unitId);
  }

  const prevLevel = unit.levels[levelIdx - 1];
  return p.completedLevelIds.includes(prevLevel.levelId);
}

export function isUnitUnlocked(unitId: string, p: SyllabusProgress): boolean {
  const unitIdx = SYLLABUS_UNITS.findIndex((u) => u.unitId === unitId);
  if (unitIdx === 0) return true;
  const prevUnit = SYLLABUS_UNITS[unitIdx - 1];
  return p.completedUnitIds.includes(prevUnit.unitId);
}

export function isGrammarDetourRequired(levelId: string, lessonIndex: number, p: SyllabusProgress): boolean {
  const level = LEVEL_MAP[levelId];
  if (!level?.grammarDetour) return false;
  if (lessonIndex !== level.grammarDetour.afterLessonIndex) return false; // only show right after that lesson
  return !p.completedGrammarTopicIds.includes(level.grammarDetour.topicId);
}

// A grammar topic is "unlocked" if at least one level has that detour AND
// the lesson before the detour has been started (or topic already completed).
export function isGrammarTopicUnlocked(topicId: string, p: SyllabusProgress): boolean {
  // Check if any level has this grammar detour
  const levelWithDetour = ALL_LEVELS.find((lv) => lv.grammarDetour?.topicId === topicId);
  if (!levelWithDetour) return true; // orphan topic, always show
  // Unlocked if the level itself is unlocked
  return isLevelUnlocked(levelWithDetour.levelId, p) || p.completedGrammarTopicIds.includes(topicId);
}

export function isGrammarTopicCompleted(topicId: string, p: SyllabusProgress): boolean {
  return p.completedGrammarTopicIds.includes(topicId);
}

// ─── Completion actions ────────────────────────────────────────────────────────

export async function completeLesson(
  lessonId: string,
  score: number, // 0–15
  p: SyllabusProgress
): Promise<SyllabusProgress> {
  const xpGain = score * 10; // 10xp per correct answer
  const stars = score >= 13 ? 3 : score >= 9 ? 2 : score >= 6 ? 1 : 0;

  const existing = p.lessons[lessonId] ?? { completed: false, stars: 0, bestScore: 0, attempts: 0 };
  const updated: LessonProgress = {
    completed: true,
    stars: Math.max(existing.stars, stars),
    bestScore: Math.max(existing.bestScore, score),
    attempts: existing.attempts + 1,
  };

  const newCompleted = p.completedLessonIds.includes(lessonId)
    ? p.completedLessonIds
    : [...p.completedLessonIds, lessonId];

  let next = { ...p, lessons: { ...p.lessons, [lessonId]: updated }, completedLessonIds: newCompleted, xp: p.xp + xpGain };

  // Check if level is now complete
  const level = getLessonLevel(lessonId);
  if (level) {
    const allLessonsDone = level.lessons.every((l) => next.completedLessonIds.includes(l.lessonId));
    if (allLessonsDone && !next.completedLevelIds.includes(level.levelId)) {
      next.completedLevelIds = [...next.completedLevelIds, level.levelId];
      next.xp += 50; // bonus for completing a level

      // Mark words learned
      const unit = getLevelUnit(level.levelId);
      if (unit) {
        const wordIds = unit.words.map((w) => w.id);
        const newWordIds = wordIds.filter((id) => !next.learnedWordIds.includes(id));
        next.learnedWordIds = [...next.learnedWordIds, ...newWordIds];
      }

      // Check if unit is now complete
      const unit2 = getLevelUnit(level.levelId);
      if (unit2) {
        const allLevelsDone = unit2.levels.every((lv) => next.completedLevelIds.includes(lv.levelId));
        if (allLevelsDone && !next.completedUnitIds.includes(unit2.unitId)) {
          next.completedUnitIds = [...next.completedUnitIds, unit2.unitId];
          next.xp += 200; // bonus for completing a unit
        }
      }
    }
  }

  // Advance current lesson
  next.currentLessonId = getNextLessonId(lessonId, next) ?? lessonId;

  // Update streak
  const today = new Date().toISOString().slice(0, 10);
  if (next.lastStreakDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    next.streak = next.lastStreakDate === yesterday ? next.streak + 1 : 1;
    next.lastStreakDate = today;
  }

  await saveProgress(next);
  return next;
}

export async function completeGrammarTopic(
  topicId: string,
  p: SyllabusProgress
): Promise<SyllabusProgress> {
  if (p.completedGrammarTopicIds.includes(topicId)) return p;
  const next: SyllabusProgress = {
    ...p,
    completedGrammarTopicIds: [...p.completedGrammarTopicIds, topicId],
    xp: p.xp + 100,
  };
  await saveProgress(next);
  return next;
}

// ─── Navigation helpers ────────────────────────────────────────────────────────

/** Returns the next logical lesson ID after completing lessonId */
function getNextLessonId(lessonId: string, p: SyllabusProgress): string | null {
  const level = getLessonLevel(lessonId);
  if (!level) return null;

  const lessonIdx = level.lessons.findIndex((l) => l.lessonId === lessonId);

  // Has more lessons in this level?
  if (lessonIdx < level.lessons.length - 1) {
    const nextLesson = level.lessons[lessonIdx + 1];
    // Check grammar detour — don't advance past it until grammar is done
    if (level.grammarDetour && lessonIdx === level.grammarDetour.afterLessonIndex) {
      if (!p.completedGrammarTopicIds.includes(level.grammarDetour.topicId)) {
        return nextLesson.lessonId; // still return it — the UI will show the detour banner
      }
    }
    return nextLesson.lessonId;
  }

  // Level complete — move to next level
  const unit = getLevelUnit(level.levelId);
  if (!unit) return null;

  const levelIdx = unit.levels.findIndex((lv) => lv.levelId === level.levelId);
  if (levelIdx < unit.levels.length - 1) {
    return unit.levels[levelIdx + 1].lessons[0].lessonId;
  }

  // Unit complete — move to next unit
  const unitIdx = SYLLABUS_UNITS.findIndex((u) => u.unitId === unit.unitId);
  if (unitIdx < SYLLABUS_UNITS.length - 1) {
    return SYLLABUS_UNITS[unitIdx + 1].levels[0].lessons[0].lessonId;
  }

  return null; // course complete!
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function getLessonProgress(lessonId: string, p: SyllabusProgress): LessonProgress {
  return p.lessons[lessonId] ?? { completed: false, stars: 0, bestScore: 0, attempts: 0 };
}

export function getLevelCompletionPercent(levelId: string, p: SyllabusProgress): number {
  const level = LEVEL_MAP[levelId];
  if (!level) return 0;
  const done = level.lessons.filter((l) => p.completedLessonIds.includes(l.lessonId)).length;
  return Math.round((done / level.lessons.length) * 100);
}

export function getUnitCompletionPercent(unitId: string, p: SyllabusProgress): number {
  const unit = UNIT_MAP[unitId];
  if (!unit) return 0;
  const allLessons = unit.levels.flatMap((lv) => lv.lessons);
  const done = allLessons.filter((l) => p.completedLessonIds.includes(l.lessonId)).length;
  return Math.round((done / allLessons.length) * 100);
}

export interface LearnedWordGroup {
  unitId: string;
  unitTitle: string;
  color: string;
  words: { id: string; german: string; english: string; article?: string; plural?: string; example_de?: string; example_en?: string }[];
}

export function getLearnedWords(p: SyllabusProgress): LearnedWordGroup[] {
  const learnedSet = new Set(p.learnedWordIds);
  return SYLLABUS_UNITS.map((unit) => {
    const words = unit.words
      .filter((w) => learnedSet.has(w.id))
      .map((w) => ({ id: w.id, german: w.german, english: w.english, article: w.article, plural: w.plural, example_de: w.example_de, example_en: w.example_en }));
    return { unitId: unit.unitId, unitTitle: unit.title, color: unit.color, words };
  }).filter((g) => g.words.length > 0);
}

export function getOverallPercent(p: SyllabusProgress): number {
  const total = ALL_LESSONS.length;
  if (total === 0) return 0;
  return Math.round((p.completedLessonIds.length / total) * 100);
}
