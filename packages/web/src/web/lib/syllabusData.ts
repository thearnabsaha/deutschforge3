/**
 * DeutschForge A1 Syllabus — Restructured
 * Hierarchy: Unit (biggest) → Level → Lesson (5 per level, 15q each)
 * 8 Units for A1. Grammar is a mid-level detour (redirects to grammar screen, then back).
 *
 * Lesson types (in order within every level):
 *  1. intro    — Teach with hints, very easy, guided
 *  2. practice — Ask questions, medium difficulty
 *  3. challenge — Harder, no hints
 *  4. tricky   — Misleading options, edge cases
 *  5. exam     — Strict, all question types, final test feel
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type LessonType = "intro" | "practice" | "challenge" | "tricky" | "exam";

export type PracticeType =
  | "pronunciation"
  | "listening"
  | "repeat_audio"
  | "spelling"
  | "typing"
  | "matching"
  | "number_listening"
  | "mcq"
  | "translation"
  | "sentence_completion"
  | "speaking"
  | "flashcard";

export interface SyllabusWord {
  id: string;
  german: string;
  english: string;
  article?: string; // der/die/das
  plural?: string;
  example_de: string;
  example_en: string;
  category: string;
}

export interface SyllabusLesson {
  lessonId: string;    // e.g. "u01-lv1-l1"
  type: LessonType;
  title: string;       // e.g. "Intro", "Practice", "Challenge", "Tricky", "Exam"
  questionCount: number; // always 15
  focusWordIds?: string[];
  grammarNote?: string;
}

export interface SyllabusLevel {
  levelId: string;     // e.g. "u01-lv1"
  levelNumber: number; // 1-based within unit
  title: string;       // e.g. "Sounds & Letters"
  description: string;
  lessons: SyllabusLesson[]; // always 5 in order: intro→practice→challenge→tricky→exam
  // Grammar detour: if set, a banner appears after completing lesson 2 (practice)
  // User is redirected to grammar screen, then comes back to continue from lesson 3
  grammarDetour?: {
    topicId: string;
    topicTitle: string;
    afterLessonIndex: number; // 0-indexed, lesson index after which the detour appears (usually 1 = after "practice")
  };
}

export interface SyllabusUnit {
  unitId: string;      // u01–u08
  unitNumber: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  xpReward: number;    // XP for completing whole unit
  levels: SyllabusLevel[];
  words: SyllabusWord[]; // all words introduced in this unit
  tip?: string;
}

// ─── Lesson factory — always 5 lessons per level ─────────────────────────────

function makeLessons(levelId: string, focusWordIds?: string[], grammarDetourAfter?: number): SyllabusLesson[] {
  const types: { type: LessonType; title: string }[] = [
    { type: "intro",     title: "Intro" },
    { type: "practice",  title: "Practice" },
    { type: "challenge", title: "Challenge" },
    { type: "tricky",    title: "Tricky" },
    { type: "exam",      title: "Exam" },
  ];
  return types.map((t, i) => ({
    lessonId: `${levelId}-l${i + 1}`,
    type: t.type,
    title: t.title,
    questionCount: 15,
    focusWordIds,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIT 1 — Sounds & Alphabet  (Foundation)
// 3 Levels. No grammar detour. Focus: pronunciation, alphabet, numbers 0–20.
// ─────────────────────────────────────────────────────────────────────────────

const UNIT_1: SyllabusUnit = {
  unitId: "u01",
  unitNumber: 1,
  title: "Grundlagen",
  subtitle: "Sounds, alphabet & first numbers",
  icon: "🎤",
  color: "#1CB0F6",
  xpReward: 150,
  tip: "German pronunciation is consistent — once you learn the rules, they always apply!",
  words: [
    { id: "w001", german: "Hallo", english: "Hello", example_de: "Hallo! Wie heißt du?", example_en: "Hello! What's your name?", category: "greetings" },
    { id: "w002", german: "Danke", english: "Thank you", example_de: "Danke sehr!", example_en: "Thank you very much!", category: "greetings" },
    { id: "w003", german: "Bitte", english: "Please / You're welcome", example_de: "Bitte schön!", example_en: "You're welcome!", category: "greetings" },
    { id: "w004", german: "Tschüss", english: "Bye", example_de: "Tschüss! Bis morgen!", example_en: "Bye! See you tomorrow!", category: "greetings" },
    { id: "w005", german: "Ja", english: "Yes", example_de: "Ja, natürlich!", example_en: "Yes, of course!", category: "basics" },
    { id: "w006", german: "Nein", english: "No", example_de: "Nein, das stimmt nicht.", example_en: "No, that's not right.", category: "basics" },
    { id: "w007", german: "eins", english: "one", example_de: "Ich habe eins.", example_en: "I have one.", category: "numbers" },
    { id: "w008", german: "zwei", english: "two", example_de: "Zwei Bücher.", example_en: "Two books.", category: "numbers" },
    { id: "w009", german: "drei", english: "three", example_de: "Drei Hunde.", example_en: "Three dogs.", category: "numbers" },
    { id: "w010", german: "zehn", english: "ten", example_de: "Zehn Euro.", example_en: "Ten euros.", category: "numbers" },
    { id: "w011", german: "zwanzig", english: "twenty", example_de: "Zwanzig Minuten.", example_en: "Twenty minutes.", category: "numbers" },
    { id: "w012", german: "null", english: "zero", example_de: "Null Fehler!", example_en: "Zero mistakes!", category: "numbers" },
  ],
  levels: [
    {
      levelId: "u01-lv1",
      levelNumber: 1,
      title: "German Sounds",
      description: "Vowels, umlauts, digraphs — the building blocks of pronunciation",
      lessons: makeLessons("u01-lv1", ["w001","w002","w003","w004","w005","w006"]),
    },
    {
      levelId: "u01-lv2",
      levelNumber: 2,
      title: "The Alphabet",
      description: "All 26 letters + ä ö ü ß — spelling your name like a local",
      lessons: makeLessons("u01-lv2", ["w001","w002","w003","w004","w005","w006"]),
    },
    {
      levelId: "u01-lv3",
      levelNumber: 3,
      title: "Numbers 0–20",
      description: "Count, say prices, tell the time — essential from day one",
      lessons: makeLessons("u01-lv3", ["w007","w008","w009","w010","w011","w012"]),
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// UNIT 2 — First Conversations  (Beginner)
// 4 Levels. Grammar detour in Level 2 (Pronouns + Present tense).
// ─────────────────────────────────────────────────────────────────────────────

const UNIT_2: SyllabusUnit = {
  unitId: "u02",
  unitNumber: 2,
  title: "Erste Gespräche",
  subtitle: "Greetings, introductions & small talk",
  icon: "👋",
  color: "#FF9600",
  xpReward: 200,
  tip: "Use 'Ich heiße...' for your name and 'Ich komme aus...' for where you're from.",
  words: [
    { id: "w013", german: "Guten Morgen", english: "Good morning", example_de: "Guten Morgen! Wie geht es dir?", example_en: "Good morning! How are you?", category: "greetings" },
    { id: "w014", german: "Guten Tag", english: "Good day / Hello", example_de: "Guten Tag, Herr Müller.", example_en: "Good day, Mr. Müller.", category: "greetings" },
    { id: "w015", german: "Guten Abend", english: "Good evening", example_de: "Guten Abend! Willkommen!", example_en: "Good evening! Welcome!", category: "greetings" },
    { id: "w016", german: "Wie geht's?", english: "How are you? (informal)", example_de: "Wie geht's dir heute?", example_en: "How are you today?", category: "greetings" },
    { id: "w017", german: "Sehr gut", english: "Very good", example_de: "Mir geht es sehr gut!", example_en: "I am very good!", category: "responses" },
    { id: "w018", german: "heißen", english: "to be called", example_de: "Ich heiße Maria.", example_en: "My name is Maria.", category: "verbs" },
    { id: "w019", german: "kommen", english: "to come (from)", example_de: "Ich komme aus Indien.", example_en: "I come from India.", category: "verbs" },
    { id: "w020", german: "wohnen", english: "to live / reside", example_de: "Ich wohne in Berlin.", example_en: "I live in Berlin.", category: "verbs" },
    { id: "w021", german: "sprechen", english: "to speak", example_de: "Ich spreche Englisch.", example_en: "I speak English.", category: "verbs" },
    { id: "w022", german: "Deutschland", english: "Germany", example_de: "Ich komme aus Deutschland.", example_en: "I come from Germany.", category: "countries" },
    { id: "w023", german: "Deutsch", english: "German (language)", example_de: "Ich lerne Deutsch.", example_en: "I am learning German.", category: "languages" },
    { id: "w024", german: "ich", english: "I", example_de: "Ich bin Student.", example_en: "I am a student.", category: "pronouns" },
    { id: "w025", german: "du", english: "you (informal)", example_de: "Du bist nett.", example_en: "You are nice.", category: "pronouns" },
    { id: "w026", german: "er / sie / es", english: "he / she / it", example_de: "Er kommt aus Berlin.", example_en: "He comes from Berlin.", category: "pronouns" },
    { id: "w027", german: "wir", english: "we", example_de: "Wir lernen Deutsch.", example_en: "We learn German.", category: "pronouns" },
    { id: "w028", german: "sie / Sie", english: "they / you (formal)", example_de: "Sie sprechen gut Deutsch.", example_en: "They speak German well.", category: "pronouns" },
  ],
  levels: [
    {
      levelId: "u02-lv1",
      levelNumber: 1,
      title: "Greetings",
      description: "Time-based greetings, how to say goodbye, small talk responses",
      lessons: makeLessons("u02-lv1", ["w013","w014","w015","w016","w017"]),
    },
    {
      levelId: "u02-lv2",
      levelNumber: 2,
      title: "Pronouns & Verbs",
      description: "Personal pronouns + present tense conjugation — grammar detour here",
      lessons: makeLessons("u02-lv2", ["w024","w025","w026","w027","w028"]),
      grammarDetour: {
        topicId: "g01-pronouns-present",
        topicTitle: "Personal Pronouns + Present Tense",
        afterLessonIndex: 1, // after "Practice" (index 1), before "Challenge"
      },
    },
    {
      levelId: "u02-lv3",
      levelNumber: 3,
      title: "Introductions",
      description: "Introduce yourself: name, origin, city, languages",
      lessons: makeLessons("u02-lv3", ["w018","w019","w020","w021","w022","w023"]),
    },
    {
      levelId: "u02-lv4",
      levelNumber: 4,
      title: "Conversation",
      description: "Put it all together — mini conversations and replies",
      lessons: makeLessons("u02-lv4"),
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// UNIT 3 — Family & Daily Life  (Elementary)
// 4 Levels. Grammar detour in Level 2 (Sentence Structure + W-Questions).
// ─────────────────────────────────────────────────────────────────────────────

const UNIT_3: SyllabusUnit = {
  unitId: "u03",
  unitNumber: 3,
  title: "Familie & Alltag",
  subtitle: "Family members & everyday activities",
  icon: "👨‍👩‍👧",
  color: "#58CC02",
  xpReward: 220,
  tip: "Use 'Das ist mein/meine...' to introduce family. Mein for masculine, meine for feminine.",
  words: [
    { id: "w029", german: "die Mutter", english: "the mother", article: "die", plural: "die Mütter", example_de: "Das ist meine Mutter.", example_en: "That is my mother.", category: "family" },
    { id: "w030", german: "der Vater", english: "the father", article: "der", plural: "die Väter", example_de: "Mein Vater ist Arzt.", example_en: "My father is a doctor.", category: "family" },
    { id: "w031", german: "der Bruder", english: "the brother", article: "der", plural: "die Brüder", example_de: "Mein Bruder heißt Tom.", example_en: "My brother's name is Tom.", category: "family" },
    { id: "w032", german: "die Schwester", english: "the sister", article: "die", plural: "die Schwestern", example_de: "Meine Schwester wohnt in Hamburg.", example_en: "My sister lives in Hamburg.", category: "family" },
    { id: "w033", german: "die Familie", english: "the family", article: "die", plural: "die Familien", example_de: "Meine Familie ist groß.", example_en: "My family is big.", category: "family" },
    { id: "w034", german: "das Kind", english: "the child", article: "das", plural: "die Kinder", example_de: "Das Kind spielt.", example_en: "The child is playing.", category: "family" },
    { id: "w035", german: "arbeiten", english: "to work", example_de: "Ich arbeite heute.", example_en: "I work today.", category: "verbs" },
    { id: "w036", german: "lernen", english: "to learn / study", example_de: "Wir lernen Deutsch.", example_en: "We are learning German.", category: "verbs" },
    { id: "w037", german: "schlafen", english: "to sleep", example_de: "Ich schlafe früh.", example_en: "I sleep early.", category: "verbs" },
    { id: "w038", german: "essen", english: "to eat", example_de: "Wann isst du?", example_en: "When do you eat?", category: "verbs" },
    { id: "w039", german: "trinken", english: "to drink", example_de: "Er trinkt Wasser.", example_en: "He drinks water.", category: "verbs" },
    { id: "w040", german: "spielen", english: "to play", example_de: "Die Kinder spielen.", example_en: "The children are playing.", category: "verbs" },
    { id: "w041", german: "gehen", english: "to go", example_de: "Ich gehe nach Hause.", example_en: "I go home.", category: "verbs" },
    { id: "w042", german: "machen", english: "to do / make", example_de: "Was machst du?", example_en: "What are you doing?", category: "verbs" },
    // W-questions
    { id: "w043", german: "wer", english: "who", example_de: "Wer ist das?", example_en: "Who is that?", category: "questions" },
    { id: "w044", german: "was", english: "what", example_de: "Was machst du?", example_en: "What are you doing?", category: "questions" },
    { id: "w045", german: "wo", english: "where", example_de: "Wo wohnst du?", example_en: "Where do you live?", category: "questions" },
    { id: "w046", german: "wann", english: "when", example_de: "Wann isst du?", example_en: "When do you eat?", category: "questions" },
    { id: "w047", german: "wie", english: "how", example_de: "Wie geht es dir?", example_en: "How are you?", category: "questions" },
    { id: "w048", german: "warum", english: "why", example_de: "Warum lernst du Deutsch?", example_en: "Why are you learning German?", category: "questions" },
  ],
  levels: [
    {
      levelId: "u03-lv1",
      levelNumber: 1,
      title: "Family Members",
      description: "Mother, father, siblings, kids — introduce your family in German",
      lessons: makeLessons("u03-lv1", ["w029","w030","w031","w032","w033","w034"]),
    },
    {
      levelId: "u03-lv2",
      levelNumber: 2,
      title: "Sentence Structure",
      description: "Verb in position 2, W-questions — grammar detour here",
      lessons: makeLessons("u03-lv2", ["w043","w044","w045","w046","w047","w048"]),
      grammarDetour: {
        topicId: "g02-sentence-questions",
        topicTitle: "Sentence Structure + W-Questions",
        afterLessonIndex: 1,
      },
    },
    {
      levelId: "u03-lv3",
      levelNumber: 3,
      title: "Daily Activities",
      description: "Work, eat, sleep, play — common verbs for your daily routine",
      lessons: makeLessons("u03-lv3", ["w035","w036","w037","w038","w039","w040","w041","w042"]),
    },
    {
      levelId: "u03-lv4",
      levelNumber: 4,
      title: "Family & Life",
      description: "Combine family + activities — talk about your life",
      lessons: makeLessons("u03-lv4"),
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// UNIT 4 — Home & Food  (Elementary+)
// 4 Levels. Grammar detour in Level 1 (Articles + Nominative).
// ─────────────────────────────────────────────────────────────────────────────

const UNIT_4: SyllabusUnit = {
  unitId: "u04",
  unitNumber: 4,
  title: "Zuhause & Essen",
  subtitle: "Home objects, food & articles",
  icon: "🏠",
  color: "#FF4B4B",
  xpReward: 230,
  tip: "Always learn the article WITH the noun: der Tisch, die Lampe, das Fenster.",
  words: [
    { id: "w049", german: "der Tisch", english: "the table", article: "der", plural: "die Tische", example_de: "Der Tisch ist groß.", example_en: "The table is big.", category: "home" },
    { id: "w050", german: "der Stuhl", english: "the chair", article: "der", plural: "die Stühle", example_de: "Der Stuhl ist bequem.", example_en: "The chair is comfortable.", category: "home" },
    { id: "w051", german: "das Handy", english: "the mobile phone", article: "das", plural: "die Handys", example_de: "Das Handy ist neu.", example_en: "The mobile phone is new.", category: "objects" },
    { id: "w052", german: "das Fenster", english: "the window", article: "das", plural: "die Fenster", example_de: "Das Fenster ist offen.", example_en: "The window is open.", category: "home" },
    { id: "w053", german: "die Tür", english: "the door", article: "die", plural: "die Türen", example_de: "Die Tür ist zu.", example_en: "The door is closed.", category: "home" },
    { id: "w054", german: "das Bett", english: "the bed", article: "das", plural: "die Betten", example_de: "Das Bett ist sehr weich.", example_en: "The bed is very soft.", category: "home" },
    { id: "w055", german: "das Brot", english: "the bread", article: "das", plural: "die Brote", example_de: "Ich esse Brot zum Frühstück.", example_en: "I eat bread for breakfast.", category: "food_drink" },
    { id: "w056", german: "der Kaffee", english: "the coffee", article: "der", plural: "-", example_de: "Trinkst du Kaffee?", example_en: "Do you drink coffee?", category: "food_drink" },
    { id: "w057", german: "die Milch", english: "the milk", article: "die", plural: "-", example_de: "Die Milch ist frisch.", example_en: "The milk is fresh.", category: "food_drink" },
    { id: "w058", german: "der Apfel", english: "the apple", article: "der", plural: "die Äpfel", example_de: "Der Apfel ist rot.", example_en: "The apple is red.", category: "food_drink" },
    { id: "w059", german: "das Ei", english: "the egg", article: "das", plural: "die Eier", example_de: "Ich esse ein Ei.", example_en: "I eat an egg.", category: "food_drink" },
    { id: "w060", german: "das Wasser", english: "the water", article: "das", plural: "-", example_de: "Ich trinke Wasser.", example_en: "I drink water.", category: "food_drink" },
    { id: "w061", german: "groß", english: "big / tall", example_de: "Das Haus ist groß.", example_en: "The house is big.", category: "adjectives" },
    { id: "w062", german: "klein", english: "small / little", example_de: "Das Kind ist klein.", example_en: "The child is small.", category: "adjectives" },
    { id: "w063", german: "neu", english: "new", example_de: "Das Handy ist neu.", example_en: "The phone is new.", category: "adjectives" },
    { id: "w064", german: "alt", english: "old", example_de: "Das Buch ist alt.", example_en: "The book is old.", category: "adjectives" },
  ],
  levels: [
    {
      levelId: "u04-lv1",
      levelNumber: 1,
      title: "Articles: der, die, das",
      description: "Every noun has a gender — learn articles with objects — grammar detour here",
      lessons: makeLessons("u04-lv1", ["w049","w050","w051","w052","w053","w054"]),
      grammarDetour: {
        topicId: "g03-articles-nominative",
        topicTitle: "Articles + Nominative Case",
        afterLessonIndex: 1,
      },
    },
    {
      levelId: "u04-lv2",
      levelNumber: 2,
      title: "Home Objects",
      description: "Furniture and objects around the house with correct articles",
      lessons: makeLessons("u04-lv2", ["w049","w050","w051","w052","w053","w054"]),
    },
    {
      levelId: "u04-lv3",
      levelNumber: 3,
      title: "Food & Drinks",
      description: "Breakfast basics, drinks, common food words",
      lessons: makeLessons("u04-lv3", ["w055","w056","w057","w058","w059","w060"]),
    },
    {
      levelId: "u04-lv4",
      levelNumber: 4,
      title: "Adjectives",
      description: "Describe things: big, small, new, old — simple descriptions",
      lessons: makeLessons("u04-lv4", ["w061","w062","w063","w064"]),
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// UNIT 5 — Shopping & Restaurants  (Pre-Intermediate)
// 4 Levels. Grammar detour in Level 1 (Negation: nicht & kein).
// ─────────────────────────────────────────────────────────────────────────────

const UNIT_5: SyllabusUnit = {
  unitId: "u05",
  unitNumber: 5,
  title: "Einkaufen & Essen gehen",
  subtitle: "Shopping, prices, restaurants & meals",
  icon: "🛍️",
  color: "#CE82FF",
  xpReward: 250,
  tip: "'Ich möchte...' is the polite way to order. 'Ich will' sounds rude in a restaurant!",
  words: [
    { id: "w065", german: "kaufen", english: "to buy", example_de: "Ich kaufe einen Apfel.", example_en: "I buy an apple.", category: "shopping" },
    { id: "w066", german: "der Euro", english: "the euro", article: "der", plural: "die Euro", example_de: "Das kostet zehn Euro.", example_en: "That costs ten euros.", category: "shopping" },
    { id: "w067", german: "teuer", english: "expensive", example_de: "Das ist zu teuer.", example_en: "That is too expensive.", category: "adjectives" },
    { id: "w068", german: "billig", english: "cheap", example_de: "Das ist sehr billig!", example_en: "That is very cheap!", category: "adjectives" },
    { id: "w069", german: "das Geschäft", english: "the shop / store", article: "das", plural: "die Geschäfte", example_de: "Das Geschäft ist offen.", example_en: "The shop is open.", category: "places" },
    { id: "w070", german: "bezahlen", english: "to pay", example_de: "Ich bezahle mit Karte.", example_en: "I pay by card.", category: "shopping" },
    { id: "w071", german: "nicht", english: "not", example_de: "Das ist nicht gut.", example_en: "That is not good.", category: "negation" },
    { id: "w072", german: "kein / keine", english: "no / not a", example_de: "Ich habe keine Zeit.", example_en: "I have no time.", category: "negation" },
    { id: "w073", german: "möchten", english: "would like", example_de: "Ich möchte Kaffee, bitte.", example_en: "I would like coffee, please.", category: "verbs" },
    { id: "w074", german: "das Restaurant", english: "the restaurant", article: "das", plural: "die Restaurants", example_de: "Wir essen im Restaurant.", example_en: "We eat at the restaurant.", category: "places" },
    { id: "w075", german: "die Speisekarte", english: "the menu", article: "die", plural: "die Speisekarten", example_de: "Kann ich die Speisekarte haben?", example_en: "Can I have the menu?", category: "restaurant" },
    { id: "w076", german: "das Frühstück", english: "breakfast", article: "das", plural: "-", example_de: "Das Frühstück ist um 8 Uhr.", example_en: "Breakfast is at 8 o'clock.", category: "meals" },
    { id: "w077", german: "das Mittagessen", english: "lunch", article: "das", plural: "-", example_de: "Wir essen Mittagessen zusammen.", example_en: "We eat lunch together.", category: "meals" },
    { id: "w078", german: "das Abendessen", english: "dinner", article: "das", plural: "-", example_de: "Das Abendessen ist fertig.", example_en: "Dinner is ready.", category: "meals" },
    { id: "w079", german: "die Rechnung", english: "the bill", article: "die", plural: "die Rechnungen", example_de: "Die Rechnung, bitte!", example_en: "The bill, please!", category: "restaurant" },
  ],
  levels: [
    {
      levelId: "u05-lv1",
      levelNumber: 1,
      title: "Negation",
      description: "nicht vs. kein — say what you don't have or don't want — grammar detour here",
      lessons: makeLessons("u05-lv1", ["w071","w072"]),
      grammarDetour: {
        topicId: "g04-negation",
        topicTitle: "Negation: nicht & kein",
        afterLessonIndex: 1,
      },
    },
    {
      levelId: "u05-lv2",
      levelNumber: 2,
      title: "Shopping",
      description: "Buy things, ask prices, pay — practical shopping vocabulary",
      lessons: makeLessons("u05-lv2", ["w065","w066","w067","w068","w069","w070"]),
    },
    {
      levelId: "u05-lv3",
      levelNumber: 3,
      title: "At the Restaurant",
      description: "Order politely, ask for the menu, pay the bill",
      lessons: makeLessons("u05-lv3", ["w073","w074","w075","w079"]),
    },
    {
      levelId: "u05-lv4",
      levelNumber: 4,
      title: "Meal Times",
      description: "Breakfast, lunch, dinner — talk about when and what you eat",
      lessons: makeLessons("u05-lv4", ["w076","w077","w078"]),
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// UNIT 6 — Travel & Hobbies  (Intermediate)
// 4 Levels. Grammar detour in Level 1 (Accusative Case).
// ─────────────────────────────────────────────────────────────────────────────

const UNIT_6: SyllabusUnit = {
  unitId: "u06",
  unitNumber: 6,
  title: "Reisen & Hobbys",
  subtitle: "Transport, travel & free time activities",
  icon: "✈️",
  color: "#1CB0F6",
  xpReward: 260,
  tip: "Only masculine 'der' changes in accusative → 'den'. Die and das stay the same!",
  words: [
    { id: "w080", german: "der Bahnhof", english: "the train station", article: "der", plural: "die Bahnhöfe", example_de: "Wo ist der Bahnhof?", example_en: "Where is the train station?", category: "travel" },
    { id: "w081", german: "der Zug", english: "the train", article: "der", plural: "die Züge", example_de: "Ich nehme den Zug.", example_en: "I take the train.", category: "travel" },
    { id: "w082", german: "der Bus", english: "the bus", article: "der", plural: "die Busse", example_de: "Der Bus kommt um 9 Uhr.", example_en: "The bus comes at 9 o'clock.", category: "travel" },
    { id: "w083", german: "das Ticket", english: "the ticket", article: "das", plural: "die Tickets", example_de: "Ich kaufe ein Ticket.", example_en: "I buy a ticket.", category: "travel" },
    { id: "w084", german: "fahren", english: "to drive / travel", example_de: "Wir fahren nach Berlin.", example_en: "We travel to Berlin.", category: "verbs" },
    { id: "w085", german: "nehmen", english: "to take", example_de: "Ich nehme den Bus.", example_en: "I take the bus.", category: "verbs" },
    { id: "w086", german: "das Auto", english: "the car", article: "das", plural: "die Autos", example_de: "Das Auto ist schnell.", example_en: "The car is fast.", category: "travel" },
    { id: "w087", german: "die Musik", english: "the music", article: "die", plural: "-", example_de: "Ich höre Musik.", example_en: "I listen to music.", category: "hobbies" },
    { id: "w088", german: "der Fußball", english: "football / soccer", article: "der", plural: "-", example_de: "Ich spiele Fußball.", example_en: "I play football.", category: "hobbies" },
    { id: "w089", german: "lesen", english: "to read", example_de: "Liest du Bücher?", example_en: "Do you read books?", category: "verbs" },
    { id: "w090", german: "schwimmen", english: "to swim", example_de: "Er schwimmt jeden Tag.", example_en: "He swims every day.", category: "verbs" },
    { id: "w091", german: "das Kino", english: "the cinema", article: "das", plural: "die Kinos", example_de: "Wir gehen ins Kino.", example_en: "We go to the cinema.", category: "places" },
    { id: "w092", german: "kochen", english: "to cook", example_de: "Ich koche gern.", example_en: "I like to cook.", category: "verbs" },
    { id: "w093", german: "gern", english: "gladly / like to", example_de: "Ich schwimme gern.", example_en: "I like to swim.", category: "expressions" },
  ],
  levels: [
    {
      levelId: "u06-lv1",
      levelNumber: 1,
      title: "Accusative Case",
      description: "den/einen for masculine — grammar detour here",
      lessons: makeLessons("u06-lv1", ["w080","w081","w082","w083"]),
      grammarDetour: {
        topicId: "g05-accusative",
        topicTitle: "Accusative Case",
        afterLessonIndex: 1,
      },
    },
    {
      levelId: "u06-lv2",
      levelNumber: 2,
      title: "Transport",
      description: "Trains, buses, cars — getting around Germany",
      lessons: makeLessons("u06-lv2", ["w080","w081","w082","w083","w084","w085","w086"]),
    },
    {
      levelId: "u06-lv3",
      levelNumber: 3,
      title: "Hobbies",
      description: "Sports, music, reading — talk about what you enjoy",
      lessons: makeLessons("u06-lv3", ["w087","w088","w089","w090","w091","w092","w093"]),
    },
    {
      levelId: "u06-lv4",
      levelNumber: 4,
      title: "Travel & Free Time",
      description: "Combine travel + hobbies — plan a trip, talk about preferences",
      lessons: makeLessons("u06-lv4"),
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// UNIT 7 — City Life & Directions  (Intermediate+)
// 4 Levels. Grammar detour in Level 1 (Dative Case).
// ─────────────────────────────────────────────────────────────────────────────

const UNIT_7: SyllabusUnit = {
  unitId: "u07",
  unitNumber: 7,
  title: "In der Stadt",
  subtitle: "Directions, places & social plans",
  icon: "🗺️",
  color: "#FF9600",
  xpReward: 270,
  tip: "Dative prepositions: 'Ich gehe zur Schule' — zur = zu + der (dative feminine).",
  words: [
    { id: "w094", german: "links", english: "left", example_de: "Gehen Sie links.", example_en: "Go left.", category: "directions" },
    { id: "w095", german: "rechts", english: "right", example_de: "Biegen Sie rechts ab.", example_en: "Turn right.", category: "directions" },
    { id: "w096", german: "geradeaus", english: "straight ahead", example_de: "Gehen Sie geradeaus.", example_en: "Go straight ahead.", category: "directions" },
    { id: "w097", german: "die Stadt", english: "the city / town", article: "die", plural: "die Städte", example_de: "Die Stadt ist schön.", example_en: "The city is beautiful.", category: "places" },
    { id: "w098", german: "die Straße", english: "the street", article: "die", plural: "die Straßen", example_de: "Wie heißt diese Straße?", example_en: "What is this street called?", category: "places" },
    { id: "w099", german: "die Schule", english: "the school", article: "die", plural: "die Schulen", example_de: "Ich gehe zur Schule.", example_en: "I go to school.", category: "places" },
    { id: "w100", german: "das Krankenhaus", english: "the hospital", article: "das", plural: "die Krankenhäuser", example_de: "Das Krankenhaus ist groß.", example_en: "The hospital is big.", category: "places" },
    { id: "w101", german: "die Post", english: "the post office", article: "die", plural: "-", example_de: "Wo ist die Post?", example_en: "Where is the post office?", category: "places" },
    { id: "w102", german: "die Party", english: "the party", article: "die", plural: "die Partys", example_de: "Kommst du zur Party?", example_en: "Are you coming to the party?", category: "social" },
    { id: "w103", german: "morgen", english: "tomorrow", example_de: "Kommst du morgen?", example_en: "Are you coming tomorrow?", category: "time" },
    { id: "w104", german: "heute Abend", english: "this evening / tonight", example_de: "Was machst du heute Abend?", example_en: "What are you doing tonight?", category: "time" },
    { id: "w105", german: "gern", english: "gladly / with pleasure", example_de: "Ja, gern!", example_en: "Yes, gladly!", category: "expressions" },
    { id: "w106", german: "leider", english: "unfortunately", example_de: "Leider kann ich nicht.", example_en: "Unfortunately I can't.", category: "expressions" },
    { id: "w107", german: "das Wochenende", english: "the weekend", article: "das", plural: "die Wochenenden", example_de: "Was machst du am Wochenende?", example_en: "What are you doing at the weekend?", category: "time" },
  ],
  levels: [
    {
      levelId: "u07-lv1",
      levelNumber: 1,
      title: "Dative Case",
      description: "Indirect object, dative prepositions — grammar detour here",
      lessons: makeLessons("u07-lv1", ["w094","w095","w096"]),
      grammarDetour: {
        topicId: "g06-dative",
        topicTitle: "Dative Case",
        afterLessonIndex: 1,
      },
    },
    {
      levelId: "u07-lv2",
      levelNumber: 2,
      title: "Directions",
      description: "Left, right, straight — give and understand directions",
      lessons: makeLessons("u07-lv2", ["w094","w095","w096","w097","w098"]),
    },
    {
      levelId: "u07-lv3",
      levelNumber: 3,
      title: "City Places",
      description: "School, hospital, post office — navigate the city",
      lessons: makeLessons("u07-lv3", ["w099","w100","w101"]),
    },
    {
      levelId: "u07-lv4",
      levelNumber: 4,
      title: "Social Plans",
      description: "Make plans, accept, decline — real social German",
      lessons: makeLessons("u07-lv4", ["w102","w103","w104","w105","w106","w107"]),
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// UNIT 8 — Daily Routine & Past Tense  (Upper Elementary)
// 4 Levels. Grammar detour in Level 1 (Modals + Separable), Level 3 (Perfekt).
// ─────────────────────────────────────────────────────────────────────────────

const UNIT_8: SyllabusUnit = {
  unitId: "u08",
  unitNumber: 8,
  title: "Tagesablauf & Vergangenheit",
  subtitle: "Daily routine, modal verbs & talking about the past",
  icon: "⏰",
  color: "#58CC02",
  xpReward: 300,
  tip: "Perfekt = haben/sein + past participle at the END. 'Ich habe gestern Musik gehört.'",
  words: [
    { id: "w108", german: "müssen", english: "must / to have to", example_de: "Ich muss lernen.", example_en: "I must study.", category: "modals" },
    { id: "w109", german: "können", english: "can / to be able to", example_de: "Kannst du schwimmen?", example_en: "Can you swim?", category: "modals" },
    { id: "w110", german: "wollen", english: "to want to", example_de: "Er will Arzt werden.", example_en: "He wants to become a doctor.", category: "modals" },
    { id: "w111", german: "dürfen", english: "may / to be allowed to", example_de: "Darf ich fragen?", example_en: "May I ask?", category: "modals" },
    { id: "w112", german: "sollen", english: "should / to be supposed to", example_de: "Du sollst pünktlich sein.", example_en: "You should be on time.", category: "modals" },
    { id: "w113", german: "aufstehen", english: "to get up", example_de: "Ich stehe früh auf.", example_en: "I get up early.", category: "daily_routine" },
    { id: "w114", german: "anrufen", english: "to call (phone)", example_de: "Ich rufe dich an.", example_en: "I'll call you.", category: "daily_routine" },
    { id: "w115", german: "einkaufen", english: "to go shopping", example_de: "Ich kaufe heute ein.", example_en: "I go shopping today.", category: "daily_routine" },
    { id: "w116", german: "fernsehen", english: "to watch TV", example_de: "Abends sehe ich fern.", example_en: "In the evenings I watch TV.", category: "daily_routine" },
    { id: "w117", german: "morgens", english: "in the morning(s)", example_de: "Morgens trinke ich Kaffee.", example_en: "In the mornings I drink coffee.", category: "time" },
    { id: "w118", german: "abends", english: "in the evening(s)", example_de: "Abends lese ich ein Buch.", example_en: "In the evenings I read a book.", category: "time" },
    { id: "w119", german: "gestern", english: "yesterday", example_de: "Gestern habe ich geschlafen.", example_en: "Yesterday I slept.", category: "time" },
    { id: "w120", german: "letztes Wochenende", english: "last weekend", example_de: "Letztes Wochenende war schön.", example_en: "Last weekend was nice.", category: "time" },
    { id: "w121", german: "der Urlaub", english: "the vacation / holiday", article: "der", plural: "die Urlaube", example_de: "Ich war im Urlaub.", example_en: "I was on vacation.", category: "travel" },
    { id: "w122", german: "reisen", english: "to travel", example_de: "Wir sind gereist.", example_en: "We traveled.", category: "verbs" },
    { id: "w123", german: "das Hotel", english: "the hotel", article: "das", plural: "die Hotels", example_de: "Das Hotel war super.", example_en: "The hotel was great.", category: "travel" },
    { id: "w124", german: "fotografieren", english: "to take photos", example_de: "Ich habe viel fotografiert.", example_en: "I took many photos.", category: "verbs" },
    { id: "w125", german: "toll", english: "great / awesome", example_de: "Das war toll!", example_en: "That was great!", category: "adjectives" },
  ],
  levels: [
    {
      levelId: "u08-lv1",
      levelNumber: 1,
      title: "Modal Verbs",
      description: "müssen, können, wollen, dürfen — grammar detour here",
      lessons: makeLessons("u08-lv1", ["w108","w109","w110","w111","w112"]),
      grammarDetour: {
        topicId: "g07-modals-separable",
        topicTitle: "Modal Verbs + Separable Verbs",
        afterLessonIndex: 1,
      },
    },
    {
      levelId: "u08-lv2",
      levelNumber: 2,
      title: "Daily Routine",
      description: "Separable verbs in action: get up, call, shop, watch TV",
      lessons: makeLessons("u08-lv2", ["w113","w114","w115","w116","w117","w118"]),
    },
    {
      levelId: "u08-lv3",
      levelNumber: 3,
      title: "Past Tense (Perfekt)",
      description: "Talk about what you did — grammar detour here",
      lessons: makeLessons("u08-lv3", ["w119","w120"]),
      grammarDetour: {
        topicId: "g08-perfekt",
        topicTitle: "Perfekt — The Past Tense",
        afterLessonIndex: 1,
      },
    },
    {
      levelId: "u08-lv4",
      levelNumber: 4,
      title: "Vacation & Memories",
      description: "Use Perfekt to tell stories about vacations and past events",
      lessons: makeLessons("u08-lv4", ["w121","w122","w123","w124","w125"]),
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export const SYLLABUS_UNITS: SyllabusUnit[] = [
  UNIT_2, UNIT_3, UNIT_4,
  UNIT_5, UNIT_6, UNIT_7, UNIT_8,
];

export const UNIT_MAP: Record<string, SyllabusUnit> = Object.fromEntries(
  SYLLABUS_UNITS.map((u) => [u.unitId, u])
);

// Flat list of all levels across all units
export const ALL_LEVELS: SyllabusLevel[] = SYLLABUS_UNITS.flatMap((u) => u.levels);

export const LEVEL_MAP: Record<string, SyllabusLevel> = Object.fromEntries(
  ALL_LEVELS.map((lv) => [lv.levelId, lv])
);

// Flat list of all lessons
export const ALL_LESSONS: SyllabusLesson[] = ALL_LEVELS.flatMap((lv) => lv.lessons);

export const LESSON_MAP: Record<string, SyllabusLesson> = Object.fromEntries(
  ALL_LESSONS.map((l) => [l.lessonId, l])
);

// All words flat
export const ALL_WORDS: SyllabusWord[] = SYLLABUS_UNITS.flatMap((u) => u.words);

export const WORD_MAP: Record<string, SyllabusWord> = Object.fromEntries(
  ALL_WORDS.map((w) => [w.id, w])
);

// Get which unit a level belongs to
export function getLevelUnit(levelId: string): SyllabusUnit | undefined {
  return SYLLABUS_UNITS.find((u) => u.levels.some((lv) => lv.levelId === levelId));
}

// Get which level a lesson belongs to
export function getLessonLevel(lessonId: string): SyllabusLevel | undefined {
  return ALL_LEVELS.find((lv) => lv.lessons.some((l) => l.lessonId === lessonId));
}

// Stats
export const TOTAL_UNITS = SYLLABUS_UNITS.length;           // 7
export const TOTAL_LEVELS = ALL_LEVELS.length;              // ~30
export const TOTAL_LESSONS = ALL_LESSONS.length;            // ~150
export const TOTAL_QUESTIONS = ALL_LESSONS.length * 15;     // ~2250
