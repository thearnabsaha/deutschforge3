/**
 * Learn Mode Data
 * Defines CEFR levels → Units → Chapters structure
 * Lessons pull from grammarPracticeData (10 levels × 10 questions per chapter)
 */

export interface LearnChapter {
  chapterId: string;
  title: string;
  subtitle: string;
}

export interface LearnUnit {
  unitId: string;
  title: string;
  theme: string;
  cefrLevel: "A1" | "A2" | "B1";
  chapters: LearnChapter[];
  color: string;
  icon: string; // emoji icon for path node
}

export interface CEFRLevel {
  id: "A1" | "A2" | "B1";
  label: string;
  color: string;
  darkColor: string;
  description: string;
  units: LearnUnit[];
}

// ─── A1 Units ─────────────────────────────────────────────────────────────────

const A1_UNITS: LearnUnit[] = [
  {
    unitId: "a1-unit-1",
    title: "First Steps",
    theme: "Pronouns, Gender & Cases",
    cefrLevel: "A1",
    color: "#1CB0F6",
    icon: "🌱",
    chapters: [
      { chapterId: "ch01", title: "Personal Pronouns", subtitle: "Nominative" },
      { chapterId: "ch02", title: "Nominative Case", subtitle: "Articles & Gender" },
      { chapterId: "ch03", title: "Present Tense", subtitle: "Regular Verbs" },
      { chapterId: "ch04", title: "Irregular Verbs", subtitle: "Strong Verb Vowel Changes" },
      { chapterId: "ch05", title: "Sentence Structure", subtitle: "Verb in Position 2" },
    ],
  },
  {
    unitId: "a1-unit-2",
    title: "Questions & Numbers",
    theme: "Questions, Numbers & Negation",
    cefrLevel: "A1",
    color: "#58CC02",
    icon: "🔢",
    chapters: [
      { chapterId: "ch06", title: "Questions", subtitle: "Yes/No & W-Questions" },
      { chapterId: "ch07", title: "Numbers & Time", subtitle: "Zahlen und Uhrzeit" },
      { chapterId: "ch08", title: "Ordinal Numbers & Dates", subtitle: "Ordinalzahlen und Datum" },
      { chapterId: "ch09", title: "Negation", subtitle: "Nicht vs. Kein" },
      { chapterId: "ch10", title: "Accusative Case", subtitle: "Direct Object & Articles" },
    ],
  },
  {
    unitId: "a1-unit-3",
    title: "Cases Deep Dive",
    theme: "Accusative & Dative",
    cefrLevel: "A1",
    color: "#FF9600",
    icon: "📚",
    chapters: [
      { chapterId: "ch11", title: "Accusative Pronouns", subtitle: "Personal Pronouns in Accusative" },
      { chapterId: "ch12", title: "Accusative Prepositions", subtitle: "DOGFU" },
      { chapterId: "ch13", title: "Dative Case", subtitle: "Indirect Object & Articles" },
      { chapterId: "ch14", title: "Dative Pronouns", subtitle: "Personal Pronouns in Dative" },
      { chapterId: "ch15", title: "Dative Prepositions", subtitle: "aus bei mit nach seit von zu" },
    ],
  },
  {
    unitId: "a1-unit-4",
    title: "Verbs & Commands",
    theme: "Modal Verbs, Separable Verbs & Imperatives",
    cefrLevel: "A1",
    color: "#FF4B4B",
    icon: "⚡",
    chapters: [
      { chapterId: "ch16", title: "Possessive Articles", subtitle: "mein dein sein ihr unser euer Ihr" },
      { chapterId: "ch17", title: "Modal Verbs", subtitle: "können müssen wollen sollen dürfen möchten" },
      { chapterId: "ch18", title: "Separable Verbs", subtitle: "Trennbare Verben" },
      { chapterId: "ch19", title: "Conjunctions", subtitle: "Coordinating — ADUSO" },
      { chapterId: "ch20", title: "Imperative", subtitle: "Commands" },
    ],
  },
  {
    unitId: "a1-unit-5",
    title: "Past & Perfect",
    theme: "Talking About the Past",
    cefrLevel: "A1",
    color: "#CE82FF",
    icon: "🏆",
    chapters: [
      { chapterId: "ch21", title: "Past Tense", subtitle: "Präteritum of sein & haben" },
      { chapterId: "ch22", title: "Perfekt", subtitle: "Present Perfect Tense" },
    ],
  },
];

