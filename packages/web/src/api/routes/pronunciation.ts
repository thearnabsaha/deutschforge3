import { Hono } from "hono";
import { requireAuth } from "../middleware/auth";
import type { AppEnv } from "../types";

const app = new Hono<AppEnv>().use(requireAuth);

// Levenshtein distance
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function similarity(a: string, b: string): number {
  const na = normalize(a), nb = normalize(b);
  if (na === nb) return 100;
  const dist = levenshtein(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  if (maxLen === 0) return 100;
  return Math.round((1 - dist / maxLen) * 100);
}

// POST /api/pronunciation/assess
app.post("/assess", async (c) => {
  try {
    const body = await c.req.json() as {
      word: string;
      audioBase64: string;
      mimeType?: string;
    };

    const { word, audioBase64, mimeType = "audio/m4a" } = body;
    if (!word || !audioBase64) {
      return c.json({ error: "Missing word or audio" }, 400);
    }

    const base64Url = process.env.AI_GATEWAY_BASE_URL ?? "";
    const apiKey = process.env.AI_GATEWAY_API_KEY ?? "";

    // Build multipart form for Whisper
    const audioBuffer = Buffer.from(audioBase64, "base64");
    const blob = new Blob([audioBuffer], { type: mimeType });

    const formData = new FormData();
    formData.append("file", blob, "audio.m4a");
    formData.append("model", "openai/whisper-1");
    formData.append("language", "de");

    // Hit the AI gateway transcription endpoint
    const whisperUrl = base64Url.replace(/\/chat\/completions\/?$/, "/audio/transcriptions").replace(/\/$/, "") + "/audio/transcriptions";

    const resp = await fetch(whisperUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    });

    let transcribed = "";
    if (resp.ok) {
      const data = await resp.json() as { text?: string };
      transcribed = (data.text ?? "").trim();
    } else {
      // If Whisper unavailable, fall back to empty string
      console.error("Whisper error:", resp.status, await resp.text());
      transcribed = "";
    }

    const score = transcribed ? similarity(word, transcribed) : 0;

    const feedback =
      score >= 85 ? "Perfect! Great pronunciation!" :
      score >= 65 ? "Almost there! Keep practising." :
      score >= 40 ? "Not quite — try listening again first." :
      transcribed
        ? `We heard "${transcribed}" — try again more clearly.`
        : "Couldn't hear you clearly — tap the mic and speak loudly.";

    return c.json({ transcribed, score, feedback }, 200);
  } catch (err) {
    console.error("pronunciation/assess error:", err);
    return c.json({ error: "Internal error" }, 500);
  }
});

export const pronunciationRoutes = app;
