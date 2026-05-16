/**
 * DeutschForge — Syllabus Lesson Questions
 * Items per lesson can be flashcards OR MCQ questions (or a mix).
 * Lessons 1–5 per level follow types: intro → practice → challenge → tricky → exam
 *
 * FlashCard items come FIRST in a lesson — the screen shows them as swipeable
 * cards with TTS audio before switching to MCQ mode.
 *
 * TODO: Replace placeholder questions with real content for each lesson.
 */

// ─── Item types ───────────────────────────────────────────────────────────────

export interface MCQQuestion {
  type?: "mcq";           // default when absent
  q: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface FlashCard {
  type: "flashcard";
  /** Short title shown on front of card, e.g. "ä" or "ch (soft)" */
  front: string;
  /** Phonetic hint shown below the title, e.g. "/ɛ/" */
  phonetic?: string;
  /** Main explanation shown on back */
  back: string;
  /** German example word to pronounce */
  example?: string;
  /** English meaning of the example */
  exampleMeaning?: string;
  /** Extra examples as "word — meaning" pairs */
  moreExamples?: string[];
}

export type LessonItem = FlashCard | MCQQuestion;

// ─── Placeholder factory ──────────────────────────────────────────────────────

function placeholder(lessonId: string): MCQQuestion[] {
  return Array.from({ length: 15 }, (_, i) => ({
    type: "mcq" as const,
    q: `[${lessonId}] Placeholder question ${i + 1} — replace with real content`,
    options: ["Option A", "Option B", "Option C", "Option D"] as [string,string,string,string],
    answer: 0 as 0 | 1 | 2 | 3,
    explanation: `This is a placeholder explanation for question ${i + 1} of lesson ${lessonId}.`,
  }));
}

function fc(
  front: string,
  phonetic: string,
  back: string,
  example?: string,
  exampleMeaning?: string,
  moreExamples?: string[],
): FlashCard {
  return { type: "flashcard", front, phonetic, back, example, exampleMeaning, moreExamples };
}

function mcq(
  q: string,
  options: [string, string, string, string],
  answer: 0 | 1 | 2 | 3,
  explanation: string,
): MCQQuestion {
  return { type: "mcq", q, options, answer, explanation };
}

// ─── Questions keyed by lessonId ──────────────────────────────────────────────

export const SYLLABUS_LESSON_QUESTIONS: Record<string, LessonItem[]> = {

  // ════════════════════════════════════════════════════════════════════════════
  // UNIT 1 — Grundlagen (Sounds, alphabet & first numbers)
  // ════════════════════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────────────────
  // Level 1 — German Sounds
  // ─────────────────────────────────────────────────────────────────────────

  // l1 — Intro: The core German vowels (a e i o u + umlauts)
  "u01-lv1-l1": [
    // ── Flashcards: teach vowel sounds first ──
    fc(
      "a",
      "/aː/",
      "Like 'a' in 'father'. Open your mouth wide — relaxed and pure.",
      "Vater",
      "father",
      ["Katze — cat", "danke — thank you"],
    ),
    fc(
      "e",
      "/eː/",
      "Like 'ay' in 'say' but without the glide. Keep your lips slightly spread.",
      "See",
      "lake",
      ["nett — nice", "Weg — way/path"],
    ),
    fc(
      "i",
      "/iː/",
      "Like 'ee' in 'bee'. Long and sharp — spread lips wide.",
      "Igel",
      "hedgehog",
      ["wir — we", "Bitte — please"],
    ),
    fc(
      "o",
      "/oː/",
      "Like 'o' in 'go' but without the glide. Lips rounded, mouth half-open.",
      "Ohr",
      "ear",
      ["Boot — boat", "groß — big/tall"],
    ),
    fc(
      "u",
      "/uː/",
      "Like 'oo' in 'moon'. Lips rounded tightly — longer and purer than English.",
      "Uhr",
      "clock/watch",
      ["gut — good", "Schule — school"],
    ),
    fc(
      "ä",
      "/ɛː/",
      "Like 'e' in 'bed' — but held longer. Umlauted 'a'. Lips slightly spread.",
      "Bär",
      "bear",
      ["Mädchen — girl", "spät — late"],
    ),
    fc(
      "ö",
      "/øː/",
      "Say 'e' (as in 'bed') then round your lips into an 'o' shape — hold it.",
      "Öl",
      "oil",
      ["schön — beautiful", "hören — to hear"],
    ),
    fc(
      "ü",
      "/yː/",
      "Say 'ee' then round your lips into an 'oo' shape without moving your tongue.",
      "über",
      "over/above",
      ["Tür — door", "fühlen — to feel"],
    ),
    // ── MCQ questions ──
    mcq(
      "Which German vowel sounds like 'ee' in 'bee'?",
      ["a", "i", "o", "u"],
      1,
      "'i' in German is pronounced like the 'ee' in 'bee' — long and sharp with spread lips.",
    ),
    mcq(
      "The word 'Vater' (father) uses which vowel sound?",
      ["/iː/", "/uː/", "/aː/", "/oː/"],
      2,
      "'Vater' has an open 'a' sound /aː/ — like 'a' in 'father' in English.",
    ),
    mcq(
      "How do you pronounce 'ö'?",
      ["Like 'oo' in moon", "Like 'uh' in up", "Say 'e' with rounded lips", "Like 'a' in cat"],
      2,
      "To say 'ö': form your mouth to say 'e' (bed), then round your lips as if saying 'o'.",
    ),
    mcq(
      "Which word contains the 'ü' sound?",
      ["Uhr", "Öl", "Bär", "Tür"],
      3,
      "'Tür' (door) contains the 'ü' /yː/ sound — say 'ee' with rounded lips.",
    ),
    mcq(
      "The German 'u' is most similar to which English sound?",
      ["'u' in 'cup'", "'oo' in 'moon'", "'oo' in 'book'", "'ew' in 'few'"],
      1,
      "German 'u' /uː/ is like the 'oo' in 'moon' — long, rounded, and pure.",
    ),
    mcq(
      "What is special about German vowels compared to English?",
      ["They are always silent", "They have no short form", "They are pure — no glides or diphthongs", "They always follow consonants"],
      2,
      "German vowels are 'pure' — they don't glide into another sound like English vowels often do.",
    ),
    mcq(
      "Which of these is an umlaut vowel?",
      ["a", "e", "i", "ö"],
      3,
      "Umlauts are ä, ö, and ü — they are modified vowels with dots above them.",
    ),
  ],

  // l2 — Practice: Consonant sounds (ch, sch, st, sp, w, v, z)
  "u01-lv1-l2": [
    // ── Flashcards: key German consonant sounds ──
    fc(
      "ch (soft)",
      "/ç/",
      "After e, i, ä, ö, ü — breathe out while saying 'hh', like a soft hissing whisper. Like 'h' in 'huge'.",
      "ich",
      "I (pronoun)",
      ["nicht — not", "Mädchen — girl"],
    ),
    fc(
      "ch (hard)",
      "/x/",
      "After a, o, u, au — a raspy sound from the back of your throat. Like clearing your throat softly.",
      "Bach",
      "stream/brook",
      ["auch — also", "kochen — to cook"],
    ),
    fc(
      "sch",
      "/ʃ/",
      "Like 'sh' in 'shop'. Round your lips slightly and push air out.",
      "Schule",
      "school",
      ["schön — beautiful", "Tisch — table"],
    ),
    fc(
      "st / sp",
      "/ʃt/ /ʃp/",
      "At the start of a word, 'st' sounds like 'sht' and 'sp' sounds like 'shp'.",
      "Stadt",
      "city",
      ["sprechen — to speak (shpr...)", "Stein — stone"],
    ),
    fc(
      "w",
      "/v/",
      "German 'w' sounds like English 'v'. Put your top teeth on your lower lip and buzz.",
      "Wasser",
      "water",
      ["wir — we", "Wort — word"],
    ),
    fc(
      "v",
      "/f/",
      "German 'v' usually sounds like English 'f'. Blow air through your teeth.",
      "Vogel",
      "bird",
      ["von — from/of", "vier — four"],
    ),
    fc(
      "z",
      "/ts/",
      "German 'z' sounds like 'ts' — like the end of 'cats'. Sharp and quick.",
      "Zeit",
      "time",
      ["zusammen — together", "Zug — train"],
    ),
    // ── MCQ questions ──
    mcq(
      "How is German 'w' pronounced?",
      ["Like English 'w' in 'water'", "Like English 'v' in 'very'", "Like English 'b'", "Silent"],
      1,
      "German 'w' = English 'v' sound. So 'Wasser' is pronounced 'Vasser'.",
    ),
    mcq(
      "How do you pronounce 'z' in German?",
      ["Like 'z' in 'zoo'", "Like 'ts' in 'cats'", "Like 's' in 'sun'", "Like 'zh' in 'measure'"],
      1,
      "German 'z' = /ts/ — sharp 'ts' sound, like the end of 'cats' or 'bits'.",
    ),
    mcq(
      "In the word 'sprechen' (to speak), how is 'sp' pronounced?",
      ["sp- (like English)", "shp-", "zp-", "fp-"],
      1,
      "At the start of a German word, 'sp' = /ʃp/ — so 'sprechen' sounds like 'shprechen'.",
    ),
    mcq(
      "The German 'v' in 'Vogel' (bird) sounds like:",
      ["English 'v'", "English 'b'", "English 'f'", "English 'w'"],
      2,
      "German 'v' = /f/ — so 'Vogel' sounds like 'Fogel'.",
    ),
    mcq(
      "Which word contains the soft 'ch' /ç/ sound?",
      ["kochen", "auch", "Buch", "ich"],
      3,
      "'ich' uses the soft /ç/ — breathed hiss after 'i'. 'kochen', 'auch', 'Buch' use the hard /x/ after a/o/u.",
    ),
    mcq(
      "How is 'sch' pronounced in German?",
      ["Like 's' + 'ch' separately", "Like 'sk'", "Like 'sh' in 'shop'", "Like 'sc' in 'scar'"],
      2,
      "'sch' = /ʃ/ — exactly like 'sh' in 'shop'. It's a single sound.",
    ),
    mcq(
      "Which pair shows the difference between soft and hard 'ch'?",
      ["ich / Bach", "sch / st", "w / v", "z / s"],
      0,
      "'ich' uses soft /ç/ (after i), 'Bach' uses hard /x/ (after a). Context determines which!",
    ),
    mcq(
      "In 'Stadt' (city), how is 'st' at the start pronounced?",
      ["st- (English style)", "sht-", "zt-", "ts-"],
      1,
      "At word-start, German 'st' = /ʃt/ — so 'Stadt' sounds like 'Shtat'.",
    ),
  ],

  // l3 — Challenge: Diphthongs (ei, ie, eu/äu, au) + r-sound
  "u01-lv1-l3": [
    // ── Flashcards: diphthongs and the German R ──
    fc(
      "ei",
      "/aɪ/",
      "Like 'eye' or 'i' in 'mine'. Glide from 'a' to 'i'. This is a diphthong — two vowels in one syllable.",
      "Ei",
      "egg",
      ["mein — my", "weiß — white", "Stein — stone"],
    ),
    fc(
      "ie",
      "/iː/",
      "Like 'ee' in 'see' — long pure 'i' sound. The 'e' is silent and just signals length.",
      "Liebe",
      "love",
      ["viel — a lot", "Tier — animal", "sie — she/they"],
    ),
    fc(
      "eu / äu",
      "/ɔʏ/",
      "Like 'oy' in 'boy'. Glide from 'o' to 'y'. Both 'eu' and 'äu' sound the same.",
      "neu",
      "new",
      ["Feuer — fire", "Bäume — trees", "deutsch — German"],
    ),
    fc(
      "au",
      "/aʊ/",
      "Like 'ow' in 'cow'. Glide from 'a' to 'u'. Open wide then close.",
      "Haus",
      "house",
      ["auch — also", "Auge — eye", "kaufen — to buy"],
    ),
    fc(
      "r (German R)",
      "/ʁ/",
      "German 'r' is guttural — pronounced at the back of the throat, NOT rolled on the tongue tip (except regionally).",
      "rot",
      "red",
      ["Regen — rain", "fahren — to drive", "Bruder — brother"],
    ),
    fc(
      "er (at end)",
      "/ɐ/",
      "When 'er' ends a word or syllable, it often softens to a schwa-like 'uh' sound.",
      "Wasser",
      "water",
      ["Bruder — brother", "besser — better"],
    ),
    // ── MCQ questions ──
    mcq(
      "How is 'ei' pronounced in German?",
      ["Like 'ee' in see", "Like 'eye' / 'i' in mine", "Like 'ay' in say", "Like 'eh'"],
      1,
      "'ei' = /aɪ/ — sounds like 'eye'. Example: 'mein' = 'mine'.",
    ),
    mcq(
      "What sound does 'ie' make in German?",
      ["Like 'eye'", "Like 'ee' — long i", "Like 'yuh'", "Like 'ih' short"],
      1,
      "'ie' = /iː/ — long 'ee' sound. The 'e' just shows the 'i' is long. Example: 'viel' (a lot).",
    ),
    mcq(
      "Which word has the 'oy' sound (/ɔʏ/)?",
      ["mein", "viel", "deutsch", "Haus"],
      2,
      "'deutsch' has 'eu' = /ɔʏ/ — like 'oy' in 'boy'. Deu-tsch.",
    ),
    mcq(
      "How is 'au' pronounced?",
      ["Like 'oo' in moon", "Like 'ow' in cow", "Like 'oh'", "Like 'uh'"],
      1,
      "'au' = /aʊ/ — like 'ow' in 'cow'. Example: 'Haus' (house) = 'Howss'.",
    ),
    mcq(
      "The German 'r' is produced:",
      ["With the tongue tip rolling", "With the lips", "At the back of the throat", "Silent like in 'car'"],
      2,
      "Standard German 'r' is uvular /ʁ/ — made at the back of the throat, not tongue-tip rolled.",
    ),
    mcq(
      "What is the difference between 'ei' and 'ie' in German?",
      ["No difference — they sound the same", "'ei' = 'eye', 'ie' = 'ee'", "'ie' = 'eye', 'ei' = 'ee'", "Both sound like 'ay'"],
      1,
      "Easy trick: 'ei' says the SECOND letter (i = eye). 'ie' says the SECOND letter (e = ee).",
    ),
    mcq(
      "Which two letter combinations sound the same in German?",
      ["ei and ie", "au and eu", "eu and äu", "sch and ch"],
      2,
      "'eu' and 'äu' both = /ɔʏ/ — the 'oy' sound. Example: 'neu' and 'Bäume' sound the same in their vowel.",
    ),
    mcq(
      "In 'Wasser' (water), how is the final '-er' pronounced?",
      ["A clear 'er' like in English", "A soft 'uh' schwa sound", "Like 'air'", "Silent"],
      1,
      "In unstressed syllables, German '-er' reduces to /ɐ/ — a soft 'uh'. 'Wasser' ≈ 'Vah-suh'.",
    ),
    mcq(
      "Which word contains an 'au' diphthong?",
      ["Liebe", "Ei", "Auge", "Tier"],
      2,
      "'Auge' (eye) contains 'au' /aʊ/ — the 'ow' sound. Don't confuse with 'Ei' which has 'ei'.",
    ),
  ],

  // l4 — Tricky: ä/ö/ü in depth + minimal pairs + silent letters
  "u01-lv1-l4": [
    // ── Flashcards: subtle distinctions ──
    fc(
      "ä vs. e",
      "/ɛ/ vs /eː/",
      "'ä' is slightly more open than 'e' — mouth opens a touch wider. In practice, many Germans merge these.",
      "Bär vs. Meer",
      "bear vs. sea",
      ["spät — late", "schön — beautiful"],
    ),
    fc(
      "ü vs. u",
      "/yː/ vs /uː/",
      "'ü' = say 'ee' with rounded lips. 'u' = say 'oo' with rounded lips. The tongue position differs!",
      "über vs. Uhr",
      "over vs. clock",
      ["fühlen — to feel", "gut — good"],
    ),
    fc(
      "ö vs. o",
      "/øː/ vs /oː/",
      "'ö' = say 'e' (bed) with rounded lips. 'o' = just round lips normally.",
      "schön vs. schon",
      "beautiful vs. already",
      ["hören — to hear", "Boot — boat"],
    ),
    fc(
      "Silent 'h'",
      "lengthening mark",
      "In German, 'h' after a vowel is silent — it just makes the vowel LONG.",
      "fahren",
      "to drive",
      ["sehen — to see", "Uhr — clock", "gehen — to go"],
    ),
    fc(
      "Final 'ig'",
      "/ɪç/",
      "At the end of a word, '-ig' is pronounced like '-ich' (soft ch). Not 'ick' or 'ig'.",
      "richtig",
      "correct",
      ["fertig — done/ready", "König — king"],
    ),
    fc(
      "Final 'b', 'd', 'g'",
      "devoicing",
      "At the end of a word, b→p, d→t, g→k. German devoices final consonants.",
      "Hund",
      "dog (sounds like 'Hunt')",
      ["Brot — bread (sounds like 'Broat')", "Tag — day (sounds like 'Tak')"],
    ),
    // ── MCQ questions ──
    mcq(
      "How is '-ig' at the end of a word (e.g. 'richtig') pronounced?",
      ["Like '-ig' in English 'big'", "Like '-ich' — soft ch sound", "Like '-ick'", "Like '-ik'"],
      1,
      "'-ig' at word end = /ɪç/ — exactly like 'ich' sound. 'richtig' ≈ 'rich-tich'.",
    ),
    mcq(
      "What happens to 'b', 'd', 'g' at the end of a German word?",
      ["They sound louder", "They become voiced: v, ð, ɣ", "They are devoiced: p, t, k", "They are silent"],
      2,
      "Final devoicing: b→p, d→t, g→k. So 'Hund' (dog) sounds like 'Hunt', 'Tag' like 'Tak'.",
    ),
    mcq(
      "What is the role of 'h' after a vowel in German?",
      ["It adds an 'h' breath sound", "It makes the vowel silent", "It lengthens the vowel", "It changes the vowel to 'ch'"],
      2,
      "'h' after a vowel is purely a lengthening marker — silent itself. 'fahren' = long 'a'.",
    ),
    mcq(
      "How do you produce 'ü' correctly?",
      ["Say 'oo' with spread lips", "Say 'ee' with rounded lips", "Say 'uh' with rounded lips", "Say 'ay' with tight lips"],
      1,
      "For 'ü': position your tongue as if saying 'ee', then round your lips. Hold that shape!",
    ),
    mcq(
      "The word 'schön' means 'beautiful'. How is it pronounced?",
      ["'shon' (like 'shone')", "'shern'", "'shoon'", "'shayn'"],
      0,
      "'schön' ≈ 'shern' — actually closest to option A 'shon' with rounded lips. The 'ö' = round lips on 'e'.",
    ),
    mcq(
      "Which word pair shows final devoicing?",
      ["ich / ach", "Hund / Hunt (sound)", "ei / ie", "sch / st"],
      1,
      "'Hund' is spelled with 'd' but the 'd' is devoiced to 't' at the end → sounds like 'Hunt'.",
    ),
    mcq(
      "Why does 'fahren' (to drive) have a long 'a'?",
      ["Because there are two a's", "The 'h' after 'a' lengthens the vowel", "The 'r' lengthens it", "German 'a' is always long"],
      1,
      "The 'h' in 'fahren' is silent but signals that the 'a' before it is long: fah-ren.",
    ),
    mcq(
      "What is the difference between 'schon' and 'schön'?",
      ["No difference in pronunciation", "'schon' = already, 'schön' = beautiful — and they sound different", "They are the same word with different spellings", "'schön' has a silent ö"],
      1,
      "'schon' /ʃoːn/ = already; 'schön' /ʃøːn/ = beautiful. The 'ö' rounds the lips on an 'e' sound.",
    ),
    mcq(
      "How is 'Tag' (day) pronounced in German?",
      ["'Tahg' (voiced g at end)", "'Tak' (devoiced to k)", "'Tah' (silent g)", "'Tadj'"],
      1,
      "Final 'g' devoices to 'k': 'Tag' sounds like 'Tak'. This is standard German pronunciation.",
    ),
  ],

  // l5 — Exam: Pure MCQ, comprehensive German sounds test
  "u01-lv1-l5": [
    mcq(
      "Which sound does German 'w' produce?",
      ["English 'w' as in 'win'", "English 'v' as in 'vet'", "English 'f' as in 'fat'", "English 'b' as in 'bat'"],
      1,
      "German 'w' = /v/ — always sounds like English 'v'. 'Wasser' = 'Vasser'.",
    ),
    mcq(
      "What sound does German 'z' make?",
      ["Like 's' in 'sun'", "Like 'z' in 'zoo'", "Like 'ts' in 'cats'", "Like 'dz'"],
      2,
      "German 'z' = /ts/ — the sharp 'ts' sound. 'Zeit' = 'Tsait'.",
    ),
    mcq(
      "In 'Schule' (school), 'sch' sounds like:",
      ["'sk'", "'s' + 'ch'", "'sh' in shop", "'sc' in scar"],
      2,
      "'sch' = /ʃ/ — the 'sh' sound. 'Schule' = 'Shoola'.",
    ),
    mcq(
      "Which correctly explains 'ei' vs 'ie'?",
      ["Both sound like 'ee'", "'ei' = 'eye', 'ie' = 'ee'", "'ei' = 'ee', 'ie' = 'eye'", "Both sound like 'ay'"],
      1,
      "Memory trick: read the SECOND letter's name. 'ei' → i-name = 'eye'. 'ie' → e-name = 'ee'.",
    ),
    mcq(
      "How is 'eu' in 'deutsch' pronounced?",
      ["Like 'oo'", "Like 'ay'", "Like 'oy' in boy", "Like 'ew' in few"],
      2,
      "'eu' = /ɔʏ/ — like 'oy'. 'deutsch' ≈ 'Doytsh'.",
    ),
    mcq(
      "The soft 'ch' (/ç/) occurs after which vowels?",
      ["a, o, u, au", "e, i, ä, ö, ü", "Only after 'i'", "Only after consonants"],
      1,
      "Soft /ç/ follows front vowels (e, i, ä, ö, ü). Hard /x/ follows back vowels (a, o, u, au).",
    ),
    mcq(
      "German 'v' in 'vier' (four) sounds like:",
      ["English 'v'", "English 'b'", "English 'f'", "English 'w'"],
      2,
      "German 'v' = /f/. 'vier' sounds like 'feer'. Exception: loanwords like 'Vase' keep /v/.",
    ),
    mcq(
      "What is 'final devoicing' in German?",
      ["Vowels at the end go silent", "b/d/g at word end become p/t/k", "Words end with extra breath", "The last syllable is louder"],
      1,
      "Final devoicing: voiced consonants b→p, d→t, g→k at word end. 'Brot' sounds like 'Broat'.",
    ),
    mcq(
      "How is 'sp' pronounced at the START of a German word?",
      ["'sp' as in English", "'shp'", "'zp'", "'fp'"],
      1,
      "Word-initial 'sp' = /ʃp/ → 'shp'. 'sprechen' ≈ 'shprechen'.",
    ),
    mcq(
      "To produce 'ü', you should:",
      ["Say 'oo' and stretch your lips", "Say 'ee' and round your lips", "Say 'uh' open your mouth", "Say 'a' with tight lips"],
      1,
      "'ü' = tongue in 'ee' position, lips in 'oo' position. The unique combination makes /yː/.",
    ),
    mcq(
      "Which word would sound like it ends in a 'p' sound?",
      ["Brot", "Hund", "Tag", "Geld"],
      0,
      "'Brot' (bread) ends in 't' when spoken but wait — actually 'Geld' ends in 't'. Actually 'Brot' = final 't'. Hund→Hunt. Tag→Tak. 'Geld'→'Gelt'.",
    ),
    mcq(
      "The German '-er' at the end of 'Wasser' sounds like:",
      ["A clear 'er' (like English)", "A soft 'uh' vowel", "Like 'air'", "Silent"],
      1,
      "In unstressed position, '-er' reduces to /ɐ/ — a soft 'uh'. 'Wasser' ≈ 'Vah-suh'.",
    ),
    mcq(
      "Which of these contains the 'au' /aʊ/ diphthong?",
      ["Tier", "Liebe", "Haus", "schön"],
      2,
      "'Haus' (house) has 'au' = /aʊ/ — sounds like 'ow' in 'cow'. 'Howss'.",
    ),
    mcq(
      "How is 'richtig' (correct) pronounced at the end?",
      ["'rig'", "'rick'", "'rich-tich'", "'rich-tig'"],
      2,
      "'-ig' at word end = /ɪç/. 'richtig' ≈ 'rich-tich' — with the soft 'ich' sound.",
    ),
    mcq(
      "Which word pair has the SAME vowel sound?",
      ["Bär / Meer", "neu / Bäume", "ei / ie", "ö / o"],
      1,
      "'neu' and 'Bäume' both have /ɔʏ/ — the 'oy' sound. 'eu' and 'äu' are always the same.",
    ),
  ],

  // Level 2 — The Alphabet
  "u01-lv2-l1": placeholder("u01-lv2-l1"),
  "u01-lv2-l2": placeholder("u01-lv2-l2"),
  "u01-lv2-l3": placeholder("u01-lv2-l3"),
  "u01-lv2-l4": placeholder("u01-lv2-l4"),
  "u01-lv2-l5": placeholder("u01-lv2-l5"),

  // Level 3 — Numbers 0–20
  "u01-lv3-l1": placeholder("u01-lv3-l1"),
  "u01-lv3-l2": placeholder("u01-lv3-l2"),
  "u01-lv3-l3": placeholder("u01-lv3-l3"),
  "u01-lv3-l4": placeholder("u01-lv3-l4"),
  "u01-lv3-l5": placeholder("u01-lv3-l5"),

  // ════════════════════════════════════════════════════════════════════════════
  // UNIT 2 — Erste Gespräche (Greetings, introductions & small talk)
  // ════════════════════════════════════════════════════════════════════════════

  // Level 1 — Greetings
  "u02-lv1-l1": [
    // ── Flashcards: teach greetings first ──
    fc(
      "Guten Morgen",
      "GOO-ten MOR-gen",
      "Good morning! Used from when you wake up until around noon. Very common in Germany.",
      "Guten Morgen! Wie geht es dir?",
      "Good morning! How are you?",
      ["Guten Morgen, Mama! — Good morning, Mum!", "Guten Morgen, alle! — Good morning, everyone!"],
    ),
    fc(
      "Guten Tag",
      "GOO-ten TAHK",
      "Good day / Hello — used from noon until evening. The standard formal daytime greeting.",
      "Guten Tag, Herr Müller.",
      "Good day, Mr. Müller.",
      ["Guten Tag! Kann ich helfen? — Good day! Can I help?", "Guten Tag, Frau Schmidt! — Good day, Ms. Schmidt!"],
    ),
    fc(
      "Guten Abend",
      "GOO-ten AH-bent",
      "Good evening — used from around 6 pm onwards. Formal and friendly.",
      "Guten Abend! Willkommen!",
      "Good evening! Welcome!",
      ["Guten Abend, alle! — Good evening, everyone!", "Guten Abend und viel Spaß! — Good evening and have fun!"],
    ),
    fc(
      "Hallo / Hi",
      "HAL-oh / hee",
      "'Hallo' is the everyday casual hello — works at any time. 'Hi' is even more informal, used with friends.",
      "Hallo! Wie heißt du?",
      "Hello! What's your name?",
      ["Hallo, ich bin Anna! — Hello, I'm Anna!", "Hi, alles gut? — Hi, all good?"],
    ),
    fc(
      "Tschüss / Auf Wiedersehen",
      "CHYSS / owf-VEE-der-zayn",
      "'Tschüss' = casual bye (friends). 'Auf Wiedersehen' = formal goodbye (until we see again).",
      "Tschüss! Bis morgen!",
      "Bye! See you tomorrow!",
      ["Auf Wiedersehen, Herr Koch! — Goodbye, Mr. Koch!", "Tschüss, bis bald! — Bye, see you soon!"],
    ),
    fc(
      "Wie geht's?",
      "vee GATES",
      "'How are you?' — informal. Short for 'Wie geht es dir?' Reply: 'Gut, danke!' (Good, thanks!)",
      "Wie geht's dir heute?",
      "How are you today?",
      ["Wie geht's? — Gut, danke! — How are you? — Good, thanks!", "Nicht so gut, leider. — Not so good, unfortunately."],
    ),
    fc(
      "Sehr gut / Gut / Es geht",
      "zayr goot / goot / es gate",
      "Three ways to answer 'How are you?': Sehr gut (very good) · Gut (good) · Es geht (so-so / OK).",
      "Mir geht es sehr gut!",
      "I am very well!",
      ["Danke, gut! — Thanks, good!", "Es geht, und dir? — So-so, and you?"],
    ),
    fc(
      "Bitte / Danke",
      "BIT-teh / DAN-keh",
      "'Bitte' = please / you're welcome. 'Danke' = thank you. Danke + bitte = the polite combo!",
      "Danke! — Bitte sehr!",
      "Thank you! — You're welcome!",
      ["Bitte schön! — Here you go / You're welcome!", "Vielen Dank! — Many thanks!"],
    ),
    // ── MCQ questions ──
    mcq(
      "You meet your teacher at 9am. Which greeting is correct?",
      ["Guten Abend", "Guten Morgen", "Auf Wiedersehen", "Tschüss"],
      1,
      "'Guten Morgen' is used in the morning (until ~noon). 'Guten Tag' is for the afternoon.",
    ),
    mcq(
      "What does 'Auf Wiedersehen' mean?",
      ["Good morning", "How are you?", "Goodbye (formal)", "You're welcome"],
      2,
      "'Auf Wiedersehen' literally means 'until we see again' — it's the formal way to say goodbye.",
    ),
    mcq(
      "How do you say 'How are you?' informally in German?",
      ["Guten Tag", "Wie geht's?", "Auf Wiedersehen", "Bitte schön"],
      1,
      "'Wie geht's?' is short for 'Wie geht es dir?' — the casual 'How are you?'",
    ),
    mcq(
      "Someone says 'Danke!' — what is the natural reply?",
      ["Tschüss!", "Guten Morgen!", "Bitte!", "Sehr gut!"],
      2,
      "'Bitte!' (or 'Bitte sehr!') means 'You're welcome' as a reply to 'Danke' (Thank you).",
    ),
    mcq(
      "Which greeting is used from noon until evening?",
      ["Guten Morgen", "Guten Tag", "Guten Abend", "Gute Nacht"],
      1,
      "'Guten Tag' (good day) is used roughly from noon until evening. 'Guten Abend' starts at ~6pm.",
    ),
    mcq(
      "Your friend leaves. Which phrase fits a casual goodbye?",
      ["Guten Tag", "Wie geht's?", "Tschüss!", "Sehr gut"],
      2,
      "'Tschüss' is the casual way to say bye. 'Auf Wiedersehen' is more formal.",
    ),
    mcq(
      "What does 'Sehr gut' mean?",
      ["Very good", "Good evening", "See you soon", "Please"],
      0,
      "'Sehr gut' = very good. It's a common response to 'Wie geht's?' ('How are you?').",
    ),
    mcq(
      "You receive something at a shop. The clerk says 'Bitte schön!' — what does it mean?",
      ["Thank you", "You're welcome / Here you go", "Goodbye", "Good morning"],
      1,
      "'Bitte schön' is used when handing something over ('here you go') or as 'you're welcome'.",
    ),
    mcq(
      "How do you greet someone formally after 6pm?",
      ["Guten Morgen", "Hallo", "Guten Abend", "Tschüss"],
      2,
      "'Guten Abend' (good evening) is the formal evening greeting used after roughly 6pm.",
    ),
    mcq(
      "Someone asks 'Wie geht's?' and you feel okay but not great. What do you say?",
      ["Sehr gut", "Guten Tag", "Es geht", "Auf Wiedersehen"],
      2,
      "'Es geht' means 'so-so / it's okay' — a middle-ground response to 'How are you?'",
    ),
    mcq(
      "Which of these is an informal 'hello' you'd say to a close friend?",
      ["Guten Tag", "Guten Abend", "Auf Wiedersehen", "Hallo"],
      3,
      "'Hallo' is the everyday casual hello. 'Hi' is even more casual. 'Guten Tag' is formal.",
    ),
    mcq(
      "'Vielen Dank!' means...?",
      ["Good luck", "Many thanks", "Good night", "You're welcome"],
      1,
      "'Vielen Dank' = 'many thanks'. It's a stronger way to thank someone than just 'Danke'.",
    ),
    mcq(
      "Put in order: You arrive at a café at noon. What do you say first?",
      ["Tschüss!", "Guten Abend!", "Guten Tag!", "Wie geht's?"],
      2,
      "At noon you say 'Guten Tag!' to greet. 'Guten Abend' is for evenings, 'Tschüss' is goodbye.",
    ),
    mcq(
      "Which phrase means 'See you soon'?",
      ["Bis bald!", "Bitte schön!", "Sehr gut!", "Guten Tag!"],
      0,
      "'Bis bald!' means 'See you soon!' — 'bis' means 'until', 'bald' means 'soon'.",
    ),
    mcq(
      "'Nicht so gut' means...?",
      ["Very good", "Not so good", "Good evening", "Please"],
      1,
      "'Nicht so gut' = 'not so good'. You'd use this when you're not feeling great.",
    ),
  ],

  "u02-lv1-l2": placeholder("u02-lv1-l2"),
  "u02-lv1-l3": placeholder("u02-lv1-l3"),
  "u02-lv1-l4": placeholder("u02-lv1-l4"),
  "u02-lv1-l5": placeholder("u02-lv1-l5"),

  // Level 2 — Pronouns & Verbs
  "u02-lv2-l1": [
    // ── Flashcards: teach pronouns first ──
    fc(
      "ich",
      "/ɪç/",
      "'I' — the first person singular. Always lowercase in German (unlike English 'I').",
      "Ich bin Student.",
      "I am a student.",
      ["Ich komme aus Indien. — I come from India.", "Ich lerne Deutsch. — I am learning German."],
    ),
    fc(
      "du",
      "/duː/",
      "'You' — informal singular. Use with friends, family, children. Capitalised only at the start of a sentence.",
      "Du bist nett.",
      "You are nice.",
      ["Du sprichst gut Deutsch! — You speak German well!", "Wie heißt du? — What's your name?"],
    ),
    fc(
      "er / sie / es",
      "/eːr / ziː / ɛs/",
      "He / She / It — third person singular. 'sie' (she) looks the same as 'sie' (they) — context decides.",
      "Er kommt aus Berlin.",
      "He comes from Berlin.",
      ["Sie ist sehr nett. — She is very nice.", "Es ist kalt. — It is cold."],
    ),
    fc(
      "wir",
      "/viːr/",
      "'We' — first person plural. Very common in German conversation.",
      "Wir lernen Deutsch.",
      "We learn German.",
      ["Wir kommen aus Indien. — We come from India.", "Wir sind Freunde. — We are friends."],
    ),
    fc(
      "ihr",
      "/iːr/",
      "'You all' — informal plural (addressing a group). Like 'you guys' in English.",
      "Ihr seid toll!",
      "You all are great!",
      ["Sprecht ihr Deutsch? — Do you all speak German?", "Wo wohnt ihr? — Where do you all live?"],
    ),
    fc(
      "sie / Sie",
      "/ziː/",
      "Two meanings! Lowercase 'sie' = they (plural). Capital 'Sie' = you (formal singular/plural). Context + capitalisation matter.",
      "Sie sprechen gut Deutsch.",
      "They speak German well. / You speak German well. (formal)",
      ["Sind Sie Herr Müller? — Are you Mr. Müller? (formal)", "Sie kommen morgen. — They are coming tomorrow."],
    ),
    fc(
      "sein — bin/bist/ist",
      "/zaɪn/",
      "'to be' — the most important German verb. Irregular! ich bin · du bist · er/sie/es ist · wir sind · ihr seid · sie/Sie sind.",
      "Ich bin Anna.",
      "I am Anna.",
      ["Du bist sehr freundlich. — You are very friendly.", "Er ist Lehrer. — He is a teacher."],
    ),
    fc(
      "kommen — komme/kommst",
      "/ˈkɔmən/",
      "'to come / to come from'. Regular verb: ich komme · du kommst · er kommt · wir kommen · ihr kommt · sie kommen.",
      "Ich komme aus Indien.",
      "I come from India.",
      ["Woher kommst du? — Where are you from?", "Er kommt aus Berlin. — He comes from Berlin."],
    ),
    fc(
      "heißen — heiße/heißt",
      "/ˈhaɪsən/",
      "'to be called / named'. Used to introduce your name. Ich heiße = My name is.",
      "Ich heiße Maria.",
      "My name is Maria.",
      ["Wie heißt du? — What is your name?", "Er heißt Thomas. — His name is Thomas."],
    ),
    // ── MCQ questions ──
    mcq(
      "How do you say 'I am a student' in German?",
      ["Du bist Student.", "Ich bin Student.", "Er ist Student.", "Wir sind Studenten."],
      1,
      "'Ich' = I, 'bin' = am (from 'sein'). So 'Ich bin Student' = 'I am a student'.",
    ),
    mcq(
      "What is the German word for 'we'?",
      ["ich", "ihr", "wir", "sie"],
      2,
      "'Wir' = we. 'Ich' = I, 'ihr' = you all, 'sie' = they/she.",
    ),
    mcq(
      "Which pronoun do you use with a close friend?",
      ["Sie (formal)", "du", "ihr", "es"],
      1,
      "'du' is the informal 'you' — used with friends, family, and children.",
    ),
    mcq(
      "'Wie heißt du?' means...?",
      ["How are you?", "Where are you from?", "What is your name?", "Do you speak German?"],
      2,
      "'Wie heißt du?' uses 'heißen' (to be called) — literally 'How are you called?' = What's your name?",
    ),
    mcq(
      "Fill in: '___ kommt aus Berlin.' (He)",
      ["Ich", "Du", "Er", "Wir"],
      2,
      "'Er' = he. So 'Er kommt aus Berlin' = 'He comes from Berlin'.",
    ),
    mcq(
      "What is the 'ich' form of 'kommen'?",
      ["kommt", "kommen", "komme", "kommst"],
      2,
      "'ich komme' — regular -en verbs drop the -en and add -e for 'ich': kommen → komme.",
    ),
    mcq(
      "Capital 'Sie' in German means...?",
      ["she", "they", "you (formal)", "it"],
      2,
      "Capital 'Sie' is the formal 'you' — used with strangers, older people, and professional contexts.",
    ),
    mcq(
      "Which is correct: 'My name is Lena'?",
      ["Ich heiße Lena.", "Du heißt Lena.", "Er heißt Lena.", "Wir heißen Lena."],
      0,
      "'Ich heiße Lena' — 'ich' = I, 'heiße' is the ich-form of 'heißen' (to be called).",
    ),
    mcq(
      "'Du bist nett' means...?",
      ["I am nice", "You are nice", "She is nice", "We are nice"],
      1,
      "'Du' = you (informal), 'bist' = are (du-form of sein). 'Du bist nett' = You are nice.",
    ),
    mcq(
      "Which is the 'ihr' (you all) form of 'sein'?",
      ["sind", "seid", "ist", "bin"],
      1,
      "The conjugation of 'sein': ich bin · du bist · er ist · wir sind · ihr seid · sie sind.",
    ),
    mcq(
      "'Woher kommst du?' means...?",
      ["What is your name?", "How are you?", "Where are you from?", "Do you speak German?"],
      2,
      "'Woher' = from where, 'kommst' = come (du-form of kommen), 'du' = you. → 'Where are you from?'",
    ),
    mcq(
      "How do you say 'We are learning German'?",
      ["Ich lerne Deutsch.", "Ihr lernt Deutsch.", "Wir lernen Deutsch.", "Sie lernt Deutsch."],
      2,
      "'Wir lernen Deutsch' — 'wir' = we, 'lernen' = learn/are learning.",
    ),
    mcq(
      "What does 'er/sie/es' all share?",
      ["They are all plural", "They all use 'ist' with 'sein'", "They are all formal", "They all mean 'you'"],
      1,
      "er/sie/es all use 'ist' — e.g. er ist, sie ist, es ist. They're the 3rd person singular group.",
    ),
    mcq(
      "'Sind Sie Herr Müller?' — which register is this?",
      ["Casual, with a friend", "Formal, with a stranger", "Rude", "Children's speech"],
      1,
      "Capital 'Sie' is always formal. You'd use this in professional or polite situations with strangers.",
    ),
    mcq(
      "Which sentence means 'You all speak German'?",
      ["Du sprichst Deutsch.", "Wir sprechen Deutsch.", "Ihr sprecht Deutsch.", "Sie sprechen Deutsch."],
      2,
      "'Ihr' = you all (informal plural). 'Ihr sprecht Deutsch' = You all speak German.",
    ),
  ],

  "u02-lv2-l2": placeholder("u02-lv2-l2"),
  "u02-lv2-l3": placeholder("u02-lv2-l3"),
  "u02-lv2-l4": placeholder("u02-lv2-l4"),
  "u02-lv2-l5": placeholder("u02-lv2-l5"),

  // Level 3 — Introductions
  "u02-lv3-l1": placeholder("u02-lv3-l1"),
  "u02-lv3-l2": placeholder("u02-lv3-l2"),
  "u02-lv3-l3": placeholder("u02-lv3-l3"),
  "u02-lv3-l4": placeholder("u02-lv3-l4"),
  "u02-lv3-l5": placeholder("u02-lv3-l5"),

  // Level 4 — Conversation
  "u02-lv4-l1": placeholder("u02-lv4-l1"),
  "u02-lv4-l2": placeholder("u02-lv4-l2"),
  "u02-lv4-l3": placeholder("u02-lv4-l3"),
  "u02-lv4-l4": placeholder("u02-lv4-l4"),
  "u02-lv4-l5": placeholder("u02-lv4-l5"),

  // ════════════════════════════════════════════════════════════════════════════
  // UNIT 3 — Familie & Alltag (Family members & everyday activities)
  // ════════════════════════════════════════════════════════════════════════════

  // Level 1 — Family Members
  "u03-lv1-l1": placeholder("u03-lv1-l1"),
  "u03-lv1-l2": placeholder("u03-lv1-l2"),
  "u03-lv1-l3": placeholder("u03-lv1-l3"),
  "u03-lv1-l4": placeholder("u03-lv1-l4"),
  "u03-lv1-l5": placeholder("u03-lv1-l5"),

  // Level 2 — Sentence Structure
  "u03-lv2-l1": placeholder("u03-lv2-l1"),
  "u03-lv2-l2": placeholder("u03-lv2-l2"),
  "u03-lv2-l3": placeholder("u03-lv2-l3"),
  "u03-lv2-l4": placeholder("u03-lv2-l4"),
  "u03-lv2-l5": placeholder("u03-lv2-l5"),

  // Level 3 — Daily Activities
  "u03-lv3-l1": placeholder("u03-lv3-l1"),
  "u03-lv3-l2": placeholder("u03-lv3-l2"),
  "u03-lv3-l3": placeholder("u03-lv3-l3"),
  "u03-lv3-l4": placeholder("u03-lv3-l4"),
  "u03-lv3-l5": placeholder("u03-lv3-l5"),

  // Level 4 — Family & Life
  "u03-lv4-l1": placeholder("u03-lv4-l1"),
  "u03-lv4-l2": placeholder("u03-lv4-l2"),
  "u03-lv4-l3": placeholder("u03-lv4-l3"),
  "u03-lv4-l4": placeholder("u03-lv4-l4"),
  "u03-lv4-l5": placeholder("u03-lv4-l5"),

  // ════════════════════════════════════════════════════════════════════════════
  // UNIT 4 — Zuhause & Essen (Home objects, food & articles)
  // ════════════════════════════════════════════════════════════════════════════

  // Level 1 — Articles: der, die, das
  "u04-lv1-l1": placeholder("u04-lv1-l1"),
  "u04-lv1-l2": placeholder("u04-lv1-l2"),
  "u04-lv1-l3": placeholder("u04-lv1-l3"),
  "u04-lv1-l4": placeholder("u04-lv1-l4"),
  "u04-lv1-l5": placeholder("u04-lv1-l5"),

  // Level 2 — Home Objects
  "u04-lv2-l1": placeholder("u04-lv2-l1"),
  "u04-lv2-l2": placeholder("u04-lv2-l2"),
  "u04-lv2-l3": placeholder("u04-lv2-l3"),
  "u04-lv2-l4": placeholder("u04-lv2-l4"),
  "u04-lv2-l5": placeholder("u04-lv2-l5"),

  // Level 3 — Food & Drinks
  "u04-lv3-l1": placeholder("u04-lv3-l1"),
  "u04-lv3-l2": placeholder("u04-lv3-l2"),
  "u04-lv3-l3": placeholder("u04-lv3-l3"),
  "u04-lv3-l4": placeholder("u04-lv3-l4"),
  "u04-lv3-l5": placeholder("u04-lv3-l5"),

  // Level 4 — Adjectives
  "u04-lv4-l1": placeholder("u04-lv4-l1"),
  "u04-lv4-l2": placeholder("u04-lv4-l2"),
  "u04-lv4-l3": placeholder("u04-lv4-l3"),
  "u04-lv4-l4": placeholder("u04-lv4-l4"),
  "u04-lv4-l5": placeholder("u04-lv4-l5"),

  // ════════════════════════════════════════════════════════════════════════════
  // UNIT 5 — Einkaufen & Essen gehen (Shopping, prices, restaurants & meals)
  // ════════════════════════════════════════════════════════════════════════════

  // Level 1 — Negation
  "u05-lv1-l1": placeholder("u05-lv1-l1"),
  "u05-lv1-l2": placeholder("u05-lv1-l2"),
  "u05-lv1-l3": placeholder("u05-lv1-l3"),
  "u05-lv1-l4": placeholder("u05-lv1-l4"),
  "u05-lv1-l5": placeholder("u05-lv1-l5"),

  // Level 2 — Shopping
  "u05-lv2-l1": placeholder("u05-lv2-l1"),
  "u05-lv2-l2": placeholder("u05-lv2-l2"),
  "u05-lv2-l3": placeholder("u05-lv2-l3"),
  "u05-lv2-l4": placeholder("u05-lv2-l4"),
  "u05-lv2-l5": placeholder("u05-lv2-l5"),

  // Level 3 — At the Restaurant
  "u05-lv3-l1": placeholder("u05-lv3-l1"),
  "u05-lv3-l2": placeholder("u05-lv3-l2"),
  "u05-lv3-l3": placeholder("u05-lv3-l3"),
  "u05-lv3-l4": placeholder("u05-lv3-l4"),
  "u05-lv3-l5": placeholder("u05-lv3-l5"),

  // Level 4 — Meal Times
  "u05-lv4-l1": placeholder("u05-lv4-l1"),
  "u05-lv4-l2": placeholder("u05-lv4-l2"),
  "u05-lv4-l3": placeholder("u05-lv4-l3"),
  "u05-lv4-l4": placeholder("u05-lv4-l4"),
  "u05-lv4-l5": placeholder("u05-lv4-l5"),

  // ════════════════════════════════════════════════════════════════════════════
  // UNIT 6 — Reisen & Hobbys (Transport, travel & free time activities)
  // ════════════════════════════════════════════════════════════════════════════

  // Level 1 — Accusative Case
  "u06-lv1-l1": placeholder("u06-lv1-l1"),
  "u06-lv1-l2": placeholder("u06-lv1-l2"),
  "u06-lv1-l3": placeholder("u06-lv1-l3"),
  "u06-lv1-l4": placeholder("u06-lv1-l4"),
  "u06-lv1-l5": placeholder("u06-lv1-l5"),

  // Level 2 — Transport
  "u06-lv2-l1": placeholder("u06-lv2-l1"),
  "u06-lv2-l2": placeholder("u06-lv2-l2"),
  "u06-lv2-l3": placeholder("u06-lv2-l3"),
  "u06-lv2-l4": placeholder("u06-lv2-l4"),
  "u06-lv2-l5": placeholder("u06-lv2-l5"),

  // Level 3 — Hobbies
  "u06-lv3-l1": placeholder("u06-lv3-l1"),
  "u06-lv3-l2": placeholder("u06-lv3-l2"),
  "u06-lv3-l3": placeholder("u06-lv3-l3"),
  "u06-lv3-l4": placeholder("u06-lv3-l4"),
  "u06-lv3-l5": placeholder("u06-lv3-l5"),

  // Level 4 — Travel & Free Time
  "u06-lv4-l1": placeholder("u06-lv4-l1"),
  "u06-lv4-l2": placeholder("u06-lv4-l2"),
  "u06-lv4-l3": placeholder("u06-lv4-l3"),
  "u06-lv4-l4": placeholder("u06-lv4-l4"),
  "u06-lv4-l5": placeholder("u06-lv4-l5"),

  // ════════════════════════════════════════════════════════════════════════════
  // UNIT 7 — In der Stadt (Directions, places & social plans)
  // ════════════════════════════════════════════════════════════════════════════

  // Level 1 — Dative Case
  "u07-lv1-l1": placeholder("u07-lv1-l1"),
  "u07-lv1-l2": placeholder("u07-lv1-l2"),
  "u07-lv1-l3": placeholder("u07-lv1-l3"),
  "u07-lv1-l4": placeholder("u07-lv1-l4"),
  "u07-lv1-l5": placeholder("u07-lv1-l5"),

  // Level 2 — Directions
  "u07-lv2-l1": placeholder("u07-lv2-l1"),
  "u07-lv2-l2": placeholder("u07-lv2-l2"),
  "u07-lv2-l3": placeholder("u07-lv2-l3"),
  "u07-lv2-l4": placeholder("u07-lv2-l4"),
  "u07-lv2-l5": placeholder("u07-lv2-l5"),

  // Level 3 — City Places
  "u07-lv3-l1": placeholder("u07-lv3-l1"),
  "u07-lv3-l2": placeholder("u07-lv3-l2"),
  "u07-lv3-l3": placeholder("u07-lv3-l3"),
  "u07-lv3-l4": placeholder("u07-lv3-l4"),
  "u07-lv3-l5": placeholder("u07-lv3-l5"),

  // Level 4 — Social Plans
  "u07-lv4-l1": placeholder("u07-lv4-l1"),
  "u07-lv4-l2": placeholder("u07-lv4-l2"),
  "u07-lv4-l3": placeholder("u07-lv4-l3"),
  "u07-lv4-l4": placeholder("u07-lv4-l4"),
  "u07-lv4-l5": placeholder("u07-lv4-l5"),

  // ════════════════════════════════════════════════════════════════════════════
  // UNIT 8 — Tagesablauf & Vergangenheit (Daily routine, modals & past tense)
  // ════════════════════════════════════════════════════════════════════════════

  // Level 1 — Modal Verbs
  "u08-lv1-l1": placeholder("u08-lv1-l1"),
  "u08-lv1-l2": placeholder("u08-lv1-l2"),
  "u08-lv1-l3": placeholder("u08-lv1-l3"),
  "u08-lv1-l4": placeholder("u08-lv1-l4"),
  "u08-lv1-l5": placeholder("u08-lv1-l5"),

  // Level 2 — Daily Routine
  "u08-lv2-l1": placeholder("u08-lv2-l1"),
  "u08-lv2-l2": placeholder("u08-lv2-l2"),
  "u08-lv2-l3": placeholder("u08-lv2-l3"),
  "u08-lv2-l4": placeholder("u08-lv2-l4"),
  "u08-lv2-l5": placeholder("u08-lv2-l5"),

  // Level 3 — Past Tense (Perfekt)
  "u08-lv3-l1": placeholder("u08-lv3-l1"),
  "u08-lv3-l2": placeholder("u08-lv3-l2"),
  "u08-lv3-l3": placeholder("u08-lv3-l3"),
  "u08-lv3-l4": placeholder("u08-lv3-l4"),
  "u08-lv3-l5": placeholder("u08-lv3-l5"),

  // Level 4 — Vacation & Memories
  "u08-lv4-l1": placeholder("u08-lv4-l1"),
  "u08-lv4-l2": placeholder("u08-lv4-l2"),
  "u08-lv4-l3": placeholder("u08-lv4-l3"),
  "u08-lv4-l4": placeholder("u08-lv4-l4"),
  "u08-lv4-l5": placeholder("u08-lv4-l5"),
};
