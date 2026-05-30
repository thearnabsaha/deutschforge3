import { Hono } from "hono";
import type { AppEnv } from "../types";
import { eq, and } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { requireAuth } from "../middleware/auth";
import { createId } from "@paralleldrive/cuid2";

const app = new Hono<AppEnv>()
  .use(requireAuth)

  // GET /api/sets — list all sets for user (with word count)
  .get("/", async (c) => {
    const user = c.get("user")!;

    const sets = await db
      .select()
      .from(schema.wordSets)
      .where(eq(schema.wordSets.userId, user.id))
      .orderBy(schema.wordSets.createdAt);

    // For each set, get member word IDs
    const setIds = sets.map((s) => s.id);
    const members = setIds.length > 0
      ? await db
          .select({
            setId: schema.wordSetMembers.setId,
            wordId: schema.wordSetMembers.wordId,
          })
          .from(schema.wordSetMembers)
          .where(eq(schema.wordSetMembers.userId, user.id))
      : [];

    // Group by setId
    const memberMap: Record<string, string[]> = {};
    for (const m of members) {
      if (!memberMap[m.setId]) memberMap[m.setId] = [];
      memberMap[m.setId].push(m.wordId);
    }

    const result = sets.map((s) => ({
      ...s,
      wordIds: memberMap[s.id] ?? [],
      wordCount: (memberMap[s.id] ?? []).length,
    }));

    return c.json({ sets: result }, 200);
  })

  // POST /api/sets — create a set
  .post("/", async (c) => {
    const user = c.get("user")!;
    const body = await c.req.json() as { name: string };
    if (!body.name?.trim()) return c.json({ error: "Name required" }, 400);

    const [set] = await db
      .insert(schema.wordSets)
      .values({ id: createId(), userId: user.id, name: body.name.trim() })
      .returning();

    return c.json({ set: { ...set, wordIds: [], wordCount: 0 } }, 201);
  })

  // PATCH /api/sets/:id — rename a set
  .patch("/:id", async (c) => {
    const user = c.get("user")!;
    const { id } = c.req.param();
    const body = await c.req.json() as { name: string };
    if (!body.name?.trim()) return c.json({ error: "Name required" }, 400);

    const [updated] = await db
      .update(schema.wordSets)
      .set({ name: body.name.trim() })
      .where(and(eq(schema.wordSets.id, id), eq(schema.wordSets.userId, user.id)))
      .returning();

    if (!updated) return c.json({ error: "Not found" }, 404);
    return c.json({ set: updated }, 200);
  })

  // DELETE /api/sets/:id — delete set + all its members
  .delete("/:id", async (c) => {
    const user = c.get("user")!;
    const { id } = c.req.param();

    await db
      .delete(schema.wordSetMembers)
      .where(and(eq(schema.wordSetMembers.setId, id), eq(schema.wordSetMembers.userId, user.id)));
    await db
      .delete(schema.wordSets)
      .where(and(eq(schema.wordSets.id, id), eq(schema.wordSets.userId, user.id)));

    return c.json({ success: true }, 200);
  })

  // POST /api/sets/:id/words — add word(s) to set
  .post("/:id/words", async (c) => {
    const user = c.get("user")!;
    const { id } = c.req.param();
    const body = await c.req.json() as { wordIds: string[] };

    if (!body.wordIds?.length) return c.json({ error: "wordIds required" }, 400);

    // Verify set belongs to user
    const [set] = await db
      .select()
      .from(schema.wordSets)
      .where(and(eq(schema.wordSets.id, id), eq(schema.wordSets.userId, user.id)))
      .limit(1);
    if (!set) return c.json({ error: "Set not found" }, 404);

    // Get existing members to avoid duplicates
    const existing = await db
      .select({ wordId: schema.wordSetMembers.wordId })
      .from(schema.wordSetMembers)
      .where(and(eq(schema.wordSetMembers.setId, id), eq(schema.wordSetMembers.userId, user.id)));
    const existingSet = new Set(existing.map((e) => e.wordId));

    const toAdd = body.wordIds.filter((wid) => !existingSet.has(wid));
    if (toAdd.length > 0) {
      await db.insert(schema.wordSetMembers).values(
        toAdd.map((wordId) => ({
          id: createId(),
          setId: id,
          wordId,
          userId: user.id,
        }))
      );
    }

    return c.json({ added: toAdd.length }, 200);
  })

  // DELETE /api/sets/:id/words/:wordId — remove word from set
  .delete("/:id/words/:wordId", async (c) => {
    const user = c.get("user")!;
    const { id, wordId } = c.req.param();

    await db
      .delete(schema.wordSetMembers)
      .where(
        and(
          eq(schema.wordSetMembers.setId, id),
          eq(schema.wordSetMembers.wordId, wordId),
          eq(schema.wordSetMembers.userId, user.id),
        )
      );

    return c.json({ success: true }, 200);
  });

export { app as setsRoutes };
