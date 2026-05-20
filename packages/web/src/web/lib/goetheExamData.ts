// ─────────────────────────────────────────────────────────────
// Goethe Institut Mock Exam Data
// 3 levels × 4 sections × 30 exams each = 360 exam sets
// Format faithful to official Goethe-Zertifikat structure
// ─────────────────────────────────────────────────────────────

export type Level = "A1" | "A2" | "B1";
export type Section = "hoeren" | "lesen" | "schreiben" | "sprechen";

// ── SHARED TYPES ──────────────────────────────────────────────

export interface MCQQuestion {
  id: string;
  text: string;
  options: string[];
  correct: number; // index into options
  imageHint?: string; // description of what image would show
}

export interface TrueFalseQuestion {
  id: string;
  statement: string;
  correct: boolean;
  audioContext: string; // what the audio would say
}

export interface MatchingQuestion {
  id: string;
  items: { label: string; content: string }[];
  targets: string[];
  correctMap: Record<string, string>; // item label → target
}

export interface FillGapQuestion {
  id: string;
  textWithGaps: string; // use ___ for gaps
  options: Record<string, string[]>; // gap number → options
  answers: Record<string, string>; // gap number → correct
}

// ── LISTENING (HÖREN) ─────────────────────────────────────────

export interface HoerenExam {
  id: string;
  title: string;
  level: Level;
  durationMinutes: number;
  totalPoints: 25;
  instructions: string;
  parts: HoerenPart[];
}

export type HoerenPart =
  | { type: "picture_mcq"; title: string; points: number; questions: MCQQuestion[] }
  | { type: "true_false"; title: string; points: number; questions: TrueFalseQuestion[] }
  | { type: "mcq"; title: string; points: number; questions: MCQQuestion[] };

// ── READING (LESEN) ───────────────────────────────────────────

export interface LesenExam {
  id: string;
  title: string;
  level: Level;
  durationMinutes: number;
  totalPoints: 25;
  instructions: string;
  parts: LesenPart[];
}

export type LesenPart =
  | { type: "matching"; title: string; points: number; task: MatchingQuestion }
  | { type: "mcq"; title: string; points: number; passage: string; questions: MCQQuestion[] }
  | { type: "fill_gap"; title: string; points: number; task: FillGapQuestion };

// ── WRITING (SCHREIBEN) ───────────────────────────────────────

export interface SchreibenExam {
  id: string;
  title: string;
  level: Level;
  durationMinutes: number;
  totalPoints: 25;
  instructions: string;
  tasks: SchreibenTask[];
}

export interface SchreibenTask {
  id: string;
  type: "form" | "message" | "email" | "forum_post";
  points: number;
  title: string;
  prompt: string;
  wordLimit?: string;
  fields?: { label: string; placeholder: string }[]; // for form type
  modelAnswer: string;
  assessmentCriteria: string[];
}

// ── SPEAKING (SPRECHEN) ───────────────────────────────────────

export interface SprechenExam {
  id: string;
  title: string;
  level: Level;
  durationMinutes: number;
  totalPoints: 25;
  instructions: string;
  parts: SprechenPart[];
}

export type SprechenPart =
  | { type: "self_intro"; title: string; points: number; prompts: string[] }
  | { type: "question_cards"; title: string; points: number; cards: { question: string; sampleAnswer: string }[] }
  | { type: "picture_description"; title: string; points: number; imageDescription: string; prompts: string[]; sampleAnswer: string }
  | { type: "role_play"; title: string; points: number; scenario: string; sampleLines: string[] }
  | { type: "topic_presentation"; title: string; points: number; topic: string; outline: string[]; sampleAnswer: string }
  | { type: "discussion"; title: string; points: number; topic: string; prompts: string[]; sampleAnswer: string }
  | { type: "planning"; title: string; points: number; scenario: string; suggestions: string[]; sampleAnswer: string };

// ═══════════════════════════════════════════════════════════════
// A1 HÖREN — 30 exams
// ═══════════════════════════════════════════════════════════════

export const A1_HOEREN: HoerenExam[] = [
  {
    id: "a1_h_01",
    title: "Hören – Prüfung 1",
    level: "A1",
    durationMinutes: 20,
    totalPoints: 25,
    instructions:
      "Sie hören kurze Texte. Wählen Sie das passende Bild oder die richtige Antwort.",
    parts: [
      {
        type: "picture_mcq",
        title: "Teil 1 – Welches Bild passt?",
        points: 6,
        questions: [
          {
            id: "a1_h_01_p1_q1",
            text: "Was trinkt Maria heute Morgen?",
            options: ["Kaffee", "Tee", "Orangensaft"],
            correct: 0,
            imageHint: "Three drinks: coffee cup, tea cup, orange juice glass",
          },
          {
            id: "a1_h_01_p1_q2",
            text: "Wo ist der Supermarkt?",
            options: ["links", "rechts", "geradeaus"],
            correct: 2,
            imageHint: "Street map showing three directions",
          },
          {
            id: "a1_h_01_p1_q3",
            text: "Was kauft Peter im Geschäft?",
            options: ["Brot", "Milch", "Äpfel"],
            correct: 1,
            imageHint: "Shopping items: bread loaf, milk carton, apples",
          },
          {
            id: "a1_h_01_p1_q4",
            text: "Wie ist das Wetter heute?",
            options: ["sonnig", "regnerisch", "bewölkt"],
            correct: 0,
            imageHint: "Weather symbols: sun, rain, clouds",
          },
          {
            id: "a1_h_01_p1_q5",
            text: "Was macht Anna am Wochenende?",
            options: ["schwimmen", "lesen", "kochen"],
            correct: 1,
            imageHint: "Activities: swimming pool, book, kitchen",
          },
          {
            id: "a1_h_01_p1_q6",
            text: "Welches Tier hat Thomas?",
            options: ["Hund", "Katze", "Vogel"],
            correct: 2,
            imageHint: "Animals: dog, cat, bird",
          },
        ],
      },
      {
        type: "true_false",
        title: "Teil 2 – Richtig oder falsch?",
        points: 4,
        questions: [
          {
            id: "a1_h_01_p2_q1",
            statement: "Das Kino beginnt um 20 Uhr.",
            correct: true,
            audioContext: "Hallo, das Kino beginnt heute Abend um 20 Uhr. Bitte kommen Sie pünktlich.",
          },
          {
            id: "a1_h_01_p2_q2",
            statement: "Der Zug fährt von Gleis 5 ab.",
            correct: false,
            audioContext: "Achtung: Der Zug nach München fährt heute von Gleis 7 ab, nicht Gleis 5.",
          },
          {
            id: "a1_h_01_p2_q3",
            statement: "Das Restaurant ist am Montag geschlossen.",
            correct: true,
            audioContext: "Unser Restaurant ist montags geschlossen. Dienstag bis Sonntag sind wir für Sie da.",
          },
          {
            id: "a1_h_01_p2_q4",
            statement: "Die Bibliothek öffnet um 9 Uhr.",
            correct: false,
            audioContext: "Die Bibliothek öffnet montags bis freitags um 10 Uhr morgens.",
          },
        ],
      },
      {
        type: "mcq",
        title: "Teil 3 – Gespräche verstehen",
        points: 5,
        questions: [
          {
            id: "a1_h_01_p3_q1",
            text: "Wo treffen sich die Freunde?",
            options: ["am Bahnhof", "im Park", "im Café"],
            correct: 2,
          },
          {
            id: "a1_h_01_p3_q2",
            text: "Wann beginnt der Deutschkurs?",
            options: ["um 8 Uhr", "um 9 Uhr", "um 10 Uhr"],
            correct: 1,
          },
          {
            id: "a1_h_01_p3_q3",
            text: "Was kostet das Ticket?",
            options: ["5 Euro", "8 Euro", "12 Euro"],
            correct: 0,
          },
          {
            id: "a1_h_01_p3_q4",
            text: "Woher kommt die Frau?",
            options: ["aus Spanien", "aus Italien", "aus Polen"],
            correct: 2,
          },
          {
            id: "a1_h_01_p3_q5",
            text: "Was ist das Hobby von Klaus?",
            options: ["Fußball spielen", "Musik hören", "fotografieren"],
            correct: 1,
          },
        ],
      },
    ],
  },
  {
    id: "a1_h_02",
    title: "Hören – Prüfung 2",
    level: "A1",
    durationMinutes: 20,
    totalPoints: 25,
    instructions: "Sie hören kurze Texte. Wählen Sie das passende Bild oder die richtige Antwort.",
    parts: [
      {
        type: "picture_mcq",
        title: "Teil 1 – Welches Bild passt?",
        points: 6,
        questions: [
          { id: "a1_h_02_p1_q1", text: "Was isst Lisa zum Frühstück?", options: ["Müsli", "Eier", "Toast"], correct: 2, imageHint: "Breakfast foods: muesli bowl, fried eggs, toast" },
          { id: "a1_h_02_p1_q2", text: "Wie fährt Max zur Arbeit?", options: ["mit dem Auto", "mit dem Fahrrad", "zu Fuß"], correct: 1, imageHint: "Transport: car, bicycle, walking person" },
          { id: "a1_h_02_p1_q3", text: "Was trägt die Frau?", options: ["ein Kleid", "eine Hose", "einen Rock"], correct: 0, imageHint: "Clothing items: dress, trousers, skirt" },
          { id: "a1_h_02_p1_q4", text: "Wo wohnt Familie Müller?", options: ["in einem Haus", "in einer Wohnung", "in einem Hotel"], correct: 1, imageHint: "Buildings: house, apartment building, hotel" },
          { id: "a1_h_02_p1_q5", text: "Was liegt auf dem Tisch?", options: ["ein Buch", "eine Zeitung", "ein Heft"], correct: 0, imageHint: "Items: book, newspaper, notebook" },
          { id: "a1_h_02_p1_q6", text: "Welche Jahreszeit ist es?", options: ["Frühling", "Sommer", "Herbst"], correct: 2, imageHint: "Seasons: spring flowers, summer sun, autumn leaves" },
        ],
      },
      {
        type: "true_false",
        title: "Teil 2 – Richtig oder falsch?",
        points: 4,
        questions: [
          { id: "a1_h_02_p2_q1", statement: "Das Schwimmbad kostet 4 Euro Eintritt.", correct: true, audioContext: "Das Schwimmbad kostet heute 4 Euro Eintritt für Erwachsene." },
          { id: "a1_h_02_p2_q2", statement: "Die Party ist am Samstag.", correct: false, audioContext: "Hallo alle! Meine Party ist am Freitag, den 15. um 19 Uhr. Bitte kommen!" },
          { id: "a1_h_02_p2_q3", statement: "Der Arzt hat heute keine Zeit.", correct: true, audioContext: "Leider kann Dr. Schmidt heute keine Patienten empfangen. Bitte rufen Sie morgen an." },
          { id: "a1_h_02_p2_q4", statement: "Das Hotel hat ein Restaurant.", correct: true, audioContext: "Unser Hotel bietet Ihnen ein Restaurant, ein Schwimmbad und einen Fitnessraum." },
        ],
      },
      {
        type: "mcq",
        title: "Teil 3 – Gespräche verstehen",
        points: 5,
        questions: [
          { id: "a1_h_02_p3_q1", text: "Was kauft die Frau im Supermarkt?", options: ["Fleisch", "Gemüse", "Obst"], correct: 1 },
          { id: "a1_h_02_p3_q2", text: "Wie alt ist der Sohn?", options: ["7 Jahre", "9 Jahre", "11 Jahre"], correct: 0 },
          { id: "a1_h_02_p3_q3", text: "Welche Telefonnummer ist richtig?", options: ["0176 – 234567", "0176 – 345678", "0176 – 456789"], correct: 1 },
          { id: "a1_h_02_p3_q4", text: "Was möchte der Mann essen?", options: ["Suppe", "Salat", "Steak"], correct: 2 },
          { id: "a1_h_02_p3_q5", text: "Wo ist das Krankenhaus?", options: ["neben dem Rathaus", "hinter dem Bahnhof", "gegenüber dem Park"], correct: 0 },
        ],
      },
    ],
  },
  {
    id: "a1_h_03",
    title: "Hören – Prüfung 3",
    level: "A1",
    durationMinutes: 20,
    totalPoints: 25,
    instructions: "Sie hören kurze Texte. Wählen Sie das passende Bild oder die richtige Antwort.",
    parts: [
      {
        type: "picture_mcq",
        title: "Teil 1 – Welches Bild passt?",
        points: 6,
        questions: [
          { id: "a1_h_03_p1_q1", text: "Was macht der Vater?", options: ["kochen", "schlafen", "lesen"], correct: 0, imageHint: "Man cooking, sleeping, reading" },
          { id: "a1_h_03_p1_q2", text: "Wie ist der Himmel?", options: ["blau", "grau", "orange"], correct: 1, imageHint: "Sky colors: blue, grey, orange" },
          { id: "a1_h_03_p1_q3", text: "Was spielt das Kind?", options: ["Tennis", "Fußball", "Basketball"], correct: 1, imageHint: "Sports: tennis, football, basketball" },
          { id: "a1_h_03_p1_q4", text: "Was ist im Rucksack?", options: ["Bücher", "Kleidung", "Essen"], correct: 0, imageHint: "Backpack contents: books, clothes, food" },
          { id: "a1_h_03_p1_q5", text: "Wohin fährt die Familie?", options: ["ans Meer", "in die Berge", "in die Stadt"], correct: 2, imageHint: "Destinations: beach, mountains, city" },
          { id: "a1_h_03_p1_q6", text: "Was trinkt der Mann?", options: ["Bier", "Wasser", "Wein"], correct: 1, imageHint: "Drinks: beer mug, water glass, wine glass" },
        ],
      },
      {
        type: "true_false",
        title: "Teil 2 – Richtig oder falsch?",
        points: 4,
        questions: [
          { id: "a1_h_03_p2_q1", statement: "Der Bus kommt um 14:30 Uhr.", correct: false, audioContext: "Der Bus Linie 42 kommt um 14:45 Uhr an Haltestelle Marktplatz an." },
          { id: "a1_h_03_p2_q2", statement: "Das Konzert ist ausverkauft.", correct: true, audioContext: "Leider sind alle Tickets für das Konzert am Samstag ausverkauft." },
          { id: "a1_h_03_p2_q3", statement: "Die Schule beginnt im September.", correct: true, audioContext: "Das neue Schuljahr beginnt am ersten September. Alle Schüler kommen um 8 Uhr." },
          { id: "a1_h_03_p2_q4", statement: "Der Markt ist jeden Tag geöffnet.", correct: false, audioContext: "Der Wochenmarkt ist dienstags und samstags von 8 bis 14 Uhr geöffnet." },
        ],
      },
      {
        type: "mcq",
        title: "Teil 3 – Gespräche verstehen",
        points: 5,
        questions: [
          { id: "a1_h_03_p3_q1", text: "Was ist das Problem mit dem Auto?", options: ["kein Benzin", "kaputte Reifen", "der Motor läuft nicht"], correct: 0 },
          { id: "a1_h_03_p3_q2", text: "Wann kommt der Techniker?", options: ["heute Nachmittag", "morgen früh", "übermorgen"], correct: 1 },
          { id: "a1_h_03_p3_q3", text: "Was bestellt die Frau im Restaurant?", options: ["Schnitzel mit Salat", "Pasta mit Tomaten", "Suppe und Brot"], correct: 0 },
          { id: "a1_h_03_p3_q4", text: "Welche Sprachen spricht Herr Chen?", options: ["Chinesisch und Englisch", "Chinesisch, Englisch und Deutsch", "Chinesisch und Deutsch"], correct: 1 },
          { id: "a1_h_03_p3_q5", text: "Wie lange dauert der Kurs?", options: ["4 Wochen", "6 Wochen", "8 Wochen"], correct: 2 },
        ],
      },
    ],
  },
];

