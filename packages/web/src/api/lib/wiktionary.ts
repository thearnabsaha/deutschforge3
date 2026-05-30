// Fetch German word info from Wiktionary + CEFR level heuristics

export interface WordInfo {
  english: string;
  partOfSpeech: string;
  gender: string | null;
  genderCategory: string | null; // masculine/feminine/neutral
  cefrLevel: string;             // A1/A2/B1/B2/C1/C2
  exampleSentence: string | null;
  exampleTranslation: string | null;
}

const POS_MAP: Record<string, string> = {
  noun: "noun",
  verb: "verb",
  adjective: "adjective",
  adverb: "adverb",
  pronoun: "pronoun",
  preposition: "preposition",
  conjunction: "conjunction",
  article: "article",
  interjection: "interjection",
  numeral: "numeral",
  particle: "particle",
};

const GENDER_MAP: Record<string, string> = {
  m: "der",
  f: "die",
  n: "das",
  masculine: "der",
  feminine: "die",
  neuter: "das",
};

const GENDER_CATEGORY_MAP: Record<string, string> = {
  der: "masculine",
  die: "feminine",
  das: "neutral",
};

// Common A1 German words for CEFR heuristic
const A1_WORDS = new Set([
  "hund","katze","haus","auto","buch","kind","frau","mann","tag","nacht","wasser","essen","geld",
  "schule","arbeit","mutter","vater","bruder","schwester","freund","freundin","ja","nein","gut",
  "schlecht","groß","klein","alt","neu","laufen","gehen","kommen","sehen","essen","trinken",
  "schlafen","sprechen","lernen","kaufen","haben","sein","werden","können","möchten","danke",
  "bitte","hallo","tschüss","apfel","brot","milch","kaffee","tee","stuhl","tisch","bett","tür",
  "fenster","zimmer","küche","bad","straße","stadt","land","welt","time","nummer","name","adresse",
]);

const A2_WORDS = new Set([
  "bahnhof","flughafen","krankenhaus","supermarkt","restaurant","hotel","büro","firma","sport",
  "musik","film","theater","museum","park","garten","meer","berg","fluss","wald","tier","blume",
  "baum","brief","paket","zeitung","computer","telefon","handy","internet","email","wohnung",
  "miete","preis","rechnung","bank","arzt","apotheke","polizei","feuerwehr","fahren","fliegen",
  "schwimmen","spielen","arbeiten","studieren","untersuchen","bezahlen","bestellen","buchen",
]);

function estimateCefrLevel(word: string, partOfSpeech: string): string {
  const lower = word.toLowerCase();
  if (A1_WORDS.has(lower)) return "A1";
  if (A2_WORDS.has(lower)) return "A2";

  // Heuristics by word characteristics
  const len = lower.length;

  // Very long or compound words tend to be higher level
  if (len <= 4) return "A1";
  if (len <= 6) return "A2";
  if (len <= 9) return "B1";
  if (len <= 12) return "B2";
  return "C1";
}

/** Strip leading article (der/die/das) from a German word input */
export function stripArticle(raw: string): { article: string | null; base: string } {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();
  const articles = ["der ", "die ", "das "];
  for (const art of articles) {
    if (lower.startsWith(art)) {
      return {
        article: art.trim(),
        base: trimmed.slice(art.length).trim(),
      };
    }
  }
  return { article: null, base: trimmed };
}

/**
 * Strip "sich" prefix from reflexive verbs.
 * "sich waschen" → { isReflexive: true, base: "waschen" }
 * "sich etwas kaufen" → { isReflexive: true, base: "etwas kaufen", phrasal: true }
 */
export function stripReflexive(raw: string): { isReflexive: boolean; base: string; phrasal: boolean } {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("sich ")) {
    const rest = trimmed.slice(5).trim(); // remove "sich "
    // phrasal if there are more words after stripping "sich" and the first verb token
    const tokens = rest.split(/\s+/);
    const phrasal = tokens.length > 1;
    // For wiktionary lookup use only the main verb (last meaningful token or first)
    const verbBase = tokens[0];
    return { isReflexive: true, base: verbBase, phrasal };
  }
  return { isReflexive: false, base: trimmed, phrasal: false };
}

export async function fetchWordInfo(germanWord: string): Promise<WordInfo> {
  try {
    // Use the English Wiktionary API to get German word data
    const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(germanWord)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "DeutschForge/1.0" },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return defaultWordInfo(germanWord);

    const data = await res.json() as any;

    // Look for German language section
    const deDefs = data.de;
    if (!deDefs || deDefs.length === 0) return defaultWordInfo(germanWord);

    const firstEntry = deDefs[0];
    const partOfSpeech = POS_MAP[firstEntry.partOfSpeech?.toLowerCase() ?? ""] ?? "unknown";

    // Extract English definition
    let english = "";
    if (firstEntry.definitions && firstEntry.definitions.length > 0) {
      const rawDef = firstEntry.definitions[0].definition ?? "";
      english = rawDef.replace(/<[^>]+>/g, "").trim();
    }

    // Try to find gender from the word forms or tags
    let gender: string | null = null;
    const tags = firstEntry.tags ?? [];
    for (const tag of tags) {
      const g = GENDER_MAP[tag.toLowerCase()];
      if (g) { gender = g; break; }
    }

    // For nouns, try to detect gender from the word label
    if (partOfSpeech === "noun" && !gender) {
      const label = (firstEntry.label ?? "").toLowerCase();
      for (const [key, val] of Object.entries(GENDER_MAP)) {
        if (label.includes(key)) { gender = val; break; }
      }
    }

    const genderCategory = gender ? (GENDER_CATEGORY_MAP[gender] ?? null) : null;
    const cefrLevel = estimateCefrLevel(germanWord, partOfSpeech);

    // Find an example sentence if available
    let exampleSentence: string | null = null;
    let exampleTranslation: string | null = null;
    if (firstEntry.definitions?.[0]?.parsedExamples?.length > 0) {
      const ex = firstEntry.definitions[0].parsedExamples[0];
      exampleSentence = ex.example?.replace(/<[^>]+>/g, "").trim() ?? null;
    } else if (firstEntry.definitions?.[0]?.examples?.length > 0) {
      exampleSentence = firstEntry.definitions[0].examples[0]?.replace(/<[^>]+>/g, "").trim() ?? null;
    }

    return { english: english || germanWord, partOfSpeech, gender, genderCategory, cefrLevel, exampleSentence, exampleTranslation };
  } catch {
    return defaultWordInfo(germanWord);
  }
}

function defaultWordInfo(word: string): WordInfo {
  return {
    english: word,
    partOfSpeech: "unknown",
    gender: null,
    genderCategory: null,
    cefrLevel: "B1",
    exampleSentence: null,
    exampleTranslation: null,
  };
}