// ─── A2 Units ─────────────────────────────────────────────────────────────────

const A2_UNITS: LearnUnit[] = [
  {
    unitId: "a2-unit-1",
    title: "Prepositions & Verbs",
    theme: "Two-way Prepositions & Verb Patterns",
    cefrLevel: "A2",
    color: "#1CB0F6",
    icon: "🗺️",
    chapters: [
      { chapterId: "a2ch01", title: "Two-Way Prepositions", subtitle: "an auf hinter in neben über unter vor zwischen" },
      { chapterId: "a2ch02", title: "Verbs with Two Objects", subtitle: "Dative & Accusative" },
      { chapterId: "a2ch03", title: "Reflexive Verbs", subtitle: "sich + reflexive pronouns" },
      { chapterId: "a2ch04", title: "Verbs with Fixed Prepositions", subtitle: "warten auf, sprechen über..." },
      { chapterId: "a2ch05", title: "Da-Words & Wo-Words", subtitle: "darauf, worüber..." },
    ],
  },
  {
    unitId: "a2-unit-2",
    title: "Complex Sentences",
    theme: "Conjunctions & Clause Structure",
    cefrLevel: "A2",
    color: "#58CC02",
    icon: "🔗",
    chapters: [
      { chapterId: "a2ch06", title: "Subordinating Conjunctions", subtitle: "dass weil obwohl wenn..." },
      { chapterId: "a2ch07", title: "Indirect Questions", subtitle: "ob + w-words" },
      { chapterId: "a2ch08", title: "Temporal Conjunctions", subtitle: "als vs wenn" },
      { chapterId: "a2ch09", title: "Adverbial Connectors", subtitle: "deshalb trotzdem dennoch..." },
      { chapterId: "a2ch10", title: "Infinitive Clauses", subtitle: "zu + Infinitiv" },
    ],
  },
  {
    unitId: "a2-unit-3",
    title: "Adjectives & Pronouns",
    theme: "Adjective Declension & Indefinite Pronouns",
    cefrLevel: "A2",
    color: "#FF9600",
    icon: "✏️",
    chapters: [
      { chapterId: "a2ch11", title: "Comparative & Superlative", subtitle: "größer als, am größten" },
      { chapterId: "a2ch12", title: "Adjective Declension: Definite", subtitle: "with der/die/das" },
      { chapterId: "a2ch13", title: "Adjective Declension: Indefinite", subtitle: "with ein/eine/ein" },
      { chapterId: "a2ch14", title: "Adjective Declension: No Article", subtitle: "standalone adjectives" },
      { chapterId: "a2ch15", title: "Indefinite Pronouns", subtitle: "man jemand niemand..." },
    ],
  },
  {
    unitId: "a2-unit-4",
    title: "Advanced Grammar",
    theme: "Genitive, Relative Clauses & Passive",
    cefrLevel: "A2",
    color: "#FF4B4B",
    icon: "🎓",
    chapters: [
      { chapterId: "a2ch16", title: "The Genitive Case", subtitle: "Possession & des/der" },
      { chapterId: "a2ch17", title: "Relative Clauses", subtitle: "der/die/das as relative pronouns" },
      { chapterId: "a2ch18", title: "Modal Verbs in Präteritum", subtitle: "konnte musste wollte..." },
      { chapterId: "a2ch19", title: "Passive Voice", subtitle: "werden + Partizip II" },
    ],
  },
];

// ─── B1 Units ─────────────────────────────────────────────────────────────────