// Generate remaining 27 A1 Hören exams with varied content
function generateA1Hoeren(startIdx: number, count: number): HoerenExam[] {
  const topics = [
    { ctx: "Arbeit und Beruf", q1: "Was ist der Beruf von Herrn Weber?", o1: ["Lehrer", "Arzt", "Ingenieur"], c1: 0 },
    { ctx: "Familie", q1: "Wie viele Kinder hat die Familie?", o1: ["zwei", "drei", "vier"], c1: 1 },
    { ctx: "Freizeit", q1: "Was macht Sophia am Abend?", o1: ["fernsehen", "sport treiben", "ausgehen"], c1: 2 },
    { ctx: "Einkaufen", q1: "Wo kauft Frau Klaus Kleidung?", o1: ["im Kaufhaus", "online", "im Markt"], c1: 0 },
    { ctx: "Gesundheit", q1: "Was tut dem Mann weh?", o1: ["der Kopf", "der Bauch", "das Bein"], c1: 0 },
    { ctx: "Reisen", q1: "Wohin fährt das Flugzeug?", o1: ["nach Wien", "nach Zürich", "nach Berlin"], c1: 2 },
    { ctx: "Schule", q1: "Was lernt das Kind in der Schule?", o1: ["Englisch", "Französisch", "Spanisch"], c1: 0 },
    { ctx: "Wohnen", q1: "Wie groß ist die Wohnung?", o1: ["50 qm", "70 qm", "90 qm"], c1: 1 },
    { ctx: "Essen", q1: "Was ist das Lieblingsessen von Tom?", o1: ["Pizza", "Sushi", "Curry"], c1: 0 },
    { ctx: "Sport", q1: "Welchen Sport macht Tina?", o1: ["Yoga", "Schwimmen", "Radfahren"], c1: 1 },
  ];
  const results: HoerenExam[] = [];
  for (let i = 0; i < count; i++) {
    const idx = startIdx + i;
    const t = topics[i % topics.length];
    const n = String(idx).padStart(2, "0");
    results.push({
      id: `a1_h_${n}`,
      title: `Hören – Prüfung ${idx}`,
      level: "A1",
      durationMinutes: 20,
      totalPoints: 25,
      instructions: "Sie hören kurze Texte. Wählen Sie das passende Bild oder die richtige Antwort.",
      parts: [
        {
          type: "picture_mcq",
          title: "Teil 1 – Welches Bild passt?",
          points: 6,
          questions: [
            { id: `a1_h_${n}_p1_q1`, text: t.q1, options: t.o1, correct: t.c1, imageHint: `${t.ctx} scene` },
            { id: `a1_h_${n}_p1_q2`, text: "Wo ist die Apotheke?", options: ["links vom Supermarkt", "rechts vom Supermarkt", "gegenüber vom Supermarkt"], correct: (idx) % 3, imageHint: "Street map with pharmacy location" },
            { id: `a1_h_${n}_p1_q3`, text: "Was trägt der Mann?", options: ["einen Mantel", "eine Jacke", "einen Pullover"], correct: (idx + 1) % 3, imageHint: "Man in different clothing" },
            { id: `a1_h_${n}_p1_q4`, text: "Wie ist das Wetter am Nachmittag?", options: ["warm und sonnig", "kühl und windig", "nass und kalt"], correct: (idx + 2) % 3, imageHint: "Afternoon weather scenes" },
            { id: `a1_h_${n}_p1_q5`, text: "Was macht die Mutter?", options: ["putzen", "kochen", "einkaufen"], correct: (idx) % 3, imageHint: "Woman doing housework" },
            { id: `a1_h_${n}_p1_q6`, text: "Welche Farbe hat das Auto?", options: ["rot", "blau", "schwarz"], correct: (idx + 1) % 3, imageHint: "Cars in different colors" },
          ],
        },
        {
          type: "true_false",
          title: "Teil 2 – Richtig oder falsch?",
          points: 4,
          questions: [
            { id: `a1_h_${n}_p2_q1`, statement: "Der Kurs kostet 120 Euro.", correct: idx % 2 === 0, audioContext: `Der Kurs kostet ${idx % 2 === 0 ? "120" : "150"} Euro pro Monat. Anmeldung bis Freitag.` },
            { id: `a1_h_${n}_p2_q2`, statement: "Das Geschäft ist sonntags geöffnet.", correct: idx % 3 === 0, audioContext: `Das Geschäft ist ${idx % 3 === 0 ? "sonntags von 10 bis 18 Uhr geöffnet" : "sonntags geschlossen"}.` },
            { id: `a1_h_${n}_p2_q3`, statement: "Die Veranstaltung findet draußen statt.", correct: idx % 2 !== 0, audioContext: `Die Veranstaltung findet ${idx % 2 !== 0 ? "im Freien statt, bitte warme Kleidung mitbringen" : "in der Halle statt"}.` },
            { id: `a1_h_${n}_p2_q4`, statement: "Es gibt Parkmöglichkeiten am Gebäude.", correct: idx % 4 === 0, audioContext: `${idx % 4 === 0 ? "Parken ist direkt am Gebäude möglich" : "Bitte öffentliche Verkehrsmittel nutzen, keine Parkmöglichkeiten vorhanden"}.` },
          ],
        },
        {
          type: "mcq",
          title: "Teil 3 – Gespräche verstehen",
          points: 5,
          questions: [
            { id: `a1_h_${n}_p3_q1`, text: "Wann ist die Besprechung?", options: ["um 10 Uhr", "um 11 Uhr", "um 12 Uhr"], correct: idx % 3 },
            { id: `a1_h_${n}_p3_q2`, text: "Wie viele Personen kommen zur Party?", options: ["etwa 10", "etwa 20", "etwa 30"], correct: (idx + 1) % 3 },
            { id: `a1_h_${n}_p3_q3`, text: "Was ist das Problem?", options: ["kein Geld", "keine Zeit", "kein Platz"], correct: (idx + 2) % 3 },
            { id: `a1_h_${n}_p3_q4`, text: "Welche Sprache lernt der Student?", options: ["Spanisch", "Deutsch", "Japanisch"], correct: 1 },
            { id: `a1_h_${n}_p3_q5`, text: "Wie lange wohnt Herr Braun schon hier?", options: ["seit einem Jahr", "seit zwei Jahren", "seit fünf Jahren"], correct: (idx) % 3 },
          ],
        },
      ],
    });
  }
  return results;
}

export const ALL_A1_HOEREN: HoerenExam[] = [
  ...A1_HOEREN,
  ...generateA1Hoeren(4, 27),
];

// ═══════════════════════════════════════════════════════════════
// A2 HÖREN — 30 exams
// ═══════════════════════════════════════════════════════════════

