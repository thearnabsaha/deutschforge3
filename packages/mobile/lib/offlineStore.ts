/**
 * Offline store — all app data reads/writes go through here.
 * Writes to local SQLite first, then enqueues for server sync.
 * When online, data is also fetched from server and merged locally.
 */
import { getDb } from "./localDb";
import { enqueue } from "./syncQueue";
import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  State,
  type Card as FSRSCard,
} from "ts-fsrs";
import { createId } from "@paralleldrive/cuid2";

const f = fsrs(generatorParameters({ enable_fuzz: true }));

const XP_PER_RATING: Record<number, number> = { 1: 1, 2: 3, 3: 5, 4: 8 };

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocalWord {
  id: string;
  userId: string;
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
  addedAt: number;
  // Card fields joined
  reps: number | null;
  lapses: number | null;
  stability: number | null;
  state: number | null;
  due: number | null;
  cardId: string | null;
}

export interface LocalCard {
  id: string;
  userId: string;
  wordId: string;
  due: number;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: number;
  lastReview: number | null;
  learningSteps: number;
}

export interface LocalStats {
  userId: string;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  totalReviews: number;
  dailyGoal: number;
  todayReviews: number;
  lastReviewDate: string | null;
}

// ─── Words ────────────────────────────────────────────────────────────────────

export function getWords(
  userId: string,
  filters: {
    pos?: string;
    gender?: string;
    cefr?: string;
    search?: string;
  } = {}
): LocalWord[] {
  const db = getDb();

  let sql = `
    SELECT
      w.id, w.userId, w.german, w.displayGerman, w.english, w.partOfSpeech,
      w.gender, w.genderCategory, w.cefrLevel, w.exampleSentence,
      w.exampleTranslation, w.aiNotes, w.ipa, w.addedAt,
      c.id as cardId, c.reps, c.lapses, c.stability, c.state, c.due
    FROM words w
    LEFT JOIN cards c ON c.wordId = w.id AND c.userId = w.userId
    WHERE w.userId = ? AND w._deleted = 0
  `;
  const params: (string | number)[] = [userId];

  if (filters.pos && filters.pos !== "all") {
    sql += ` AND w.partOfSpeech = ?`;
    params.push(filters.pos);
  }
  if (filters.gender && filters.gender !== "all") {
    sql += ` AND w.genderCategory = ?`;
    params.push(filters.gender);
  }
  if (filters.cefr && filters.cefr !== "all") {
    sql += ` AND w.cefrLevel = ?`;
    params.push(filters.cefr);
  }
  if (filters.search) {
    sql += ` AND (lower(w.german) LIKE ? OR lower(w.english) LIKE ? OR lower(coalesce(w.displayGerman,'')) LIKE ?)`;
    const s = `%${filters.search.toLowerCase()}%`;
    params.push(s, s, s);
  }

  sql += ` ORDER BY w.addedAt DESC`;

  return db.getAllSync<LocalWord>(sql, params);
}

export function upsertWordLocally(word: Omit<LocalWord, "reps" | "lapses" | "stability" | "state" | "due" | "cardId">): void {
  const db = getDb();
  db.runSync(`
    INSERT INTO words (id, userId, german, displayGerman, english, partOfSpeech, gender, genderCategory,
      cefrLevel, exampleSentence, exampleTranslation, aiNotes, ipa, addedAt, _deleted, _synced)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1)
    ON CONFLICT(id) DO UPDATE SET
      german = excluded.german,
      displayGerman = excluded.displayGerman,
      english = excluded.english,
      partOfSpeech = excluded.partOfSpeech,
      gender = excluded.gender,
      genderCategory = excluded.genderCategory,
      cefrLevel = excluded.cefrLevel,
      exampleSentence = excluded.exampleSentence,
      exampleTranslation = excluded.exampleTranslation,
      aiNotes = excluded.aiNotes,
      ipa = excluded.ipa,
      _deleted = 0,
      _synced = 1
  `, [
    word.id, word.userId, word.german, word.displayGerman ?? null,
    word.english, word.partOfSpeech, word.gender ?? null,
    word.genderCategory ?? null, word.cefrLevel ?? null,
    word.exampleSentence ?? null, word.exampleTranslation ?? null,
    word.aiNotes ?? null, word.ipa ?? null, word.addedAt,
  ]);
}

/** Add words offline — creates a placeholder word and queues for server enrichment */
export function addWordOffline(userId: string, wordInput: string): { id: string; german: string }[] {
  const db = getDb();
  const terms = wordInput.split(",").map((w) => w.trim()).filter(Boolean);
  const created: { id: string; german: string }[] = [];

  for (const term of terms) {
    const existing = db.getFirstSync<{ id: string }>(
      `SELECT id FROM words WHERE userId = ? AND lower(german) = lower(?) AND _deleted = 0`,
      [userId, term]
    );
    if (existing) continue;

    const id = createId();
    db.runSync(`
      INSERT INTO words (id, userId, german, displayGerman, english, partOfSpeech, addedAt, _deleted, _synced)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)
    `, [id, userId, term, term, "(syncing...)", "unknown", Date.now()]);

    created.push({ id, german: term });
  }

  // Queue single op for all words
  if (created.length > 0) {
    enqueue({ type: "ADD_WORDS", payload: { words: wordInput } });
  }

  return created;
}

