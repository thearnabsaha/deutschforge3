// Grammar Practice MCQ Data
// Format: { q, options: [A,B,C,D], answer: 0|1|2|3, explanation }
// 10 levels × 10 questions per chapter

export interface MCQQuestion {
  q: string;
  options: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface ChapterPractice {
  chapterId: string;
  levels: MCQQuestion[][];
}

export const PRACTICE_DATA: ChapterPractice[] = [
  {
    chapterId: "ch01",
    levels: [
      // Level 1 — Recognition: match pronoun to meaning
      [
        {
          q: "What does the German pronoun 'ich' mean?",
          options: ["you", "he", "I", "we"],
          answer: 2,
          explanation: "'ich' means 'I' — the speaker. Unlike English, 'ich' is NOT capitalized unless it starts a sentence.",
        },
        {
          q: "What does 'wir' mean in English?",
          options: ["you all", "they", "I", "we"],
          answer: 3,
          explanation: "'wir' means 'we' — the speaker plus others.",
        },
        {
          q: "Which pronoun means 'she' in German?",
          options: ["er", "es", "sie", "Sie"],
          answer: 2,
          explanation: "'sie' (lowercase) means 'she' or 'they' depending on context. Here, for a single female it means 'she'.",
        },
        {
          q: "What does 'ihr' mean when talking to a group of friends?",
          options: ["they", "you all (informal)", "her", "you (formal)"],
          answer: 1,
          explanation: "'ihr' is used to address a group informally — like 'you guys' or 'you all'.",
        },
        {
          q: "Which pronoun means 'it' in German?",
          options: ["er", "sie", "es", "wir"],
          answer: 2,
          explanation: "'es' means 'it' — used for neuter nouns like 'das Kind' (the child) or 'das Buch' (the book).",
        },
        {
          q: "What does 'Sie' (capital S) mean?",
          options: ["she", "they", "you (formal)", "it"],
          answer: 2,
          explanation: "'Sie' with a capital S is the formal 'you' — used with strangers, bosses, or anyone you'd address respectfully.",
        },
        {
          q: "What does 'er' mean in German?",
          options: ["she", "it", "they", "he"],
          answer: 3,
          explanation: "'er' means 'he' — used for masculine nouns and male people.",
        },
        {
          q: "Which pronoun would you use to talk about yourself?",
          options: ["du", "wir", "ich", "er"],
          answer: 2,
          explanation: "'ich' is always used for the speaker — 'I'.",
        },
        {
          q: "What does 'du' mean?",
          options: ["you (formal)", "you (informal, singular)", "you all", "he"],
          answer: 1,
          explanation: "'du' means 'you' informally to one person — a friend, family member, child.",
        },
        {
          q: "How many personal pronouns exist in German nominative?",
          options: ["6", "7", "8", "9"],
          answer: 3,
          explanation: "German has 9 nominative pronouns: ich, du, er, sie, es, wir, ihr, sie (they), Sie (formal you).",
        },
      ],

      // Level 2 — Recognition: choose the correct pronoun
      [
        {
          q: "You're talking about your female friend Maria. Which pronoun do you use?",
          options: ["er", "es", "sie", "Sie"],
          answer: 2,
          explanation: "For a female person in the third person, use 'sie' (lowercase) = she.",
        },
        {
          q: "You're addressing your boss formally. Which pronoun do you use?",
          options: ["du", "ihr", "Sie", "sie"],
          answer: 2,
          explanation: "'Sie' (capital) is the formal 'you' — always used in professional or formal settings.",
        },
        {
          q: "You're talking to your best friend directly. Which pronoun?",
          options: ["Sie", "ihr", "du", "wir"],
          answer: 2,
          explanation: "'du' is the informal singular 'you' for friends and family.",
        },
        {
          q: "You're referring to a table (der Tisch — masculine). Which pronoun replaces it?",
          options: ["sie", "es", "er", "wir"],
          answer: 2,
          explanation: "Masculine nouns are replaced by 'er' (he/it). 'Der Tisch ist groß → Er ist groß.'",
        },
        {
          q: "You're talking about a book (das Buch — neuter). Which pronoun replaces it?",
          options: ["er", "sie", "es", "wir"],
          answer: 2,
          explanation: "Neuter nouns are replaced by 'es'. 'Das Buch ist neu → Es ist neu.'",
        },
        {
          q: "You're talking about yourself and a friend together. Which pronoun?",
          options: ["ich", "du", "wir", "ihr"],
          answer: 2,
          explanation: "'wir' = we — used when the speaker and others are the subject together.",
        },
        {
          q: "You're addressing three friends in a group. Which pronoun?",
          options: ["du", "wir", "ihr", "sie"],
          answer: 2,
          explanation: "'ihr' is the informal plural 'you' — used to address two or more people you know well.",
        },
        {
          q: "You're talking about two strangers (mixed gender). Which pronoun?",
          options: ["er", "sie (plural/they)", "wir", "es"],
          answer: 1,
          explanation: "'sie' (lowercase, plural) = they — for any group regardless of gender.",
        },
        {
          q: "You're talking about a woman (die Frau — feminine). Which pronoun replaces it?",
          options: ["er", "es", "sie", "wir"],
          answer: 2,
          explanation: "Feminine nouns are replaced by 'sie' (she). 'Die Frau arbeitet → Sie arbeitet.'",
        },
        {
          q: "Which pronoun is ALWAYS capitalized regardless of position in a sentence?",
          options: ["ich", "sie", "er", "Sie"],
          answer: 3,
          explanation: "'Sie' (formal you) is always capitalized to distinguish it from 'sie' (she/they). 'ich' is only capitalized at the start of a sentence.",
        },
      ],

      // Level 3 — Recall: fill in the correct pronoun
      [
        {
          q: "Fill in: '___ komme aus Deutschland.' (I come from Germany.)",
          options: ["Du", "Er", "Ich", "Wir"],
          answer: 2,
          explanation: "'Ich komme aus Deutschland.' — 'ich' for the first person singular.",
        },
        {
          q: "Fill in: '___ bist mein Freund.' (You are my friend.) [informal]",
          options: ["Sie", "Ihr", "Du", "Er"],
          answer: 2,
          explanation: "'Du bist mein Freund.' — 'du' for informal singular you.",
        },
        {
          q: "Fill in: '___ ist mein Bruder.' (He is my brother.)",
          options: ["Sie", "Es", "Wir", "Er"],
          answer: 3,
          explanation: "'Er ist mein Bruder.' — 'er' = he.",
        },
        {
          q: "Fill in: '___ sind Studenten.' (They are students.)",
          options: ["Wir", "Ihr", "Sie", "Es"],
          answer: 2,
          explanation: "'Sie sind Studenten.' — 'sie' (lowercase, plural) = they.",
        },
        {
          q: "Fill in: '___ lernen Deutsch.' (We are learning German.)",
          options: ["Ihr", "Ich", "Wir", "Sie"],
          answer: 2,
          explanation: "'Wir lernen Deutsch.' — 'wir' = we.",
        },
        {
          q: "Fill in: '___ seid toll!' (You all are great!) [informal plural]",
          options: ["Du", "Sie", "Wir", "Ihr"],
          answer: 3,
          explanation: "'Ihr seid toll!' — 'ihr' for informal plural you.",
        },
        {
          q: "Fill in: '___ ist schön.' (It is beautiful.) [neuter noun]",
          options: ["Er", "Ich", "Sie", "Es"],
          answer: 3,
          explanation: "'Es ist schön.' — 'es' for neuter nouns and 'it'.",
        },
        {
          q: "Fill in: '___ sind Lehrer.' (You are teachers.) [formal, plural possible]",
          options: ["Ihr", "Du", "Sie", "Wir"],
          answer: 2,
          explanation: "'Sie sind Lehrer.' — could be formal 'you' (Sie) or 'they'. Both fit. Here it's the formal address.",
        },
        {
          q: "Fill in: '___ arbeitet hier.' (She works here.)",
          options: ["Er", "Sie", "Es", "Du"],
          answer: 1,
          explanation: "'Sie arbeitet hier.' — 'sie' (lowercase, singular) = she.",
        },
        {
          q: "Fill in: '___ bin müde.' (I am tired.)",
          options: ["Du", "Er", "Wir", "Ich"],
          answer: 3,
          explanation: "'Ich bin müde.' — 'ich' + 'bin' (am). The verb 'sein' (to be) is irregular.",
        },
      ],

      // Level 4 — Recall: choose the correct sentence
      [
        {
          q: "Which sentence means 'We are from Berlin'?",
          options: ["Ihr sind aus Berlin.", "Wir sind aus Berlin.", "Sie sind aus Berlin.", "Ich bin aus Berlin."],
          answer: 1,
          explanation: "'Wir sind aus Berlin.' — 'wir' = we, 'sind' is the 'wir' form of 'sein'.",
        },
        {
          q: "Which sentence means 'You (formal) are very kind'?",
          options: ["Du bist sehr nett.", "Ihr seid sehr nett.", "Er ist sehr nett.", "Sie sind sehr nett."],
          answer: 3,
          explanation: "'Sie sind sehr nett.' — 'Sie' (capital) is formal you, uses 'sind' verb form.",
        },
        {
          q: "Which sentence means 'He is a doctor'?",
          options: ["Sie ist Arzt.", "Er ist Arzt.", "Es ist Arzt.", "Du bist Arzt."],
          answer: 1,
          explanation: "'Er ist Arzt.' — 'er' = he. Note: no article needed before professions in German.",
        },
        {
          q: "Which sentence means 'It is cold today'?",
          options: ["Er ist kalt heute.", "Sie ist kalt heute.", "Es ist kalt heute.", "Ihr ist kalt heute."],
          answer: 2,
          explanation: "'Es ist kalt heute.' — 'es' is used for weather and impersonal expressions.",
        },
        {
          q: "Which sentence means 'They are coming tomorrow'?",
          options: ["Wir kommen morgen.", "Ihr kommt morgen.", "Sie kommen morgen.", "Er kommt morgen."],
          answer: 2,
          explanation: "'Sie kommen morgen.' — 'sie' (plural/they) + 'kommen' (plural verb).",
        },
        {
          q: "Which sentence means 'I love German'?",
          options: ["Du liebst Deutsch.", "Wir lieben Deutsch.", "Ich liebe Deutsch.", "Er liebt Deutsch."],
          answer: 2,
          explanation: "'Ich liebe Deutsch.' — 'ich' + '-e' ending = liebe.",
        },
        {
          q: "Which sentence means 'You all are learning German'? [informal group]",
          options: ["Wir lernen Deutsch.", "Sie lernen Deutsch.", "Du lernst Deutsch.", "Ihr lernt Deutsch."],
          answer: 3,
          explanation: "'Ihr lernt Deutsch.' — 'ihr' = informal plural you, 'lernt' = ihr verb form (-t ending).",
        },
        {
          q: "Which sentence means 'She is my sister'?",
          options: ["Er ist meine Schwester.", "Es ist meine Schwester.", "Sie ist meine Schwester.", "Ihr ist meine Schwester."],
          answer: 2,
          explanation: "'Sie ist meine Schwester.' — 'sie' (singular) = she.",
        },
        {
          q: "Identify the sentence using the correct formal pronoun:",
          options: ["du sind mein Chef.", "Sie sind mein Chef.", "Ihr sind mein Chef.", "Wir sind mein Chef."],
          answer: 1,
          explanation: "'Sie sind mein Chef.' — 'Sie' (capital) = formal you. Note the capital S.",
        },
        {
          q: "Which sentence correctly uses 'es'?",
          options: ["Es bin ich.", "Es regnet heute.", "Es seid ihr.", "Es lernen wir."],
          answer: 1,
          explanation: "'Es regnet heute.' = It is raining today. 'es' is used for weather expressions and impersonal statements.",
        },
      ],

      // Level 5 — Applied: sentence context
      [
        {
          q: "Thomas is your coworker. You're talking about him. Which sentence is correct?",
          options: ["Sie arbeitet bei uns.", "Er arbeitet bei uns.", "Es arbeitet bei uns.", "Wir arbeitet bei uns."],
          answer: 1,
          explanation: "'Er arbeitet bei uns.' — Thomas is male → 'er' (he).",
        },
        {
          q: "You see Anna and Lisa. You ask them if they want coffee. Which sentence?",
          options: ["Wollt ihr Kaffee?", "Wollen Sie Kaffee?", "Willst du Kaffee?", "Wollen wir Kaffee?"],
          answer: 0,
          explanation: "'Wollt ihr Kaffee?' — 'ihr' for an informal group (Anna and Lisa are presumably friends).",
        },
        {
          q: "You're at a job interview talking to the interviewer. Which pronoun do you use?",
          options: ["du", "ihr", "Sie", "wir"],
          answer: 2,
          explanation: "'Sie' (formal) — always use formal address in professional settings.",
        },
        {
          q: "The book is on the table. You replace 'the book' with a pronoun. Which one?",
          options: ["er", "sie", "es", "wir"],
          answer: 2,
          explanation: "'das Buch' (neuter) → 'es'. 'Es liegt auf dem Tisch.'",
        },
        {
          q: "You and your friends are going to a party. Which sentence is correct?",
          options: ["Ich gehen zur Party.", "Wir gehen zur Party.", "Ihr geht zur Party.", "Sie geht zur Party."],
          answer: 1,
          explanation: "'Wir gehen zur Party.' — 'wir' = we (speaker + friends), 'gehen' = wir form.",
        },
        {
          q: "Your teacher asks how you are — addressing you alone. What did they say?",
          options: ["Wie geht es euch?", "Wie geht es Ihnen?", "Wie geht es uns?", "Wie geht es dir?"],
          answer: 1,
          explanation: "'Wie geht es Ihnen?' — formal singular you. 'dir' would be informal.",
        },
        {
          q: "Your dog runs away. You say '___ läuft weg!' Which pronoun?",
          options: ["Sie", "Es", "Er", "Wir"],
          answer: 2,
          explanation: "'Er läuft weg!' — 'der Hund' is masculine, so the pronoun is 'er'.",
        },
        {
          q: "Your cat is sleeping. You say '___ schläft.' Which pronoun?",
          options: ["Er", "Sie", "Es", "Wir"],
          answer: 1,
          explanation: "'Sie schläft.' — 'die Katze' is feminine → 'sie' (she).",
        },
        {
          q: "You're writing to your professor via email. How do you start?",
          options: ["Hallo du,", "Hey ihr,", "Hallo Sie,", "Sehr geehrte Damen und Herren / Sehr geehrter Professor X,"],
          answer: 3,
          explanation: "Formal emails use 'Sehr geehrte/r...' — never 'du' or 'Sie' directly as a greeting.",
        },
        {
          q: "Two male friends are at the door. You say '___ sind da!' Which pronoun?",
          options: ["Er", "Es", "Sie", "Wir"],
          answer: 2,
          explanation: "'Sie sind da!' — 'sie' (plural/they) for a group, regardless of gender.",
        },
      ],

      // Level 6 — Applied: verb agreement
      [
        {
          q: "Which verb form is correct: 'ich ___ Deutsch.' (learn)?",
          options: ["lernst", "lernt", "lernen", "lerne"],
          answer: 3,
          explanation: "'ich lerne' — the 'ich' form takes the '-e' ending.",
        },
        {
          q: "Which verb form is correct: 'du ___ Deutsch.'",
          options: ["lerne", "lernt", "lernst", "lernen"],
          answer: 2,
          explanation: "'du lernst' — the 'du' form takes the '-st' ending.",
        },
        {
          q: "Which verb form is correct: 'er ___ Deutsch.'",
          options: ["lerne", "lernst", "lernen", "lernt"],
          answer: 3,
          explanation: "'er lernt' — er/sie/es takes the '-t' ending.",
        },
        {
          q: "Which verb form is correct: 'wir ___ Deutsch.'",
          options: ["lernst", "lernt", "lerne", "lernen"],
          answer: 3,
          explanation: "'wir lernen' — wir takes the '-en' ending (same as the infinitive).",
        },
        {
          q: "Which verb form is correct: 'ihr ___ Deutsch.'",
          options: ["lernen", "lerne", "lernst", "lernt"],
          answer: 3,
          explanation: "'ihr lernt' — ihr also takes the '-t' ending.",
        },
        {
          q: "Which verb form is correct: 'sie (they) ___ Deutsch.'",
          options: ["lernt", "lernst", "lernen", "lerne"],
          answer: 2,
          explanation: "'sie lernen' — sie (plural/they) takes '-en', same as wir.",
        },
        {
          q: "Which sentence is correct? (I am from Spain.)",
          options: ["Ich bist aus Spanien.", "Ich bin aus Spanien.", "Ich sind aus Spanien.", "Ich seid aus Spanien."],
          answer: 1,
          explanation: "'Ich bin aus Spanien.' — 'ich' uses 'bin' (irregular form of sein).",
        },
        {
          q: "Which sentence is correct? (You are from France.) [informal]",
          options: ["Du bin aus Frankreich.", "Du ist aus Frankreich.", "Du bist aus Frankreich.", "Du sind aus Frankreich."],
          answer: 2,
          explanation: "'Du bist aus Frankreich.' — 'du' uses 'bist'.",
        },
        {
          q: "Which sentence is correct? (We are students.)",
          options: ["Wir bist Studenten.", "Wir bin Studenten.", "Wir seid Studenten.", "Wir sind Studenten."],
          answer: 3,
          explanation: "'Wir sind Studenten.' — 'wir' uses 'sind'.",
        },
        {
          q: "Which sentence is correct? (They are here.)",
          options: ["Sie ist hier.", "Sie bist hier.", "Sie seid hier.", "Sie sind hier."],
          answer: 3,
          explanation: "'Sie sind hier.' — 'sie' (plural/they) uses 'sind'. Same form as 'wir sind'.",
        },
      ],

      // Level 7 — Translation choice: German → English
      [
        {
          q: "What does 'Ich bin müde' mean?",
          options: ["You are tired.", "He is tired.", "I am tired.", "We are tired."],
          answer: 2,
          explanation: "'Ich bin müde.' = 'I am tired.' — ich = I, bin = am, müde = tired.",
        },
        {
          q: "What does 'Du lernst sehr gut' mean?",
          options: ["He learns very well.", "I learn very well.", "We learn very well.", "You learn very well."],
          answer: 3,
          explanation: "'Du lernst sehr gut.' = 'You learn very well.' — du = you (informal).",
        },
        {
          q: "What does 'Er kommt aus Japan' mean?",
          options: ["She comes from Japan.", "He comes from Japan.", "They come from Japan.", "I come from Japan."],
          answer: 1,
          explanation: "'Er kommt aus Japan.' = 'He comes from Japan.' — er = he.",
        },
        {
          q: "What does 'Wir spielen Fußball' mean?",
          options: ["They play football.", "You play football.", "I play football.", "We play football."],
          answer: 3,
          explanation: "'Wir spielen Fußball.' = 'We play football.' — wir = we.",
        },
        {
          q: "What does 'Ihr seid toll!' mean?",
          options: ["You (formal) are great!", "He is great!", "You all are great!", "We are great!"],
          answer: 2,
          explanation: "'Ihr seid toll!' = 'You all are great!' — ihr = informal plural you.",
        },
        {
          q: "What does 'Sie arbeitet bei uns' mean?",
          options: ["He works with us.", "They work with us.", "She works with us.", "You work with us."],
          answer: 2,
          explanation: "'Sie arbeitet bei uns.' — 'sie' singular + 3rd person verb '-t' ending = she. 'She works with us.'",
        },
        {
          q: "What does 'Es regnet heute' mean?",
          options: ["He is raining today.", "She is raining today.", "They are raining today.", "It is raining today."],
          answer: 3,
          explanation: "'Es regnet heute.' = 'It is raining today.' — 'es' is used for weather.",
        },
        {
          q: "What does 'Sie sind meine Freunde' mean? (lowercase sie)",
          options: ["She is my friend.", "You are my friends.", "He is my friend.", "They are my friends."],
          answer: 3,
          explanation: "'Sie sind meine Freunde.' — 'sie' + plural verb 'sind' = they. 'They are my friends.'",
        },
        {
          q: "What does 'Ich heiße Max' mean?",
          options: ["He is called Max.", "I am called Max. / My name is Max.", "You are called Max.", "We are called Max."],
          answer: 1,
          explanation: "'Ich heiße Max.' = 'My name is Max.' — ich = I, heiße = am called (from heißen).",
        },
        {
          q: "What does 'Wir kommen um 8 Uhr' mean?",
          options: ["She comes at 8", "You (formal) come at 8", "They come at 8", "We come at 8"],
          answer: 3,
          explanation: "'Wir kommen um 8 Uhr.' = 'We come at 8 o'clock.' — wir = we.",
        },
      ],

      // Level 8 — Translation: English → German
      [
        {
          q: "Translate: 'I am from Germany.'",
          options: ["Du bist aus Deutschland.", "Ich bin aus Deutschland.", "Er ist aus Deutschland.", "Wir sind aus Deutschland."],
          answer: 1,
          explanation: "'Ich bin aus Deutschland.' — ich = I, bin = am.",
        },
        {
          q: "Translate: 'She is my teacher.'",
          options: ["Er ist meine Lehrerin.", "Es ist meine Lehrerin.", "Sie ist meine Lehrerin.", "Du bist meine Lehrerin."],
          answer: 2,
          explanation: "'Sie ist meine Lehrerin.' — sie = she, ist = is.",
        },
        {
          q: "Translate: 'We are learning German.'",
          options: ["Ihr lernt Deutsch.", "Ich lerne Deutsch.", "Sie lernen Deutsch.", "Wir lernen Deutsch."],
          answer: 3,
          explanation: "'Wir lernen Deutsch.' — wir = we, lernen = learn (-en ending).",
        },
        {
          q: "Translate: 'You are great!' (to one friend)",
          options: ["Ihr seid toll!", "Sie sind toll!", "Du bist toll!", "Er ist toll!"],
          answer: 2,
          explanation: "'Du bist toll!' — du = you (one friend, informal), bist = are.",
        },
        {
          q: "Translate: 'They come from Spain.'",
          options: ["Wir kommen aus Spanien.", "Er kommt aus Spanien.", "Ihr kommt aus Spanien.", "Sie kommen aus Spanien."],
          answer: 3,
          explanation: "'Sie kommen aus Spanien.' — sie (plural/they) = they, kommen = come.",
        },
        {
          q: "Translate: 'He plays football.'",
          options: ["Ich spiele Fußball.", "Er spielt Fußball.", "Sie spielt Fußball.", "Wir spielen Fußball."],
          answer: 1,
          explanation: "'Er spielt Fußball.' — er = he, spielt = plays (-t ending).",
        },
        {
          q: "Translate: 'You all are from Austria.' [informal group]",
          options: ["Du bist aus Österreich.", "Sie sind aus Österreich.", "Wir sind aus Österreich.", "Ihr seid aus Österreich."],
          answer: 3,
          explanation: "'Ihr seid aus Österreich.' — ihr = you all (informal), seid = are (ihr form of sein).",
        },
        {
          q: "Translate: 'Are you tired?' (formal)",
          options: ["Bist du müde?", "Seid ihr müde?", "Sind Sie müde?", "Ist er müde?"],
          answer: 2,
          explanation: "'Sind Sie müde?' — Sie (formal you) + sind. Verb goes first in yes/no questions.",
        },
        {
          q: "Translate: 'It is beautiful here.'",
          options: ["Er ist schön hier.", "Sie ist schön hier.", "Es ist schön hier.", "Ihr seid schön hier."],
          answer: 2,
          explanation: "'Es ist schön hier.' — es = it (for impersonal/environmental statements).",
        },
        {
          q: "Translate: 'I love you.' (to a friend)",
          options: ["Ich liebe Sie.", "Ich liebe euch.", "Ich liebe dich.", "Ich liebe wir."],
          answer: 2,
          explanation: "'Ich liebe dich.' — 'dich' is the accusative of 'du' (you, informal). This is a preview of the accusative case!",
        },
      ],

      // Level 9 — Error spotting
      [
        {
          q: "Spot the mistake: 'Ich bist müde.'",
          options: ["'müde' is wrong", "'Ich' should be 'Er'", "'bist' should be 'bin' — ich uses 'bin'", "No mistake"],
          answer: 2,
          explanation: "'Ich bin müde.' — 'ich' pairs with 'bin', not 'bist'. 'Bist' is for 'du'.",
        },
        {
          q: "Spot the mistake: 'Du bin aus Italien.'",
          options: ["'aus' should be 'von'", "'bin' should be 'bist' — du uses 'bist'", "'Italien' should be lowercase", "No mistake"],
          answer: 1,
          explanation: "'Du bist aus Italien.' — 'du' pairs with 'bist', not 'bin'.",
        },
        {
          q: "Spot the mistake: 'Er sind mein Freund.'",
          options: ["'mein' should be 'meine'", "'sind' should be 'ist' — er uses 'ist'", "'Freund' should be lowercase", "No mistake"],
          answer: 1,
          explanation: "'Er ist mein Freund.' — 'er' pairs with 'ist', not 'sind'.",
        },
        {
          q: "Spot the mistake: 'Wir ist Studenten.'",
          options: ["'Studenten' should be lowercase", "'ist' should be 'sind' — wir uses 'sind'", "'Wir' should be 'Ich'", "No mistake"],
          answer: 1,
          explanation: "'Wir sind Studenten.' — 'wir' pairs with 'sind'.",
        },
        {
          q: "Spot the mistake: 'Ihr seid aus Frankreich.' (You all are from France.)",
          options: ["'seid' should be 'sind'", "'aus' should be 'von'", "No mistake — this is correct", "'Ihr' should be 'Sie'"],
          answer: 2,
          explanation: "'Ihr seid aus Frankreich.' is correct! 'ihr' + 'seid' is the right pairing.",
        },
        {
          q: "Spot the mistake: 'sie (she) arbeiten hier.'",
          options: ["'hier' should be 'da'", "'arbeiten' should be 'arbeitet' — sie (she) uses '-t'", "'sie' should be capitalized", "No mistake"],
          answer: 1,
          explanation: "'Sie arbeitet hier.' — sie (singular she) uses '-t'. 'Arbeiten' is for wir/sie(plural)/Sie.",
        },
        {
          q: "Spot the mistake: 'Ich und du sind Freunde.' (I and you are friends.)",
          options: ["'Ich und du' should be 'Wir'", "'sind' should be 'seid'", "'Freunde' should be 'Freund'", "No mistake — both forms are acceptable"],
          answer: 3,
          explanation: "Both 'Ich und du sind Freunde' and 'Wir sind Freunde' are grammatically acceptable. No mistake here.",
        },
        {
          q: "Spot the mistake: 'Sie (formal) bist sehr nett.'",
          options: ["'sehr' is wrong", "'nett' should be 'nette'", "'bist' should be 'sind' — Sie (formal) uses 'sind'", "No mistake"],
          answer: 2,
          explanation: "'Sie sind sehr nett.' — formal 'Sie' uses 'sind', not 'bist' (which is for 'du').",
        },
        {
          q: "Which sentence has NO mistake?",
          options: ["Ich bist hier.", "Du bin müde.", "Er ist mein Freund.", "Wir ist Studenten."],
          answer: 2,
          explanation: "'Er ist mein Freund.' is correct. 'Ich bist' → 'bin', 'Du bin' → 'bist', 'Wir ist' → 'sind'.",
        },
        {
          q: "Spot the mistake: 'sie (they) kommt morgen.'",
          options: ["'morgen' should be 'Morgen'", "'kommt' should be 'kommen' — sie (plural) uses '-en'", "'sie' should be capitalized", "No mistake"],
          answer: 1,
          explanation: "'Sie kommen morgen.' — sie (plural/they) uses the '-en' ending, same as wir and infinitive.",
        },
      ],

      // Level 10 — Mixed hardest
      [
        {
          q: "Which sentence is completely correct?",
          options: ["Ich und er lerne Deutsch.", "Ich und er lernen Deutsch.", "Ich und er lernst Deutsch.", "Ich und er lernt Deutsch."],
          answer: 1,
          explanation: "'Ich und er lernen Deutsch.' — combined subject 'ich und er' = we (plural) → '-en' ending.",
        },
        {
          q: "Which pronoun correctly replaces 'die Katze' (the cat)?",
          options: ["er", "es", "wir", "sie"],
          answer: 3,
          explanation: "'die Katze' is feminine → replaced by 'sie' (she). Pronoun gender follows noun gender.",
        },
        {
          q: "'Sie sind sehr freundlich.' — Is 'Sie' formal you or they?",
          options: ["Always formal you", "Always they", "Can be either — context decides", "Always she"],
          answer: 2,
          explanation: "'Sie sind' can be 'they are' or formal 'you are'. Context and capitalization in writing (capital S) help distinguish.",
        },
        {
          q: "You address a group of professors formally. Which pronoun and verb?",
          options: ["Ihr seid sehr kompetent.", "Sie sind sehr kompetent.", "Du bist sehr kompetent.", "Wir sind sehr kompetent."],
          answer: 1,
          explanation: "'Sie sind sehr kompetent.' — formal address uses 'Sie' (capital) + 'sind' even for groups.",
        },
        {
          q: "Translate: 'He and she are coming tomorrow.'",
          options: ["Er und sie kommen morgen.", "Er und sie kommt morgen.", "Er und sie sind morgen.", "Wir kommen morgen."],
          answer: 0,
          explanation: "'Er und sie kommen morgen.' — combined 3rd person = plural → 'kommen'.",
        },
        {
          q: "Which is the correct formal question: 'Where are you from?' (to your boss)",
          options: ["Woher bist du?", "Woher seid ihr?", "Woher sind Sie?", "Woher ist er?"],
          answer: 2,
          explanation: "'Woher sind Sie?' — formal you = 'Sie' + 'sind'. Verb comes before the pronoun in questions.",
        },
        {
          q: "Which pronoun sequence is in the standard German grammar order?",
          options: ["ich, du, er, sie, es, wir, ihr, sie, Sie", "ich, du, Sie, er, sie, es, wir, ihr, sie", "ich, er, du, sie, es, wir, ihr, sie, Sie", "du, ich, er, sie, es, wir, ihr, sie, Sie"],
          answer: 0,
          explanation: "The standard sequence: ich · du · er · sie · es · wir · ihr · sie · Sie.",
        },
        {
          q: "Which sentence uses pronouns correctly throughout?",
          options: ["Ich bin hier und du bist auch hier.", "Ich bist hier und du bin auch hier.", "Ich bin hier und du bin auch hier.", "Ich bist hier und du bist auch hier."],
          answer: 0,
          explanation: "'Ich bin hier und du bist auch hier.' — ich→bin, du→bist. Both correct.",
        },
        {
          q: "When do you use 'Sie' vs 'sie' (both meaning 'you/she/they')?",
          options: ["Sie = formal you (always capitalized); sie = she or they", "They mean the same thing", "Sie = plural only; sie = singular only", "Capitalization doesn't matter in German"],
          answer: 0,
          explanation: "'Sie' (capital) = formal you. 'sie' (lowercase) = she (singular) or they (plural). Context + capitalization distinguish them.",
        },
        {
          q: "Final challenge: Identify the ONE correct sentence.",
          options: [
            "Ich bin müde und du bist auch müde.",
            "Ich bist müde und du bin auch müde.",
            "Wir ist müde und ihr sind auch müde.",
            "Er sind müde und sie ist auch müde."
          ],
          answer: 0,
          explanation: "'Ich bin müde und du bist auch müde.' — ich→bin ✓, du→bist ✓. All other options have verb-pronoun mismatches.",
        },
      ],
    ],
  },


  {
    chapterId: "ch02",
    levels: [
      // Level 1 — Recognition: articles and genders
      [
        {
          q: "Which article is used for masculine nouns in the nominative case?",
          options: ["die", "das", "der", "ein"],
          answer: 2,
          explanation: "'der' is the definite article for masculine nouns in the nominative: der Hund, der Mann.",
        },
        {
          q: "Which article is used for feminine nouns in the nominative case?",
          options: ["der", "das", "ein", "die"],
          answer: 3,
          explanation: "'die' is the definite article for feminine nouns: die Frau, die Katze.",
        },
        {
          q: "Which article is used for neuter nouns in the nominative case?",
          options: ["der", "das", "die", "eine"],
          answer: 1,
          explanation: "'das' is the definite article for neuter nouns: das Kind, das Buch.",
        },
        {
          q: "How many grammatical genders exist in German?",
          options: ["1", "2", "3", "4"],
          answer: 2,
          explanation: "German has 3 grammatical genders: masculine (der), feminine (die), and neuter (das).",
        },
        {
          q: "What is the definite article for plural nouns in German?",
          options: ["das", "der", "ein", "die"],
          answer: 3,
          explanation: "All plural nouns use 'die' regardless of the singular gender: die Kinder, die Hunde, die Frauen.",
        },
        {
          q: "What is the indefinite article for feminine nouns?",
          options: ["ein", "eine", "der", "kein"],
          answer: 1,
          explanation: "'eine' is the indefinite article for feminine nouns: eine Frau, eine Katze.",
        },
        {
          q: "What is the indefinite article for masculine nouns?",
          options: ["eine", "das", "ein", "die"],
          answer: 2,
          explanation: "'ein' is the indefinite article for masculine nouns: ein Hund, ein Mann.",
        },
        {
          q: "What is the indefinite article for neuter nouns?",
          options: ["eine", "der", "die", "ein"],
          answer: 3,
          explanation: "'ein' is also the indefinite article for neuter nouns: ein Kind, ein Buch.",
        },
        {
          q: "Which statement about German nouns is always true?",
          options: ["All nouns are lowercase", "All nouns are capitalized", "Only proper nouns are capitalized", "Nouns are only capitalized at the start of a sentence"],
          answer: 1,
          explanation: "All German nouns are capitalized: der Hund, die Frau, das Kind — always, not just at the start of a sentence.",
        },
        {
          q: "Does the indefinite article have a plural form in German?",
          options: ["Yes: eine", "Yes: ein", "No, there is no indefinite plural article", "Yes: die"],
          answer: 2,
          explanation: "There is no indefinite article for plurals. You say 'Kinder spielen' or 'keine Kinder', never 'eine Kinder'.",
        },
      ],

      // Level 2 — Recognition: noun genders
      [
        {
          q: "What is the correct article for 'Hund' (dog)?",
          options: ["die", "das", "der", "ein"],
          answer: 2,
          explanation: "'der Hund' — Hund is masculine. You must memorize gender with each noun.",
        },
        {
          q: "What is the correct article for 'Frau' (woman)?",
          options: ["der", "die", "das", "eine"],
          answer: 1,
          explanation: "'die Frau' — Frau is feminine.",
        },
        {
          q: "What is the correct article for 'Kind' (child)?",
          options: ["das", "die", "der", "ein"],
          answer: 0,
          explanation: "'das Kind' — Kind is neuter.",
        },
        {
          q: "What is the correct article for 'Mann' (man)?",
          options: ["die", "das", "der", "ein"],
          answer: 2,
          explanation: "'der Mann' — Mann is masculine.",
        },
        {
          q: "What is the correct article for 'Buch' (book)?",
          options: ["der", "die", "ein", "das"],
          answer: 3,
          explanation: "'das Buch' — Buch is neuter.",
        },
        {
          q: "What is the correct article for 'Katze' (cat)?",
          options: ["das", "die", "der", "ein"],
          answer: 1,
          explanation: "'die Katze' — Katze is feminine.",
        },
        {
          q: "What is the correct article for 'Handy' (mobile phone)?",
          options: ["der", "die", "das", "eine"],
          answer: 2,
          explanation: "'das Handy' — Handy is neuter.",
        },
        {
          q: "What is the correct article for 'Auto' (car)?",
          options: ["das", "der", "die", "ein"],
          answer: 0,
          explanation: "'das Auto' — Auto is neuter.",
        },
        {
          q: "What is the correct article for 'Schule' (school)?",
          options: ["das", "der", "die", "ein"],
          answer: 2,
          explanation: "'die Schule' — Schule is feminine.",
        },
        {
          q: "What is the correct article for 'Tisch' (table)?",
          options: ["die", "das", "der", "ein"],
          answer: 2,
          explanation: "'der Tisch' — Tisch is masculine.",
        },
      ],

      // Level 3 — Recall: fill in the article
      [
        {
          q: "Fill in the blank: '___ Hund schläft.' (The dog is sleeping.)",
          options: ["Das", "Die", "Ein", "Der"],
          answer: 3,
          explanation: "'Der Hund schläft.' — Hund is masculine, so use 'der' in the nominative.",
        },
        {
          q: "Fill in the blank: '___ Frau ist hier.' (The woman is here.)",
          options: ["Der", "Das", "Die", "Eine"],
          answer: 2,
          explanation: "'Die Frau ist hier.' — Frau is feminine, so use 'die'.",
        },
        {
          q: "Fill in the blank: '___ Kind spielt.' (The child is playing.)",
          options: ["Die", "Der", "Das", "Ein"],
          answer: 2,
          explanation: "'Das Kind spielt.' — Kind is neuter, so use 'das'.",
        },
        {
          q: "Fill in the blank: '___ Mann ist hier.' (A man is here.)",
          options: ["Eine", "Der", "Das", "Ein"],
          answer: 3,
          explanation: "'Ein Mann ist hier.' — indefinite article for masculine = 'ein'.",
        },
        {
          q: "Fill in the blank: '___ Frau ist hier.' (A woman is here.)",
          options: ["Ein", "Eine", "Die", "Das"],
          answer: 1,
          explanation: "'Eine Frau ist hier.' — indefinite article for feminine = 'eine'.",
        },
        {
          q: "Fill in the blank: '___ Buch ist neu.' (The book is new.)",
          options: ["Der", "Die", "Das", "Ein"],
          answer: 2,
          explanation: "'Das Buch ist neu.' — Buch is neuter, definite article = 'das'.",
        },
        {
          q: "Fill in the blank: '___ Kinder spielen.' (The children are playing.)",
          options: ["Das", "Der", "Ein", "Die"],
          answer: 3,
          explanation: "'Die Kinder spielen.' — all plural nouns take 'die'.",
        },
        {
          q: "Fill in the blank: '___ Hund ist groß.' (A dog is big.)",
          options: ["Eine", "Die", "Ein", "Das"],
          answer: 2,
          explanation: "'Ein Hund ist groß.' — indefinite article for masculine = 'ein'.",
        },
        {
          q: "Fill in the blank: '___ Auto ist neu.' (A car is new.)",
          options: ["Eine", "Der", "Die", "Ein"],
          answer: 3,
          explanation: "'Ein Auto ist neu.' — Auto is neuter, indefinite article = 'ein'.",
        },
        {
          q: "Fill in the blank: '___ Tisch ist hier.' (The table is here.)",
          options: ["Die", "Ein", "Das", "Der"],
          answer: 3,
          explanation: "'Der Tisch ist hier.' — Tisch is masculine, definite article = 'der'.",
        },
      ],

      // Level 4 — Recall: correct article choice
      [
        {
          q: "Which is correct? (The cat sleeps.)",
          options: ["Der Katze schläft.", "Das Katze schläft.", "Die Katze schläft.", "Ein Katze schläft."],
          answer: 2,
          explanation: "'Die Katze schläft.' — Katze is feminine, nominative = 'die'.",
        },
        {
          q: "Which is correct? (A book is here.)",
          options: ["Eine Buch ist hier.", "Der Buch ist hier.", "Ein Buch ist hier.", "Die Buch ist hier."],
          answer: 2,
          explanation: "'Ein Buch ist hier.' — Buch is neuter, indefinite = 'ein'.",
        },
        {
          q: "Which is correct? (The children are here.)",
          options: ["Das Kinder sind hier.", "Die Kinder sind hier.", "Der Kinder sind hier.", "Ein Kinder sind hier."],
          answer: 1,
          explanation: "'Die Kinder sind hier.' — all plurals take 'die'.",
        },
        {
          q: "Which is correct? (A woman is working.)",
          options: ["Ein Frau arbeitet.", "Der Frau arbeitet.", "Das Frau arbeitet.", "Eine Frau arbeitet."],
          answer: 3,
          explanation: "'Eine Frau arbeitet.' — Frau is feminine, indefinite = 'eine'.",
        },
        {
          q: "Which is correct? (The phone is new.)",
          options: ["Der Handy ist neu.", "Die Handy ist neu.", "Das Handy ist neu.", "Ein Handy ist neu."],
          answer: 2,
          explanation: "'Das Handy ist neu.' — Handy is neuter, definite = 'das'.",
        },
        {
          q: "Choose the correct sentence. (The dog is big.)",
          options: ["Die Hund ist groß.", "Das Hund ist groß.", "Der Hund ist groß.", "Eine Hund ist groß."],
          answer: 2,
          explanation: "'Der Hund ist groß.' — Hund is masculine, nominative definite = 'der'.",
        },
        {
          q: "Choose the correct sentence. (A table is here.)",
          options: ["Eine Tisch ist hier.", "Ein Tisch ist hier.", "Das Tisch ist hier.", "Die Tisch ist hier."],
          answer: 1,
          explanation: "'Ein Tisch ist hier.' — Tisch is masculine, indefinite = 'ein'.",
        },
        {
          q: "Choose the correct sentence. (The school is big.)",
          options: ["Der Schule ist groß.", "Das Schule ist groß.", "Die Schule ist groß.", "Ein Schule ist groß."],
          answer: 2,
          explanation: "'Die Schule ist groß.' — Schule is feminine, definite = 'die'.",
        },
        {
          q: "Choose the correct sentence. (A child is here.)",
          options: ["Eine Kind ist hier.", "Die Kind ist hier.", "Ein Kind ist hier.", "Der Kind ist hier."],
          answer: 2,
          explanation: "'Ein Kind ist hier.' — Kind is neuter, indefinite = 'ein'.",
        },
        {
          q: "Which two sentences are both correct?",
          options: ["Der Mann ist hier. / Eine Frau ist hier.", "Das Mann ist hier. / Ein Frau ist hier.", "Die Mann ist hier. / Der Frau ist hier.", "Ein Mann ist hier. / Eine Kind ist hier."],
          answer: 0,
          explanation: "'Der Mann ist hier.' (masc.) and 'Eine Frau ist hier.' (fem. indef.) are both correct.",
        },
      ],

      // Level 5 — Applied: sentence construction
      [
        {
          q: "Translate: 'The dog is sleeping.'",
          options: ["Das Hund schläft.", "Die Hund schläft.", "Der Hund schläft.", "Ein Hund schläft."],
          answer: 2,
          explanation: "'Der Hund schläft.' — der (masc.) + Hund + schläft.",
        },
        {
          q: "Translate: 'A woman is working.'",
          options: ["Eine Frau arbeitet.", "Ein Frau arbeitet.", "Die Frau arbeitet.", "Der Frau arbeitet."],
          answer: 0,
          explanation: "'Eine Frau arbeitet.' — eine (fem. indef.) + Frau + arbeitet.",
        },
        {
          q: "Translate: 'The child is playing.'",
          options: ["Der Kind spielt.", "Die Kind spielt.", "Ein Kind spielt.", "Das Kind spielt."],
          answer: 3,
          explanation: "'Das Kind spielt.' — das (neuter) + Kind + spielt.",
        },
        {
          q: "Translate: 'A man is here.'",
          options: ["Eine Mann ist hier.", "Der Mann ist hier.", "Ein Mann ist hier.", "Das Mann ist hier."],
          answer: 2,
          explanation: "'Ein Mann ist hier.' — ein (masc. indef.) + Mann + ist hier.",
        },
        {
          q: "Translate: 'The book is new.'",
          options: ["Das Buch ist neu.", "Die Buch ist neu.", "Der Buch ist neu.", "Ein Buch ist neu."],
          answer: 0,
          explanation: "'Das Buch ist neu.' — das (neuter) + Buch + ist neu.",
        },
        {
          q: "Translate: 'The children are playing.'",
          options: ["Das Kinder spielen.", "Der Kinder spielen.", "Ein Kinder spielen.", "Die Kinder spielen."],
          answer: 3,
          explanation: "'Die Kinder spielen.' — die (plural) + Kinder + spielen.",
        },
        {
          q: "Translate: 'A cat is here.'",
          options: ["Ein Katze ist hier.", "Der Katze ist hier.", "Eine Katze ist hier.", "Das Katze ist hier."],
          answer: 2,
          explanation: "'Eine Katze ist hier.' — eine (fem. indef.) + Katze + ist hier.",
        },
        {
          q: "Translate: 'The car is new.'",
          options: ["Der Auto ist neu.", "Das Auto ist neu.", "Die Auto ist neu.", "Ein Auto ist neu."],
          answer: 1,
          explanation: "'Das Auto ist neu.' — das (neuter) + Auto + ist neu.",
        },
        {
          q: "Translate: 'The table is big.'",
          options: ["Die Tisch ist groß.", "Das Tisch ist groß.", "Der Tisch ist groß.", "Ein Tisch ist groß."],
          answer: 2,
          explanation: "'Der Tisch ist groß.' — der (masc.) + Tisch + ist groß.",
        },
        {
          q: "Translate: 'A school is here.'",
          options: ["Ein Schule ist hier.", "Der Schule ist hier.", "Eine Schule ist hier.", "Das Schule ist hier."],
          answer: 2,
          explanation: "'Eine Schule ist hier.' — eine (fem. indef.) + Schule + ist hier.",
        },
      ],

      // Level 6 — Applied: mixed article and gender in context
      [
        {
          q: "Which sentence uses the correct article for all nouns? (The man and a woman are here.)",
          options: ["Die Mann und eine Frau sind hier.", "Der Mann und eine Frau sind hier.", "Das Mann und ein Frau sind hier.", "Ein Mann und die Frau sind hier."],
          answer: 1,
          explanation: "'Der Mann' (masc. def.) and 'eine Frau' (fem. indef.) are both correct.",
        },
        {
          q: "Complete: 'Das ist ___ Hund.' (That is a dog.)",
          options: ["eine", "die", "ein", "der"],
          answer: 2,
          explanation: "'Das ist ein Hund.' — predicate use: indefinite article for masculine = 'ein'.",
        },
        {
          q: "Complete: 'Das ist ___ Frau.' (That is a woman.)",
          options: ["ein", "der", "das", "eine"],
          answer: 3,
          explanation: "'Das ist eine Frau.' — predicate use: indefinite article for feminine = 'eine'.",
        },
        {
          q: "Complete: 'Das ist ___ Kind.' (That is a child.)",
          options: ["eine", "das", "ein", "der"],
          answer: 2,
          explanation: "'Das ist ein Kind.' — neuter indefinite = 'ein'. Note: 'Das ist…' as a filler phrase stays 'das' regardless of the noun's gender.",
        },
        {
          q: "Which is the correct plural? (The dogs are big.)",
          options: ["Der Hunde sind groß.", "Das Hunde sind groß.", "Ein Hunde sind groß.", "Die Hunde sind groß."],
          answer: 3,
          explanation: "'Die Hunde sind groß.' — plural definite article = 'die' for all genders.",
        },
        {
          q: "Which sentence is WRONG?",
          options: ["Der Hund ist hier.", "Die Frau arbeitet.", "Das Kind schläft.", "Ein Frau ist hier."],
          answer: 3,
          explanation: "'Ein Frau ist hier.' is wrong. Frau is feminine so the indefinite article must be 'eine', not 'ein'.",
        },
        {
          q: "Which sentence is CORRECT?",
          options: ["Ein Buch ist da.", "Eine Buch ist da.", "Der Buch ist da.", "Die Buch ist da."],
          answer: 0,
          explanation: "'Ein Buch ist da.' — Buch is neuter, indefinite = 'ein'. Correct!",
        },
        {
          q: "How do you say 'no children' (as a subject) in German?",
          options: ["Ein Kinder", "Keine Kinder", "Nicht Kinder", "Die keine Kinder"],
          answer: 1,
          explanation: "'Keine Kinder' — 'kein/keine' is the negative counterpart of 'ein/eine'. For plurals it's always 'keine'.",
        },
        {
          q: "Which article system is correct for German?",
          options: ["Only 'the' like English", "der/die/das (def.) + ein/eine (indef.)", "der/die for all + ein for indef.", "le/la/les like French"],
          answer: 1,
          explanation: "German uses der/die/das as definite articles and ein/eine as indefinite articles, depending on gender.",
        },
        {
          q: "What happens to the article when a noun becomes plural?",
          options: ["It stays the same as the singular", "It changes to 'die' for all genders", "It changes to 'das'", "There is no article in the plural"],
          answer: 1,
          explanation: "All plural nouns use 'die' as the definite article, regardless of their singular gender.",
        },
      ],

      // Level 7 — Translation choice: German → English
      [
        {
          q: "What does 'Der Hund ist groß' mean?",
          options: ["A dog is big.", "The dogs are big.", "The dog is big.", "A big dog."],
          answer: 2,
          explanation: "'Der Hund ist groß.' = 'The dog is big.' — 'der' is definite, 'groß' means big.",
        },
        {
          q: "What does 'Eine Frau arbeitet hier' mean?",
          options: ["The woman works here.", "A woman is working here.", "Women work here.", "A man works here."],
          answer: 1,
          explanation: "'Eine Frau arbeitet hier.' = 'A woman is working here.' — 'eine' = a (indef. fem.).",
        },
        {
          q: "What does 'Das Kind schläft' mean?",
          options: ["A child is sleeping.", "The children are sleeping.", "The child sleeps.", "The child is awake."],
          answer: 2,
          explanation: "'Das Kind schläft.' = 'The child sleeps.' — 'das' = the (neuter).",
        },
        {
          q: "What does 'Die Kinder spielen' mean?",
          options: ["The child is playing.", "A child plays.", "Children play sometimes.", "The children are playing."],
          answer: 3,
          explanation: "'Die Kinder spielen.' = 'The children are playing.' — 'die' + plural noun + plural verb.",
        },
        {
          q: "What does 'Ein Buch ist neu' mean?",
          options: ["The book is new.", "The books are new.", "A book is new.", "Books are new."],
          answer: 2,
          explanation: "'Ein Buch ist neu.' = 'A book is new.' — 'ein' = a (indef. neuter).",
        },
        {
          q: "What does 'Das ist ein Mann' mean?",
          options: ["That is the man.", "That is a man.", "He is a man.", "That man is here."],
          answer: 1,
          explanation: "'Das ist ein Mann.' = 'That is a man.' — 'das ist' is a standard way to introduce/point at something.",
        },
        {
          q: "What does 'Das Auto ist neu' mean?",
          options: ["A car is new.", "The cars are new.", "The car is new.", "That new car."],
          answer: 2,
          explanation: "'Das Auto ist neu.' = 'The car is new.' — 'das' = the (neuter definite).",
        },
        {
          q: "What does 'Der Tisch ist groß' mean?",
          options: ["The table is big.", "A table is here.", "The tables are big.", "A big table."],
          answer: 0,
          explanation: "'Der Tisch ist groß.' = 'The table is big.' — 'der' = the (masculine).",
        },
        {
          q: "What does 'Eine Katze ist hier' mean?",
          options: ["The cat is here.", "Cats are here.", "A cat is here.", "A dog is here."],
          answer: 2,
          explanation: "'Eine Katze ist hier.' = 'A cat is here.' — 'eine' = a (feminine indef.).",
        },
        {
          q: "What does 'Die Schule ist groß' mean?",
          options: ["A school is big.", "The school is big.", "Schools are big.", "The big school."],
          answer: 1,
          explanation: "'Die Schule ist groß.' = 'The school is big.' — 'die' = the (feminine definite).",
        },
      ],

      // Level 8 — Translation: English → German
      [
        {
          q: "Translate: 'The man is here.'",
          options: ["Das Mann ist hier.", "Ein Mann ist hier.", "Die Mann ist hier.", "Der Mann ist hier."],
          answer: 3,
          explanation: "'Der Mann ist hier.' — Mann is masculine, definite = 'der'.",
        },
        {
          q: "Translate: 'A book is new.'",
          options: ["Das Buch ist neu.", "Ein Buch ist neu.", "Die Buch ist neu.", "Eine Buch ist neu."],
          answer: 1,
          explanation: "'Ein Buch ist neu.' — Buch is neuter, indefinite = 'ein'.",
        },
        {
          q: "Translate: 'The woman is working.'",
          options: ["Das Frau arbeitet.", "Die Frau arbeitet.", "Der Frau arbeitet.", "Eine Frau arbeitet."],
          answer: 1,
          explanation: "'Die Frau arbeitet.' — Frau is feminine, definite = 'die'.",
        },
        {
          q: "Translate: 'A dog is big.'",
          options: ["Das Hund ist groß.", "Eine Hund ist groß.", "Ein Hund ist groß.", "Der Hund ist groß."],
          answer: 2,
          explanation: "'Ein Hund ist groß.' — Hund is masculine, indefinite = 'ein'.",
        },
        {
          q: "Translate: 'The children are playing.'",
          options: ["Das Kinder spielen.", "Die Kinder spielen.", "Der Kinder spielen.", "Ein Kinder spielen."],
          answer: 1,
          explanation: "'Die Kinder spielen.' — plural always uses 'die'.",
        },
        {
          q: "Translate: 'A cat is sleeping.'",
          options: ["Ein Katze schläft.", "Das Katze schläft.", "Der Katze schläft.", "Eine Katze schläft."],
          answer: 3,
          explanation: "'Eine Katze schläft.' — Katze is feminine, indefinite = 'eine'.",
        },
        {
          q: "Translate: 'The car is new.'",
          options: ["Der Auto ist neu.", "Die Auto ist neu.", "Das Auto ist neu.", "Ein Auto ist neu."],
          answer: 2,
          explanation: "'Das Auto ist neu.' — Auto is neuter, definite = 'das'.",
        },
        {
          q: "Translate: 'A table is big.'",
          options: ["Ein Tisch ist groß.", "Eine Tisch ist groß.", "Die Tisch ist groß.", "Das Tisch ist groß."],
          answer: 0,
          explanation: "'Ein Tisch ist groß.' — Tisch is masculine, indefinite = 'ein'.",
        },
        {
          q: "Translate: 'The school is big.'",
          options: ["Der Schule ist groß.", "Das Schule ist groß.", "Die Schule ist groß.", "Ein Schule ist groß."],
          answer: 2,
          explanation: "'Die Schule ist groß.' — Schule is feminine, definite = 'die'.",
        },
        {
          q: "Translate: 'That is a child.'",
          options: ["Das ist ein Kind.", "Das ist eine Kind.", "Das ist das Kind.", "Das ist der Kind."],
          answer: 0,
          explanation: "'Das ist ein Kind.' — Kind is neuter, indefinite = 'ein'. 'Das ist' is a fixed expression.",
        },
      ],

      // Level 9 — Error spotting
      [
        {
          q: "Spot the mistake: 'Die Hund schläft.'",
          options: ["'schläft' should be 'schlafen'", "'Die' should be 'Der' — Hund is masculine", "'Hund' should be lowercase", "No mistake"],
          answer: 1,
          explanation: "Hund is masculine, so it needs 'der': 'Der Hund schläft.' Using 'die' is the error.",
        },
        {
          q: "Spot the mistake: 'Ein Frau arbeitet.'",
          options: ["'arbeitet' is wrong", "'Ein' should be 'Eine' — Frau is feminine", "'Frau' should be lowercase", "No mistake"],
          answer: 1,
          explanation: "Frau is feminine, so the indefinite article is 'eine', not 'ein': 'Eine Frau arbeitet.'",
        },
        {
          q: "Spot the mistake: 'Das kind spielt.'",
          options: ["'spielt' should be 'spielen'", "'Das' should be 'Der'", "'kind' should be capitalized: 'Kind'", "No mistake"],
          answer: 2,
          explanation: "All German nouns are capitalized. 'kind' is wrong — it should be 'Kind': 'Das Kind spielt.'",
        },
        {
          q: "Spot the mistake: 'Der Buch ist neu.'",
          options: ["'ist' should be 'sind'", "'Buch' should be lowercase", "'Der' should be 'Das' — Buch is neuter", "No mistake"],
          answer: 2,
          explanation: "Buch is neuter, so it needs 'das': 'Das Buch ist neu.' Using 'der' is the error.",
        },
        {
          q: "Spot the mistake: 'Die Auto ist neu.'",
          options: ["'neu' should be 'neue'", "'Die' should be 'Das' — Auto is neuter", "'Auto' should be lowercase", "No mistake"],
          answer: 1,
          explanation: "Auto is neuter — 'das Auto'. Using 'die' is the error.",
        },
        {
          q: "Spot the mistake: 'Ein Kinder spielen.'",
          options: ["'spielen' should be 'spielt'", "'Kinder' should be lowercase", "'Ein' should be 'Die' — Kinder is plural (definite context)", "No mistake"],
          answer: 2,
          explanation: "'Kinder' is plural. In a definite context (the children) use 'die', and there is no indefinite plural article. 'Ein' with a plural noun is always wrong.",
        },
        {
          q: "Spot the mistake: 'Das ist eine Hund.'",
          options: ["'ist' should be 'sind'", "'eine' should be 'ein' — Hund is masculine", "'Hund' should be lowercase", "No mistake"],
          answer: 1,
          explanation: "Hund is masculine — indefinite is 'ein': 'Das ist ein Hund.' Using 'eine' is the error.",
        },
        {
          q: "Spot the mistake: 'Die Tisch ist groß.'",
          options: ["'groß' is spelled wrong", "'Die' should be 'Der' — Tisch is masculine", "'Tisch' needs a lowercase 't'", "No mistake"],
          answer: 1,
          explanation: "Tisch is masculine — 'der Tisch'. Using 'die' is the error.",
        },
        {
          q: "Which sentence has NO mistake?",
          options: ["Die Hund schläft.", "Das Frau arbeitet.", "Der Tisch ist groß.", "Eine Kind ist hier."],
          answer: 2,
          explanation: "'Der Tisch ist groß.' is correct. 'Die Hund' → 'Der Hund', 'Das Frau' → 'Die Frau', 'Eine Kind' → 'Ein Kind'.",
        },
        {
          q: "Spot the mistake: 'Der schule ist groß.'",
          options: ["'groß' should be 'große'", "'Der' should be 'Die' AND 'schule' should be 'Schule'", "'ist' should be 'sind'", "No mistake"],
          answer: 1,
          explanation: "Two errors: 'schule' should be 'Schule' (capitalized), and Schule is feminine so the article should be 'die': 'Die Schule ist groß.'",
        },
      ],

      // Level 10 — Mixed hardest
      [
        {
          q: "Which sentence correctly uses BOTH definite and indefinite articles?",
          options: ["Der Mann und ein Frau sind hier.", "Der Mann und eine Frau sind hier.", "Die Mann und eine Frau sind hier.", "Ein Mann und ein Frau sind hier."],
          answer: 1,
          explanation: "'Der Mann' (masc. definite) + 'eine Frau' (fem. indefinite). Both correct.",
        },
        {
          q: "Choose the sentence where ALL articles are correct:",
          options: ["Das Kind spielt mit ein Hund.", "Das Kind spielt mit einem Hund.", "Das Kind spielt mit der Hund.", "Das Kind spielt mit die Hund."],
          answer: 1,
          explanation: "In the dative case (after 'mit') masculine becomes 'einem'. 'Das Kind spielt mit einem Hund.' This is a preview of the dative case.",
        },
        {
          q: "Which is true about German articles?",
          options: ["Gender can always be guessed from the word ending", "Gender must be memorized with each noun", "Masculine nouns always end in -er", "All nouns ending in -e are feminine"],
          answer: 1,
          explanation: "German noun gender must be memorized. There are some patterns but no reliable rule — always learn der/die/das with each new word.",
        },
        {
          q: "Translate: 'The man and the woman are working.'",
          options: ["Der Mann und die Frau arbeiten.", "Die Mann und der Frau arbeitet.", "Das Mann und das Frau arbeiten.", "Ein Mann und eine Frau arbeiten."],
          answer: 0,
          explanation: "'Der Mann und die Frau arbeiten.' — 'der' for masculine, 'die' for feminine, 'arbeiten' (plural conjugation).",
        },
        {
          q: "Which sentence correctly introduces an object? (That is a cat.)",
          options: ["Diese ist eine Katze.", "Das ist eine Katze.", "Die ist eine Katze.", "Das ist ein Katze."],
          answer: 1,
          explanation: "'Das ist eine Katze.' — 'Das ist' is the standard German way to introduce something. Katze is feminine → 'eine'.",
        },
        {
          q: "Spot ALL mistakes in: 'ein kind und ein frau spielen.'",
          options: ["'kind' needs capital, 'frau' needs capital", "'ein kind' → 'ein Kind', 'ein frau' → 'eine Frau', both nouns need capitals", "'spielen' should be 'spielt'", "No mistakes"],
          answer: 1,
          explanation: "Three errors: 'kind' → 'Kind', 'frau' → 'Frau' (capitalized), 'ein frau' → 'eine Frau' (feminine indef.).",
        },
        {
          q: "Which word is masculine (der)?",
          options: ["Katze", "Schule", "Mann", "Kind"],
          answer: 2,
          explanation: "'der Mann' is masculine. die Katze (f), die Schule (f), das Kind (n).",
        },
        {
          q: "Which word is neuter (das)?",
          options: ["Frau", "Tisch", "Mann", "Auto"],
          answer: 3,
          explanation: "'das Auto' is neuter. die Frau (f), der Tisch (m), der Mann (m).",
        },
        {
          q: "How do you say 'There are no dogs here.' in German?",
          options: ["Die Hunde sind nicht hier.", "Keine Hunde sind hier.", "Hunde sind nicht.", "Ein Hunde sind hier nicht."],
          answer: 1,
          explanation: "'Keine Hunde sind hier.' — 'keine' is the plural negative article (negates 'some/any'). Most natural way to say there are no dogs.",
        },
        {
          q: "Final challenge: Which paragraph is grammatically correct?",
          options: [
            "Das ist ein Hund. Der Hund ist groß. Das ist eine Frau. Die Frau arbeitet.",
            "Das ist ein Hund. Die Hund ist groß. Das ist eine Frau. Die Frau arbeitet.",
            "Das ist ein Hund. Der Hund ist groß. Das ist ein Frau. Die Frau arbeitet.",
            "Das ist eine Hund. Der Hund ist groß. Das ist eine Frau. Die Frau arbeitet.",
          ],
          answer: 0,
          explanation: "Option A is fully correct. B: 'Die Hund' → 'Der Hund'. C: 'ein Frau' → 'eine Frau'. D: 'eine Hund' → 'ein Hund'.",
        },
      ],
    ],
  },


  {
    chapterId: "ch03",
    levels: [
      // Level 1 — Recognition: verb endings
      [
        {
          q: "What ending does 'ich' take in the present tense for regular verbs?",
          options: ["-st", "-t", "-e", "-en"],
          answer: 2,
          explanation: "'ich' takes the ending '-e': ich lerne, ich wohne, ich spiele.",
        },
        {
          q: "What ending does 'du' take in the present tense?",
          options: ["-e", "-st", "-t", "-en"],
          answer: 1,
          explanation: "'du' takes '-st': du lernst, du wohnst, du spielst.",
        },
        {
          q: "What ending does 'er/sie/es' take in the present tense?",
          options: ["-e", "-st", "-en", "-t"],
          answer: 3,
          explanation: "'er/sie/es' takes '-t': er lernt, sie wohnt, es spielt.",
        },
        {
          q: "What ending does 'wir' take in the present tense?",
          options: ["-t", "-e", "-en", "-st"],
          answer: 2,
          explanation: "'wir' takes '-en': wir lernen, wir wohnen — same as the infinitive.",
        },
        {
          q: "What ending does 'ihr' take in the present tense?",
          options: ["-en", "-e", "-st", "-t"],
          answer: 3,
          explanation: "'ihr' takes '-t': ihr lernt, ihr wohnt. Same ending as er/sie/es.",
        },
        {
          q: "What ending does 'sie/Sie' take in the present tense?",
          options: ["-t", "-st", "-en", "-e"],
          answer: 2,
          explanation: "'sie/Sie' takes '-en': sie lernen, Sie wohnen — same as wir and the infinitive.",
        },
        {
          q: "What is the first step to conjugate a regular verb?",
          options: ["Add -en to the stem", "Remove -en from the infinitive to get the stem", "Change the vowel", "Add -t to the infinitive"],
          answer: 1,
          explanation: "Remove '-en' from the infinitive to get the stem: lernen → lern-, spielen → spiel-. Then add the correct ending.",
        },
        {
          q: "Which pronoun pair shares the same '-en' ending?",
          options: ["ich and du", "er and wir", "du and ihr", "wir and sie/Sie"],
          answer: 3,
          explanation: "'wir' and 'sie/Sie' both take '-en'. They also match the infinitive form.",
        },
        {
          q: "Which pronoun pair shares the same '-t' ending?",
          options: ["ich and du", "er/sie/es and ihr", "wir and sie", "du and er"],
          answer: 1,
          explanation: "'er/sie/es' and 'ihr' both take '-t'. Example: er lernt / ihr lernt.",
        },
        {
          q: "What special rule applies to verb stems ending in '-t' or '-d'?",
          options: ["Drop the final consonant", "Add an extra '-e' before the ending for pronunciation", "Change to '-en' for all forms", "No change needed"],
          answer: 1,
          explanation: "Stems ending in -t or -d (arbeit-, red-) insert an extra '-e': du arbeitest, er arbeitet, ihr arbeitet.",
        },
      ],

      // Level 2 — Recognition: identify correct conjugation
      [
        {
          q: "Which is the correct 'ich' form of 'lernen'?",
          options: ["lernst", "lernt", "lernen", "lerne"],
          answer: 3,
          explanation: "'ich lerne' — stem 'lern-' + '-e'.",
        },
        {
          q: "Which is the correct 'du' form of 'spielen'?",
          options: ["spiele", "spielst", "spielt", "spielen"],
          answer: 1,
          explanation: "'du spielst' — stem 'spiel-' + '-st'.",
        },
        {
          q: "Which is the correct 'er' form of 'wohnen'?",
          options: ["wohne", "wohnst", "wohnt", "wohnen"],
          answer: 2,
          explanation: "'er wohnt' — stem 'wohn-' + '-t'.",
        },
        {
          q: "Which is the correct 'wir' form of 'kaufen'?",
          options: ["kaufe", "kaufst", "kauft", "kaufen"],
          answer: 3,
          explanation: "'wir kaufen' — stem 'kauf-' + '-en'. Same as the infinitive.",
        },
        {
          q: "Which is the correct 'ihr' form of 'machen'?",
          options: ["mache", "machst", "macht", "machen"],
          answer: 2,
          explanation: "'ihr macht' — stem 'mach-' + '-t'.",
        },
        {
          q: "Which is the correct 'sie (they)' form of 'hören'?",
          options: ["höre", "hörst", "hört", "hören"],
          answer: 3,
          explanation: "'sie hören' — '-en' ending, same as wir.",
        },
        {
          q: "Which is the correct 'du' form of 'arbeiten'?",
          options: ["arbeitest", "arbeitest", "arbeitet", "arbeiten"],
          answer: 0,
          explanation: "'du arbeitest' — stem 'arbeit-' ends in -t, so insert extra '-e': arbeit + e + st = arbeitest.",
        },
        {
          q: "Which is the correct 'er' form of 'arbeiten'?",
          options: ["arbeitest", "arbeitet", "arbeiten", "arbeite"],
          answer: 1,
          explanation: "'er arbeitet' — stem 'arbeit-' + extra '-e' + '-t' = arbeitet.",
        },
        {
          q: "Which is the correct 'ich' form of 'kochen'?",
          options: ["kochst", "kocht", "kochen", "koche"],
          answer: 3,
          explanation: "'ich koche' — stem 'koch-' + '-e'.",
        },
        {
          q: "Which is the correct 'Sie (formal)' form of 'lernen'?",
          options: ["lerne", "lernst", "lernt", "lernen"],
          answer: 3,
          explanation: "'Sie lernen' — formal Sie takes '-en', same as wir and sie (plural).",
        },
      ],

      // Level 3 — Recall: fill in the conjugation
      [
        {
          q: "Fill in: 'Ich ___ Deutsch.' (learn)",
          options: ["lernst", "lernt", "lernen", "lerne"],
          answer: 3,
          explanation: "'Ich lerne Deutsch.' — ich + stem lern- + -e.",
        },
        {
          q: "Fill in: 'Du ___ schnell.' (learn)",
          options: ["lerne", "lernt", "lernst", "lernen"],
          answer: 2,
          explanation: "'Du lernst schnell.' — du + lern- + -st.",
        },
        {
          q: "Fill in: 'Er ___ jeden Tag.' (learn)",
          options: ["lerne", "lernst", "lernen", "lernt"],
          answer: 3,
          explanation: "'Er lernt jeden Tag.' — er + lern- + -t.",
        },
        {
          q: "Fill in: 'Wir ___ zusammen.' (learn)",
          options: ["lerne", "lernst", "lernt", "lernen"],
          answer: 3,
          explanation: "'Wir lernen zusammen.' — wir + lern- + -en.",
        },
        {
          q: "Fill in: 'Ihr ___ gut.' (learn)",
          options: ["lerne", "lernst", "lernen", "lernt"],
          answer: 3,
          explanation: "'Ihr lernt gut.' — ihr + lern- + -t.",
        },
        {
          q: "Fill in: 'Sie ___ Englisch.' (learn — they)",
          options: ["lerne", "lernst", "lernt", "lernen"],
          answer: 3,
          explanation: "'Sie lernen Englisch.' — sie (plural) + lern- + -en.",
        },
        {
          q: "Fill in: 'Du ___ viel.' (work — arbeiten)",
          options: ["arbeite", "arbeitest", "arbeitet", "arbeiten"],
          answer: 1,
          explanation: "'Du arbeitest viel.' — arbeit- (ends in -t) + e + st = arbeitest.",
        },
        {
          q: "Fill in: 'Ich ___ Fußball.' (play — spielen)",
          options: ["spielst", "spielt", "spielen", "spiele"],
          answer: 3,
          explanation: "'Ich spiele Fußball.' — ich + spiel- + -e.",
        },
        {
          q: "Fill in: 'Sie ___ hier.' (work — sie = she)",
          options: ["arbeite", "arbeitest", "arbeitet", "arbeiten"],
          answer: 2,
          explanation: "'Sie arbeitet hier.' — sie (she) + arbeit- + extra-e + -t = arbeitet.",
        },
        {
          q: "Fill in: 'Wir ___ Pizza.' (make — machen)",
          options: ["mache", "machst", "macht", "machen"],
          answer: 3,
          explanation: "'Wir machen Pizza.' — wir + mach- + -en.",
        },
      ],

      // Level 4 — Recall: full conjugation tables
      [
        {
          q: "What is the full 'spielen' conjugation for 'du'?",
          options: ["du spiele", "du spielen", "du spielst", "du spielt"],
          answer: 2,
          explanation: "'du spielst' — spiel- + -st.",
        },
        {
          q: "What is the full conjugation for 'kochen' with 'sie (they)'?",
          options: ["sie koche", "sie kochst", "sie kocht", "sie kochen"],
          answer: 3,
          explanation: "'sie kochen' — sie (plural) + koch- + -en.",
        },
        {
          q: "What is 'reden' (to talk) conjugated for 'du'? (stem: red-)",
          options: ["du redst", "du redet", "du redest", "du reden"],
          answer: 2,
          explanation: "'du redest' — 'red-' ends in -d, so insert extra -e: red + e + st = redest.",
        },
        {
          q: "What is 'reden' conjugated for 'er'?",
          options: ["er redet", "er redest", "er reden", "er rede"],
          answer: 0,
          explanation: "'er redet' — red- + extra-e + -t = redet.",
        },
        {
          q: "Which is correct for 'ihr' + 'wohnen'?",
          options: ["ihr wohne", "ihr wohnst", "ihr wohnt", "ihr wohnen"],
          answer: 2,
          explanation: "'ihr wohnt' — ihr takes '-t' ending.",
        },
        {
          q: "Which is correct for 'ich' + 'hören'?",
          options: ["ich hörst", "ich höre", "ich hört", "ich hören"],
          answer: 1,
          explanation: "'ich höre' — ich takes '-e' ending.",
        },
        {
          q: "Which is correct for 'sie (she)' + 'spielen'?",
          options: ["sie spiele", "sie spielst", "sie spielt", "sie spielen"],
          answer: 2,
          explanation: "'sie spielt' — she uses er/sie/es form: '-t' ending.",
        },
        {
          q: "Which is correct for 'wir' + 'kaufen'?",
          options: ["wir kaufe", "wir kauft", "wir kaufst", "wir kaufen"],
          answer: 3,
          explanation: "'wir kaufen' — wir takes '-en'.",
        },
        {
          q: "Which sentence is completely correct?",
          options: ["Ich kochst Suppe.", "Du kochst Suppe.", "Er kochen Suppe.", "Wir kocht Suppe."],
          answer: 1,
          explanation: "'Du kochst Suppe.' — du + koch- + -st. The others have wrong endings.",
        },
        {
          q: "Which sentence is completely correct?",
          options: ["Ihr spielen gut.", "Wir spielt gut.", "Sie (they) spielen gut.", "Du spielen gut."],
          answer: 2,
          explanation: "'Sie spielen gut.' — sie (plural) + spiel- + -en. Correct!",
        },
      ],

      // Level 5 — Applied: conjugate in context
      [
        {
          q: "Complete: 'Max ___ in Berlin.' (live — wohnen)",
          options: ["wohne", "wohnst", "wohnt", "wohnen"],
          answer: 2,
          explanation: "'Max wohnt in Berlin.' — Max = er/sie/es → '-t'.",
        },
        {
          q: "Complete: 'Anna und ich ___ Deutsch.' (learn — lernen)",
          options: ["lerne", "lernst", "lernt", "lernen"],
          answer: 3,
          explanation: "'Anna und ich lernen Deutsch.' — combined subject = wir → '-en'.",
        },
        {
          q: "Complete: 'Was ___ du?' (do — machen)",
          options: ["mache", "machst", "macht", "machen"],
          answer: 1,
          explanation: "'Was machst du?' — du + mach- + -st = machst.",
        },
        {
          q: "Complete: 'Die Kinder ___ im Park.' (play — spielen)",
          options: ["spiele", "spielst", "spielt", "spielen"],
          answer: 3,
          explanation: "'Die Kinder spielen im Park.' — die Kinder = they → '-en'.",
        },
        {
          q: "Complete: 'Ich ___ gern Musik.' (listen — hören)",
          options: ["hörst", "hört", "hören", "höre"],
          answer: 3,
          explanation: "'Ich höre gern Musik.' — ich + hör- + -e.",
        },
        {
          q: "Complete: 'Er ___ im Büro.' (work — arbeiten)",
          options: ["arbeite", "arbeitest", "arbeitet", "arbeiten"],
          answer: 2,
          explanation: "'Er arbeitet im Büro.' — er + arbeit- + extra-e + -t = arbeitet.",
        },
        {
          q: "Complete: 'Ihr ___ sehr gut!' (cook — kochen)",
          options: ["koche", "kochst", "kocht", "kochen"],
          answer: 2,
          explanation: "'Ihr kocht sehr gut!' — ihr + koch- + -t.",
        },
        {
          q: "Complete: 'Wir ___ heute Pizza.' (buy — kaufen)",
          options: ["kaufe", "kaufst", "kauft", "kaufen"],
          answer: 3,
          explanation: "'Wir kaufen heute Pizza.' — wir + kauf- + -en.",
        },
        {
          q: "Complete: 'Du ___ sehr gut Klavier.' (play — spielen)",
          options: ["spiele", "spielst", "spielt", "spielen"],
          answer: 1,
          explanation: "'Du spielst sehr gut Klavier.' — du + spiel- + -st.",
        },
        {
          q: "Complete: 'Sie (formal) ___ Deutsch.' (learn — lernen)",
          options: ["lerne", "lernst", "lernt", "lernen"],
          answer: 3,
          explanation: "'Sie lernen Deutsch.' — formal Sie + lern- + -en.",
        },
      ],

      // Level 6 — Applied: choose the correct sentence
      [
        {
          q: "Which sentence is correct? (He works here.)",
          options: ["Er arbeitest hier.", "Er arbeite hier.", "Er arbeitet hier.", "Er arbeiten hier."],
          answer: 2,
          explanation: "'Er arbeitet hier.' — er + arbeit- + extra-e + -t = arbeitet.",
        },
        {
          q: "Which sentence is correct? (We play football.)",
          options: ["Wir spielst Fußball.", "Wir spielt Fußball.", "Wir spielen Fußball.", "Wir spiele Fußball."],
          answer: 2,
          explanation: "'Wir spielen Fußball.' — wir + spiel- + -en.",
        },
        {
          q: "Which sentence is correct? (You all learn German.)",
          options: ["Ihr lernen Deutsch.", "Ihr lernst Deutsch.", "Ihr lerne Deutsch.", "Ihr lernt Deutsch."],
          answer: 3,
          explanation: "'Ihr lernt Deutsch.' — ihr + lern- + -t.",
        },
        {
          q: "Which sentence is correct? (She listens to music.)",
          options: ["Sie hören Musik.", "Sie höre Musik.", "Sie hörst Musik.", "Sie hört Musik."],
          answer: 3,
          explanation: "'Sie hört Musik.' — sie (she) + hör- + -t.",
        },
        {
          q: "Which sentence is correct? (They cook pasta.)",
          options: ["Sie kocht Pasta.", "Sie kochst Pasta.", "Sie kochen Pasta.", "Sie koche Pasta."],
          answer: 2,
          explanation: "'Sie kochen Pasta.' — sie (plural/they) + koch- + -en.",
        },
        {
          q: "Which sentence is correct? (I buy a book.)",
          options: ["Ich kaufst ein Buch.", "Ich kauft ein Buch.", "Ich kaufen ein Buch.", "Ich kaufe ein Buch."],
          answer: 3,
          explanation: "'Ich kaufe ein Buch.' — ich + kauf- + -e.",
        },
        {
          q: "Which sentence is correct? (You work a lot.) [informal]",
          options: ["Du arbeitest viel.", "Du arbeitet viel.", "Du arbeiten viel.", "Du arbeite viel."],
          answer: 0,
          explanation: "'Du arbeitest viel.' — du + arbeit- + extra-e + -st = arbeitest.",
        },
        {
          q: "Which sentence is correct? (The child plays.)",
          options: ["Das Kind spielen.", "Das Kind spielst.", "Das Kind spiele.", "Das Kind spielt."],
          answer: 3,
          explanation: "'Das Kind spielt.' — das Kind = es → '-t' ending.",
        },
        {
          q: "Which sentence is WRONG?",
          options: ["Ich lerne Deutsch.", "Du lernst Deutsch.", "Er lernt Deutsch.", "Wir lernt Deutsch."],
          answer: 3,
          explanation: "'Wir lernt' is wrong. Wir takes '-en': 'Wir lernen Deutsch.'",
        },
        {
          q: "Which sentence is WRONG?",
          options: ["Ich arbeite hier.", "Du arbeitest hier.", "Er arbeitest hier.", "Wir arbeiten hier."],
          answer: 2,
          explanation: "'Er arbeitest' is wrong. Er takes '-t' with extra-e: 'Er arbeitet hier.'",
        },
      ],

      // Level 7 — Translation: German → English
      [
        {
          q: "What does 'Ich lerne Deutsch.' mean?",
          options: ["You learn German.", "He learns German.", "We learn German.", "I learn German."],
          answer: 3,
          explanation: "'Ich lerne Deutsch.' = 'I learn German.' — ich = I, lerne = learn (ich form).",
        },
        {
          q: "What does 'Du lernst schnell.' mean?",
          options: ["He learns fast.", "I learn fast.", "You learn fast.", "They learn fast."],
          answer: 2,
          explanation: "'Du lernst schnell.' = 'You learn fast.' — du = you (informal), lernst = learn.",
        },
        {
          q: "What does 'Er lernt jeden Tag.' mean?",
          options: ["He learns every week.", "She learns every day.", "They learn every day.", "He learns every day."],
          answer: 3,
          explanation: "'Er lernt jeden Tag.' = 'He learns every day.' — jeden Tag = every day.",
        },
        {
          q: "What does 'Wir lernen zusammen.' mean?",
          options: ["They learn together.", "You learn together.", "We learn together.", "I learn together."],
          answer: 2,
          explanation: "'Wir lernen zusammen.' = 'We learn together.' — zusammen = together.",
        },
        {
          q: "What does 'Du arbeitest viel.' mean?",
          options: ["He works a lot.", "I work a lot.", "You work a lot.", "They work a lot."],
          answer: 2,
          explanation: "'Du arbeitest viel.' = 'You work a lot.' — viel = a lot.",
        },
        {
          q: "What does 'Er arbeitet hier.' mean?",
          options: ["I work here.", "You work here.", "They work here.", "He works here."],
          answer: 3,
          explanation: "'Er arbeitet hier.' = 'He works here.' — hier = here.",
        },
        {
          q: "What does 'Sie spielen Fußball.' mean? (lowercase sie)",
          options: ["She plays football.", "He plays football.", "They play football.", "You play football."],
          answer: 2,
          explanation: "'Sie spielen Fußball.' — sie + '-en' ending = they. 'They play football.'",
        },
        {
          q: "What does 'Ihr kocht gut.' mean?",
          options: ["She cooks well.", "We cook well.", "They cook well.", "You all cook well."],
          answer: 3,
          explanation: "'Ihr kocht gut.' = 'You all cook well.' — ihr = informal plural you.",
        },
        {
          q: "What does 'Ich höre Musik.' mean?",
          options: ["She listens to music.", "I listen to music.", "We listen to music.", "You listen to music."],
          answer: 1,
          explanation: "'Ich höre Musik.' = 'I listen to music.' — hören = to listen/hear.",
        },
        {
          q: "What does 'Das Kind spielt im Garten.' mean?",
          options: ["The children play in the garden.", "The child plays in the garden.", "The child works in the garden.", "A child plays in the park."],
          answer: 1,
          explanation: "'Das Kind spielt im Garten.' = 'The child plays in the garden.' — im Garten = in the garden.",
        },
      ],

      // Level 8 — Translation: English → German
      [
        {
          q: "Translate: 'I play football.'",
          options: ["Ich spielst Fußball.", "Ich spielt Fußball.", "Ich spielen Fußball.", "Ich spiele Fußball."],
          answer: 3,
          explanation: "'Ich spiele Fußball.' — ich + spiel- + -e.",
        },
        {
          q: "Translate: 'She learns German.'",
          options: ["Sie lerne Deutsch.", "Sie lernst Deutsch.", "Sie lernt Deutsch.", "Sie lernen Deutsch."],
          answer: 2,
          explanation: "'Sie lernt Deutsch.' — sie (she) + lern- + -t.",
        },
        {
          q: "Translate: 'We work here.'",
          options: ["Wir arbeitet hier.", "Wir arbeitest hier.", "Wir arbeiten hier.", "Wir arbeite hier."],
          answer: 2,
          explanation: "'Wir arbeiten hier.' — wir + arbeit- + extra-e + -en = arbeiten.",
        },
        {
          q: "Translate: 'You cook pasta.' (informal singular)",
          options: ["Du koche Pasta.", "Du kocht Pasta.", "Du kochen Pasta.", "Du kochst Pasta."],
          answer: 3,
          explanation: "'Du kochst Pasta.' — du + koch- + -st.",
        },
        {
          q: "Translate: 'They buy a car.'",
          options: ["Sie kauft ein Auto.", "Sie kaufst ein Auto.", "Sie kaufe ein Auto.", "Sie kaufen ein Auto."],
          answer: 3,
          explanation: "'Sie kaufen ein Auto.' — sie (plural) + kauf- + -en.",
        },
        {
          q: "Translate: 'He listens to music.'",
          options: ["Er höre Musik.", "Er hörst Musik.", "Er hört Musik.", "Er hören Musik."],
          answer: 2,
          explanation: "'Er hört Musik.' — er + hör- + -t.",
        },
        {
          q: "Translate: 'You all play well.' (informal group)",
          options: ["Ihr spielen gut.", "Ihr spiele gut.", "Ihr spielst gut.", "Ihr spielt gut."],
          answer: 3,
          explanation: "'Ihr spielt gut.' — ihr + spiel- + -t.",
        },
        {
          q: "Translate: 'I work a lot.'",
          options: ["Ich arbeitest viel.", "Ich arbeite viel.", "Ich arbeitet viel.", "Ich arbeiten viel."],
          answer: 1,
          explanation: "'Ich arbeite viel.' — ich + arbeit- + extra-e + -e = arbeite.",
        },
        {
          q: "Translate: 'The woman cooks dinner.'",
          options: ["Die Frau koche Abendessen.", "Die Frau kochst Abendessen.", "Die Frau kochen Abendessen.", "Die Frau kocht Abendessen."],
          answer: 3,
          explanation: "'Die Frau kocht Abendessen.' — die Frau = sie/er/es → '-t'.",
        },
        {
          q: "Translate: 'We learn together.'",
          options: ["Wir lernst zusammen.", "Wir lernt zusammen.", "Wir lerne zusammen.", "Wir lernen zusammen."],
          answer: 3,
          explanation: "'Wir lernen zusammen.' — wir + lern- + -en.",
        },
      ],

      // Level 9 — Error spotting
      [
        {
          q: "Spot the mistake: 'Ich lernst Deutsch.'",
          options: ["'Deutsch' should be lowercase", "'lernst' should be 'lerne' — ich takes -e", "'Ich' should be 'Du'", "No mistake"],
          answer: 1,
          explanation: "'Ich lerne Deutsch.' — 'ich' takes '-e', not '-st'. 'lernst' is the 'du' form.",
        },
        {
          q: "Spot the mistake: 'Du lernt Deutsch.'",
          options: ["'lernt' should be 'lernst' — du takes -st", "'Deutsch' should be lowercase", "'Du' should be 'Er'", "No mistake"],
          answer: 0,
          explanation: "'Du lernst Deutsch.' — 'du' takes '-st'. 'lernt' is the er/sie/es or ihr form.",
        },
        {
          q: "Spot the mistake: 'Er lerne hier.'",
          options: ["'lerne' should be 'lernt' — er takes -t", "'hier' should be 'da'", "'Er' should be 'Sie'", "No mistake"],
          answer: 0,
          explanation: "'Er lernt hier.' — 'er' takes '-t'. 'lerne' is the ich form.",
        },
        {
          q: "Spot the mistake: 'Wir lernt Deutsch.'",
          options: ["'lernt' should be 'lernen' — wir takes -en", "'Deutsch' should be lowercase", "'Wir' should be 'Ihr'", "No mistake"],
          answer: 0,
          explanation: "'Wir lernen Deutsch.' — wir takes '-en'. 'lernt' is the er/sie/es or ihr form.",
        },
        {
          q: "Spot the mistake: 'Du arbeitet viel.'",
          options: ["'viel' should be 'viele'", "'Du' should be 'Er'", "'arbeitet' should be 'arbeitest' — du takes -est for stems in -t", "No mistake"],
          answer: 2,
          explanation: "'Du arbeitest viel.' — du + arbeit- + extra-e + -st = arbeitest. 'arbeitet' is the er form.",
        },
        {
          q: "Spot the mistake: 'Sie (they) spielen Fußball.' — is this correct?",
          options: ["'spielen' should be 'spielt'", "'Fußball' should be lowercase", "No mistake — this is correct", "'Sie' should be 'Er'"],
          answer: 2,
          explanation: "'Sie spielen Fußball.' is correct! sie (plural) + spiel- + -en.",
        },
        {
          q: "Spot the mistake: 'Ihr lernen Deutsch.'",
          options: ["'lernen' should be 'lernt' — ihr takes -t", "'Deutsch' should be lowercase", "'Ihr' should be 'Wir'", "No mistake"],
          answer: 0,
          explanation: "'Ihr lernt Deutsch.' — ihr takes '-t'. 'lernen' is the wir/sie form.",
        },
        {
          q: "Spot the mistake: 'Ich arbeitest hier.'",
          options: ["'arbeitest' should be 'arbeite' — ich takes -e", "'hier' should be 'da'", "'Ich' should be 'Er'", "No mistake"],
          answer: 0,
          explanation: "'Ich arbeite hier.' — ich + arbeit- + extra-e + -e = arbeite. 'arbeitest' is the du form.",
        },
        {
          q: "Which sentence has NO mistake?",
          options: ["Ich lernst Deutsch.", "Du lernt Deutsch.", "Er lernt Deutsch.", "Wir lernt Deutsch."],
          answer: 2,
          explanation: "'Er lernt Deutsch.' is correct. 'Ich lernst' → lerne, 'Du lernt' → lernst, 'Wir lernt' → lernen.",
        },
        {
          q: "Spot the mistake: 'Das Kind spielen im Park.'",
          options: ["'Park' should be lowercase", "'spielen' should be 'spielt' — das Kind = es, takes -t", "'im' should be 'in dem'", "No mistake"],
          answer: 1,
          explanation: "'Das Kind spielt im Park.' — das Kind = es form → '-t'. 'spielen' is the wir/sie/Sie form.",
        },
      ],

      // Level 10 — Mixed hardest
      [
        {
          q: "Which sentence is fully correct?",
          options: [
            "Ich spielst Fußball und du spielen Tennis.",
            "Ich spiele Fußball und du spielst Tennis.",
            "Ich spielt Fußball und du spielst Tennis.",
            "Ich spielen Fußball und du spiele Tennis.",
          ],
          answer: 1,
          explanation: "'Ich spiele Fußball und du spielst Tennis.' — ich→-e, du→-st. Both correct.",
        },
        {
          q: "Complete the conjugation table for 'machen': which row is fully correct?",
          options: [
            "ich mache / du machst / er macht / wir machen",
            "ich machst / du macht / er machen / wir mache",
            "ich macht / du machst / er mache / wir machen",
            "ich machen / du machst / er macht / wir mache",
          ],
          answer: 0,
          explanation: "ich mache / du machst / er macht / wir machen — all four correct forms.",
        },
        {
          q: "Why does 'du arbeitest' have an extra 'e'?",
          options: ["For aesthetic reasons", "The stem 'arbeit-' ends in -t, so -e is inserted for pronunciation", "All du-forms add an extra -e", "It's an irregular verb"],
          answer: 1,
          explanation: "Stems ending in -t or -d insert an extra -e before the personal ending to make pronunciation easier: arbeit + e + st = arbeitest.",
        },
        {
          q: "Translate: 'She works and he learns.'",
          options: [
            "Sie arbeitet und er lernt.",
            "Sie arbeite und er lernst.",
            "Sie arbeitest und er lernen.",
            "Sie arbeiten und er lernt.",
          ],
          answer: 0,
          explanation: "'Sie arbeitet und er lernt.' — sie (she) + arbeitet, er + lernt. Both use '-t' ending.",
        },
        {
          q: "Which sentence correctly uses the verb 'reden' (to talk) for 'du'?",
          options: ["Du redst.", "Du redet.", "Du redest.", "Du reden."],
          answer: 2,
          explanation: "'Du redest.' — stem 'red-' ends in -d → insert extra -e: red + e + st = redest.",
        },
        {
          q: "Which of these is the ONLY wrong sentence?",
          options: ["Ich koche gern.", "Du kochst heute.", "Er kocht Suppe.", "Wir kochen zusammen."],
          answer: 3,
          explanation: "All four are correct! Trick question — there is no wrong sentence here. But wait: 'Wir kochen zusammen.' — wir + -en ✓. All correct.",
        },
        {
          q: "Which verb stem needs the extra -e rule?",
          options: ["spielen (spiel-)", "lernen (lern-)", "arbeiten (arbeit-)", "kochen (koch-)"],
          answer: 2,
          explanation: "'arbeiten' — stem 'arbeit-' ends in -t. Needs extra -e for du and er: arbeitest, arbeitet.",
        },
        {
          q: "Translate: 'We cook and they eat.'",
          options: [
            "Wir kocht und sie essen.",
            "Wir kochen und sie essen.",
            "Wir kochen und sie isst.",
            "Wir koche und sie essen.",
          ],
          answer: 1,
          explanation: "'Wir kochen und sie essen.' — wir + -en = kochen. 'essen' is also plural -en form.",
        },
        {
          q: "Which verb does NOT follow the regular conjugation pattern?",
          options: ["lernen", "spielen", "arbeiten", "sein"],
          answer: 3,
          explanation: "'sein' (to be) is highly irregular: ich bin, du bist, er ist, wir sind — none follow the regular -e/-st/-t/-en pattern.",
        },
        {
          q: "Final challenge: Conjugate 'spielen' for ALL pronouns in order. Which is correct?",
          options: [
            "ich spiele / du spielst / er spielt / wir spielen / ihr spielt / sie spielen",
            "ich spielst / du spiele / er spielen / wir spielt / ihr spielen / sie spielt",
            "ich spiele / du spielt / er spielst / wir spielen / ihr spielt / sie spielen",
            "ich spielen / du spielst / er spielt / wir spiele / ihr spielen / sie spielt",
          ],
          answer: 0,
          explanation: "ich spiele / du spielst / er spielt / wir spielen / ihr spielt / sie spielen — the full correct conjugation.",
        },
      ],
    ],
  },
];
