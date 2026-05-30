/**
 * Local SQLite database — mirrors Turso schema for offline-first support.
 * Uses expo-sqlite v16 (synchronous API via useSQLiteContext / openDatabaseSync).
 */
import * as SQLite from "expo-sqlite";

let _db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!_db) {
    _db = SQLite.openDatabaseSync("moinmoin.db");
  }
  return _db;
}

export function initLocalDb(): void {
  const db = getDb();

  db.execSync(`PRAGMA journal_mode = WAL;`);
  db.execSync(`PRAGMA foreign_keys = ON;`);

  // Words
  db.execSync(`
    CREATE TABLE IF NOT EXISTS words (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      german TEXT NOT NULL,
      displayGerman TEXT,
      english TEXT NOT NULL DEFAULT '',
      partOfSpeech TEXT NOT NULL DEFAULT 'unknown',
      gender TEXT,
      genderCategory TEXT,
      cefrLevel TEXT,
      exampleSentence TEXT,
      exampleTranslation TEXT,
      aiNotes TEXT,
      ipa TEXT,
      addedAt INTEGER NOT NULL,
      _deleted INTEGER NOT NULL DEFAULT 0,
      _synced INTEGER NOT NULL DEFAULT 1
    );
  `);

  // FSRS cards
  db.execSync(`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      wordId TEXT NOT NULL,
      due INTEGER NOT NULL,
      stability REAL NOT NULL DEFAULT 0,
      difficulty REAL NOT NULL DEFAULT 0,
      elapsedDays INTEGER NOT NULL DEFAULT 0,
      scheduledDays INTEGER NOT NULL DEFAULT 0,
      reps INTEGER NOT NULL DEFAULT 0,
      lapses INTEGER NOT NULL DEFAULT 0,
      state INTEGER NOT NULL DEFAULT 0,
      lastReview INTEGER,
      learningSteps INTEGER NOT NULL DEFAULT 0,
      _synced INTEGER NOT NULL DEFAULT 1
    );
  `);

  // Reviews (append-only)
  db.execSync(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      cardId TEXT NOT NULL,
      rating INTEGER NOT NULL,
      reviewedAt INTEGER NOT NULL,
      xpEarned INTEGER NOT NULL DEFAULT 0,
      _synced INTEGER NOT NULL DEFAULT 1
    );
  `);

  // User stats (single row per user)
  db.execSync(`
    CREATE TABLE IF NOT EXISTS userStats (
      userId TEXT PRIMARY KEY,
      xp INTEGER NOT NULL DEFAULT 0,
      level INTEGER NOT NULL DEFAULT 1,
      streak INTEGER NOT NULL DEFAULT 0,
      longestStreak INTEGER NOT NULL DEFAULT 0,
      lastActiveDate TEXT,
      totalReviews INTEGER NOT NULL DEFAULT 0,
      dailyGoal INTEGER NOT NULL DEFAULT 20,
      todayReviews INTEGER NOT NULL DEFAULT 0,
      lastReviewDate TEXT,
      _synced INTEGER NOT NULL DEFAULT 1
    );
  `);

  // Sync queue — pending operations to push to server
  db.execSync(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      op TEXT NOT NULL,
      payload TEXT NOT NULL,
      createdAt INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
      attempts INTEGER NOT NULL DEFAULT 0
    );
  `);

  // Indexes
  db.execSync(`CREATE INDEX IF NOT EXISTS idx_words_userId ON words(userId);`);
  db.execSync(`CREATE INDEX IF NOT EXISTS idx_cards_userId ON cards(userId);`);
  db.execSync(`CREATE INDEX IF NOT EXISTS idx_cards_due ON cards(userId, due);`);
  db.execSync(`CREATE INDEX IF NOT EXISTS idx_reviews_userId ON reviews(userId);`);
}

/** Wipe all user data from local DB on logout. */
export function clearLocalData(): void {
  try {
    const db = getDb();
    db.execSync(`DELETE FROM words;`);
    db.execSync(`DELETE FROM cards;`);
    db.execSync(`DELETE FROM reviews;`);
    db.execSync(`DELETE FROM userStats;`);
  } catch (e) {
    console.warn("[db] clearLocalData failed", e);
  }
}