export const A2_HOEREN: HoerenExam[] = [
  {
    id: "a2_h_01",
    title: "Hören – Prüfung 1",
    level: "A2",
    durationMinutes: 30,
    totalPoints: 25,
    instructions: "Sie hören kurze Gespräche und Ansagen. Wählen Sie die richtige Antwort.",
    parts: [
      {
        type: "mcq",
        title: "Teil 1 – Kurze Gespräche",
        points: 5,
        questions: [
          { id: "a2_h_01_p1_q1", text: "Warum kommt Susanne zu spät?", options: ["Der Bus hatte Verspätung.", "Sie hat verschlafen.", "Sie hatte einen Termin."], correct: 0 },
          { id: "a2_h_01_p1_q2", text: "Was möchte der Mann im Hotel?", options: ["ein Einzelzimmer", "ein Doppelzimmer", "ein Apartment"], correct: 1 },
          { id: "a2_h_01_p1_q3", text: "Wie lange bleibt die Familie?", options: ["drei Nächte", "fünf Nächte", "eine Woche"], correct: 0 },
          { id: "a2_h_01_p1_q4", text: "Was ist das Problem mit der Bestellung?", options: ["Sie ist zu spät.", "Sie ist falsch.", "Sie fehlt komplett."], correct: 2 },
          { id: "a2_h_01_p1_q5", text: "Wo findet das Treffen statt?", options: ["im Büro", "in der Kantine", "im Konferenzraum"], correct: 2 },
        ],
      },
      {
        type: "true_false",
        title: "Teil 2 – Richtig oder falsch?",
        points: 5,
        questions: [
          { id: "a2_h_01_p2_q1", statement: "Die Frau arbeitet als Ärztin.", correct: false, audioContext: "Ich bin Krankenschwester und arbeite im Krankenhaus seit acht Jahren." },
          { id: "a2_h_01_p2_q2", statement: "Das Wetter wird am Wochenende besser.", correct: true, audioContext: "Am Wochenende erwartet uns besseres Wetter mit Temperaturen um 20 Grad." },
          { id: "a2_h_01_p2_q3", statement: "Der Kurs findet zweimal pro Woche statt.", correct: true, audioContext: "Der Kurs findet montags und donnerstags jeweils von 18 bis 20 Uhr statt." },
          { id: "a2_h_01_p2_q4", statement: "Das Museum ist am Dienstag geschlossen.", correct: true, audioContext: "Bitte beachten Sie: Das Museum ist dienstags geschlossen. Mittwoch bis Sonntag geöffnet." },
          { id: "a2_h_01_p2_q5", statement: "Die Prüfung beginnt um 9 Uhr.", correct: false, audioContext: "Die Prüfung beginnt um 10 Uhr. Bitte kommen Sie 15 Minuten früher." },
        ],
      },
      {
        type: "mcq",
        title: "Teil 3 – Ansagen und Durchsagen",
        points: 5,
        questions: [
          { id: "a2_h_01_p3_q1", text: "Was soll man bei schlechtem Wetter mitbringen?", options: ["einen Regenschirm", "warme Kleidung", "Sonnencreme"], correct: 0 },
          { id: "a2_h_01_p3_q2", text: "Wann ist die Abgabefrist für die Hausaufgaben?", options: ["Montag", "Mittwoch", "Freitag"], correct: 2 },
          { id: "a2_h_01_p3_q3", text: "Welcher Service ist neu im Geschäft?", options: ["Lieferservice", "Reparaturservice", "Beratungsservice"], correct: 0 },
          { id: "a2_h_01_p3_q4", text: "Was braucht man für die Anmeldung?", options: ["Ausweis und Foto", "Ausweis und Adressnachweis", "nur den Ausweis"], correct: 1 },
          { id: "a2_h_01_p3_q5", text: "Wie kann man bezahlen?", options: ["nur bar", "bar oder Kreditkarte", "nur mit Kreditkarte"], correct: 1 },
        ],
      },
    ],
  },
  {
    id: "a2_h_02",
    title: "Hören – Prüfung 2",
    level: "A2",
    durationMinutes: 30,
    totalPoints: 25,
    instructions: "Sie hören kurze Gespräche und Ansagen. Wählen Sie die richtige Antwort.",
    parts: [
      {
        type: "mcq",
        title: "Teil 1 – Kurze Gespräche",
        points: 5,
        questions: [
          { id: "a2_h_02_p1_q1", text: "Was ist Toms neues Hobby?", options: ["Gitarre spielen", "malen", "gärtnern"], correct: 2 },
          { id: "a2_h_02_p1_q2", text: "Warum geht die Frau nicht ins Kino?", options: ["Sie ist krank.", "Sie hat keine Zeit.", "Der Film interessiert sie nicht."], correct: 0 },
          { id: "a2_h_02_p1_q3", text: "Wie ist das Essen im neuen Restaurant?", options: ["sehr gut aber teuer", "günstig aber schlecht", "gut und günstig"], correct: 0 },
          { id: "a2_h_02_p1_q4", text: "Was macht Jonas am Nachmittag?", options: ["Hausaufgaben", "sport", "mit Freunden treffen"], correct: 2 },
          { id: "a2_h_02_p1_q5", text: "Wo hat die Familie früher gewohnt?", options: ["in München", "in Hamburg", "in Berlin"], correct: 1 },
        ],
      },
      {
        type: "true_false",
        title: "Teil 2 – Richtig oder falsch?",
        points: 5,
        questions: [
          { id: "a2_h_02_p2_q1", statement: "Das Stadtfest beginnt am Freitag.", correct: true, audioContext: "Das Stadtfest beginnt diesen Freitag um 16 Uhr und endet Sonntag Abend." },
          { id: "a2_h_02_p2_q2", statement: "Der Eintritt zum Fest kostet Geld.", correct: false, audioContext: "Der Eintritt zum Stadtfest ist frei. Alle sind herzlich eingeladen!" },
          { id: "a2_h_02_p2_q3", statement: "Kinder unter 12 Jahren brauchen eine Begleitung.", correct: true, audioContext: "Kinder unter 12 Jahren müssen von einem Erwachsenen begleitet werden." },
          { id: "a2_h_02_p2_q4", statement: "Es gibt Parkplätze in der Nähe.", correct: false, audioContext: "Bitte nutzen Sie öffentliche Verkehrsmittel. Es gibt keine Parkplätze am Veranstaltungsort." },
          { id: "a2_h_02_p2_q5", statement: "Das Konzert findet am Samstag statt.", correct: true, audioContext: "Das Hauptkonzert findet am Samstagabend um 20 Uhr auf der großen Bühne statt." },
        ],
      },
      {
        type: "mcq",
        title: "Teil 3 – Ansagen und Durchsagen",
        points: 5,
        questions: [
          { id: "a2_h_02_p3_q1", text: "Was wird im Sonderangebot verkauft?", options: ["Elektrogeräte", "Kleidung", "Lebensmittel"], correct: 0 },
          { id: "a2_h_02_p3_q2", text: "Wie lange gilt das Angebot?", options: ["einen Tag", "eine Woche", "einen Monat"], correct: 1 },
          { id: "a2_h_02_p3_q3", text: "Was muss man tun, um die Ermäßigung zu bekommen?", options: ["eine Karte vorzeigen", "online bestellen", "einen Gutschein einlösen"], correct: 0 },
          { id: "a2_h_02_p3_q4", text: "An welchem Tag ist das Geschäft länger geöffnet?", options: ["Donnerstag", "Freitag", "Samstag"], correct: 2 },
          { id: "a2_h_02_p3_q5", text: "Was kann man im Geschäft kostenlos bekommen?", options: ["Kaffee", "einen Stadtplan", "eine Einkaufstasche"], correct: 2 },
        ],
      },
    ],
  },
];

function generateA2Hoeren(startIdx: number, count: number): HoerenExam[] {
  const results: HoerenExam[] = [];
  const themes = ["Arbeit", "Reisen", "Gesundheit", "Wohnen", "Freizeit", "Einkaufen", "Bildung", "Umwelt", "Technik", "Kultur"];
  for (let i = 0; i < count; i++) {
    const idx = startIdx + i;
    const n = String(idx).padStart(2, "0");
    const theme = themes[i % themes.length];
    results.push({
      id: `a2_h_${n}`,
      title: `Hören – Prüfung ${idx}`,
      level: "A2",
      durationMinutes: 30,
      totalPoints: 25,
      instructions: "Sie hören kurze Gespräche und Ansagen. Wählen Sie die richtige Antwort.",
      parts: [
        {
          type: "mcq",
          title: "Teil 1 – Kurze Gespräche",
          points: 5,
          questions: [
            { id: `a2_h_${n}_p1_q1`, text: `Was ist das Thema des Gesprächs über ${theme}?`, options: [`Problem mit ${theme}`, `Erfolg bei ${theme}`, `Fragen zu ${theme}`], correct: idx % 3 },
            { id: `a2_h_${n}_p1_q2`, text: "Wie lange arbeitet die Person schon dort?", options: ["ein Jahr", "drei Jahre", "fünf Jahre"], correct: (idx + 1) % 3 },
            { id: `a2_h_${n}_p1_q3`, text: "Was ist der Plan für das Wochenende?", options: ["in die Stadt fahren", "zu Hause bleiben", "Freunde besuchen"], correct: (idx + 2) % 3 },
            { id: `a2_h_${n}_p1_q4`, text: "Welches Verkehrsmittel wird empfohlen?", options: ["die U-Bahn", "der Bus", "das Taxi"], correct: idx % 3 },
            { id: `a2_h_${n}_p1_q5`, text: "Wann soll man zurückrufen?", options: ["vor 12 Uhr", "nach 14 Uhr", "nach 17 Uhr"], correct: (idx + 1) % 3 },
          ],
        },
        {
          type: "true_false",
          title: "Teil 2 – Richtig oder falsch?",
          points: 5,
          questions: [
            { id: `a2_h_${n}_p2_q1`, statement: "Die Anmeldung ist bis Ende des Monats möglich.", correct: idx % 2 === 0, audioContext: `Die Anmeldung ist ${idx % 2 === 0 ? "bis Ende des Monats" : "bis nächste Woche Freitag"} möglich.` },
            { id: `a2_h_${n}_p2_q2`, statement: "Für Senioren gibt es eine Ermäßigung.", correct: idx % 3 !== 0, audioContext: `${idx % 3 !== 0 ? "Senioren erhalten 20% Ermäßigung auf alle Tickets" : "Es gibt keine Ermäßigungen für Senioren"}.` },
            { id: `a2_h_${n}_p2_q3`, statement: "Die Veranstaltung findet im Freien statt.", correct: idx % 2 !== 0, audioContext: `Die Veranstaltung findet ${idx % 2 !== 0 ? "auf dem Marktplatz statt" : "in der Stadtbibliothek statt"}.` },
            { id: `a2_h_${n}_p2_q4`, statement: "Man braucht eine Voranmeldung.", correct: idx % 3 === 0, audioContext: `${idx % 3 === 0 ? "Eine Voranmeldung ist erforderlich" : "Eine Voranmeldung ist nicht nötig, kommen Sie einfach vorbei"}.` },
            { id: `a2_h_${n}_p2_q5`, statement: "Es gibt eine Möglichkeit, online zu bezahlen.", correct: idx % 2 === 0, audioContext: `${idx % 2 === 0 ? "Online-Zahlung ist möglich über unsere Website" : "Zahlung ist nur vor Ort möglich"}.` },
          ],
        },
        {
          type: "mcq",
          title: "Teil 3 – Ansagen und Durchsagen",
          points: 5,
          questions: [
            { id: `a2_h_${n}_p3_q1`, text: "Was ist die Hauptnachricht dieser Ansage?", options: ["eine Warnung", "eine Einladung", "eine Information"], correct: (idx + 2) % 3 },
            { id: `a2_h_${n}_p3_q2`, text: "An wen richtet sich diese Ansage hauptsächlich?", options: ["an Studenten", "an alle Bürger", "an Reisende"], correct: (idx + 1) % 3 },
            { id: `a2_h_${n}_p3_q3`, text: "Was soll man mitbringen?", options: ["einen Ausweis", "eine Bestätigung", "nichts Besonderes"], correct: idx % 3 },
            { id: `a2_h_${n}_p3_q4`, text: "Wo findet die beschriebene Aktivität statt?", options: ["im Stadtzentrum", "am Stadtrand", "außerhalb der Stadt"], correct: (idx + 2) % 3 },
            { id: `a2_h_${n}_p3_q5`, text: "Wie kann man mehr Informationen bekommen?", options: ["per Telefon", "per E-Mail", "auf der Website"], correct: (idx + 1) % 3 },
          ],
        },
      ],
    });
  }
  return results;
}

export const ALL_A2_HOEREN: HoerenExam[] = [
  ...A2_HOEREN,
  ...generateA2Hoeren(3, 28),
];

// ═══════════════════════════════════════════════════════════════
// B1 HÖREN — 30 exams
// ═══════════════════════════════════════════════════════════════

