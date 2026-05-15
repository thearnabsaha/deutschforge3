import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";

// Re-export Better Auth generated schema
export * from "./auth-schema";

// Words vocabulary table
export const words = sqliteTable("words", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  german: text("german").notNull(),          // canonical form WITHOUT article prefix
  displayGerman: text("display_german"),     // full display form e.g. "der Hund"
  english: text("english").notNull().default(""),
  partOfSpeech: text("part_of_speech").notNull().default("unknown"),
  gender: text("gender"),                    // der/die/das for nouns
  genderCategory: text("gender_category"),   // masculine/feminine/neutral
  cefrLevel: text("cefr_level"),             // A1/A2/B1/B2/C1/C2
  exampleSentence: text("example_sentence"),
  exampleTranslation: text("example_translation"),
  aiNotes: text("ai_notes"),               // AI-generated usage notes
  ipa: text("ipa"),                        // IPA pronunciation e.g. /ˈhʊnt/
  addedAt: integer("added_at").notNull().$defaultFn(() => Date.now()),
}, (t) => [
  index("words_user_id_idx").on(t.userId),
  index("words_user_pos_idx").on(t.userId, t.partOfSpeech),
  index("words_user_cefr_idx").on(t.userId, t.cefrLevel),
  index("words_user_gender_idx").on(t.userId, t.genderCategory),
  index("words_user_added_idx").on(t.userId, t.addedAt),
]);

// FSRS card state per word per user
export const cards = sqliteTable("cards", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  wordId: text("word_id").notNull(),
  due: integer("due").notNull().$defaultFn(() => Date.now()),
  stability: real("stability").notNull().default(0),
  difficulty: real("difficulty").notNull().default(0),
  elapsedDays: integer("elapsed_days").notNull().default(0),
  scheduledDays: integer("scheduled_days").notNull().default(0),
  reps: integer("reps").notNull().default(0),
  lapses: integer("lapses").notNull().default(0),
  state: integer("state").notNull().default(0), // 0=New,1=Learning,2=Review,3=Relearning
  lastReview: integer("last_review"),
  learningSteps: integer("learning_steps").notNull().default(0),
}, (t) => [
  index("cards_user_id_idx").on(t.userId),
  index("cards_user_due_idx").on(t.userId, t.due),
  index("cards_word_id_idx").on(t.wordId),
  index("cards_user_state_idx").on(t.userId, t.state),
]);

// Review log
export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  cardId: text("card_id").notNull(),
  rating: integer("rating").notNull(), // 1=Again,2=Hard,3=Good,4=Easy
  reviewedAt: integer("reviewed_at").notNull().$defaultFn(() => Date.now()),
  xpEarned: integer("xp_earned").notNull().default(0),
}, (t) => [
  index("reviews_user_id_idx").on(t.userId),
  index("reviews_user_reviewed_idx").on(t.userId, t.reviewedAt),
]);

// User stats / gamification
export const userStats = sqliteTable("user_stats", {
  userId: text("user_id").primaryKey(),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  streak: integer("streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: text("last_active_date"), // YYYY-MM-DD
  totalReviews: integer("total_reviews").notNull().default(0),
  dailyGoal: integer("daily_goal").notNull().default(20),
  todayReviews: integer("today_reviews").notNull().default(0),
  lastReviewDate: text("last_review_date"), // YYYY-MM-DD
});

// Earned badges
export const badges = sqliteTable("badges", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  badgeKey: text("badge_key").notNull(), // e.g. "first_word", "streak_7"
  earnedAt: integer("earned_at").notNull().$defaultFn(() => Date.now()),
}, (t) => [
  index("badges_user_id_idx").on(t.userId),
]);