const B1_UNITS: LearnUnit[] = [
  {
    unitId: "b1-unit-1",
    title: "Mastering Tenses",
    theme: "Past, Perfect & Future",
    cefrLevel: "B1",
    color: "#1CB0F6",
    icon: "⏰",
    chapters: [
      { chapterId: "b1ch01", title: "Simple Past", subtitle: "Präteritum — regular & irregular" },
      { chapterId: "b1ch02", title: "Past Perfect", subtitle: "Plusquamperfekt" },
      { chapterId: "b1ch03", title: "Temporal Conjunctions", subtitle: "nachdem bevor während..." },
      { chapterId: "b1ch04", title: "Futur I", subtitle: "werden + Infinitiv" },
      { chapterId: "b1ch05", title: "Genitive Prepositions", subtitle: "wegen trotz während..." },
    ],
  },
  {
    unitId: "b1-unit-2",
    title: "Complex Structures",
    theme: "N-Declension & Infinitive Constructions",
    cefrLevel: "B1",
    color: "#58CC02",
    icon: "🧩",
    chapters: [
      { chapterId: "b1ch06", title: "N-Declension", subtitle: "weak nouns — den Herren" },
      { chapterId: "b1ch07", title: "Damit vs Um...zu", subtitle: "expressing purpose" },
      { chapterId: "b1ch08", title: "Ohne...zu & Anstatt...zu", subtitle: "without/instead of" },
      { chapterId: "b1ch09", title: "Two-Part Connectors", subtitle: "entweder...oder, sowohl...als auch" },
      { chapterId: "b1ch10", title: "Je...desto", subtitle: "the more...the more" },
    ],
  },
  {
    unitId: "b1-unit-3",
    title: "Relative Clauses",
    theme: "Advanced Relative Clause Structures",
    cefrLevel: "B1",
    color: "#FF9600",
    icon: "🔍",
    chapters: [
      { chapterId: "b1ch11", title: "Participles as Adjectives", subtitle: "present & past participle" },
      { chapterId: "b1ch12", title: "Dative Relative Clauses", subtitle: "dem/der as relative pronouns" },
      { chapterId: "b1ch13", title: "Genitive Relative Clauses", subtitle: "dessen/deren" },
      { chapterId: "b1ch14", title: "Advanced Relative Clauses", subtitle: "was & wo as relatives" },
      { chapterId: "b1ch15", title: "Konjunktiv II Present", subtitle: "würde, wäre, hätte..." },
    ],
  },
  {
    unitId: "b1-unit-4",
    title: "Passive & Subjunctive",
    theme: "Passive Voice & Konjunktiv II",
    cefrLevel: "B1",
    color: "#CE82FF",
    icon: "🌟",
    chapters: [
      { chapterId: "b1ch16", title: "Konjunktiv II Past", subtitle: "hätte + Partizip II" },
      { chapterId: "b1ch17", title: "Past Passive", subtitle: "wurde + Partizip II" },
      { chapterId: "b1ch18", title: "State Passive", subtitle: "sein + Partizip II" },
      { chapterId: "b1ch19", title: "Hin & Her", subtitle: "directional prefixes" },
      { chapterId: "b1ch20", title: "Alternative Verb Constructions", subtitle: "lassen, brauchen zu, scheinen zu" },
    ],
  },
];

// ─── CEFR Level Definitions ────────────────────────────────────────────────────

export const CEFR_LEVELS: CEFRLevel[] = [
  {
    id: "A1",
    label: "A1 — Beginner",
    color: "#1CB0F6",
    darkColor: "#0E8EC2",
    description: "Build your foundation in German",
    units: A1_UNITS,
  },
  {
    id: "A2",
    label: "A2 — Elementary",
    color: "#58CC02",
    darkColor: "#45A800",
    description: "Expand your German toolkit",
    units: A2_UNITS,
  },
  {
    id: "B1",
    label: "B1 — Intermediate",
    color: "#FF9600",
    darkColor: "#CC7800",
    description: "Master complex German structures",
    units: B1_UNITS,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const LEVELS_PER_CHAPTER = 10;
export const QUESTIONS_PER_LEVEL = 10;

export function getUnit(unitId: string): LearnUnit | undefined {
  for (const level of CEFR_LEVELS) {
    const unit = level.units.find((u) => u.unitId === unitId);
    if (unit) return unit;
  }
  return undefined;
}

export function getCEFRForUnit(unitId: string): CEFRLevel | undefined {
  return CEFR_LEVELS.find((l) => l.units.some((u) => u.unitId === unitId));
}

export function getAllChapterIds(): string[] {
  return CEFR_LEVELS.flatMap((l) => l.units.flatMap((u) => u.chapters.map((c) => c.chapterId)));
}

/** Returns the index of a unit within its CEFR level (0-based) */
export function getUnitIndex(unitId: string): number {
  const cefrLevel = getCEFRForUnit(unitId);
  if (!cefrLevel) return -1;
  return cefrLevel.units.findIndex((u) => u.unitId === unitId);
}