function generateB1Hoeren(count: number): HoerenExam[] {
  const results: HoerenExam[] = [];
  const topics = [
    "Umweltschutz", "Digitalisierung", "Gesundheit und Ernährung", "Arbeitswelt der Zukunft",
    "Reisen und Tourismus", "Bildung und Schule", "Medien und Kommunikation", "Sport und Fitness",
    "Kunst und Kultur", "Stadtleben vs. Landleben",
  ];
  for (let i = 0; i < count; i++) {
    const n = String(i + 1).padStart(2, "0");
    const topic = topics[i % topics.length];
    results.push({
      id: `b1_h_${n}`,
      title: `Hören – Prüfung ${i + 1}`,
      level: "B1",
      durationMinutes: 40,
      totalPoints: 25,
      instructions: "Sie hören verschiedene Texte. Beantworten Sie die Fragen.",
      parts: [
        {
          type: "mcq",
          title: `Teil 1 – Gespräch über ${topic}`,
          points: 5,
          questions: [
            { id: `b1_h_${n}_p1_q1`, text: `Was ist die Hauptmeinung der Person zum Thema ${topic}?`, options: ["sehr positiv", "kritisch aber offen", "vollständig negativ"], correct: 1 },
            { id: `b1_h_${n}_p1_q2`, text: "Welches Argument wird als am stärksten bewertet?", options: ["wirtschaftliche Vorteile", "gesellschaftlicher Nutzen", "persönliche Erfahrungen"], correct: (i + 1) % 3 },
            { id: `b1_h_${n}_p1_q3`, text: "Was schlägt die Person als Lösung vor?", options: ["mehr staatliche Kontrolle", "bessere Aufklärung", "technische Innovationen"], correct: (i + 2) % 3 },
            { id: `b1_h_${n}_p1_q4`, text: "Wem gibt die Person die Hauptverantwortung?", options: ["dem Staat", "den Unternehmen", "jedem Einzelnen"], correct: i % 3 },
            { id: `b1_h_${n}_p1_q5`, text: "Was wird als größtes Problem genannt?", options: ["Mangel an Information", "fehlendes Geld", "fehlendes Interesse"], correct: (i + 1) % 3 },
          ],
        },
        {
          type: "true_false",
          title: "Teil 2 – Radio-Interview",
          points: 5,
          questions: [
            { id: `b1_h_${n}_p2_q1`, statement: `${topic} ist laut dem Experten ein wachsendes Problem.`, correct: i % 2 === 0, audioContext: `Experte: "${i % 2 === 0 ? "Ja, wir sehen jedes Jahr eine deutliche Zunahme" : "Ehrlich gesagt stagniert die Entwicklung momentan"}"` },
            { id: `b1_h_${n}_p2_q2`, statement: "Junge Menschen engagieren sich mehr als ältere.", correct: i % 3 !== 2, audioContext: `${i % 3 !== 2 ? "Studien zeigen, dass die Jugend deutlich engagierter ist" : "Überraschenderweise sind ältere Generationen aktiver"}.` },
            { id: `b1_h_${n}_p2_q3`, statement: "Deutschland ist in Europa führend bei diesem Thema.", correct: i % 4 === 0, audioContext: `${i % 4 === 0 ? "Deutschland gilt als Vorreiter in Europa" : "Hier liegt Deutschland im europäischen Mittelfeld"}.` },
            { id: `b1_h_${n}_p2_q4`, statement: "Die Regierung hat neue Gesetze verabschiedet.", correct: i % 2 !== 0, audioContext: `${i % 2 !== 0 ? "Im letzten Jahr wurden drei neue Gesetze verabschiedet" : "Trotz Diskussionen gibt es noch keine neuen Gesetze"}.` },
            { id: `b1_h_${n}_p2_q5`, statement: "Schulen spielen eine wichtige Rolle bei der Lösung.", correct: true, audioContext: "Alle Experten sind sich einig: Schulen sind der Schlüssel für eine langfristige Lösung." },
          ],
        },
        {
          type: "mcq",
          title: "Teil 3 – Telefonansagen",
          points: 5,
          questions: [
            { id: `b1_h_${n}_p3_q1`, text: "Was ist der Grund für den Anruf?", options: ["eine Beschwerde", "eine Anfrage", "eine Bestätigung"], correct: i % 3 },
            { id: `b1_h_${n}_p3_q2`, text: "Was wird als Nächstes erwartet?", options: ["ein Rückruf", "eine E-Mail", "ein Brief"], correct: (i + 1) % 3 },
            { id: `b1_h_${n}_p3_q3`, text: "Bis wann soll man sich melden?", options: ["bis heute Abend", "bis morgen Mittag", "bis Ende der Woche"], correct: (i + 2) % 3 },
            { id: `b1_h_${n}_p3_q4`, text: "Welche Abteilung ist zuständig?", options: ["Kundenservice", "Technischer Support", "Buchhaltung"], correct: i % 3 },
            { id: `b1_h_${n}_p3_q5`, text: "Was soll man bereithalten?", options: ["Kundennummer", "Bestellnummer", "Passwort"], correct: (i + 1) % 3 },
          ],
        },
        {
          type: "mcq",
          title: "Teil 4 – Radio-Magazin",
          points: 5,
          questions: [
            { id: `b1_h_${n}_p4_q1`, text: "Was ist das Hauptthema des Radiobeitrags?", options: [`Neue Entwicklungen bei ${topic}`, `Geschichte von ${topic}`, `Kritik an ${topic}`], correct: 0 },
            { id: `b1_h_${n}_p4_q2`, text: "Welche Altersgruppe wird am häufigsten erwähnt?", options: ["Kinder und Jugendliche", "Berufstätige", "Rentner"], correct: (i + 1) % 3 },
            { id: `b1_h_${n}_p4_q3`, text: "In welchem Land wurde das beschriebene Projekt durchgeführt?", options: ["Deutschland", "Österreich", "der Schweiz"], correct: i % 3 },
            { id: `b1_h_${n}_p4_q4`, text: "Was war das Ergebnis des Projekts?", options: ["voller Erfolg", "teilweise erfolgreich", "gescheitert"], correct: 1 },
            { id: `b1_h_${n}_p4_q5`, text: "Was empfiehlt der Moderator zum Schluss?", options: ["mehr Forschung", "sofortiges Handeln", "Abwarten"], correct: 0 },
          ],
        },
      ],
    });
  }
  return results;
}

export const ALL_B1_HOEREN: HoerenExam[] = generateB1Hoeren(30);

// ═══════════════════════════════════════════════════════════════
// A1 LESEN — 30 exams
// ═══════════════════════════════════════════════════════════════

function generateA1Lesen(count: number): LesenExam[] {
  const results: LesenExam[] = [];
  const notices = [
    { item: "Anzeige: Wohnung zu vermieten", target: "jemand sucht eine Wohnung" },
    { item: "Anzeige: Fahrrad zu verkaufen", target: "jemand sucht ein günstiges Fahrrad" },
    { item: "Stellenanzeige: Kellner gesucht", target: "jemand sucht einen Nebenjob" },
    { item: "Ankündigung: Deutschkurs", target: "jemand möchte Deutsch lernen" },
    { item: "Angebot: Nachhilfestunden", target: "jemand braucht Hilfe beim Lernen" },
  ];
  for (let i = 0; i < count; i++) {
    const n = String(i + 1).padStart(2, "0");
    results.push({
      id: `a1_l_${n}`,
      title: `Lesen – Prüfung ${i + 1}`,
      level: "A1",
      durationMinutes: 25,
      totalPoints: 25,
      instructions: "Lesen Sie die Texte und wählen Sie die richtige Antwort.",
      parts: [
        {
          type: "matching",
          title: "Teil 1 – Anzeigen und Personen",
          points: 5,
          task: {
            id: `a1_l_${n}_p1`,
            items: notices.map((no) => ({ label: no.item, content: no.item })),
            targets: notices.map((_, idx) => `Person ${idx + 1}: ${notices[(idx + i) % notices.length].target}`),
            correctMap: Object.fromEntries(notices.map((no, idx) => [no.item, `Person ${((idx - i + notices.length) % notices.length) + 1}: ${notices[(idx) % notices.length].target}`])),
          },
        },
        {
          type: "mcq",
          title: "Teil 2 – Kurznachrichten lesen",
          points: 5,
          passage: `Hallo ${["Anna", "Klaus", "Lisa", "Tom", "Sara"][i % 5]}! \n\nIch mache heute Abend eine kleine Party. Kannst du um ${17 + (i % 5)} Uhr kommen? Bring bitte etwas zu trinken mit. \n\nBis später, ${["Tom", "Maria", "Peter", "Lena", "Max"][i % 5]}`,
          questions: [
            { id: `a1_l_${n}_p2_q1`, text: "Was findet heute statt?", options: ["eine Party", "ein Kurs", "ein Konzert"], correct: 0 },
            { id: `a1_l_${n}_p2_q2`, text: "Was soll man mitbringen?", options: ["Essen", "Getränke", "Musik"], correct: 1 },
            { id: `a1_l_${n}_p2_q3`, text: "Wann beginnt die Veranstaltung?", options: [`um ${17 + (i % 5)} Uhr`, `um ${18 + (i % 5)} Uhr`, `um ${19 + (i % 5)} Uhr`], correct: 0 },
            { id: `a1_l_${n}_p2_q4`, text: "Wer hat die Nachricht geschrieben?", options: [["Tom", "Maria", "Peter", "Lena", "Max"][i % 5], ["Anna", "Klaus", "Lisa", "Tom", "Sara"][i % 5], "jemand Unbekanntes"], correct: 0 },
            { id: `a1_l_${n}_p2_q5`, text: "An wen ist die Nachricht?", options: [["Anna", "Klaus", "Lisa", "Tom", "Sara"][i % 5], ["Tom", "Maria", "Peter", "Lena", "Max"][i % 5], "an alle"], correct: 0 },
          ],
        },
        {
          type: "mcq",
          title: "Teil 3 – Schilder und Aushänge",
          points: 5,
          passage: [
            "VORSICHT! Nasse Böden – Bitte langsam gehen!",
            "Geöffnet: Mo–Fr 9–18 Uhr, Sa 10–14 Uhr. Sonntags geschlossen.",
            "Hier parken verboten! Abschleppzone.",
            "Rauchen nur im Außenbereich erlaubt.",
            "Bitte Hunde anleinen! Danke.",
          ][i % 5],
          questions: [
            {
              id: `a1_l_${n}_p3_q1`,
              text: "Was bedeutet dieses Schild?",
              options: (([
                ["Seien Sie vorsichtig, der Boden ist rutschig", "Sie dürfen hier schnell laufen", "Der Boden ist repariert"],
                ["Das Geschäft hat bestimmte Öffnungszeiten", "Das Geschäft ist immer geöffnet", "Das Geschäft ist nur samstags offen"],
                ["Parken ist nicht erlaubt", "Sie können kurz parken", "Parken ist kostenlos"],
                ["Rauchen ist nur draußen erlaubt", "Rauchen ist überall verboten", "Rauchen ist frei"],
                ["Hunde müssen eine Leine tragen", "Hunde dürfen frei laufen", "Hunde sind verboten"],
              ] as string[][])[i % 5]),
              correct: 0,
            },
            { id: `a1_l_${n}_p3_q2`, text: "Für wen ist dieses Schild?", options: ["für alle Besucher", "nur für Mitarbeiter", "nur für Kinder"], correct: 0 },
            { id: `a1_l_${n}_p3_q3`, text: "Was soll man tun?", options: ["die Anweisung befolgen", "die Anweisung ignorieren", "eine Person fragen"], correct: 0 },
            { id: `a1_l_${n}_p3_q4`, text: "Wo findet man solche Schilder?", options: ["in öffentlichen Gebäuden", "nur zu Hause", "nur in Schulen"], correct: 0 },
            { id: `a1_l_${n}_p3_q5`, text: "Was passiert, wenn man die Anweisung nicht befolgt?", options: ["Es könnte gefährlich werden", "Nichts Besonderes", "Man bekommt ein Geschenk"], correct: 0 },
          ],
        },
      ],
    });
  }
  return results;
}

export const ALL_A1_LESEN: LesenExam[] = generateA1Lesen(30);

// ═══════════════════════════════════════════════════════════════
// A2 LESEN — 30 exams
// ═══════════════════════════════════════════════════════════════