export function deleteWordLocally(userId: string, wordId: string): void {
  const db = getDb();
  db.runSync(`UPDATE words SET _deleted = 1, _synced = 0 WHERE id = ? AND userId = ?`, [wordId, userId]);
  enqueue({ type: "DELETE_WORD", payload: { id: wordId } });
}

// ─── Cards ────────────────────────────────────────────────────────────────────

export function upsertCardLocally(card: LocalCard): void {
  const db = getDb();
  db.runSync(`
    INSERT INTO cards (id, userId, wordId, due, stability, difficulty, elapsedDays,
      scheduledDays, reps, lapses, state, lastReview, learningSteps, _synced)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(id) DO UPDATE SET
      due = excluded.due,
      stability = excluded.stability,
      difficulty = excluded.difficulty,
      elapsedDays = excluded.elapsedDays,
      scheduledDays = excluded.scheduledDays,
      reps = excluded.reps,
      lapses = excluded.lapses,
      state = excluded.state,
      lastReview = excluded.lastReview,
      learningSteps = excluded.learningSteps,
      _synced = 1
  `, [
    card.id, card.userId, card.wordId, card.due, card.stability,
    card.difficulty, card.elapsedDays, card.scheduledDays, card.reps,
    card.lapses, card.state, card.lastReview ?? null, card.learningSteps,
  ]);
}

export function getDueCards(userId: string, limit = 20): Array<{ card: LocalCard; word: LocalWord }> {
  const db = getDb();
  const now = Date.now();

  const rows = db.getAllSync<{
    // card fields
    cId: string; cUserId: string; wordId: string; due: number;
    stability: number; difficulty: number; elapsedDays: number;
    scheduledDays: number; reps: number; lapses: number;
    state: number; lastReview: number | null; learningSteps: number;
    // word fields
    wId: string; german: string; displayGerman: string | null;
    english: string; partOfSpeech: string; gender: string | null;
    genderCategory: string | null; cefrLevel: string | null;
    exampleSentence: string | null; exampleTranslation: string | null;
    aiNotes: string | null; ipa: string | null; addedAt: number;
  }>(`
    SELECT
      c.id as cId, c.userId as cUserId, c.wordId, c.due, c.stability, c.difficulty,
      c.elapsedDays, c.scheduledDays, c.reps, c.lapses, c.state, c.lastReview, c.learningSteps,
      w.id as wId, w.german, w.displayGerman, w.english, w.partOfSpeech, w.gender,
      w.genderCategory, w.cefrLevel, w.exampleSentence, w.exampleTranslation,
      w.aiNotes, w.ipa, w.addedAt
    FROM cards c
    INNER JOIN words w ON w.id = c.wordId AND w._deleted = 0
    WHERE c.userId = ? AND c.due <= ?
    ORDER BY c.due ASC
    LIMIT ?
  `, [userId, now, limit]);

  return rows.map((r) => ({
    card: {
      id: r.cId, userId: r.cUserId, wordId: r.wordId, due: r.due,
      stability: r.stability, difficulty: r.difficulty, elapsedDays: r.elapsedDays,
      scheduledDays: r.scheduledDays, reps: r.reps, lapses: r.lapses,
      state: r.state, lastReview: r.lastReview, learningSteps: r.learningSteps,
    },
    word: {
      id: r.wId, userId: r.cUserId, german: r.german, displayGerman: r.displayGerman,
      english: r.english, partOfSpeech: r.partOfSpeech, gender: r.gender,
      genderCategory: r.genderCategory, cefrLevel: r.cefrLevel,
      exampleSentence: r.exampleSentence, exampleTranslation: r.exampleTranslation,
      aiNotes: r.aiNotes, ipa: r.ipa, addedAt: r.addedAt,
      cardId: r.cId, reps: r.reps, lapses: r.lapses, stability: r.stability,
      state: r.state, due: r.due,
    },
  }));
}

