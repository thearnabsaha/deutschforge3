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
  // ─── Level 3 — Introductions ─────────────────────────────────────────────
  // Focus: heißen · kommen · wohnen · sprechen · countries · languages

  // l1 — Intro: Meet the intro verbs + key phrases (guided, hints on)
  "u02-lv3-l1": [
    fc(
      "Ich heiße ...",
      "ɪç ˈhaɪsə",
      "'My name is ...' — from the verb 'heißen' (to be called). The most natural way to introduce your name in German.",
      "Ich heiße Anna.",
      "My name is Anna.",
      ["Wie heißt du? — What's your name?", "Er heißt Thomas. — His name is Thomas."],
    ),
    fc(
      "Ich komme aus ...",
      "ɪç ˈkɔmə aʊs",
      "'I come from ...' — use this to say where you're from. 'aus' means 'from' (a country or city).",
      "Ich komme aus Indien.",
      "I come from India.",
      ["Woher kommst du? — Where are you from?", "Sie kommt aus Japan. — She comes from Japan."],
    ),
    fc(
      "Ich wohne in ...",
      "ɪç ˈvoːnə ɪn",
      "'I live in ...' — use 'wohnen' for where you currently live. Different from 'kommen aus' (origin).",
      "Ich wohne in Berlin.",
      "I live in Berlin.",
      ["Wo wohnst du? — Where do you live?", "Wir wohnen in München. — We live in Munich."],
    ),
    fc(
      "Ich spreche ...",
      "ɪç ˈʃprɛçə",
      "'I speak ...' — from 'sprechen', an irregular verb. Use it to list languages you know.",
      "Ich spreche Englisch und Deutsch.",
      "I speak English and German.",
      ["Sprichst du Deutsch? — Do you speak German?", "Er spricht kein Französisch. — He doesn't speak French."],
    ),
    fc(
      "Ich lerne Deutsch.",
      "ɪç ˈlɛrnə ˈdɔʏtʃ",
      "'I am learning German.' — a great sentence for your very first introduction! 'lernen' is regular.",
      "Ich lerne seit drei Monaten Deutsch.",
      "I have been learning German for three months.",
      ["Lernst du Deutsch? — Are you learning German?", "Wir lernen zusammen. — We learn together."],
    ),
    fc(
      "Mein Name ist ...",
      "maɪn ˈnaːmə ɪst",
      "'My name is ...' — slightly more formal than 'Ich heiße'. Both are correct and common.",
      "Mein Name ist Priya Sharma.",
      "My name is Priya Sharma.",
      ["Was ist Ihr Name? — What is your name? (formal)", "Ihr Name ist Müller. — Her name is Müller."],
    ),
    fc(
      "Wie alt bist du?",
      "viː alt bɪst duː",
      "'How old are you?' — 'alt' means old/age. Reply: 'Ich bin [number] Jahre alt.' (I am [X] years old.)",
      "Ich bin 25 Jahre alt.",
      "I am 25 years old.",
      ["Wie alt ist er? — How old is he?", "Sie ist 30 Jahre alt. — She is 30 years old."],
    ),
    fc(
      "Angenehm! / Freut mich!",
      "anɡəˈneːm / frɔʏt mɪç",
      "Pleased to meet you! 'Angenehm' = pleasant/delighted. 'Freut mich' = it pleases me. Both used after introductions.",
      "Ich heiße Max. — Angenehm!",
      "My name is Max. — Pleased to meet you!",
      ["Freut mich, Sie kennenzulernen! — Pleased to meet you! (formal)", "Auch angenehm! — Likewise!"],
    ),
    // ── MCQ ──
    mcq(
      "How do you say 'My name is Lena' in German?",
      ["Ich bin Lena.", "Ich heiße Lena.", "Ich komme Lena.", "Ich wohne Lena."],
      1,
      "'Ich heiße Lena' uses 'heißen' (to be called) — the standard way to give your name.",
    ),
    mcq(
      "'Ich komme aus Indien' means...?",
      ["I live in India.", "I speak Indian.", "I come from India.", "I am going to India."],
      2,
      "'kommen aus' = to come from. 'Indien' = India. → 'I come from India.'",
    ),
    mcq(
      "What does 'Ich wohne in Berlin' mean?",
      ["I come from Berlin.", "I am visiting Berlin.", "I live in Berlin.", "I love Berlin."],
      2,
      "'wohnen' = to live/reside. 'Ich wohne in Berlin' = 'I live in Berlin.'",
    ),
    mcq(
      "'Ich spreche Englisch.' means...?",
      ["I learn English.", "I speak English.", "I understand English.", "I like English."],
      1,
      "'sprechen' = to speak. 'Ich spreche Englisch' = 'I speak English.'",
    ),
    mcq(
      "How do you ask 'Where are you from?' in German?",
      ["Wie heißt du?", "Wo wohnst du?", "Woher kommst du?", "Wie alt bist du?"],
      2,
      "'Woher' = from where, 'kommst' = come (du-form). 'Woher kommst du?' = Where are you from?",
    ),
    mcq(
      "'Freut mich!' after an introduction means...?",
      ["Goodbye!", "Pleased to meet you!", "Thank you!", "Good morning!"],
      1,
      "'Freut mich' literally = 'it pleases me' — the standard 'pleased to meet you' after introductions.",
    ),
    mcq(
      "Complete: 'Ich bin ___ Jahre alt.' (I am 22 years old.)",
      ["22 Monat", "22 Jahr", "zweiundzwanzig", "zwanzig zwei"],
      2,
      "'Ich bin zweiundzwanzig Jahre alt.' In German, two-digit numbers are said units-first: zwei-und-zwanzig.",
    ),
  ],

  // l2 — Practice: Introduction building blocks (medium difficulty)
  "u02-lv3-l2": [
    mcq(
      "Which sentence correctly introduces your name?",
      ["Ich bin heiße Anna.", "Mein Name ist Anna.", "Ich komme Anna.", "Anna bin ich heiße."],
      1,
      "'Mein Name ist Anna' = My name is Anna. Also correct: 'Ich heiße Anna.'",
    ),
    mcq(
      "What is the du-form of 'heißen'?",
      ["heißt", "heiße", "heißen", "heißt du"],
      0,
      "heißen conjugation: ich heiße · du heißt · er heißt · wir heißen · ihr heißt · sie heißen.",
    ),
    mcq(
      "Someone asks 'Woher kommst du?' — what do they want to know?",
      ["Your name", "Your age", "Where you're from", "Where you live"],
      2,
      "'Woher' = from where. 'Woher kommst du?' = Where do you come from / Where are you from?",
    ),
    mcq(
      "What is the difference between 'kommen aus' and 'wohnen in'?",
      ["No difference — both mean 'to live'", "'kommen aus' = origin, 'wohnen in' = current residence", "'wohnen in' = origin, 'kommen aus' = current location", "Both mean 'to speak'"],
      1,
      "'Ich komme aus Indien' = I'm originally from India. 'Ich wohne in Berlin' = I currently live in Berlin.",
    ),
    mcq(
      "Fill in: 'Ich ___ in München.'",
      ["komme", "heiße", "wohne", "spreche"],
      2,
      "'Ich wohne in München' — 'wohnen' is used with 'in' for the city/place where you live.",
    ),
    mcq(
      "How do you say 'I speak German and English'?",
      ["Ich spreche Deutsch und Englisch.", "Ich lerne Deutsch und Englisch.", "Ich bin Deutsch und Englisch.", "Ich komme Deutsch und Englisch."],
      0,
      "'sprechen' = to speak. 'Ich spreche Deutsch und Englisch.' — list languages after the verb.",
    ),
    mcq(
      "'Wie alt bist du?' — what is a correct answer?",
      ["Ich bin Berlin.", "Ich bin sehr gut.", "Ich bin 28 Jahre alt.", "Ich heiße 28."],
      2,
      "Answer with 'Ich bin [number] Jahre alt.' — 'Jahre alt' means 'years old'.",
    ),
    mcq(
      "Which is the correct way to say you're from Germany?",
      ["Ich spreche aus Deutschland.", "Ich komme aus Deutschland.", "Ich wohne aus Deutschland.", "Ich bin aus Deutschland komme."],
      1,
      "'Ich komme aus Deutschland' — 'kommen aus' = to come from. 'Deutschland' = Germany.",
    ),
    mcq(
      "What does 'Ich lerne Deutsch seit einem Jahr' mean?",
      ["I learned German one year ago.", "I will learn German in one year.", "I have been learning German for one year.", "I speak German for one year."],
      2,
      "'seit' = for/since (ongoing). 'Ich lerne Deutsch seit einem Jahr' = I've been learning German for one year.",
    ),
    mcq(
      "'Angenehm!' is said...?",
      ["When saying goodbye", "After being introduced to someone", "When ordering food", "When you're confused"],
      1,
      "'Angenehm!' = Pleased to meet you! — said right after introductions, equivalent to 'Nice to meet you!'",
    ),
    mcq(
      "Which word means 'to speak' in German?",
      ["wohnen", "heißen", "sprechen", "kommen"],
      2,
      "'sprechen' = to speak. Irregular: ich spreche · du sprichst · er spricht.",
    ),
    mcq(
      "How do you ask someone where they live?",
      ["Woher kommst du?", "Wie heißt du?", "Wo wohnst du?", "Was sprichst du?"],
      2,
      "'Wo' = where, 'wohnst' = live (du-form of wohnen). 'Wo wohnst du?' = Where do you live?",
    ),
    mcq(
      "Complete a full introduction: 'Ich heiße Max. Ich komme aus ___. Ich wohne in ___.'",
      ["Berlin / Indien (wrong order)", "Indien / Berlin (correct — from India, live in Berlin)", "Deutsch / Englisch", "gut / danke"],
      1,
      "'aus' goes with country of origin, 'in' with city of current residence. Ich komme aus Indien. Ich wohne in Berlin.",
    ),
    mcq(
      "What does 'Mein Name ist...' signal vs 'Ich heiße...'?",
      ["'Mein Name ist' is wrong German", "'Mein Name ist' is slightly more formal", "They mean completely different things", "'Ich heiße' is only for children"],
      1,
      "Both mean 'my name is'. 'Mein Name ist' is a touch more formal — common in professional introductions.",
    ),
    mcq(
      "The verb 'sprechen' (to speak) in the du-form is...?",
      ["sprechst", "sprichst", "spreche", "sprecht"],
      1,
      "'sprechen' is irregular with vowel change: ich spreche · du sprichst · er spricht.",
    ),
  ],

  // l3 — Challenge: No hints, full introduction sentences
  "u02-lv3-l3": [
    mcq(
      "Translate: 'What is your name?' (informal)",
      ["Was ist Ihr Name?", "Wie heißen Sie?", "Wie heißt du?", "Was heißt du?"],
      2,
      "'Wie heißt du?' is the informal version. 'Wie heißen Sie?' is formal.",
    ),
    mcq(
      "Which sentence is a complete self-introduction?",
      ["Ich heiße Ben und komme aus England.", "Ich und Ben und England.", "Heiße Ben, England komme.", "Ben ich heiße aus England."],
      0,
      "Correct word order: Subject → Verb → rest. 'Ich heiße Ben und komme aus England.'",
    ),
    mcq(
      "'Sprichst du Französisch?' means...?",
      ["I speak French.", "Do you speak French?", "He speaks French.", "We speak French."],
      1,
      "Verb-first = yes/no question. 'Sprichst du Französisch?' = Do you speak French?",
    ),
    mcq(
      "How do you say 'She lives in Hamburg'?",
      ["Sie wohnt in Hamburg.", "Sie wohne in Hamburg.", "Sie wohnen in Hamburg.", "Sie heißt in Hamburg."],
      0,
      "er/sie/es form of 'wohnen' = wohnt. 'Sie wohnt in Hamburg.' = She lives in Hamburg.",
    ),
    mcq(
      "Complete: 'Ich spreche ___ Englisch.' (I don't speak English.)",
      ["nicht", "kein", "nein", "keinst"],
      0,
      "Use 'nicht' to negate verbs: 'Ich spreche nicht Englisch.' OR 'Ich spreche kein Englisch.' (kein for nouns).",
    ),
    mcq(
      "What does 'Woher' mean?",
      ["Where (location)", "From where", "Where to", "How"],
      1,
      "'Woher' = from where. Used with 'kommen': 'Woher kommst du?' = Where are you from?",
    ),
    mcq(
      "How do you say 'We come from Austria'?",
      ["Ich komme aus Österreich.", "Wir kommen aus Österreich.", "Wir wohnen aus Österreich.", "Ihr kommt aus Österreich."],
      1,
      "'Wir' = we, 'kommen' = come (wir-form of kommen). 'Wir kommen aus Österreich.'",
    ),
    mcq(
      "'Er heißt Thomas.' means...?",
      ["I am called Thomas.", "You are called Thomas.", "His name is Thomas.", "They are called Thomas."],
      2,
      "'er heißt' = he is called. So 'Er heißt Thomas' = His name is Thomas.",
    ),
    mcq(
      "Which is the correct 'wir'-form of 'wohnen'?",
      ["wohnt", "wohnst", "wohnen", "wohne"],
      2,
      "Regular verb: ich wohne · du wohnst · er wohnt · wir wohnen · ihr wohnt · sie wohnen.",
    ),
    mcq(
      "How do you ask someone's age formally?",
      ["Wie alt bist du?", "Wie alt sind Sie?", "Wie viel alt sind Sie?", "Alt wie bist du?"],
      1,
      "Formal 'you' = 'Sie'. 'Wie alt sind Sie?' = How old are you? (formal).",
    ),
    mcq(
      "'Ich lerne seit sechs Monaten Deutsch.' means...?",
      ["I will learn German for six months.", "I learned German six months ago.", "I have been learning German for six months.", "I speak German after six months."],
      2,
      "'seit' + present tense = ongoing action. 'seit sechs Monaten' = for six months (ongoing).",
    ),
    mcq(
      "Which is NOT a correct introduction sentence?",
      ["Ich heiße Priya.", "Ich komme aus Indien.", "Ich wohne in Delhi.", "Ich bin komme spreche."],
      3,
      "'Ich bin komme spreche' is grammatically wrong — three verbs stacked without structure.",
    ),
    mcq(
      "Translate: 'Do you live in Frankfurt?'",
      ["Woher wohnst du Frankfurt?", "Wohnst du in Frankfurt?", "Wohnt du Frankfurt?", "Du wohnst Frankfurt?"],
      1,
      "Yes/no question: verb goes first. 'Wohnst du in Frankfurt?' = Do you live in Frankfurt?",
    ),
    mcq(
      "Which countries use 'aus' correctly?",
      ["Ich komme in Deutschland.", "Ich komme aus Spanien.", "Ich komme von Frankreich.", "Ich komme zu Italien."],
      1,
      "'kommen aus' always takes 'aus'. 'Ich komme aus Spanien.' = I come from Spain.",
    ),
    mcq(
      "What does 'Auch angenehm!' mean as a reply to 'Angenehm!'?",
      ["Good morning too!", "Also not bad!", "Likewise / Pleased to meet you too!", "Also goodbye!"],
      2,
      "'Auch angenehm' = likewise / pleased to meet you too — the natural reply to 'Angenehm!'",
    ),
  ],

  // l4 — Tricky: Edge cases, similar phrases, word order traps
  "u02-lv3-l4": [
    mcq(
      "What's wrong with: 'Ich heiße aus Indien.'?",
      ["'Ich heiße' should be 'Ich bin'", "'aus Indien' is wrong here — 'heißen' is for names, not origin", "Nothing is wrong", "'Indien' needs an article"],
      1,
      "'heißen' = to be called (name only). For origin use 'kommen aus': 'Ich komme aus Indien.'",
    ),
    mcq(
      "Which is wrong word order?",
      ["Ich komme aus Indien.", "Aus Indien komme ich.", "Ich Indien komme aus.", "Komme ich aus Indien?"],
      2,
      "German verb must be in position 2. 'Ich Indien komme aus' puts the verb at the end — wrong in main clauses.",
    ),
    mcq(
      "'Ich wohne aus Berlin' — what's the error?",
      ["'wohnen' takes 'in', not 'aus'", "'Berlin' needs an article", "'Ich' should be 'Mein'", "Nothing — it's correct"],
      0,
      "'wohnen' + 'in': Ich wohne in Berlin. 'aus' is only for 'kommen aus' (origin).",
    ),
    mcq(
      "She speaks Spanish — which is correct?",
      ["Sie sprechen Spanisch.", "Sie sprichst Spanisch.", "Sie spricht Spanisch.", "Sie spreche Spanisch."],
      2,
      "er/sie/es form of 'sprechen' (irregular): er/sie/es spricht. 'Sie spricht Spanisch.'",
    ),
    mcq(
      "What does 'Ich spreche kein Deutsch' vs 'Ich spreche nicht Deutsch' mean?",
      ["They are completely different in meaning", "Both mean 'I don't speak German' — both acceptable", "'kein' is wrong here", "'nicht' is wrong here"],
      1,
      "Both are acceptable. 'kein' negates nouns directly (kein Deutsch), 'nicht' negates the verb. Both used.",
    ),
    mcq(
      "A friend introduces themselves. You reply 'Freut mich!' — what do they say back?",
      ["Auf Wiedersehen!", "Tschüss!", "Mich auch! / Auch angenehm!", "Guten Morgen!"],
      2,
      "'Mich auch!' = me too / likewise. 'Auch angenehm!' = also pleased. Both are natural replies.",
    ),
    mcq(
      "Formal: 'What is your name, where are you from?' — correct German?",
      ["Wie heißt du und woher kommst du?", "Wie heißen Sie und woher kommen Sie?", "Wie heißen Sie und woher kommst du?", "Wie bist Sie und woher sind Sie?"],
      1,
      "Full formal: 'Sie' throughout. 'Wie heißen Sie und woher kommen Sie?' — consistent register.",
    ),
    mcq(
      "'Ich bin 30.' vs 'Ich bin 30 Jahre alt.' — which is more correct?",
      ["'Ich bin 30' is wrong", "'Ich bin 30 Jahre alt' is more complete and natural", "Both are equally wrong", "'Jahre alt' is too formal"],
      1,
      "'Ich bin 30 Jahre alt' is the full, natural form. 'Ich bin 30' is understood but feels incomplete.",
    ),
    mcq(
      "Pick the tricky one: which means 'I am from India'?",
      ["Ich bin aus Indien. ✓ (informal/spoken)", "Ich komme aus Indien. ✓ (standard)", "Both are used", "Neither is correct"],
      2,
      "Both 'Ich bin aus Indien' (colloquial) and 'Ich komme aus Indien' (standard) are used to say where you're from.",
    ),
    mcq(
      "'Wo kommst du her?' vs 'Woher kommst du?' — what's the difference?",
      ["One is wrong", "'Wo kommst du her?' is old-fashioned only", "Same meaning — both are correct", "Different meanings entirely"],
      2,
      "Both mean 'Where are you from?' — 'Woher' is one word, 'wo...her' is split. Both are correct.",
    ),
    mcq(
      "Complete correctly: '___ wohnt ihr?' (Where do you all live?)",
      ["Woher", "Wohin", "Wo", "Wie"],
      2,
      "'Wo' = where (location). 'Wo wohnt ihr?' = Where do you all live? ('woher' = from where, 'wohin' = to where).",
    ),
    mcq(
      "What's wrong: 'Ich spreche Deutsch gut.'?",
      ["'gut' should come before 'Deutsch'", "Nothing is wrong", "'gut' should follow the verb directly: 'Ich spreche gut Deutsch.'", "'spreche' is the wrong form"],
      2,
      "Adverbs of manner typically come before the object in German: 'Ich spreche gut Deutsch.' Not 'Deutsch gut'.",
    ),
    mcq(
      "How do you say 'He has been living in Berlin for two years'?",
      ["Er wohnt seit zwei Jahren in Berlin.", "Er wohnte in Berlin für zwei Jahre.", "Er wohnt in Berlin vor zwei Jahren.", "Er ist wohnen Berlin seit zwei Jahre."],
      0,
      "'seit' + present tense for ongoing situations. 'Er wohnt seit zwei Jahren in Berlin.' = correct.",
    ),
    mcq(
      "What is 'Österreich' in English?",
      ["Australia", "Austria", "Switzerland", "Germany"],
      1,
      "'Österreich' = Austria. Common confusion: 'Australien' = Australia. Very different countries!",
    ),
    mcq(
      "Which reply is natural to 'Sprechen Sie Deutsch?'",
      ["Ja, ein bisschen. — Yes, a little.", "Ja, ich heiße Deutsch.", "Nein, ich wohne Deutsch.", "Ja, ich komme Deutsch."],
      0,
      "'Ja, ein bisschen' = Yes, a little — a very natural and common reply for beginners.",
    ),
  ],

  // l5 — Exam: Strict test, all intro content
  "u02-lv3-l5": [
    mcq(
      "Which sentence introduces your name correctly?",
      ["Ich bin heiße Lena.", "Ich heiße Lena.", "Ich komme Lena.", "Heiße ich Lena."],
      1,
      "'Ich heiße Lena.' — verb 'heiße' (ich-form of heißen) directly follows 'Ich'.",
    ),
    mcq(
      "How do you say 'I come from Switzerland'?",
      ["Ich wohne in Schweiz.", "Ich bin Schweiz.", "Ich komme aus der Schweiz.", "Ich spreche Schweiz."],
      2,
      "'Die Schweiz' (Switzerland) has a definite article — so it's 'aus der Schweiz', not just 'aus Schweiz'.",
    ),
    mcq(
      "What is the er/sie/es form of 'heißen'?",
      ["heißen", "heiße", "heißt", "heißst"],
      2,
      "er/sie/es heißt — same ending as du (heißt). Coincidence but common in German.",
    ),
    mcq(
      "'Ich wohne in Wien.' — what does this tell us?",
      ["Where I'm originally from", "What languages I speak", "Where I currently live", "How old I am"],
      2,
      "'wohnen in' = current residence. 'Wien' = Vienna (Austria). So: I currently live in Vienna.",
    ),
    mcq(
      "How do you say 'Do you speak English?' (informal)?",
      ["Sprechen Sie Englisch?", "Sprichst du Englisch?", "Spricht du Englisch?", "Spreche du Englisch?"],
      1,
      "Informal du-form of 'sprechen' = 'sprichst' (vowel change e→i). 'Sprichst du Englisch?'",
    ),
    mcq(
      "Translate: 'Pleased to meet you!' (one word answer)",
      ["Danke!", "Bitte!", "Angenehm!", "Tschüss!"],
      2,
      "'Angenehm!' = Pleased to meet you! Used right after introductions.",
    ),
    mcq(
      "What does 'seit' mean in 'Ich wohne seit drei Jahren in Berlin'?",
      ["ago", "in", "for/since (ongoing)", "until"],
      2,
      "'seit' + present tense = ongoing action that started in the past. 'seit drei Jahren' = for three years.",
    ),
    mcq(
      "Complete: 'Mein ___ ist Schmidt.'",
      ["Name", "Heiße", "Bin", "Komme"],
      0,
      "'Mein Name ist Schmidt.' — 'Name' is the noun. 'Mein' = my (possessive for masculine nouns).",
    ),
    mcq(
      "'Wohin' vs 'Wo' vs 'Woher' — which asks about destination?",
      ["Wo", "Woher", "Wohin", "Wann"],
      2,
      "'Wohin' = to where (destination). 'Wo' = where (location). 'Woher' = from where (origin).",
    ),
    mcq(
      "Which is correct: 'I speak a little German'?",
      ["Ich spreche ein bisschen Deutsch.", "Ich spreche wenig Deutsch gut.", "Ich spreche Deutsch ein bisschen kein.", "Ich spreche bisschen ein Deutsch."],
      0,
      "'ein bisschen' = a little/a bit. 'Ich spreche ein bisschen Deutsch.' — natural and correct.",
    ),
    mcq(
      "How do you say 'Where does she come from?'",
      ["Woher kommt sie?", "Woher komme sie?", "Wo kommt sie her?", "A and C are both correct"],
      3,
      "Both 'Woher kommt sie?' and 'Wo kommt sie her?' are correct and natural.",
    ),
    mcq(
      "'Die Schweiz', 'die Türkei', 'die USA' all need...?",
      ["'in der' not 'in' when saying you live there", "'aus' with no article", "'kein' before them", "no preposition"],
      0,
      "These countries have definite articles. So: 'Ich wohne in der Schweiz / Türkei / den USA.'",
    ),
    mcq(
      "Which verb means 'to live (reside)'?",
      ["heißen", "kommen", "wohnen", "sprechen"],
      2,
      "'wohnen' = to live/reside. 'kommen' = to come. 'heißen' = to be called. 'sprechen' = to speak.",
    ),
    mcq(
      "Full intro — which is correct?",
      ["Ich heiße Kim, komme aus Korea und wohne in Hamburg.", "Ich heiße Kim, wohne Korea und komme in Hamburg.", "Kim heiße ich, Ich aus Korea komme, Hamburg ich wohne.", "Ich bin heiße Kim aus Korea Hamburg."],
      0,
      "Perfect intro: 'Ich heiße Kim, komme aus Korea und wohne in Hamburg.' — all three verbs used correctly.",
    ),
    mcq(
      "What is 'Österreich' and which preposition do you use?",
      ["Germany — aus Deutschland", "Austria — aus Österreich", "Australia — aus Australien", "Switzerland — aus der Schweiz"],
      1,
      "'Österreich' = Austria. No article needed: 'Ich komme aus Österreich.' Standard country without article.",
    ),
  ],

  // Level 4 — Conversation
  // ─── Level 4 — Conversation ──────────────────────────────────────────────
  // Focus: full mini-dialogues, question-answer patterns, register, small talk

  // l1 — Intro: Key conversation phrases + dialogues (guided, hints on)
  "u02-lv4-l1": [
    fc(
      "Wie heißt du? — Ich heiße ...",
      "viː haɪst duː / ɪç ˈhaɪsə",
      "The classic first exchange. Q: 'What's your name?' A: 'My name is ...' Always the opener.",
      "Wie heißt du? — Ich heiße Max.",
      "What's your name? — My name is Max.",
      ["Und du? — And you?", "Wie heißen Sie? — What is your name? (formal)"],
    ),
    fc(
      "Woher kommst du? — Ich komme aus ...",
      "ˈvoːhɛr ˈkɔmst duː / ɪç ˈkɔmə aʊs",
      "Q: 'Where are you from?' A: 'I come from ...' Always follow up with 'Und du?' (And you?).",
      "Woher kommst du? — Ich komme aus Indien.",
      "Where are you from? — I come from India.",
      ["Und du? Woher kommst du? — And you? Where are you from?", "Ich auch! — Me too!"],
    ),
    fc(
      "Wie geht es dir? — Danke, gut!",
      "viː ɡeːt ɛs diːr / ˈdaŋkə ɡuːt",
      "Q: 'How are you?' A: 'Thanks, good!' Always return the question: 'Und dir?' (And you?).",
      "Wie geht es dir? — Danke, gut! Und dir?",
      "How are you? — Thanks, good! And you?",
      ["Nicht so gut, leider. — Not so good, unfortunately.", "Es geht, danke. — So-so, thanks."],
    ),
    fc(
      "Wie bitte? / Können Sie das wiederholen?",
      "viː ˈbɪtə / ˈkœnən ziː das viːdɐˈhoːlən",
      "'Pardon? / Could you repeat that?' Essential for beginners! 'Wie bitte?' is the quick version.",
      "Wie bitte? Ich verstehe nicht.",
      "Pardon? I don't understand.",
      ["Langsamer, bitte! — Slower, please!", "Ich verstehe. — I understand."],
    ),
    fc(
      "Was bedeutet ... auf Deutsch?",
      "vas bəˈdɔʏtət ... aʊf ˈdɔʏtʃ",
      "'What does ... mean in German?' — the learner's most useful question.",
      "Was bedeutet 'Bahnhof' auf Deutsch?",
      "What does 'Bahnhof' mean in German?",
      ["Wie sagt man '...' auf Deutsch? — How do you say '...' in German?", "Das weiß ich nicht. — I don't know that."],
    ),
    fc(
      "Können wir Deutsch sprechen?",
      "ˈkœnən viːr ˈdɔʏtʃ ˈʃprɛçən",
      "'Can we speak German?' — great phrase when meeting a German speaker. Show initiative!",
      "Können wir auf Deutsch sprechen?",
      "Can we speak in German?",
      ["Ja, gerne! — Yes, gladly!", "Natürlich! — Of course!", "Lieber auf Englisch, bitte. — Better in English, please."],
    ),
    fc(
      "Ich verstehe (nicht).",
      "ɪç fɛɐ̯ˈʃteːə (nɪçt)",
      "'I (don't) understand.' — vital for signalling comprehension. Pair with 'Können Sie langsamer sprechen?'",
      "Ich verstehe nicht. Können Sie langsamer sprechen?",
      "I don't understand. Can you speak slower?",
      ["Jetzt verstehe ich! — Now I understand!", "Ich verstehe ein bisschen. — I understand a little."],
    ),
    fc(
      "Das ist ... / Das sind ...",
      "das ɪst / das zɪnt",
      "'This is ... / These are ...' — how to introduce people or point things out.",
      "Das ist mein Freund Tom.",
      "This is my friend Tom.",
      ["Das sind meine Eltern. — These are my parents.", "Das ist Anna, meine Kollegin. — This is Anna, my colleague."],
    ),
    // ── MCQ ──
    mcq(
      "You meet someone. What's the first thing you ask?",
      ["Wie geht es dir?", "Wie heißt du?", "Woher kommst du?", "Was machst du?"],
      1,
      "The opener is always 'Wie heißt du?' (What's your name?) — before asking anything else.",
    ),
    mcq(
      "Someone says 'Wie geht es dir?' — what is a natural reply?",
      ["Ich heiße Max.", "Ich komme aus Berlin.", "Danke, gut! Und dir?", "Auf Wiedersehen!"],
      2,
      "'Danke, gut! Und dir?' = Thanks, good! And you? — always return the question in small talk.",
    ),
    mcq(
      "'Wie bitte?' is used when...?",
      ["You want to say hello", "You didn't hear or understand something", "You want to leave", "You're ordering food"],
      1,
      "'Wie bitte?' = Pardon? / Sorry? — used when you didn't catch what someone said.",
    ),
    mcq(
      "How do you say 'I don't understand' in German?",
      ["Ich weiß nicht.", "Ich spreche nicht.", "Ich verstehe nicht.", "Ich komme nicht."],
      2,
      "'Ich verstehe nicht.' = I don't understand. 'Ich weiß nicht' = I don't know.",
    ),
    mcq(
      "'Können Sie langsamer sprechen?' means...?",
      ["Can you speak louder?", "Can you speak slower?", "Can you repeat that?", "Can you write it down?"],
      1,
      "'langsamer' = slower. 'Können Sie langsamer sprechen?' = Can you speak more slowly?",
    ),
    mcq(
      "'Das ist meine Freundin Sara.' introduces...?",
      ["Sara as a male friend", "Sara as a female friend", "Sara as a colleague", "Sara as a teacher"],
      1,
      "'Freundin' = female friend. 'Freund' = male friend. 'Das ist meine Freundin Sara.' = This is my (female) friend Sara.",
    ),
    mcq(
      "How do you say 'Can we speak German?'",
      ["Sprechen wir Deutsch jetzt?", "Können wir Deutsch sprechen?", "Wir können Deutsch.", "Deutsch sprechen können wir?"],
      1,
      "'Können' (can) + infinitive at the end: 'Können wir Deutsch sprechen?' — modal verb structure.",
    ),
  ],

  // l2 — Practice: Question-answer exchanges, conversation flow
  "u02-lv4-l2": [
    mcq(
      "A: 'Wie heißt du?' B: '___'",
      ["Ich komme aus Berlin.", "Ich bin gut.", "Ich heiße Priya.", "Danke, gut!"],
      2,
      "Reply to 'What's your name?' with 'Ich heiße [name].' or 'Mein Name ist [name].'",
    ),
    mcq(
      "A: 'Woher kommst du?' B: 'Ich komme aus Indien. ___ du?'",
      ["Und", "Oder", "Aber", "Weil"],
      0,
      "'Und du?' = And you? — always use 'und' to return the question in conversation.",
    ),
    mcq(
      "A: 'Sprichst du Deutsch?' B: 'Ja, ___ ein bisschen.'",
      ["ich spreche", "ich sprichst", "ich sprechen", "du sprichst"],
      0,
      "'Ja, ich spreche ein bisschen.' = Yes, I speak a little. Ich-form of sprechen = spreche.",
    ),
    mcq(
      "You don't understand. You say: '___'",
      ["Ich verstehe. Sehr gut!", "Wie bitte? Ich verstehe nicht.", "Auf Wiedersehen!", "Ich komme nicht."],
      1,
      "'Wie bitte? Ich verstehe nicht.' = Pardon? I don't understand. — the right response when lost.",
    ),
    mcq(
      "How do you introduce your friend Leila to someone?",
      ["Das ist mein Freund Leila.", "Das ist meine Freundin Leila.", "Das sind Leila.", "Leila ist das meine Freundin."],
      1,
      "Leila is female → 'Freundin'. 'Das ist meine Freundin Leila.' = This is my friend Leila.",
    ),
    mcq(
      "A: 'Wie geht es Ihnen?' — What register is this?",
      ["Casual, with friends", "Formal, with strangers or older people", "Rude", "Children's speech"],
      1,
      "'Ihnen' is the formal dative of 'Sie'. 'Wie geht es Ihnen?' = How are you? (formal).",
    ),
    mcq(
      "Reply formally to 'Wie heißen Sie?'",
      ["Ich bin Max.", "Mein Name ist Max Müller.", "Ich heiße, Max.", "Du heißt Max."],
      1,
      "Formal reply: 'Mein Name ist Max Müller.' — full name, formal phrasing, no comma after 'heiße'.",
    ),
    mcq(
      "'Ich verstehe ein bisschen Deutsch.' means...?",
      ["I speak a little German.", "I understand a little German.", "I learn a little German.", "I know a little German."],
      1,
      "'verstehen' = to understand. 'ein bisschen' = a little. → 'I understand a little German.'",
    ),
    mcq(
      "How do you ask 'What does that mean?' in German?",
      ["Was ist das?", "Was bedeutet das?", "Was machst du?", "Was kostet das?"],
      1,
      "'bedeuten' = to mean. 'Was bedeutet das?' = What does that mean?",
    ),
    mcq(
      "To ask someone to repeat something, you say:",
      ["Bitte wiederholen Sie das.", "Bitte nochmal.", "Können Sie das wiederholen, bitte?", "All of the above are correct"],
      3,
      "All three work! 'Können Sie das wiederholen, bitte?' is most polite. 'Bitte nochmal' is casual.",
    ),
    mcq(
      "'Natürlich!' in a conversation means...?",
      ["Unfortunately!", "Of course!", "Never!", "Maybe!"],
      1,
      "'Natürlich' = of course / naturally — a very common positive response in German conversation.",
    ),
    mcq(
      "A: 'Wo wohnst du?' B: '___'",
      ["Ich heiße Berlin.", "Ich wohne in Berlin.", "Ich komme Berlin.", "Berlin bin ich."],
      1,
      "Reply to 'Where do you live?' with 'Ich wohne in [city/place].'",
    ),
    mcq(
      "'Und du?' after answering is used to...?",
      ["Change the subject", "Return the same question to the other person", "Say goodbye", "Show you're confused"],
      1,
      "'Und du?' = And you? — bounces the question back. Essential for natural two-way conversation.",
    ),
    mcq(
      "A: 'Können wir auf Deutsch sprechen?' B: 'Ja, ___!'",
      ["leider", "gerne", "nicht", "kein"],
      1,
      "'Ja, gerne!' = Yes, gladly / with pleasure! — the enthusiastic 'yes' in German.",
    ),
    mcq(
      "Which phrase is best for a learner who is struggling in a conversation?",
      ["Ich verstehe alles!", "Sprechen Sie bitte langsamer.", "Nein, danke.", "Auf Wiedersehen!"],
      1,
      "'Sprechen Sie bitte langsamer.' = Please speak more slowly. — a must-know survival phrase.",
    ),
  ],

  // l3 — Challenge: Full dialogues, harder question-answer, no hints
  "u02-lv4-l3": [
    mcq(
      "Complete the dialogue — A: 'Wie heißt du?' B: 'Ich heiße Mia. Und ___?'",
      ["du", "dir", "dich", "dein"],
      0,
      "'Und du?' = And you? — nominative pronoun used in this short question.",
    ),
    mcq(
      "A: 'Sprechen Sie Englisch?' B: 'Ja, aber ich spreche lieber Deutsch.' What does B prefer?",
      ["To speak English", "Not to speak at all", "To speak German", "To speak French"],
      2,
      "'lieber' = preferably/rather. 'Ich spreche lieber Deutsch' = I prefer to speak German.",
    ),
    mcq(
      "Dialogue: A introduces B to C. Which sentence is correct?",
      ["Das ist mein Kollege, er heißt Ben.", "Das ist mein Kollege, du heißt Ben.", "Das ist mein Kollege, ich heiße Ben.", "Das ist mein Kollege, sie heißt Ben."],
      0,
      "When introducing a third person: 'Das ist mein Kollege, er heißt Ben.' — 'er' (he) refers to Ben.",
    ),
    mcq(
      "A: 'Wie lange lernst du schon Deutsch?' B: 'Ich lerne seit ___ Deutschen.'",
      ["einem Jahr", "ein Jahr", "einen Jahre", "ein Jahre"],
      0,
      "'seit' takes the dative: 'einem Jahr' (neuter dative). 'Ich lerne seit einem Jahr Deutsch.' = one year.",
    ),
    mcq(
      "'Das macht nichts.' in conversation means...?",
      ["That makes nothing.", "That's fine / No worries.", "That is wrong.", "That is important."],
      1,
      "'Das macht nichts.' = That's fine / It doesn't matter / No worries — very common in German.",
    ),
    mcq(
      "A: 'Entschuldigung, sprechen Sie Deutsch?' What does A want?",
      ["To say sorry and leave", "To check if the person speaks German", "To buy something", "To ask for directions"],
      1,
      "'Entschuldigung' = Excuse me. 'Sprechen Sie Deutsch?' = Do you speak German? A is checking first.",
    ),
    mcq(
      "Which is the most natural way to end a short conversation?",
      ["Ich verstehe nicht.", "Es war nett, Sie kennenzulernen! Tschüss!", "Wie heißen Sie?", "Ich komme aus Berlin."],
      1,
      "'Es war nett, Sie kennenzulernen!' = It was nice to meet you! + 'Tschüss!' = natural conversation closer.",
    ),
    mcq(
      "'Kein Problem!' means...?",
      ["Big problem!", "No problem!", "One problem!", "Their problem!"],
      1,
      "'Kein Problem!' = No problem! — a very common, casual conversational phrase.",
    ),
    mcq(
      "A: 'Ich spreche nur ein bisschen Deutsch.' What is A saying?",
      ["I don't speak German at all.", "I speak only a little German.", "I speak German fluently.", "I am learning German now."],
      1,
      "'nur ein bisschen' = only a little. 'Ich spreche nur ein bisschen Deutsch.' = I speak only a little German.",
    ),
    mcq(
      "Formal small talk: 'Wie geht es Ihnen?' — correct formal reply?",
      ["Danke, gut. Und Ihnen?", "Gut, und du?", "Sehr gut, und dir?", "Ich bin gut, danke."],
      0,
      "Keep formal throughout: 'Danke, gut. Und Ihnen?' — 'Ihnen' = you (formal dative). Don't switch to 'du'.",
    ),
    mcq(
      "How do you say 'I'm sorry, I don't speak German well.'?",
      ["Es tut mir leid, ich spreche kein Deutsch.", "Es tut mir leid, ich spreche nicht gut Deutsch.", "Ich verstehe, ich spreche gut Deutsch.", "Tut mir leid, ich heiße kein Deutsch."],
      1,
      "'Es tut mir leid' = I'm sorry. 'nicht gut Deutsch sprechen' = don't speak German well. → correct B.",
    ),
    mcq(
      "A: 'Woher kommen Sie?' B should reply...",
      ["Ich heiße Schmidt.", "Ich komme aus der Schweiz.", "Ich wohne gut.", "Ja, natürlich."],
      1,
      "Reply to 'Where do you come from?' (formal) with 'Ich komme aus [country].'",
    ),
    mcq(
      "What does 'Wie bitte? Könnten Sie das wiederholen?' show?",
      ["Aggression", "Rudeness", "Polite confusion — asking for repetition", "Excitement"],
      2,
      "'Wie bitte?' + 'Könnten Sie das wiederholen?' = polite combo for when you didn't catch something.",
    ),
    mcq(
      "'Es war schön, dich kennenzulernen!' — what does this mean?",
      ["It was nice to know you (formal)", "It was nice to meet you (informal)", "It's nice to see you again", "Nice day, isn't it?"],
      1,
      "'dich kennenzulernen' = to meet you (informal acc.). → 'It was nice to meet you' — informal version.",
    ),
    mcq(
      "What's the formal equivalent of 'dich' in 'Es war schön, dich kennenzulernen'?",
      ["dir", "Sie", "Ihnen", "euch"],
      2,
      "Formal accusative of Sie = 'Sie' (same form but capitalised). → 'Es war schön, Sie kennenzulernen.'",
    ),
  ],

  // l4 — Tricky: Subtle register mistakes, common dialogue errors
  "u02-lv4-l4": [
    mcq(
      "A German speaker says 'Du' to you after just meeting. What does this signal?",
      ["They're being rude", "They're very young", "They're treating you as an equal / being friendly and casual", "They don't know German"],
      2,
      "In Germany, 'du' from a stranger is increasingly normal — it signals friendliness and informality, not rudeness.",
    ),
    mcq(
      "What's wrong with: 'Wie geht es du?'",
      ["'geht' is wrong", "'Wie' should be 'Was'", "Should be 'dir' not 'du' — dative required after 'es geht'", "Nothing is wrong"],
      2,
      "'Wie geht es dir?' — after 'es geht' you need dative: 'dir' (not 'du'). 'du' is nominative only.",
    ),
    mcq(
      "You mix formal and informal: 'Wie heißen Sie? Und du?' — what's the issue?",
      ["'heißen' is wrong", "Mixing 'Sie' (formal) and 'du' (informal) in one exchange — inconsistent register", "Nothing wrong", "'Und' is wrong here"],
      1,
      "You must stay consistent. Either formal throughout (Sie) or informal (du). Mixing signals confusion.",
    ),
    mcq(
      "'Ich weiß nicht' vs 'Ich verstehe nicht' — when do you use each?",
      ["They're identical", "'Ich weiß nicht' = I don't know (knowledge), 'Ich verstehe nicht' = I don't understand (comprehension)", "'Ich verstehe nicht' = I don't know, 'Ich weiß nicht' = I don't understand", "Both mean 'I don't like it'"],
      1,
      "Important distinction: 'wissen' = to know facts. 'verstehen' = to understand (spoken/written). Use correctly!",
    ),
    mcq(
      "'Wie sagt man auf Deutsch...' — what comes after?",
      ["...ein Wort auf Englisch?", "...das Wort auf Englisch in Deutsch?", "'coffee' auf Deutsch?", "All of the above work"],
      2,
      "'Wie sagt man [English word] auf Deutsch?' = How do you say [word] in German? Natural and common.",
    ),
    mcq(
      "After introducing yourself, your German is poor and the person offers to switch to English. You say?",
      ["Nein, danke. Ich möchte Deutsch üben!", "Ja, ich heißt Englisch.", "Nein, ich wohne Englisch.", "Bitte kommen Sie aus Englisch."],
      0,
      "'Ich möchte Deutsch üben!' = I'd like to practice German! — great response to keep practicing.",
    ),
    mcq(
      "What is the polite form of 'Kannst du das wiederholen?'",
      ["Könntest du das wiederholen?", "Können Sie das wiederholen?", "Könnten Sie das wiederholen?", "All three — in increasing formality"],
      3,
      "All three work: 'Kannst du' (casual) → 'Könntest du' (polite du) → 'Können/Könnten Sie' (formal).",
    ),
    mcq(
      "'Entschuldigung' vs 'Entschuldigen Sie' — what's the difference?",
      ["Same meaning, 'Entschuldigung' is shorter and works in all contexts", "Different meanings entirely", "'Entschuldigen Sie' is rude", "'Entschuldigung' is only for formal contexts"],
      0,
      "Both = 'excuse me'. 'Entschuldigung' is the noun (exclamation). 'Entschuldigen Sie' is the verb form (formal command).",
    ),
    mcq(
      "In a job interview, someone asks 'Wie heißen Sie?' — correct reply?",
      ["Ich heiße Max. Und du?", "Mein Name ist Max Brenner.", "Ich bin Max, hi!", "Max heiße ich ja."],
      1,
      "Job interview = formal. 'Mein Name ist Max Brenner.' — full name, formal phrasing, no 'und du?'.",
    ),
    mcq(
      "'Es tut mir leid' means...?",
      ["It pleases me.", "I'm sorry.", "That's fine.", "I don't understand."],
      1,
      "'Es tut mir leid' = I'm sorry (apology). 'Mir tut es leid' is also correct. Very common phrase.",
    ),
    mcq(
      "Which is the natural opener when approaching a stranger on the street?",
      ["Guten Tag! Wie heißen Sie?", "Entschuldigung, können Sie mir helfen?", "Hallo! Wo wohnst du?", "Tschüss! Sprechen Sie Deutsch?"],
      1,
      "'Entschuldigung, können Sie mir helfen?' = Excuse me, can you help me? — the natural street approach.",
    ),
    mcq(
      "Which phrase is a WRONG reaction to 'Danke!'?",
      ["Bitte!", "Bitte sehr!", "Gern geschehen!", "Wie bitte!"],
      3,
      "'Wie bitte!' means 'Pardon?' — not a response to 'thank you'. The others all mean 'you're welcome'.",
    ),
    mcq(
      "A: 'Ich spreche kein Deutsch.' B should say...?",
      ["Auf Wiedersehen!", "Kein Problem! Wir können Englisch sprechen.", "Ich verstehe nicht.", "Wie heißt du?"],
      1,
      "'Kein Problem! Wir können Englisch sprechen.' = No problem! We can speak English. — considerate and natural.",
    ),
    mcq(
      "'Gern geschehen!' is used after...?",
      ["A greeting", "A goodbye", "Someone says 'Danke'", "Someone asks your name"],
      2,
      "'Gern geschehen!' = You're welcome / My pleasure! — said in response to 'Danke/Danke schön'.",
    ),
    mcq(
      "You finish a call. Which goodbye phrase fits?",
      ["Auf Wiederhören!", "Auf Wiedersehen!", "Tschüss!", "A is correct — 'hören' because it's a call"],
      3,
      "'Auf Wiederhören' = until we hear each other again — specifically for phone calls. 'sehen' = to see (in person).",
    ),
  ],

  // l5 — Exam: Full conversation test — all Unit 2 content
  "u02-lv4-l5": [
    mcq(
      "Which greetings are time-based? (select most complete answer)",
      ["Hallo and Tschüss", "Guten Morgen, Guten Tag, Guten Abend", "Wie geht's and Danke", "Bitte and Auf Wiedersehen"],
      1,
      "Guten Morgen (morning) · Guten Tag (noon-evening) · Guten Abend (evening). All time-dependent.",
    ),
    mcq(
      "Which is the complete, correct self-introduction?",
      ["Ich heiße Ana, komme aus Brasilien und wohne in Frankfurt.", "Ich bin heiße Ana, wohne Brasilien und komme Frankfurt.", "Ana ich heiße, Brasilien aus komme.", "Ich bin Ana spreche Deutsch gut."],
      0,
      "'Ich heiße Ana, komme aus Brasilien und wohne in Frankfurt.' — perfect structure and prepositions.",
    ),
    mcq(
      "Formal: 'How are you?' + correct formal reply?",
      ["Wie geht's? — Gut, und du?", "Wie geht es Ihnen? — Danke, gut. Und Ihnen?", "Wie bist du? — Sehr gut!", "Wie geht es dir? — Danke, und Sie?"],
      1,
      "Full formal exchange: 'Wie geht es Ihnen?' → 'Danke, gut. Und Ihnen?' — Sie/Ihnen throughout.",
    ),
    mcq(
      "What does 'Ich spreche ein bisschen Deutsch, aber ich lerne noch.' mean?",
      ["I speak perfect German but still learning more.", "I don't speak German at all.", "I speak a little German but I'm still learning.", "I used to speak German."],
      2,
      "'ein bisschen' = a little, 'noch' = still. → 'I speak a little German but I'm still learning.'",
    ),
    mcq(
      "How do you say 'This is my colleague Thomas' in German?",
      ["Das ist mein Kollege Thomas.", "Das ist meine Kollege Thomas.", "Das sind mein Kollege Thomas.", "Das ist ein Kollege Thomas."],
      0,
      "'Kollege' is masculine (der Kollege) → 'mein' (not 'meine'). 'Das ist mein Kollege Thomas.'",
    ),
    mcq(
      "'Wie lange lernst du schon Deutsch?' means...?",
      ["Why are you learning German?", "How long have you been learning German (already)?", "When did you start learning German?", "How much German do you know?"],
      1,
      "'Wie lange' = how long. 'schon' adds 'already' / up to now. → How long have you been learning German?",
    ),
    mcq(
      "To apologise and ask someone to repeat: which is best?",
      ["Entschuldigung, können Sie das wiederholen?", "Wie bitte? Nochmal bitte.", "Es tut mir leid, ich habe das nicht verstanden.", "All are correct and natural"],
      3,
      "All three phrases work for 'I didn't catch that — please repeat'. Use based on formality level.",
    ),
    mcq(
      "Complete: 'Es war schön, ___ kennenzulernen!' (formal — meeting a professor)",
      ["dich", "dir", "Sie", "euch"],
      2,
      "Formal accusative = 'Sie'. 'Es war schön, Sie kennenzulernen!' = It was nice to meet you (formal).",
    ),
    mcq(
      "'Kein Problem!' and 'Das macht nichts.' both mean...?",
      ["I agree", "No problem / It's fine", "I don't understand", "Good luck"],
      1,
      "Both are reassuring phrases: 'Kein Problem!' = No problem! 'Das macht nichts.' = It doesn't matter.",
    ),
    mcq(
      "Which pronoun is WRONG in: 'Wie geht es ___ ?' (formal)?",
      ["Ihnen", "dir", "ihm", "ihr"],
      1,
      "'dir' is informal dative. Formal is 'Ihnen'. 'Wie geht es dir?' = informal; 'Wie geht es Ihnen?' = formal.",
    ),
    mcq(
      "What is 'auf Wiederhören' specifically used for?",
      ["Saying goodbye in person", "Saying goodbye on the phone", "Saying good morning", "Starting a conversation"],
      1,
      "'Auf Wiederhören' = until we hear each other again — only for phone/audio calls. 'Wiedersehen' = in person.",
    ),
    mcq(
      "'Ich möchte Deutsch üben.' means...?",
      ["I must speak German.", "I want to practice German.", "I can speak German.", "I should learn German."],
      1,
      "'möchten' = would like to. 'üben' = to practice. → 'I would like to practice German.'",
    ),
    mcq(
      "Which is a correct response to being thanked?",
      ["Gern geschehen!", "Bitte sehr!", "Bitte!", "All of the above"],
      3,
      "All mean 'you're welcome': 'Gern geschehen' = my pleasure, 'Bitte sehr' = you're very welcome, 'Bitte' = please/you're welcome.",
    ),
    mcq(
      "How do you say 'Excuse me' before asking a stranger a question?",
      ["Danke", "Entschuldigung", "Bitte", "Tschüss"],
      1,
      "'Entschuldigung' = Excuse me — used to get attention or apologise before a request.",
    ),
    mcq(
      "Which full dialogue is correct from start to finish?",
      ["A: Guten Tag! B: Ich heiße nicht. A: Wie geht? B: Auf Morgen!", "A: Hallo! B: Hi! A: Wie heißt du? B: Ich heiße Lena. A: Freut mich! B: Mich auch!", "A: Tschüss! B: Guten Tag! A: Wie bitte? B: Ja, ich.", "A: Ich bin Max. B: Du bist gut. A: Danke aus Berlin."],
      1,
      "Option B is a perfect mini-dialogue: greeting → name exchange → 'Freut mich!' → 'Mich auch!'",
    ),
  ],

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