function generateA2Lesen(count: number): LesenExam[] {
  const results: LesenExam[] = [];
  const passages = [
    { title: "Ein neues Café in der Stadt", text: "Das Café 'Morgensonne' öffnet nächste Woche in der Hauptstraße 15. Das Café bietet Frühstück, Mittagessen und Kaffee an. Es gibt auch WLAN und gemütliche Sitzplätze. Die Öffnungszeiten sind montags bis samstags von 8 bis 20 Uhr. Jeden Dienstag gibt es ein besonderes Angebot: Kaffee und Kuchen für nur 3,50 Euro. Die Inhaberin, Frau Berger, freut sich auf viele Gäste." },
    { title: "Ausflug in den Zoo", text: "Der Stadtpark-Zoo lädt am Sonntag zu einem Familientag ein. Kinder unter 6 Jahren haben freien Eintritt. Für Erwachsene kostet der Eintritt 8 Euro, für Kinder von 6 bis 14 Jahren 4 Euro. Ab 14 Uhr gibt es eine Führung durch das Tropenhaus. Bitte denken Sie an warme Kleidung, da es im Außenbereich kühl sein kann." },
    { title: "Sprachkurs für Anfänger", text: "Das Sprachzentrum Rosenberg bietet ab Oktober einen neuen Spanischkurs für Anfänger an. Der Kurs findet jeden Montag und Donnerstag von 18 bis 20 Uhr statt. Kosten: 180 Euro für 10 Wochen. Materialien sind im Preis enthalten. Anmeldung bis 30. September online oder telefonisch unter 089-123456." },
    { title: "Wohnungssuche in München", text: "Schöne 2-Zimmer-Wohnung in München-Schwabing zu vermieten. 65 Quadratmeter, helle Räume, moderne Küche, Balkon. Miete: 1.200 Euro warm, Kaution: 2 Monatsmieten. Ab 1. November frei. Haustiere nach Absprache möglich. Kontakt: Immobilien Schmidt, Tel. 089-987654." },
    { title: "Stadtradfahren – Tipps für Anfänger", text: "Immer mehr Menschen fahren in der Stadt mit dem Fahrrad. Das spart Zeit, ist umweltfreundlich und macht fit. Wichtig: Immer einen Helm tragen! Auch Licht vorne und hinten ist Pflicht. Benutzen Sie wenn möglich den Fahrradweg. An roten Ampeln müssen auch Radfahrer warten. Tipp: Kaufen Sie ein gutes Schloss, um Ihr Fahrrad zu sichern." },
  ];
  for (let i = 0; i < count; i++) {
    const n = String(i + 1).padStart(2, "0");
    const p = passages[i % passages.length];
    results.push({
      id: `a2_l_${n}`,
      title: `Lesen – Prüfung ${i + 1}`,
      level: "A2",
      durationMinutes: 25,
      totalPoints: 25,
      instructions: "Lesen Sie die Texte und wählen Sie die richtige Antwort.",
      parts: [
        {
          type: "matching",
          title: "Teil 1 – Anzeigen und Personen zuordnen",
          points: 5,
          task: {
            id: `a2_l_${n}_p1`,
            items: [
              { label: "Anzeige A", content: "Gitarrenunterricht – Anfänger und Fortgeschrittene. Tel. 0176-111222" },
              { label: "Anzeige B", content: "Verkaufe Sofa, 2 Jahre alt, sehr guter Zustand. 150 Euro. Abholung." },
              { label: "Anzeige C", content: "Suche Mitfahrer nach Frankfurt jeden Dienstag. Kosten teilen." },
              { label: "Anzeige D", content: "Biete Nachhilfe in Mathematik für Gymnasiasten. Günstig." },
              { label: "Anzeige E", content: "Vermiete Zimmer in WG, 400 Euro warm, ab sofort." },
            ],
            targets: [
              `Person 1 sucht ${["ein möbliertes Zimmer", "Fahrgelegenheit", "Lernangebote für Kinder", "günstige Möbel", "Musikunterricht"][i % 5]}`,
              `Person 2 sucht ${["Musikunterricht", "ein möbliertes Zimmer", "Fahrgelegenheit", "Lernangebote", "günstige Möbel"][(i + 1) % 5]}`,
              `Person 3 sucht ${["Lernangebote für Kinder", "günstige Möbel", "Musikunterricht", "Fahrgelegenheit", "ein Zimmer"][(i + 2) % 5]}`,
              `Person 4 sucht ${["günstige Möbel", "Lernangebote", "ein Zimmer", "Musikunterricht", "Fahrgelegenheit"][(i + 3) % 5]}`,
              `Person 5 sucht ${["Fahrgelegenheit", "ein Zimmer", "günstige Möbel", "Musikunterricht", "Lernangebote"][(i + 4) % 5]}`,
            ],
            correctMap: {
              "Anzeige A": `Person ${((4 - i) % 5) + 1} sucht ${["ein möbliertes Zimmer", "Fahrgelegenheit", "Lernangebote für Kinder", "günstige Möbel", "Musikunterricht"][4 % 5]}`,
              "Anzeige B": `Person ${((3 - i) % 5) + 1} sucht günstige Möbel`,
              "Anzeige C": `Person ${((2 - i) % 5) + 1} sucht Fahrgelegenheit`,
              "Anzeige D": `Person ${((1 - i) % 5) + 1} sucht Lernangebote`,
              "Anzeige E": `Person ${((0 - i) % 5) + 1} sucht ein Zimmer`,
            },
          },
        },
        {
          type: "mcq",
          title: `Teil 2 – ${p.title}`,
          points: 10,
          passage: p.text,
          questions: [
            { id: `a2_l_${n}_p2_q1`, text: "Was ist das Hauptthema des Textes?", options: [p.title, "Das Leben in Deutschland", "Geschichte der Stadt"], correct: 0 },
            { id: `a2_l_${n}_p2_q2`, text: "Was können Leser aus diesem Text lernen?", options: ["wichtige Informationen und Details", "historische Fakten", "wissenschaftliche Erkenntnisse"], correct: 0 },
            { id: `a2_l_${n}_p2_q3`, text: "An wen richtet sich dieser Text?", options: ["an alle interessierten Leser", "nur an Experten", "nur an Kinder"], correct: 0 },
            { id: `a2_l_${n}_p2_q4`, text: "Welchen Ton hat der Text?", options: ["informativ und sachlich", "emotional und persönlich", "wissenschaftlich und komplex"], correct: 0 },
            { id: `a2_l_${n}_p2_q5`, text: "Was könnte man als Nächstes tun, nachdem man den Text gelesen hat?", options: ["mehr Informationen suchen", "den Text ignorieren", "den Text übersetzen"], correct: 0 },
            { id: `a2_l_${n}_p2_q6`, text: "Welcher Satz beschreibt den Text am besten?", options: ["Der Text gibt hilfreiche Informationen.", "Der Text ist schwer zu verstehen.", "Der Text ist nicht interessant."], correct: 0 },
            { id: `a2_l_${n}_p2_q7`, text: "Gibt es im Text konkrete Zahlen oder Fakten?", options: ["Ja, es gibt spezifische Details.", "Nein, alles ist vage.", "Vielleicht, aber sie sind unwichtig."], correct: 0 },
            { id: `a2_l_${n}_p2_q8`, text: "Welche Textsorte ist das wahrscheinlich?", options: ["eine Zeitungsanzeige oder Mitteilung", "ein wissenschaftlicher Artikel", "ein Gedicht"], correct: 0 },
            { id: `a2_l_${n}_p2_q9`, text: "Ist der Text positiv oder negativ?", options: ["eher positiv", "eher negativ", "neutral"], correct: i % 3 },
            { id: `a2_l_${n}_p2_q10`, text: "Was ist das Ziel des Textes?", options: ["informieren oder einladen", "warnen oder kritisieren", "unterhalten oder amüsieren"], correct: 0 },
          ],
        },
        {
          type: "mcq",
          title: "Teil 3 – Kurze Anzeigen verstehen",
          points: 5,
          passage: "Sonderangebot: 30% auf alle Winterjacken! Nur solange der Vorrat reicht. Gültig bis Sonntag.",
          questions: [
            { id: `a2_l_${n}_p3_q1`, text: "Was wird angeboten?", options: ["reduzierte Winterjacken", "Sommerschuhe", "günstige Hosen"], correct: 0 },
            { id: `a2_l_${n}_p3_q2`, text: "Wie groß ist die Ermäßigung?", options: ["30%", "20%", "50%"], correct: 0 },
            { id: `a2_l_${n}_p3_q3`, text: "Bis wann gilt das Angebot?", options: ["bis Sonntag", "bis Samstag", "bis Ende des Monats"], correct: 0 },
            { id: `a2_l_${n}_p3_q4`, text: "Was ist die Einschränkung?", options: ["nur solange der Vorrat reicht", "nur für Stammkunden", "nur am Wochenende"], correct: 0 },
            { id: `a2_l_${n}_p3_q5`, text: "Was sollte man tun, wenn man eine Jacke kaufen möchte?", options: ["schnell handeln", "bis nächste Woche warten", "online bestellen"], correct: 0 },
          ],
        },
      ],
    });
  }
  return results;
}

export const ALL_A2_LESEN: LesenExam[] = generateA2Lesen(30);

// ═══════════════════════════════════════════════════════════════
// B1 LESEN — 30 exams
// ═══════════════════════════════════════════════════════════════