export function getDueCardCount(userId: string): number {
  const db = getDb();
  const row = db.getFirstSync<{ c: number }>(
    `SELECT COUNT(*) as c FROM cards c
     INNER JOIN words w ON w.id = c.wordId AND w._deleted = 0
     WHERE c.userId = ? AND c.due <= ?`,
    [userId, Date.now()]
  );
  return row?.c ?? 0;
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

/**
 * Submit a review locally — runs FSRS client-side, updates card, saves review, queues sync.
 */
export function submitReviewOffline(
  userId: string,
  cardId: string,
  rating: number,
  sessionRatings: number[],
  sessionComplete: boolean
): { xpEarned: number; nextDue: number; scheduledDays: number } {
  const db = getDb();

  // Load card
  const dbCard = db.getFirstSync<LocalCard>(
    `SELECT * FROM cards WHERE id = ? AND userId = ?`,
    [cardId, userId]
  );
  if (!dbCard) throw new Error("Card not found locally");

  // Run FSRS
  const fsrsCard: FSRSCard = {
    ...createEmptyCard(),
    due: new Date(dbCard.due),
    stability: dbCard.stability,
    difficulty: dbCard.difficulty,
    elapsed_days: dbCard.elapsedDays,
    scheduled_days: dbCard.scheduledDays,
    reps: dbCard.reps,
    lapses: dbCard.lapses,
    state: dbCard.state as State,
    last_review: dbCard.lastReview ? new Date(dbCard.lastReview) : undefined,
    learning_steps: dbCard.learningSteps,
  };

  const now = new Date();
  const result = f.next(fsrsCard, now, rating as any);
  const updatedCard = result.card;

  // Update card locally
  db.runSync(`
    UPDATE cards SET
      due = ?, stability = ?, difficulty = ?, elapsedDays = ?,
      scheduledDays = ?, reps = ?, lapses = ?, state = ?,
      lastReview = ?, learningSteps = ?, _synced = 0
    WHERE id = ? AND userId = ?
  `, [
    updatedCard.due.getTime(),
    updatedCard.stability,
    updatedCard.difficulty,
    updatedCard.elapsed_days,
    updatedCard.scheduled_days,
    updatedCard.reps,
    updatedCard.lapses,
    updatedCard.state,
    now.getTime(),
    (updatedCard as any).learning_steps ?? 0,
    cardId, userId,
  ]);

  // XP
  const xpEarned = XP_PER_RATING[rating] ?? 3;
  const today = now.toISOString().split("T")[0];

  // Save review locally
  const reviewId = createId();
  db.runSync(`
    INSERT INTO reviews (id, userId, cardId, rating, reviewedAt, xpEarned, _synced)
    VALUES (?, ?, ?, ?, ?, ?, 0)
  `, [reviewId, userId, cardId, rating, now.getTime(), xpEarned]);

  // Update local stats
  const statsRow = db.getFirstSync<LocalStats>(
    `SELECT * FROM userStats WHERE userId = ?`, [userId]
  );

  if (statsRow) {
    const todayReviews = statsRow.lastReviewDate === today
      ? statsRow.todayReviews + 1
      : 1;

    const lastDate = statsRow.lastActiveDate;
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak = statsRow.streak;
    if (lastDate === yesterdayStr) newStreak = statsRow.streak + 1;
    else if (lastDate !== today) newStreak = 1;

    const newLongest = Math.max(statsRow.longestStreak, newStreak);
    const newXp = statsRow.xp + xpEarned;
    // Simple level: every 100 XP
    const newLevel = Math.max(1, Math.floor(newXp / 100) + 1);

    db.runSync(`
      UPDATE userStats SET
        xp = ?, level = ?, streak = ?, longestStreak = ?,
        lastActiveDate = ?, totalReviews = ?, todayReviews = ?, lastReviewDate = ?,
        _synced = 0
      WHERE userId = ?
    `, [
      newXp, newLevel, newStreak, newLongest,
      today, statsRow.totalReviews + 1, todayReviews, today,
      userId,
    ]);
  } else {
    db.runSync(`
      INSERT INTO userStats (userId, xp, level, streak, longestStreak, lastActiveDate, totalReviews, dailyGoal, todayReviews, lastReviewDate, _synced)
      VALUES (?, ?, 1, 1, 1, ?, 1, 20, 1, ?, 0)
    `, [userId, xpEarned, today, today]);
  }

  // Enqueue
  enqueue({
    type: "SUBMIT_REVIEW",
    payload: {
      cardId, rating,
      reviewedAt: now.getTime(),
      xpEarned,
      sessionRatings,
      sessionComplete,
    },
  });

  return {
    xpEarned,
    nextDue: updatedCard.due.getTime(),
    scheduledDays: updatedCard.scheduled_days,
  };
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function getLocalStats(userId: string): LocalStats | null {
  const db = getDb();
  return db.getFirstSync<LocalStats>(`SELECT * FROM userStats WHERE userId = ?`, [userId]) ?? null;
}

export function upsertStatsLocally(stats: LocalStats): void {
  const db = getDb();
  db.runSync(`
    INSERT INTO userStats (userId, xp, level, streak, longestStreak, lastActiveDate,
      totalReviews, dailyGoal, todayReviews, lastReviewDate, _synced)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(userId) DO UPDATE SET
      xp = excluded.xp, level = excluded.level, streak = excluded.streak,
      longestStreak = excluded.longestStreak, lastActiveDate = excluded.lastActiveDate,
      totalReviews = excluded.totalReviews, dailyGoal = excluded.dailyGoal,
      todayReviews = excluded.todayReviews, lastReviewDate = excluded.lastReviewDate,
      _synced = 1
  `, [
    stats.userId, stats.xp, stats.level, stats.streak, stats.longestStreak,
    stats.lastActiveDate, stats.totalReviews, stats.dailyGoal,
    stats.todayReviews, stats.lastReviewDate,
  ]);
}

export function getLocalWordCount(userId: string): number {
  const db = getDb();
  const row = db.getFirstSync<{ c: number }>(
    `SELECT COUNT(*) as c FROM words WHERE userId = ? AND _deleted = 0`, [userId]
  );
  return row?.c ?? 0;
}
