import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, count, and, gte, sql, lte } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { requireAuth } from "../middleware/auth";
import { BADGE_DEFS, getXpForNextLevel, getXpForCurrentLevel } from "../lib/gamification";
import { createId } from "@paralleldrive/cuid2";

const app = new Hono<AppEnv>()
  .use(requireAuth)

  // GET /api/stats - get user stats
  .get("/", async (c) => {
    const user = c.get("user")!;
    const today = new Date().toISOString().split("T")[0];

    let statsRows = await db
      .select()
      .from(schema.userStats)
      .where(eq(schema.userStats.userId, user.id))
      .limit(1);

    if (statsRows.length === 0) {
      await db.insert(schema.userStats).values({
        userId: user.id,
        xp: 0, level: 1, streak: 0, longestStreak: 0,
        lastActiveDate: today, totalReviews: 0,
        dailyGoal: 20, todayReviews: 0, lastReviewDate: null,
      });
      statsRows = await db
        .select().from(schema.userStats)
        .where(eq(schema.userStats.userId, user.id)).limit(1);
    }

    const stats = statsRows[0];

    if (stats.lastReviewDate !== today) {
      await db.update(schema.userStats).set({ todayReviews: 0 })
        .where(eq(schema.userStats.userId, user.id));
      stats.todayReviews = 0;
    }

    const [wordCountRow] = await db.select({ c: count() }).from(schema.words)
      .where(eq(schema.words.userId, user.id));
    const wordCount = wordCountRow?.c ?? 0;

    const xpForCurrentLevel = getXpForCurrentLevel(stats.level);
    const xpForNextLevel = getXpForNextLevel(stats.level);

    return c.json({
      ...stats, wordCount, xpForCurrentLevel, xpForNextLevel,
      dailyGoalCompleted: stats.todayReviews >= stats.dailyGoal,
    }, 200);
  })

  // GET /api/stats/dashboard - rich analytics for dashboard screen
  .get("/dashboard", async (c) => {
    const user = c.get("user")!;
    const today = new Date().toISOString().split("T")[0];

    // Base stats
    const statsRows = await db.select().from(schema.userStats)
      .where(eq(schema.userStats.userId, user.id)).limit(1);
    const stats = statsRows[0] ?? {
      xp: 0, level: 1, streak: 0, longestStreak: 0, totalReviews: 0,
      dailyGoal: 20, todayReviews: 0, lastReviewDate: null,
    };

    // Run all aggregate queries in parallel — no full table scans in memory
    const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const yearAgo = Date.now() - 364 * 24 * 60 * 60 * 1000;

    const [
      cefrRows,
      genderRows,
      posRows,
      cardStateRows,
      totalWordsRow,
      totalCardsRow,
      masteredRow,
      recentReviews,
      ratingRows,
      recentWordRows,
      hardWordRows,
      yearReviewRows,
    ] = await Promise.all([
      // CEFR breakdown
      db.select({
        cefrLevel: sql<string>`coalesce(${schema.words.cefrLevel}, 'B1')`,
        cnt: count(),
      }).from(schema.words).where(eq(schema.words.userId, user.id))
        .groupBy(sql`coalesce(${schema.words.cefrLevel}, 'B1')`),

      // Gender breakdown
      db.select({
        genderCategory: sql<string>`coalesce(${schema.words.genderCategory}, 'none')`,
        cnt: count(),
      }).from(schema.words).where(eq(schema.words.userId, user.id))
        .groupBy(sql`coalesce(${schema.words.genderCategory}, 'none')`),

      // POS breakdown
      db.select({
        partOfSpeech: sql<string>`coalesce(${schema.words.partOfSpeech}, 'unknown')`,
        cnt: count(),
      }).from(schema.words).where(eq(schema.words.userId, user.id))
        .groupBy(sql`coalesce(${schema.words.partOfSpeech}, 'unknown')`),

      // Card states
      db.select({
        state: schema.cards.state,
        cnt: count(),
      }).from(schema.cards).where(eq(schema.cards.userId, user.id))
        .groupBy(schema.cards.state),

      // Total word count
      db.select({ c: count() }).from(schema.words).where(eq(schema.words.userId, user.id)),

      // Total card count
      db.select({ c: count() }).from(schema.cards).where(eq(schema.cards.userId, user.id)),

      // Mastered count (state=2)
      db.select({ c: count() }).from(schema.cards)
        .where(and(eq(schema.cards.userId, user.id), eq(schema.cards.state, 2))),

      // Recent 14-day reviews (needed for daily breakdown + rating dist)
      db.select({
        reviewedAt: schema.reviews.reviewedAt,
        xpEarned: schema.reviews.xpEarned,
        rating: schema.reviews.rating,
      }).from(schema.reviews).where(and(
        eq(schema.reviews.userId, user.id),
        gte(schema.reviews.reviewedAt, fourteenDaysAgo),
      )),

      // Rating distribution (14 days)
      db.select({
        rating: schema.reviews.rating,
        cnt: count(),
      }).from(schema.reviews).where(and(
        eq(schema.reviews.userId, user.id),
        gte(schema.reviews.reviewedAt, fourteenDaysAgo),
      )).groupBy(schema.reviews.rating),

      // Words added last 14 days (only addedAt + id needed)
      db.select({ addedAt: schema.words.addedAt })
        .from(schema.words).where(and(
          eq(schema.words.userId, user.id),
          gte(schema.words.addedAt, fourteenDaysAgo),
        )),

      // Hard words: top 20 by lapses, joined
      db.select({
        id: schema.words.id,
        german: schema.words.german,
        displayGerman: schema.words.displayGerman,
        english: schema.words.english,
        partOfSpeech: schema.words.partOfSpeech,
        cefrLevel: schema.words.cefrLevel,
        lapses: schema.cards.lapses,
        reps: schema.cards.reps,
        difficulty: schema.cards.difficulty,
      }).from(schema.cards)
        .innerJoin(schema.words, eq(schema.words.id, schema.cards.wordId))
        .where(and(
          eq(schema.cards.userId, user.id),
          gte(schema.cards.lapses, 2),
        ))
        .orderBy(sql`${schema.cards.lapses} desc`)
        .limit(20),

      // Year activity: only date + count (group by date string in JS — still single query)
      db.select({ reviewedAt: schema.reviews.reviewedAt })
        .from(schema.reviews).where(and(
          eq(schema.reviews.userId, user.id),
          gte(schema.reviews.reviewedAt, yearAgo),
        )),
    ]);

    // Assemble maps from aggregate rows
    const cefrMap: Record<string, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    for (const r of cefrRows) cefrMap[r.cefrLevel] = r.cnt;

    const genderMap: Record<string, number> = { masculine: 0, feminine: 0, neutral: 0, none: 0 };
    for (const r of genderRows) genderMap[r.genderCategory] = r.cnt;

    const posMap: Record<string, number> = {};
    for (const r of posRows) posMap[r.partOfSpeech] = r.cnt;

    const cardStates = { new: 0, learning: 0, review: 0, relearning: 0 };
    for (const r of cardStateRows) {
      if (r.state === 0) cardStates.new = r.cnt;
      else if (r.state === 1) cardStates.learning = r.cnt;
      else if (r.state === 2) cardStates.review = r.cnt;
      else if (r.state === 3) cardStates.relearning = r.cnt;
    }

    const totalWords = totalWordsRow[0]?.c ?? 0;
    const totalCards = totalCardsRow[0]?.c ?? 0;
    const masteredCount = masteredRow[0]?.c ?? 0;
    const masteryPct = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;

    // Daily reviews last 14 days
    const dailyReviews: { date: string; count: number; xp: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayStart = new Date(dateStr).getTime();
      const dayEnd = dayStart + 86400000;
      const dayRevs = recentReviews.filter((r) => r.reviewedAt >= dayStart && r.reviewedAt < dayEnd);
      dailyReviews.push({
        date: dateStr,
        count: dayRevs.length,
        xp: dayRevs.reduce((s, r) => s + r.xpEarned, 0),
      });
    }

    // Rating distribution from SQL aggregate
    const ratingMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const r of ratingRows) ratingMap[r.rating] = r.cnt;

    // Daily words added last 14 days
    const dailyWordsAdded: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayStart = new Date(dateStr).getTime();
      const dayEnd = dayStart + 86400000;
      dailyWordsAdded.push({
        date: dateStr,
        count: recentWordRows.filter((w) => w.addedAt >= dayStart && w.addedAt < dayEnd).length,
      });
    }

    // Dominant CEFR
    let dominantCefr = "A1";
    if (totalWords > 0) {
      let maxCount = 0;
      for (const [lvl, cnt] of Object.entries(cefrMap)) {
        if (cnt > maxCount) { maxCount = cnt; dominantCefr = lvl; }
      }
    }

    const xpForCurrentLevel = getXpForCurrentLevel(stats.level);
    const xpForNextLevel = getXpForNextLevel(stats.level);

    // Hard words already sorted + joined from SQL
    const hardWords = hardWordRows.map((w) => ({
      ...w,
      displayGerman: w.displayGerman ?? w.german,
    }));

    // 52-week activity heatmap
    const activityMap: Record<string, number> = {};
    for (const r of yearReviewRows) {
      const d = new Date(r.reviewedAt).toISOString().split("T")[0];
      activityMap[d] = (activityMap[d] ?? 0) + 1;
    }
    const weeklyActivity: { date: string; count: number }[] = [];
    for (let i = 363; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      weeklyActivity.push({ date: dateStr, count: activityMap[dateStr] ?? 0 });
    }

    return c.json({
      stats: { ...stats, xpForCurrentLevel, xpForNextLevel },
      totalWords,
      cefrBreakdown: cefrMap,
      genderBreakdown: genderMap,
      posBreakdown: posMap,
      cardStates,
      dailyReviews,
      dailyWordsAdded,
      ratingDistribution: ratingMap,
      dominantCefr,
      masteryPct,
      masteredCount,
      hardWords,
      weeklyActivity,
    }, 200);
  })

  // GET /api/stats/badges
  .get("/badges", async (c) => {
    const user = c.get("user")!;

    const earned = await db.select().from(schema.badges)
      .where(eq(schema.badges.userId, user.id));
    const earnedSet = new Set(earned.map((b) => b.badgeKey));

    const allBadges = BADGE_DEFS.map((def) => ({
      ...def,
      earned: earnedSet.has(def.key),
      earnedAt: earned.find((b) => b.badgeKey === def.key)?.earnedAt ?? null,
    }));

    return c.json({ badges: allBadges }, 200);
  })

  // DELETE /api/stats/reset - reset all profile stats, reviews, badges (keep words + cards)
  .delete("/reset", async (c) => {
    const user = c.get("user")!;

    // Delete reviews, badges, reset stats to zero
    await db.delete(schema.reviews).where(eq(schema.reviews.userId, user.id));
    await db.delete(schema.badges).where(eq(schema.badges.userId, user.id));
    await db.update(schema.userStats).set({
      xp: 0, level: 1, streak: 0, longestStreak: 0,
      totalReviews: 0, todayReviews: 0, lastReviewDate: null,
    }).where(eq(schema.userStats.userId, user.id));

    // Reset all cards to new state
    await db.update(schema.cards).set({
      due: Date.now(), stability: 0, difficulty: 0,
      elapsedDays: 0, scheduledDays: 0, reps: 0, lapses: 0, state: 0,
    }).where(eq(schema.cards.userId, user.id));

    return c.json({ success: true }, 200);
  })

  // PUT /api/stats/goal
  .put("/goal", async (c) => {
    const user = c.get("user")!;
    const body = await c.req.json() as { dailyGoal: number };

    if (body.dailyGoal < 5 || body.dailyGoal > 200) {
      return c.json({ error: "Daily goal must be between 5 and 200" }, 400);
    }

    await db.update(schema.userStats).set({ dailyGoal: body.dailyGoal })
      .where(eq(schema.userStats.userId, user.id));

    return c.json({ success: true }, 200);
  });

export { app as statsRoutes };