function generateB1Lesen(count: number): LesenExam[] {
  const results: LesenExam[] = [];
  const topics = [
    { title: "Homeoffice: Vor- und Nachteile", text: "Die Coronapandemie hat das Homeoffice in Deutschland salonfähig gemacht. Während viele Arbeitnehmer die Flexibilität und den Wegfall des Pendelns schätzen, berichten andere von Problemen mit der Selbstdisziplin und der sozialen Isolation. Studien zeigen, dass die Produktivität im Homeoffice um bis zu 15 Prozent steigen kann, wenn die Arbeitsbedingungen optimal sind. Allerdings verschwimmen für viele die Grenzen zwischen Berufs- und Privatleben. Experten empfehlen klare Arbeitszeiten und einen eigenen Arbeitsplatz zu Hause. Unternehmen müssen in technische Ausstattung investieren und die Kommunikation zwischen Mitarbeitern aktiv fördern." },
    { title: "Nachhaltiger Tourismus", text: "Immer mehr Reisende entscheiden sich bewusst für umweltfreundliche Urlaubsformen. Ökotourismus, Radreisen und Slow Travel sind Trends, die den ökologischen Fußabdruck minimieren sollen. Dabei geht es nicht nur um Transportmittel, sondern auch um die Wahl der Unterkunft und lokale Produkte. Hotels mit Nachhaltigkeitszertifikat gewinnen an Beliebtheit. Kritiker warnen jedoch, dass 'Greenwashing' – also das oberflächliche Bewerben von Umweltfreundlichkeit – ein wachsendes Problem darstellt. Reisende sollten sich informieren, welche Anbieter wirklich nachhaltig wirtschaften." },
    { title: "Digitale Medien im Unterricht", text: "Tablets, interaktive Whiteboards und Lernplattformen halten zunehmend Einzug in deutsche Schulen. Der Einsatz digitaler Medien soll den Unterricht abwechslungsreicher machen und Schüler auf die digitale Arbeitswelt vorbereiten. Gleichzeitig warnen Pädagogen vor zu viel Bildschirmzeit und fordern einen ausgewogenen Mix aus traditionellen und digitalen Lernmethoden. Eine Studie der Universität Münster zeigt, dass Schüler bei digitalem Lernen zwar motivierter sind, aber tieferes Verständnis oft noch besser durch klassische Methoden gefördert wird." },
  ];
  for (let i = 0; i < count; i++) {
    const n = String(i + 1).padStart(2, "0");
    const tp = topics[i % topics.length];
    results.push({
      id: `b1_l_${n}`,
      title: `Lesen – Prüfung ${i + 1}`,
      level: "B1",
      durationMinutes: 65,
      totalPoints: 25,
      instructions: "Lesen Sie die Texte sorgfältig und beantworten Sie die Fragen.",
      parts: [
        {
          type: "matching",
          title: "Teil 1 – Texte und Überschriften",
          points: 5,
          task: {
            id: `b1_l_${n}_p1`,
            items: [
              { label: "Text 1", content: "Immer mehr Deutsche verzichten auf das Auto und nutzen Sharing-Angebote." },
              { label: "Text 2", content: "Neue Studie zeigt: Schlaf ist wichtiger als bisher gedacht." },
              { label: "Text 3", content: "Start-up aus Berlin entwickelt App für mentale Gesundheit." },
              { label: "Text 4", content: "Bundesregierung plant Reform des Bildungssystems." },
              { label: "Text 5", content: "Vegetarische Küche boomt in deutschen Restaurants." },
            ],
            targets: [
              "a) Gesundheit und Wohlbefinden",
              "b) Mobilität und Verkehr",
              "c) Ernährung und Lifestyle",
              "d) Technologie und Innovation",
              "e) Politik und Gesellschaft",
            ],
            correctMap: {
              "Text 1": "b) Mobilität und Verkehr",
              "Text 2": "a) Gesundheit und Wohlbefinden",
              "Text 3": "d) Technologie und Innovation",
              "Text 4": "e) Politik und Gesellschaft",
              "Text 5": "c) Ernährung und Lifestyle",
            },
          },
        },
        {
          type: "fill_gap",
          title: "Teil 2 – Lückentext",
          points: 5,
          task: {
            id: `b1_l_${n}_p2`,
            textWithGaps: `Deutschland ist bekannt für seine starke Wirtschaft und hohe ${1}. Viele ${2} aus der ganzen Welt kommen hierher, um zu arbeiten oder zu ${3}. Die deutsche Sprache gilt als ${4} für den beruflichen Erfolg in vielen Branchen. Das Schulsystem ${5} zwischen den Bundesländern.`,
            options: {
              "1": ["Lebensqualität", "Armut", "Kriminalität"],
              "2": ["Ausländer", "Fachkräfte", "Touristen"],
              "3": ["studieren", "fliehen", "einkaufen"],
              "4": ["Hindernis", "Vorteil", "Pflicht"],
              "5": ["unterscheidet sich", "ist gleich", "funktioniert nicht"],
            },
            answers: { "1": "Lebensqualität", "2": "Fachkräfte", "3": "studieren", "4": "Vorteil", "5": "unterscheidet sich" },
          },
        },
        {
          type: "mcq",
          title: `Teil 3 – ${tp.title}`,
          points: 5,
          passage: tp.text,
          questions: [
            { id: `b1_l_${n}_p3_q1`, text: "Was ist die Hauptaussage des Textes?", options: [tp.title + " hat verschiedene Aspekte.", "Das Thema ist unwichtig.", "Alles ist positiv."], correct: 0 },
            { id: `b1_l_${n}_p3_q2`, text: "Welche Personen oder Gruppen werden im Text erwähnt?", options: ["Experten und Bürger", "nur Politiker", "nur Wissenschaftler"], correct: 0 },
            { id: `b1_l_${n}_p3_q3`, text: "Wird im Text eine Lösung vorgeschlagen?", options: ["Ja, konkrete Empfehlungen werden gegeben", "Nein, nur Probleme werden beschrieben", "Nein, keine Meinung wird geäußert"], correct: 0 },
            { id: `b1_l_${n}_p3_q4`, text: "Ist der Text eher für oder gegen das Thema?", options: ["ausgewogen, zeigt Vor- und Nachteile", "eindeutig positiv", "eindeutig negativ"], correct: 0 },
            { id: `b1_l_${n}_p3_q5`, text: "Welche Art von Text ist das?", options: ["ein Meinungsartikel oder Sachtext", "ein literarisches Werk", "ein Werbetext"], correct: 0 },
          ],
        },
        {
          type: "mcq",
          title: "Teil 4 – Kleinanzeigen",
          points: 5,
          passage: "Biete: Deutschkurse für Firmen – maßgeschneidertes Programm, flexible Zeiten, qualifizierte Lehrkräfte. Für Anfänger bis Fortgeschrittene. Infopaket per E-Mail anfordern.",
          questions: [
            { id: `b1_l_${n}_p4_q1`, text: "Was wird angeboten?", options: ["Deutschkurse für Unternehmen", "Übersetzungsservices", "Sprachreisen"], correct: 0 },
            { id: `b1_l_${n}_p4_q2`, text: "Für wen ist das Angebot geeignet?", options: ["Firmen jeder Größe", "nur Großkonzerne", "nur Privatpersonen"], correct: 0 },
            { id: `b1_l_${n}_p4_q3`, text: "Was ist ein Vorteil dieses Angebots?", options: ["flexible Zeiten", "kostenlos", "international bekannt"], correct: 0 },
            { id: `b1_l_${n}_p4_q4`, text: "Wie bekommt man mehr Informationen?", options: ["per E-Mail", "per Telefon", "durch einen Besuch"], correct: 0 },
            { id: `b1_l_${n}_p4_q5`, text: "Für welches Niveau ist das Angebot?", options: ["alle Niveaus", "nur Anfänger", "nur Fortgeschrittene"], correct: 0 },
          ],
        },
        {
          type: "mcq",
          title: "Teil 5 – Längerer Text",
          points: 5,
          passage: "Die deutsche Sprache hat weltweit etwa 130 Millionen Muttersprachler und ist damit die meistgesprochene Muttersprache in der Europäischen Union. Deutsch ist Amtssprache in Deutschland, Österreich, der Schweiz, Liechtenstein, Luxemburg und Belgien. Als Fremdsprache wird Deutsch weltweit von etwa 15 Millionen Menschen gelernt. Besonders in Osteuropa, den USA und Japan ist das Interesse an Deutsch groß. Die Sprache ist bekannt für ihre langen zusammengesetzten Wörter, wie zum Beispiel 'Donaudampfschifffahrtsgesellschaft'. Diese Flexibilität in der Wortbildung ist eine Besonderheit des Deutschen.",
          questions: [
            { id: `b1_l_${n}_p5_q1`, text: "Wie viele Muttersprachler hat Deutsch weltweit?", options: ["etwa 130 Millionen", "etwa 50 Millionen", "etwa 200 Millionen"], correct: 0 },
            { id: `b1_l_${n}_p5_q2`, text: "In wie vielen Ländern ist Deutsch Amtssprache?", options: ["6 Ländern", "3 Ländern", "10 Ländern"], correct: 0 },
            { id: `b1_l_${n}_p5_q3`, text: "Was ist eine Besonderheit des Deutschen?", options: ["lange zusammengesetzte Wörter", "viele Lehnwörter", "einfache Grammatik"], correct: 0 },
            { id: `b1_l_${n}_p5_q4`, text: "In welchen Regionen ist Interesse an Deutsch besonders groß?", options: ["Osteuropa, USA und Japan", "Südamerika und Afrika", "Asien und Australien"], correct: 0 },
            { id: `b1_l_${n}_p5_q5`, text: "Was sagt der Text über Deutsch in der EU?", options: ["Es ist die meistgesprochene Muttersprache.", "Es ist eine Fremdsprache.", "Es verliert an Bedeutung."], correct: 0 },
          ],
        },
      ],
    });
  }
  return results;
}

export const ALL_B1_LESEN: LesenExam[] = generateB1Lesen(30);

// ═══════════════════════════════════════════════════════════════
// SCHREIBEN — All Levels
// ═══════════════════════════════════════════════════════════════

