import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, and, count, like, or, sql } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { requireAuth } from "../middleware/auth";
import { fetchWordInfo, stripArticle, stripReflexive } from "../lib/wiktionary";
import { enrichWordWithAI } from "../lib/ai-enrichment";
import { checkBadges } from "../lib/gamification";
import { createId } from "@paralleldrive/cuid2";

const app = new Hono<AppEnv>()
  .use(requireAuth)

  // GET /api/words - get all words for user (with card data joined)
  .get("/", async (c) => {
    const user = c.get("user")!;
    const pos = c.req.query("pos");
    const search = c.req.query("search");
    const gender = c.req.query("gender");    // masculine/feminine/neutral
    const cefr = c.req.query("cefr");        // A1/A2/B1/B2/C1/C2

    // Build WHERE conditions — push all filters into SQL
    const conditions = [eq(schema.words.userId, user.id)];
    if (pos && pos !== "all") {
      conditions.push(eq(schema.words.partOfSpeech, pos));
    }
    if (gender && gender !== "all") {
      conditions.push(eq(schema.words.genderCategory, gender));
    }
    if (cefr && cefr !== "all") {
      conditions.push(eq(schema.words.cefrLevel, cefr));
    }
    if (search) {
      const s = `%${search.toLowerCase()}%`;
      conditions.push(
        or(
          like(sql`lower(${schema.words.german})`, s),
          like(sql`lower(${schema.words.english})`, s),
          like(sql`lower(coalesce(${schema.words.displayGerman}, ''))`, s),
        )!
      );
    }

    // LEFT JOIN cards so we get reps/lapses/state — all filtering done in SQL
    const rows = await db
      .select({
        id: schema.words.id,
        userId: schema.words.userId,
        german: schema.words.german,
        displayGerman: schema.words.displayGerman,
        english: schema.words.english,
        partOfSpeech: schema.words.partOfSpeech,
        gender: schema.words.gender,
        genderCategory: schema.words.genderCategory,
        cefrLevel: schema.words.cefrLevel,
        exampleSentence: schema.words.exampleSentence,
        exampleTranslation: schema.words.exampleTranslation,
        aiNotes: schema.words.aiNotes,
        ipa: schema.words.ipa,
        addedAt: schema.words.addedAt,
        // Card fields
        reps: schema.cards.reps,
        lapses: schema.cards.lapses,
        stability: schema.cards.stability,
        state: schema.cards.state,
        due: schema.cards.due,
      })
      .from(schema.words)
      .leftJoin(schema.cards, eq(schema.cards.wordId, schema.words.id))
      .where(and(...conditions))
      .orderBy(sql`${schema.words.addedAt} desc`);

    return c.json({ words: rows }, 200);
  })

  // POST /api/words/add - add comma-separated words
  .post("/add", async (c) => {
    const user = c.get("user")!;
    const body = await c.req.json() as { words: string };
    const rawWords = body.words ?? "";

    const wordList = rawWords
      .split(",")
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    if (wordList.length === 0) {
      return c.json({ error: "No words provided" }, 400);
    }

    const addedWords = [];
    const skippedWords = [];

    // Get all existing words for this user once (for efficiency)
    const existingWords = await db
      .select({ german: schema.words.german })
      .from(schema.words)
      .where(eq(schema.words.userId, user.id));
    const existingSet = new Set(existingWords.map((w) => w.german.toLowerCase()));

    for (const raw of wordList) {
      // Strip article prefix: "der Hund" → { article: "der", base: "Hund" }
      const { article: inputArticle, base: articleStripped } = stripArticle(raw);

      // Strip reflexive prefix: "sich waschen" → { isReflexive: true, base: "waschen" }
      const { isReflexive, base, phrasal } = stripReflexive(articleStripped);

      // Canonical key for dedup — use full original (no article) to preserve "sich waschen" vs "waschen"
      const canonicalKey = articleStripped.toLowerCase();

      if (existingSet.has(canonicalKey)) {
        skippedWords.push(raw);
        continue;
      }

      // Fetch word info using the base verb (wiktionary doesn't know "sich waschen")
      const info = await fetchWordInfo(base);

      // For reflexive verbs wiktionary will return verb POS — force it if it didn't
      const effectivePOS = isReflexive ? "verb" : info.partOfSpeech;

      // AI enrichment: better meaning, examples, notes (runs once at add time)
      const aiData = await enrichWordWithAI(
        base,
        effectivePOS,
        info.english !== base ? info.english : null,
        { isReflexive, phrasal, originalInput: articleStripped },
      );

      // If user supplied article but wiktionary didn't find gender, use user's article
      let gender = info.gender;
      if (!gender && inputArticle) {
        const articleToGender: Record<string, string> = { der: "der", die: "die", das: "das" };
        gender = articleToGender[inputArticle] ?? null;
      }

      const genderCategory = gender === "der" ? "masculine"
        : gender === "die" ? "feminine"
        : gender === "das" ? "neutral"
        : info.genderCategory;

      // Build display form:
      // - reflexive verb: "sich waschen", "sich etwas kaufen" (preserve original input)
      // - noun with gender: "der Hund"
      // - otherwise: base word
      const displayGerman = isReflexive
        ? articleStripped                                    // preserve "sich waschen" / "sich etwas kaufen"
        : (effectivePOS === "noun" && gender)
          ? `${gender} ${base}`
          : base;

      // Merge: AI data wins over wiktionary for meaning/examples (better quality)
      const finalEnglish = aiData?.english || info.english || base;
      const finalExample = aiData?.exampleSentence || info.exampleSentence;
      const finalExampleTranslation = aiData?.exampleTranslation || info.exampleTranslation;
      const finalCefr = aiData?.cefrLevel || info.cefrLevel || "B1";

      const wordId = createId();
      const [word] = await db
        .insert(schema.words)
        .values({
          id: wordId,
          userId: user.id,
          german: articleStripped,   // canonical: "sich waschen" / "Hund" (no der/die/das)
          displayGerman,
          english: finalEnglish,
          partOfSpeech: effectivePOS,
          gender,
          genderCategory,
          cefrLevel: finalCefr,
          exampleSentence: finalExample,
          exampleTranslation: finalExampleTranslation,
          aiNotes: aiData?.notes ?? null,
          ipa: aiData?.ipa ?? null,
        })
        .returning();

      // Mark as added in dedup set (use full canonical: "sich waschen")
      existingSet.add(canonicalKey);

      // Create FSRS card for this word
      await db.insert(schema.cards).values({
        id: createId(),
        userId: user.id,
        wordId,
        due: Date.now(),
        stability: 0,
        difficulty: 0,
        elapsedDays: 0,
        scheduledDays: 0,
        reps: 0,
        lapses: 0,
        state: 0,
      });

      addedWords.push(word);
    }

    // Check badges — gather full word counts for CEFR/POS/gender badges
    const allUserWords = await db
      .select({
        cefrLevel: schema.words.cefrLevel,
        partOfSpeech: schema.words.partOfSpeech,
        genderCategory: schema.words.genderCategory,
      })
      .from(schema.words)
      .where(eq(schema.words.userId, user.id));

    const wordCount = allUserWords.length;

    // Count by CEFR
    const cefrCounts: Record<string, number> = {};
    const posCounts: Record<string, number> = {};
    const genderCounts: Record<string, number> = {};
    for (const w of allUserWords) {
      if (w.cefrLevel) cefrCounts[w.cefrLevel] = (cefrCounts[w.cefrLevel] ?? 0) + 1;
      if (w.partOfSpeech) posCounts[w.partOfSpeech] = (posCounts[w.partOfSpeech] ?? 0) + 1;
      if (w.genderCategory) genderCounts[w.genderCategory] = (genderCounts[w.genderCategory] ?? 0) + 1;
    }

    const existingBadges = await db
      .select()
      .from(schema.badges)
      .where(eq(schema.badges.userId, user.id));
    const existingBadgeKeys = existingBadges.map((b) => b.badgeKey);

    const statsRow = await db
      .select()
      .from(schema.userStats)
      .where(eq(schema.userStats.userId, user.id))
      .limit(1);

    const stats = statsRow[0];

    const newBadgeKeys = checkBadges({
      wordCount,
      totalReviews: stats?.totalReviews ?? 0,
      streak: stats?.streak ?? 0,
      level: stats?.level ?? 1,
      dailyGoalCompleted: false,
      existingBadgeKeys,
      // CEFR
      a1Count: cefrCounts["A1"] ?? 0,
      a2Count: cefrCounts["A2"] ?? 0,
      b1Count: cefrCounts["B1"] ?? 0,
      b2Count: cefrCounts["B2"] ?? 0,
      c1Count: cefrCounts["C1"] ?? 0,
      c2Count: cefrCounts["C2"] ?? 0,
      // POS variety
      nounCount: posCounts["noun"] ?? 0,
      verbCount: posCounts["verb"] ?? 0,
      adjCount: posCounts["adjective"] ?? 0,
      // Gender
      masculineCount: genderCounts["masculine"] ?? 0,
      feminineCount: genderCounts["feminine"] ?? 0,
      neutralCount: genderCounts["neutral"] ?? 0,
    });

    for (const key of newBadgeKeys) {
      await db.insert(schema.badges).values({
        id: createId(),
        userId: user.id,
        badgeKey: key,
      });
    }

    return c.json({ added: addedWords, skipped: skippedWords, newBadges: newBadgeKeys }, 200);
  })

  // DELETE /api/words/reset - delete ALL words, cards for the user
  .delete("/reset", async (c) => {
    const user = c.get("user")!;
    await db.delete(schema.cards).where(eq(schema.cards.userId, user.id));
    await db.delete(schema.words).where(eq(schema.words.userId, user.id));
    return c.json({ success: true }, 200);
  })

  // PUT /api/words/:id - update a word
  .put("/:id", async (c) => {
    const user = c.get("user")!;
    const { id } = c.req.param();
    const body = await c.req.json() as {
      english?: string;
      partOfSpeech?: string;
      gender?: string;
      genderCategory?: string;
      cefrLevel?: string;
      exampleSentence?: string;
      exampleTranslation?: string;
    };

    const [updated] = await db
      .update(schema.words)
      .set(body)
      .where(and(eq(schema.words.id, id), eq(schema.words.userId, user.id)))
      .returning();

    if (!updated) return c.json({ error: "Not found" }, 404);

    return c.json({ word: updated }, 200);
  })

  // DELETE /api/words/:id
  .delete("/:id", async (c) => {
    const user = c.get("user")!;
    const { id } = c.req.param();

    await db.delete(schema.cards).where(and(eq(schema.cards.wordId, id), eq(schema.cards.userId, user.id)));
    await db.delete(schema.words).where(and(eq(schema.words.id, id), eq(schema.words.userId, user.id)));

    return c.json({ success: true }, 200);
  });

export { app as wordsRoutes };
