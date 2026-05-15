import { Hono } from "hono";
import { eq, and, lte, count } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { requireAuth } from "../middleware/auth";
import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  State,
  type Card as FSRSCard,
  type RecordLog,
} from "ts-fsrs";
import {
  XP_PER_RATING,
  getLevel,
  checkBadges,
} from "../lib/gamification";
import { createId } from "@paralleldrive/cuid2";
import type { AppEnv } from "../types";

const f = fsrs(generatorParameters({ enable_fuzz: true }));

// Convert DB card to FSRS Card
function toFSRSCard(dbCard: typeof schema.cards.$inferSelect): FSRSCard {
  const card = createEmptyCard();
  return {
    ...card,
    due: new Date(dbCard.due),
    stability: dbCard.stability,
    difficulty: dbCard.difficulty,
    elapsed_days: dbCard.elapsedDays,
    scheduled_days: dbCard.scheduledDays,
    reps: dbCard.reps,
    lapses: dbCard.lapses,
    state: dbCard.state as State,
    last_review: dbCard.lastReview ? new Date(dbCard.lastReview) : undefined,
    learning_steps: (dbCard as any).learningSteps ?? 0,
  };
}

const app = new Hono<AppEnv>()
  .use(requireAuth)

  // GET /api/review/due - get cards due for review today
  .get("/due", async (c) => {
    const user = c.get("user")!;
    const limit = parseInt(c.req.query("limit") ?? "20");

    const now = Date.now();

    const dueCards = await db
      .select({
        card: schema.cards,
        word: schema.words,
      })
      .from(schema.cards)
      .innerJoin(schema.words, eq(schema.cards.wordId, schema.words.id))
      .where(and(eq(schema.cards.userId, user.id), lte(schema.cards.due, now)))
      .limit(limit);

    return c.json({ cards: dueCards }, 200);
  })

  // GET /api/review/count - get count of due cards
  .get("/count", async (c) => {
    const user = c.get("user")!;
    const now = Date.now();

    const [row] = await db
      .select({ c: count() })
      .from(schema.cards)
      .where(and(eq(schema.cards.userId, user.id), lte(schema.cards.due, now)));

    return c.json({ count: row?.c ?? 0 }, 200);
  })

  // POST /api/review/submit - submit a card rating
  .post("/submit", async (c) => {
    const user = c.get("user")!;
    const body = await c.req.json() as {
      cardId: string;
      rating: number;
      sessionRatings?: number[]; // all ratings in this session so far
      sessionComplete?: boolean; // true when last card in session
    };
    const { cardId, rating, sessionRatings = [], sessionComplete = false } = body;

    // Validate rating
    if (![1, 2, 3, 4].includes(rating)) {
      return c.json({ error: "Invalid rating. Must be 1-4." }, 400);
    }

    // Get the card
    const [dbCard] = await db
      .select()
      .from(schema.cards)
      .where(and(eq(schema.cards.id, cardId), eq(schema.cards.userId, user.id)))
      .limit(1);

    if (!dbCard) return c.json({ error: "Card not found" }, 404);

    // Run FSRS scheduling
    const fsrsCard = toFSRSCard(dbCard);
    const now = new Date();

    // Map user rating (1-4) to FSRS Rating enum values (Again=1, Hard=2, Good=3, Easy=4)
    const fsrsRating = rating as Rating.Again | Rating.Hard | Rating.Good | Rating.Easy;
    const result: RecordLog = f.repeat(fsrsCard, now);
    const scheduled = result[fsrsRating];
    const updatedCard = scheduled.card;

    // Update card in DB
    await db
      .update(schema.cards)
      .set({
        due: updatedCard.due.getTime(),
        stability: updatedCard.stability,
        difficulty: updatedCard.difficulty,
        elapsedDays: updatedCard.elapsed_days,
        scheduledDays: updatedCard.scheduled_days,
        reps: updatedCard.reps,
        lapses: updatedCard.lapses,
        state: updatedCard.state,
        lastReview: now.getTime(),
        learningSteps: (updatedCard as any).learning_steps ?? 0,
      })
      .where(eq(schema.cards.id, cardId));

    // Award XP
    const xpEarned = XP_PER_RATING[rating] ?? 5;

    // Log review
    await db.insert(schema.reviews).values({
      id: createId(),
      userId: user.id,
      cardId,
      rating,
      xpEarned,
    });

    // Update user stats
    const today = new Date().toISOString().split("T")[0];
    const statsRows = await db
      .select()
      .from(schema.userStats)
      .where(eq(schema.userStats.userId, user.id))
      .limit(1);

    let stats = statsRows[0];
    let comebackAfterBreak = false;

    if (!stats) {
      await db.insert(schema.userStats).values({
        userId: user.id,
        xp: xpEarned,
        level: 1,
        streak: 1,
        longestStreak: 1,
        lastActiveDate: today,
        totalReviews: 1,
        dailyGoal: 20,
        todayReviews: 1,
        lastReviewDate: today,
      });

      const [newStats] = await db
        .select()
        .from(schema.userStats)
        .where(eq(schema.userStats.userId, user.id))
        .limit(1);
      stats = newStats;
    } else {
      let newStreak = stats.streak;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (stats.lastReviewDate === today) {
        // Same day
      } else if (stats.lastReviewDate === yesterdayStr) {
        newStreak = stats.streak + 1;
      } else {
        // Streak broken — check for comeback
        const lastDate = stats.lastReviewDate ? new Date(stats.lastReviewDate) : null;
        const daysSinceLast = lastDate
          ? Math.floor((Date.now() - lastDate.getTime()) / 86400000)
          : 0;
        if (daysSinceLast >= 7) comebackAfterBreak = true;
        newStreak = 1;
      }

      const todayReviews = stats.lastReviewDate === today ? stats.todayReviews + 1 : 1;
      const newXp = stats.xp + xpEarned;
      const newLevel = getLevel(newXp);
      const newLongestStreak = Math.max(stats.longestStreak, newStreak);

      await db
        .update(schema.userStats)
        .set({
          xp: newXp,
          level: newLevel,
          streak: newStreak,
          longestStreak: newLongestStreak,
          lastActiveDate: today,
          totalReviews: stats.totalReviews + 1,
          todayReviews,
          lastReviewDate: today,
        })
        .where(eq(schema.userStats.userId, user.id));

      const [updatedStats] = await db
        .select()
        .from(schema.userStats)
        .where(eq(schema.userStats.userId, user.id))
        .limit(1);
      stats = updatedStats;
    }

    // Gather badge params
    const [totalWordsRow] = await db
      .select({ c: count() })
      .from(schema.words)
      .where(eq(schema.words.userId, user.id));
    const wordCount = totalWordsRow?.c ?? 0;

    const existingBadges = await db
      .select()
      .from(schema.badges)
      .where(eq(schema.badges.userId, user.id));
    const existingBadgeKeys = existingBadges.map((b) => b.badgeKey);

    const dailyGoalCompleted = (stats?.todayReviews ?? 0) >= (stats?.dailyGoal ?? 20);

    // Session accuracy
    const allRatings = [...sessionRatings, rating];
    const goodCount = allRatings.filter((r) => r >= 3).length;
    const accuracyRate = allRatings.length > 0 ? goodCount / allRatings.length : 0;
    const perfectSession = sessionComplete && allRatings.length >= 5 && allRatings.every((r) => r === 4);
    const reviewsWithoutAgain = allRatings.every((r) => r > 1) ? allRatings.length : 0;

    // CEFR counts
    const allWords = await db
      .select({ cefrLevel: schema.words.cefrLevel, partOfSpeech: schema.words.partOfSpeech, genderCategory: schema.words.genderCategory })
      .from(schema.words)
      .where(eq(schema.words.userId, user.id));

    const a1Count = allWords.filter((w) => w.cefrLevel === "A1").length;
    const a2Count = allWords.filter((w) => w.cefrLevel === "A2").length;
    const b1Count = allWords.filter((w) => w.cefrLevel === "B1").length;
    const b2Count = allWords.filter((w) => w.cefrLevel === "B2").length;
    const c1Count = allWords.filter((w) => w.cefrLevel === "C1").length;
    const c2Count = allWords.filter((w) => w.cefrLevel === "C2").length;
    const nounCount = allWords.filter((w) => w.partOfSpeech === "noun").length;
    const verbCount = allWords.filter((w) => w.partOfSpeech === "verb").length;
    const adjCount = allWords.filter((w) => w.partOfSpeech === "adjective").length;
    const masculineCount = allWords.filter((w) => w.genderCategory === "masculine").length;
    const feminineCount = allWords.filter((w) => w.genderCategory === "feminine").length;
    const neutralCount = allWords.filter((w) => w.genderCategory === "neutral").length;

    const studyHour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    const studiedWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const newBadgeKeys = checkBadges({
      wordCount,
      totalReviews: stats?.totalReviews ?? 1,
      streak: stats?.streak ?? 1,
      level: stats?.level ?? 1,
      dailyGoalCompleted,
      existingBadgeKeys,
      perfectSession,
      sessionCardCount: allRatings.length,
      accuracyRate,
      reviewsWithoutAgain,
      a1Count, a2Count, b1Count, b2Count, c1Count, c2Count,
      nounCount, verbCount, adjCount,
      masculineCount, feminineCount, neutralCount,
      studyHour,
      studiedWeekend,
      comebackAfterBreak,
    });

    for (const key of newBadgeKeys) {
      await db.insert(schema.badges).values({
        id: createId(),
        userId: user.id,
        badgeKey: key,
      });
    }

    return c.json({
      xpEarned,
      nextDue: updatedCard.due.getTime(),
      scheduledDays: updatedCard.scheduled_days,
      stats,
      newBadges: newBadgeKeys,
    }, 200);
  });

export { app as reviewRoutes };