function generateSchreiben(level: Level, count: number): SchreibenExam[] {
  const results: SchreibenExam[] = [];

  const a1Tasks: Array<{ p1: SchreibenTask; p2: SchreibenTask }> = [
    {
      p1: {
        id: "t1",
        type: "form",
        points: 10,
        title: "Aufgabe 1 – Formular ausfüllen",
        prompt: "Füllen Sie das Anmeldeformular für den Deutschkurs aus.",
        fields: [
          { label: "Vorname", placeholder: "Ihr Vorname" },
          { label: "Nachname", placeholder: "Ihr Nachname" },
          { label: "Geburtsdatum", placeholder: "TT.MM.JJJJ" },
          { label: "Nationalität", placeholder: "Ihr Land" },
          { label: "E-Mail", placeholder: "ihre@email.de" },
          { label: "Telefon", placeholder: "+49 ..." },
          { label: "Vorkenntnisse", placeholder: "keine / A1 / A2 ..." },
          { label: "Kursbeginn", placeholder: "Datum" },
        ],
        modelAnswer: "Alle Felder korrekt ausgefüllt mit realistischen deutschen Angaben.",
        assessmentCriteria: ["Alle Felder ausgefüllt", "Korrekte Formatierung (Datum, Telefon)", "Leserliche Schrift"],
      },
      p2: {
        id: "t2",
        type: "message",
        points: 15,
        title: "Aufgabe 2 – Kurze Nachricht schreiben",
        prompt: "Ihr Freund Thomas fragt, ob Sie am Samstag ins Kino gehen möchten. Schreiben Sie ihm eine kurze Antwort. Schreiben Sie: ob Sie kommen können, warum (ja/nein), und wann Sie frei sind.",
        wordLimit: "30–50 Wörter",
        modelAnswer: "Hallo Thomas,\n\nleider kann ich am Samstag nicht ins Kino kommen, weil ich arbeiten muss. Aber am Sonntag habe ich Zeit. Können wir dann gehen?\n\nBis bald,\n[Name]",
        assessmentCriteria: ["Alle drei Punkte angesprochen", "Angemessene Länge (30–50 Wörter)", "Korrekte Anrede und Abschluss", "Verständliche Formulierungen"],
      },
    },
    {
      p1: {
        id: "t1",
        type: "form",
        points: 10,
        title: "Aufgabe 1 – Anmeldeformular",
        prompt: "Füllen Sie das Formular für die Stadtbibliothek aus.",
        fields: [
          { label: "Vorname", placeholder: "Ihr Vorname" },
          { label: "Nachname", placeholder: "Ihr Nachname" },
          { label: "Straße und Hausnummer", placeholder: "z.B. Hauptstraße 5" },
          { label: "PLZ und Ort", placeholder: "z.B. 80331 München" },
          { label: "Geburtsdatum", placeholder: "TT.MM.JJJJ" },
          { label: "E-Mail", placeholder: "ihre@email.de" },
        ],
        modelAnswer: "Formular vollständig und korrekt ausgefüllt.",
        assessmentCriteria: ["Alle Pflichtfelder ausgefüllt", "Korrekte Adressangabe", "Gültige E-Mail-Adresse"],
      },
      p2: {
        id: "t2",
        type: "message",
        points: 15,
        title: "Aufgabe 2 – Entschuldigung schreiben",
        prompt: "Sie können nicht zum Deutschkurs kommen. Schreiben Sie Ihrem Lehrer eine kurze Entschuldigung. Schreiben Sie: warum Sie fehlen, wie lange Sie fehlen werden, und ob Sie die Hausaufgaben bekommen können.",
        wordLimit: "30–50 Wörter",
        modelAnswer: "Sehr geehrter Herr/Frau [Name],\n\nleider muss ich diese Woche zum Arzt und kann nicht zum Kurs kommen. Ich fehle Dienstag und Donnerstag. Können Sie mir bitte die Hausaufgaben per E-Mail schicken?\n\nMit freundlichen Grüßen,\n[Name]",
        assessmentCriteria: ["Grund für Fehlen genannt", "Dauer des Fehlens angegeben", "Frage nach Hausaufgaben gestellt", "Formeller Ton"],
      },
    },
  ];

  const a2Prompts = [
    { p2prompt: "Sie haben in einem Online-Shop Schuhe bestellt. Die Schuhe sind zu klein. Schreiben Sie eine E-Mail. Schreiben Sie: welche Schuhe Sie bestellt haben, was das Problem ist, und was Sie möchten (Umtausch oder Rückgabe).", model: "Sehr geehrte Damen und Herren,\n\nich habe am [Datum] bei Ihnen Schuhe in Größe 39 bestellt (Bestellnummer: 12345). Leider sind die Schuhe zu klein – sie haben Größe 38. Ich bitte um Umtausch gegen die richtige Größe oder Erstattung des Kaufpreises.\n\nMit freundlichen Grüßen,\n[Name]" },
    { p2prompt: "Ihr Nachbar macht jeden Abend laute Musik. Schreiben Sie ihm eine kurze Nachricht. Schreiben Sie: das Problem, wann die Musik stört, und was Sie von ihm möchten.", model: "Lieber Nachbar,\n\nleider stört mich Ihre Musik jeden Abend ab 22 Uhr sehr. Ich muss früh aufstehen und kann nicht schlafen. Wäre es möglich, die Musik etwas leiser zu stellen nach 22 Uhr?\n\nVielen Dank und freundliche Grüße,\n[Name]" },
    { p2prompt: "Sie möchten ein Konto bei einer Bank eröffnen. Schreiben Sie eine E-Mail an die Bank. Schreiben Sie: was Sie möchten, welche Unterlagen Sie haben, und wann Sie kommen können.", model: "Sehr geehrte Damen und Herren,\n\nich möchte gerne ein Girokonto bei Ihrer Bank eröffnen. Ich habe meinen Reisepass und eine Wohnsitzbescheinigung dabei. Wann kann ich einen Termin vereinbaren? Ich bin montags bis freitags ab 16 Uhr verfügbar.\n\nMit freundlichen Grüßen,\n[Name]" },
  ];

  const b1Topics = [
    { topic: "Klimawandel und persönliche Verantwortung", forum: "Diskutieren Sie im Forum: Was kann jeder Einzelne gegen den Klimawandel tun?" },
    { topic: "Soziale Medien: Fluch oder Segen?", forum: "Im Internetforum wird diskutiert: Sind soziale Medien gut oder schlecht für die Gesellschaft?" },
    { topic: "Leben in der Großstadt vs. auf dem Land", forum: "Teilen Sie Ihre Meinung: Was sind die Vor- und Nachteile von Stadt- und Landleben?" },
    { topic: "Gesunde Ernährung im Alltag", forum: "Diskutieren Sie: Wie kann man sich trotz Stress und wenig Zeit gesund ernähren?" },
    { topic: "Homeoffice und Work-Life-Balance", forum: "Geben Sie Ihre Meinung ab: Ist Homeoffice besser als Büroarbeit?" },
  ];

  for (let i = 0; i < count; i++) {
    const n = String(i + 1).padStart(2, "0");

    if (level === "A1") {
      const taskSet = a1Tasks[i % a1Tasks.length];
      results.push({
        id: `a1_s_${n}`,
        title: `Schreiben – Prüfung ${i + 1}`,
        level: "A1",
        durationMinutes: 20,
        totalPoints: 25,
        instructions: "Bearbeiten Sie beide Aufgaben. Sie haben 20 Minuten Zeit.",
        tasks: [
          { ...taskSet.p1, id: `a1_s_${n}_t1` },
          { ...taskSet.p2, id: `a1_s_${n}_t2` },
        ],
      });
    } else if (level === "A2") {
      const pr = a2Prompts[i % a2Prompts.length];
      results.push({
        id: `a2_s_${n}`,
        title: `Schreiben – Prüfung ${i + 1}`,
        level: "A2",
        durationMinutes: 30,
        totalPoints: 25,
        instructions: "Bearbeiten Sie beide Aufgaben. Sie haben 30 Minuten Zeit.",
        tasks: [
          {
            id: `a2_s_${n}_t1`,
            type: "form",
            points: 10,
            title: "Aufgabe 1 – Formular / SMS",
            prompt: `Füllen Sie das Anmeldeformular für die Veranstaltung '${["Kunstworkshop", "Kochkurs", "Sprachkurs", "Fotokurs", "Yogakurs"][i % 5]}' aus und schreiben Sie eine kurze SMS an Ihren Freund/Ihre Freundin (20–30 Wörter), dass Sie sich angemeldet haben.`,
            wordLimit: "20–30 Wörter für SMS",
            fields: [
              { label: "Name", placeholder: "Vor- und Nachname" },
              { label: "Alter", placeholder: "Ihr Alter" },
              { label: "Kontakt", placeholder: "Telefon oder E-Mail" },
              { label: "Erfahrung", placeholder: "keine / Anfänger / Fortgeschritten" },
            ],
            modelAnswer: `Formular ausgefüllt.\nSMS: Hey! Ich habe mich für den ${["Kunstworkshop", "Kochkurs", "Sprachkurs", "Fotokurs", "Yogakurs"][i % 5]} angemeldet. Das wird toll! Kommst du auch?`,
            assessmentCriteria: ["Formular vollständig", "SMS verständlich", "Angemessene Länge", "Korrekte Sprache"],
          },
          {
            id: `a2_s_${n}_t2`,
            type: "message",
            points: 15,
            title: "Aufgabe 2 – E-Mail oder Nachricht",
            prompt: pr.p2prompt,
            wordLimit: "40–60 Wörter",
            modelAnswer: pr.model,
            assessmentCriteria: ["Alle Inhaltspunkte vorhanden", "Angemessene Anrede und Abschluss", "Korrekter Ton (formal/informal)", "40–60 Wörter", "Verständliche Formulierungen"],
          },
        ],
      });
    } else {
      const tp = b1Topics[i % b1Topics.length];
      results.push({
        id: `b1_s_${n}`,
        title: `Schreiben – Prüfung ${i + 1}`,
        level: "B1",
        durationMinutes: 60,
        totalPoints: 25,
        instructions: "Bearbeiten Sie beide Aufgaben. Sie haben 60 Minuten Zeit.",
        tasks: [
          {
            id: `b1_s_${n}_t1`,
            type: "email",
            points: 12,
            title: "Aufgabe 1 – Formeller Brief oder E-Mail",
            prompt: `Sie haben eine Stellenausschreibung für eine Stelle als ${["Bürokaufmann/-frau", "Verkäufer/in", "Erzieher/in", "IT-Fachkraft", "Pflegekraft"][i % 5]} gelesen. Schreiben Sie eine formelle Bewerbung. Schreiben Sie: warum Sie sich bewerben, welche Erfahrungen/Qualifikationen Sie haben, warum Sie für die Stelle geeignet sind, und wann Sie beginnen könnten.`,
            wordLimit: "80+ Wörter",
            modelAnswer: `Sehr geehrte Damen und Herren,\n\nmit großem Interesse habe ich Ihre Stellenausschreibung gelesen und bewerbe mich hiermit um die Stelle als ${["Bürokaufmann/-frau", "Verkäufer/in", "Erzieher/in", "IT-Fachkraft", "Pflegekraft"][i % 5]}.\n\nIch habe eine abgeschlossene Ausbildung und mehrjährige Erfahrung im Bereich. Meine Stärken liegen in der Teamarbeit, Kommunikation und selbstständigen Arbeitsweise. Ich bin zuverlässig, lernbereit und motiviert.\n\nIch würde mich freuen, mich in einem persönlichen Gespräch vorzustellen. Ich könnte ab dem ersten des nächsten Monats beginnen.\n\nMit freundlichen Grüßen,\n[Vor- und Nachname]`,
            assessmentCriteria: ["Formelle Anrede und Abschluss", "Alle vier Inhaltspunkte vorhanden", "Kohärenter Aufbau", "Formeller Ton", "Min. 80 Wörter", "Grammatik und Orthografie"],
          },
          {
            id: `b1_s_${n}_t2`,
            type: "forum_post",
            points: 13,
            title: "Aufgabe 2 – Forumsbeitrag",
            prompt: tp.forum + "\n\nSchreiben Sie einen Beitrag von ca. 100 Wörtern. Nennen Sie Ihre Meinung und begründen Sie sie mit mindestens zwei Argumenten.",
            wordLimit: "ca. 100 Wörter",
            modelAnswer: `Das Thema '${tp.topic}' beschäftigt viele Menschen. Ich bin der Meinung, dass jeder Einzelne Verantwortung trägt.\n\nErstens: Kleine Alltagsänderungen haben große Wirkung. Zum Beispiel kann man weniger Fleisch essen, öffentliche Verkehrsmittel nutzen und Energie sparen.\n\nZweitens: Wenn viele Menschen umdenken, entsteht ein gesellschaftlicher Wandel, der Unternehmen und Politik zum Handeln zwingt.\n\nNatürlich reicht individuelles Handeln allein nicht aus – auch strukturelle Maßnahmen sind nötig. Aber als Bürger haben wir die Pflicht, unseren Teil beizutragen.\n\nWas denkt ihr?`,
            assessmentCriteria: ["Klare Meinungsäußerung", "Mindestens zwei Argumente", "Beispiele oder Erklärungen", "Ca. 100 Wörter", "Kohärenter Aufbau", "Abschluss mit Frage/Einladung zur Diskussion"],
          },
        ],
      });
    }
  }
  return results;
}

export const ALL_A1_SCHREIBEN: SchreibenExam[] = generateSchreiben("A1", 30);
export const ALL_A2_SCHREIBEN: SchreibenExam[] = generateSchreiben("A2", 30);
export const ALL_B1_SCHREIBEN: SchreibenExam[] = generateSchreiben("B1", 30);

// ═══════════════════════════════════════════════════════════════
// SPRECHEN — All Levels
// ═══════════════════════════════════════════════════════════════

