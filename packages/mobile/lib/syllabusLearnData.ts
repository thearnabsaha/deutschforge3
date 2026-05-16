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
  "u02-lv1-l1": placeholder("u02-lv1-l1"),
  "u02-lv1-l2": placeholder("u02-lv1-l2"),
  "u02-lv1-l3": placeholder("u02-lv1-l3"),
  "u02-lv1-l4": placeholder("u02-lv1-l4"),
  "u02-lv1-l5": placeholder("u02-lv1-l5"),

  // Level 2 — Pronouns & Verbs
  "u02-lv2-l1": placeholder("u02-lv2-l1"),
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