function generateSprechen(level: Level, count: number): SprechenExam[] {
  const results: SprechenExam[] = [];

  const a1IntroPrompts = [
    ["Name", "Alter", "Herkunftsland", "Wohnort", "Beruf", "Hobbys"],
    ["Name", "Geburtsort", "Familie", "Sprachen", "Lieblingsspeise", "Freizeit"],
    ["Vorname", "Nachname", "Wo wohnen Sie?", "Was arbeiten Sie?", "Was machen Sie gern?"],
  ];

  const a1QuestionCards = [
    [
      { question: "Wie ist das Wetter heute?", sampleAnswer: "Das Wetter ist heute sonnig und warm. Es hat etwa 22 Grad." },
      { question: "Was essen Sie gern?", sampleAnswer: "Ich esse gern Pizza und Pasta. Ich mag auch deutsches Brot." },
      { question: "Haben Sie Geschwister?", sampleAnswer: "Ja, ich habe einen Bruder. Er ist 25 Jahre alt und wohnt in Hamburg." },
      { question: "Was machen Sie am Wochenende?", sampleAnswer: "Am Wochenende treffe ich Freunde oder gehe spazieren. Manchmal koche ich auch." },
    ],
    [
      { question: "Wo kaufen Sie ein?", sampleAnswer: "Ich kaufe meistens im Supermarkt ein. Manchmal gehe ich auch auf den Markt." },
      { question: "Wie kommen Sie zur Arbeit?", sampleAnswer: "Ich fahre mit der U-Bahn zur Arbeit. Das dauert etwa 20 Minuten." },
      { question: "Was ist Ihr Lieblingsfilm?", sampleAnswer: "Mein Lieblingsfilm ist ein Komödie. Ich sehe gern lustige Filme." },
      { question: "Lernen Sie andere Sprachen?", sampleAnswer: "Ja, ich lerne Deutsch und ein bisschen Spanisch. Deutsch ist schön aber schwierig." },
    ],
  ];

  const a1Objects = [
    { imageDescription: "Ein Handy / Smartphone auf dem Tisch", prompts: ["Was ist das?", "Was kann man damit machen?", "Haben Sie auch so ein Gerät?"], sampleAnswer: "Das ist ein Handy. Man kann damit telefonieren, Nachrichten schreiben und im Internet surfen. Ja, ich habe auch ein Smartphone." },
    { imageDescription: "Eine Straßenbahn / Tram in der Stadt", prompts: ["Was sehen Sie?", "Benutzen Sie auch öffentliche Verkehrsmittel?", "Wo fährt die Straßenbahn?"], sampleAnswer: "Ich sehe eine Straßenbahn in der Stadt. Ja, ich benutze oft die Straßenbahn. Sie fährt durch das Stadtzentrum." },
    { imageDescription: "Ein Marktstand mit Obst und Gemüse", prompts: ["Was sehen Sie auf dem Bild?", "Kaufen Sie gern auf dem Markt ein?", "Was kostet Obst auf dem Markt?"], sampleAnswer: "Ich sehe einen Marktstand mit frischem Obst und Gemüse. Ja, ich kaufe gern auf dem Markt ein. Das Obst ist frisch und nicht sehr teuer." },
  ];

  const a2Scenarios = [
    { scenario: "Sie sind im Restaurant. Sie haben das falsche Gericht bekommen. Sprechen Sie mit dem Kellner.", sampleLines: ["Entschuldigung, ich habe ein Problem.", "Ich habe Schnitzel bestellt, aber hier ist Pasta.", "Können Sie bitte das richtige Gericht bringen?", "Danke für Ihr Verständnis."] },
    { scenario: "Sie rufen beim Arzt an und möchten einen Termin machen.", sampleLines: ["Guten Tag, mein Name ist [Name].", "Ich würde gern einen Termin vereinbaren.", "Ich habe Kopfschmerzen seit zwei Tagen.", "Wann haben Sie einen freien Termin?"] },
    { scenario: "Sie möchten ein Ticket für den Zug kaufen. Fragen Sie am Schalter nach den Zeiten und Preisen.", sampleLines: ["Guten Tag! Ich möchte nach Berlin fahren.", "Wann fährt der nächste Zug?", "Was kostet eine Fahrkarte hin und zurück?", "Kann ich mit Kreditkarte bezahlen?"] },
  ];

  const b1Topics = [
    { topic: "Ehrenamtliche Arbeit", outline: ["Was ist Ehrenamt?", "Warum ist es wichtig?", "Eigene Erfahrungen oder Beispiele", "Meinung und Fazit"] },
    { topic: "Digitale Kommunikation", outline: ["Welche Medien nutze ich?", "Vorteile digitaler Kommunikation", "Nachteile und Risiken", "Tipps für verantwortungsvolle Nutzung"] },
    { topic: "Gesunde Lebensweise", outline: ["Was bedeutet gesund leben?", "Meine tägliche Routine", "Herausforderungen", "Empfehlungen für andere"] },
    { topic: "Kulturelle Unterschiede in Deutschland", outline: ["Erste Eindrücke", "Überraschende Unterschiede", "Was ich gelernt habe", "Integration und Offenheit"] },
    { topic: "Meine Traumarbeit", outline: ["Welchen Beruf träume ich?", "Warum dieser Beruf?", "Welche Qualifikationen brauche ich?", "Meine Pläne für die Zukunft"] },
  ];

  const b1Discussions = [
    { topic: "Sollten Schulen weniger Hausaufgaben geben?", prompts: ["Was denken Sie?", "Welche Argumente gibt es dafür und dagegen?", "Was wäre die beste Lösung?"] },
    { topic: "Ist ein Leben ohne Smartphone möglich?", prompts: ["Können Sie sich das vorstellen?", "Was würde sich ändern?", "Was sind die Vor- und Nachteile?"] },
    { topic: "Sollte man immer die Wahrheit sagen?", prompts: ["Gibt es Situationen, wo kleine Lügen okay sind?", "Was sind die Folgen von Unehrlichkeit?", "Wie wichtig ist Ehrlichkeit für Sie?"] },
  ];

  const b1Planning = [
    { scenario: "Planen Sie mit Ihrem Partner eine Geburtstagsfeier für einen gemeinsamen Freund.", suggestions: ["Wo soll die Party stattfinden?", "Wen soll man einladen?", "Was für Essen und Getränke?", "Welche Aktivitäten oder Spiele?", "Was für ein Budget haben wir?"] },
    { scenario: "Planen Sie mit Ihrem Partner einen Kurzurlaub (3 Tage) in einer deutschen Stadt.", suggestions: ["Welche Stadt soll es sein?", "Wie fahren wir hin?", "Wo übernachten wir?", "Was möchten wir sehen und machen?", "Wie viel darf es kosten?"] },
    { scenario: "Planen Sie mit Ihrem Partner ein Abendessen für 8 Personen.", suggestions: ["Welche Küche bevorzugen wir?", "Was kaufen wir ein?", "Wer kocht was?", "Wie dekorieren wir den Tisch?", "Soll es Musik geben?"] },
  ];

  for (let i = 0; i < count; i++) {
    const n = String(i + 1).padStart(2, "0");

    if (level === "A1") {
      const intro = a1IntroPrompts[i % a1IntroPrompts.length];
      const cards = a1QuestionCards[i % a1QuestionCards.length];
      const obj = a1Objects[i % a1Objects.length];
      results.push({
        id: `a1_sp_${n}`,
        title: `Sprechen – Prüfung ${i + 1}`,
        level: "A1",
        durationMinutes: 15,
        totalPoints: 25,
        instructions: "Es gibt drei Teile. Sprechen Sie mit dem Prüfer oder Ihrer Partnerin/Ihrem Partner.",
        parts: [
          { type: "self_intro", title: "Teil 1 – Sich vorstellen", points: 8, prompts: intro },
          { type: "question_cards", title: "Teil 2 – Fragen stellen und antworten", points: 8, cards },
          { type: "picture_description", title: "Teil 3 – Bild beschreiben", points: 9, imageDescription: obj.imageDescription, prompts: obj.prompts, sampleAnswer: obj.sampleAnswer },
        ],
      });
    } else if (level === "A2") {
      const sc = a2Scenarios[i % a2Scenarios.length];
      results.push({
        id: `a2_sp_${n}`,
        title: `Sprechen – Prüfung ${i + 1}`,
        level: "A2",
        durationMinutes: 15,
        totalPoints: 25,
        instructions: "Es gibt drei Teile. Sprechen Sie mit dem Prüfer oder Ihrer Partnerin/Ihrem Partner.",
        parts: [
          {
            type: "self_intro",
            title: "Teil 1 – Über sich sprechen",
            points: 7,
            prompts: [
              "Stellen Sie sich vor: Name, Herkunft, Beruf, Familie, Wohnort",
              "Was machen Sie in Ihrer Freizeit?",
              "Warum lernen Sie Deutsch?",
              "Was sind Ihre Pläne für die Zukunft?",
            ],
          },
          {
            type: "question_cards",
            title: "Teil 2 – Fragen stellen",
            points: 8,
            cards: [
              { question: `Fragen Sie Ihren Partner über seine/ihre Erfahrungen mit ${["Reisen", "Sport", "Kochen", "Musik", "Sprachen"][i % 5]}.`, sampleAnswer: `Machst du gern ${["Reisen", "Sport", "Kochen", "Musik", "Sprachen"][i % 5]}? Seit wann machst du das? Was magst du daran besonders?` },
              { question: "Fragen Sie Ihren Partner, was er/sie am letzten Wochenende gemacht hat.", sampleAnswer: "Was hast du am Wochenende gemacht? Bist du irgendwohin gegangen? Hat es dir gefallen?" },
              { question: "Fragen Sie Ihren Partner nach seinem/ihrem Lieblingsrestaurant.", sampleAnswer: "Hast du ein Lieblingsrestaurant? Wo ist es? Was isst du dort gern? Gehst du oft dorthin?" },
            ],
          },
          { type: "role_play", title: "Teil 3 – Rollenspiel", points: 10, scenario: sc.scenario, sampleLines: sc.sampleLines },
        ],
      });
    } else {
      const tp = b1Topics[i % b1Topics.length];
      const disc = b1Discussions[i % b1Discussions.length];
      const plan = b1Planning[i % b1Planning.length];
      results.push({
        id: `b1_sp_${n}`,
        title: `Sprechen – Prüfung ${i + 1}`,
        level: "B1",
        durationMinutes: 15,
        totalPoints: 25,
        instructions: "Es gibt drei Teile. Sie haben 5 Minuten Vorbereitungszeit für Teil 1.",
        parts: [
          {
            type: "topic_presentation",
            title: "Teil 1 – Kurzpräsentation",
            points: 8,
            topic: tp.topic,
            outline: tp.outline,
            sampleAnswer: `Ich möchte heute über das Thema '${tp.topic}' sprechen.\n\n${tp.outline[0]}: ${tp.outline[0]} ist ein wichtiger Aspekt unseres Alltags.\n\n${tp.outline[1]}: ${tp.outline[1]} zeigt, wie bedeutend dieses Thema ist.\n\n${tp.outline[2]}: Aus eigener Erfahrung kann ich sagen, dass...\n\nFazit: Insgesamt denke ich, dass ${tp.topic} sehr wichtig ist und wir alle davon lernen können.`,
          },
          {
            type: "discussion",
            title: "Teil 2 – Diskussion",
            points: 8,
            topic: disc.topic,
            prompts: disc.prompts,
            sampleAnswer: `Ich finde, dass '${disc.topic}' ein sehr interessantes Thema ist. Meiner Meinung nach... Einerseits... Andererseits... Ich denke, die beste Lösung wäre...`,
          },
          {
            type: "planning",
            title: "Teil 3 – Gemeinsam planen",
            points: 9,
            scenario: plan.scenario,
            suggestions: plan.suggestions,
            sampleAnswer: `Ich schlage vor, dass wir zuerst über ${plan.suggestions[0]} entscheiden. Was meinst du? Ich finde es wichtig, dass... Wären Sie damit einverstanden? Vielleicht könnten wir auch...`,
          },
        ],
      });
    }
  }
  return results;
}

export const ALL_A1_SPRECHEN: SprechenExam[] = generateSprechen("A1", 30);
export const ALL_A2_SPRECHEN: SprechenExam[] = generateSprechen("A2", 30);
export const ALL_B1_SPRECHEN: SprechenExam[] = generateSprechen("B1", 30);

// ═══════════════════════════════════════════════════════════════
// MASTER INDEX
// ═══════════════════════════════════════════════════════════════

export const EXAM_CATALOG = {
  A1: {
    hoeren: ALL_A1_HOEREN,
    lesen: ALL_A1_LESEN,
    schreiben: ALL_A1_SCHREIBEN,
    sprechen: ALL_A1_SPRECHEN,
  },
  A2: {
    hoeren: ALL_A2_HOEREN,
    lesen: ALL_A2_LESEN,
    schreiben: ALL_A2_SCHREIBEN,
    sprechen: ALL_A2_SPRECHEN,
  },
  B1: {
    hoeren: ALL_B1_HOEREN,
    lesen: ALL_B1_LESEN,
    schreiben: ALL_B1_SCHREIBEN,
    sprechen: ALL_B1_SPRECHEN,
  },
};

export const SECTION_META: Record<Section, { label: string; icon: string; color: string; description: string }> = {
  hoeren: { label: "Hören", icon: "🎧", color: "#5C6BC0", description: "Hörverstehen – Audio-basierte Aufgaben" },
  lesen: { label: "Lesen", icon: "📖", color: "#26A69A", description: "Leseverstehen – Texte verstehen und analysieren" },
  schreiben: { label: "Schreiben", icon: "✏️", color: "#EF6C00", description: "Schriftlicher Ausdruck – Texte verfassen" },
  sprechen: { label: "Sprechen", icon: "🎤", color: "#AD1457", description: "Mündlicher Ausdruck – Gespräche und Präsentationen" },
};

export const LEVEL_META: Record<Level, { label: string; color: string; description: string; passScore: number }> = {
  A1: { label: "A1 – Anfänger", color: "#4CAF50", description: "Grundlegende Sprachkenntnisse", passScore: 60 },
  A2: { label: "A2 – Grundlegende Kenntnisse", color: "#FF9800", description: "Elementare Kommunikationsfähigkeiten", passScore: 60 },
  B1: { label: "B1 – Mittelstufe", color: "#F44336", description: "Selbstständige Sprachverwendung", passScore: 60 },
};

export type AnyExam = HoerenExam | LesenExam | SchreibenExam | SprechenExam;

export function getExams(level: Level, section: Section): AnyExam[] {
  return EXAM_CATALOG[level][section] as AnyExam[];
}

export function getExamById(level: Level, section: Section, id: string): AnyExam | undefined {
  return (EXAM_CATALOG[level][section] as AnyExam[]).find((e) => e.id === id);
}
