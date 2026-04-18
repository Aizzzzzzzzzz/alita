import { ProgressData, ProgressRow, QuizData } from "./types";

export const quizData: QuizData = {
  Math: [
    {
      question: "What is 2 plus 3?",
      choices: ["four", "five", "six", "seven"],
      answers: ["five", "number five", "the answer is five", "it is five", "5"],
    },
    {
      question: "What is 4 plus 4?",
      choices: ["six", "seven", "eight", "nine"],
      answers: ["eight", "number eight", "the answer is eight", "it is eight", "8"],
    },
    {
      question: "What is 9 minus 3?",
      choices: ["five", "six", "seven", "eight"],
      answers: ["six", "number six", "the answer is six", "it is six", "6"],
    },
    {
      question: "What is 10 minus 2?",
      choices: ["six", "seven", "eight", "nine"],
      answers: ["eight", "number eight", "the answer is eight", "it is eight", "8"],
    },
    {
      question: "What is 3 times 2?",
      choices: ["five", "six", "seven", "eight"],
      answers: ["six", "number six", "the answer is six", "it is six", "6"],
    },
    {
      question: "What is 3 times 3?",
      choices: ["eight", "nine", "fifteen", "eleven"],
      answers: ["nine", "number nine", "the answer is nine", "it is nine", "9"],
    },
    {
      question: "What is 12 divided by 3?",
      choices: ["two", "three", "four", "five"],
      answers: ["four", "number four", "the answer is four", "it is four", "4"],
    },
    {
      question: "What is 15 divided by 5?",
      choices: ["two", "three", "four", "five"],
      answers: ["three", "number three", "the answer is three", "it is three", "3"],
    },
    {
      question: "What is one half plus one half?",
      choices: ["one", "two", "half", "zero"],
      answers: ["one whole", "one", "the answer is one whole", "it is one whole", "1"],
    },
    {
      question: "What is one fourth plus one fourth?",
      choices: ["one half", "one whole", "two", "zero"],
      answers: ["one half", "half", "the answer is one half", "it is one half"],
    },
    {
      question: "What do we use to measure length?",
      choices: ["ruler", "clock", "scale", "cup"],
      answers: ["ruler", "the answer is ruler", "it is ruler"],
    },
    {
      question: "What do we use to measure time?",
      choices: ["clock", "ruler", "scale", "meter"],
      answers: ["clock", "time clock", "the answer is clock", "it is clock"],
    },
    {
      question: "What do we use to measure mass?",
      choices: ["scale", "clock", "ruler", "book"],
      answers: ["scale", "the answer is scale", "it is scale"],
    },
    {
      question: "What shape has four equal sides?",
      choices: ["triangle", "circle", "square", "oval"],
      answers: ["square", "shape square", "the answer is square", "it is square"],
    },
    {
      question: "What shape is round?",
      choices: ["circle", "square", "triangle", "rectangle"],
      answers: ["circle", "shape circle", "the answer is circle", "it is circle"],
    },
    {
      question: "What do we add to find the perimeter of a shape?",
      choices: ["all sides", "only one side", "corners", "angles"],
      answers: ["all sides", "add all sides", "the answer is all sides", "it is all sides"],
    },
    {
      question: "What do we find inside a shape: area or color?",
      choices: ["area", "color", "name", "number"],
      answers: ["area", "the answer is area", "it is area"],
    },
    {
      question: "If you have 10 apples and eat 2, how many are left?",
      choices: ["six", "seven", "eight", "nine"],
      answers: ["eight", "number eight", "the answer is eight", "it is eight", "8"],
    },
    {
      question: "If there are 3 bags with 2 pencils each, how many pencils are there?",
      choices: ["four", "five", "six", "seven"],
      answers: ["six", "number six", "the answer is six", "it is six", "6"],
    },
    {
      question: "If you share 8 candies equally with 2 friends, how many candies does each get?",
      choices: ["three", "four", "five", "six"],
      answers: ["four", "number four", "the answer is four", "it is four", "4"],
    },
  ],

  English: [
    {
      question: "Which word is a color?",
      choices: ["red", "run", "table", "jump"],
      answers: ["red", "color red", "the answer is red", "it is red"],
    },
    {
      question: "Which word is an action?",
      choices: ["jump", "chair", "blue", "desk"],
      answers: ["jump", "action jump", "the answer is jump", "it is jump"],
    },
    {
      question: "Which word is a place?",
      choices: ["school", "run", "green", "book"],
      answers: ["school", "place school", "the answer is school", "it is school"],
    },
    {
      question: "Which word is a thing?",
      choices: ["book", "jump", "fast", "run"],
      answers: ["book", "thing book", "the answer is book", "it is book"],
    },
    {
      question: "Which word is the opposite of hot?",
      choices: ["cold", "fast", "bright", "near"],
      answers: ["cold", "the answer is cold", "it is cold"],
    },
    {
      question: "Which word means big?",
      choices: ["large", "small", "slow", "thin"],
      answers: ["large", "the answer is large", "it is large"],
    },
    {
      question: "Which word is a noun?",
      choices: ["teacher", "run", "quickly", "blue"],
      answers: ["teacher", "noun teacher", "the answer is teacher", "it is teacher"],
    },
    {
      question: "Which word is a verb?",
      choices: ["jump", "apple", "happy", "yellow"],
      answers: ["jump", "verb jump", "the answer is jump", "it is jump"],
    },
    {
      question: "Which word is an adjective?",
      choices: ["happy", "run", "teacher", "slowly"],
      answers: ["happy", "adjective happy", "the answer is happy", "it is happy"],
    },
    {
      question: "Which word is a pronoun?",
      choices: ["she", "table", "run", "blue"],
      answers: ["she", "pronoun she", "the answer is she", "it is she"],
    },
    {
      question: "Which word is an adverb?",
      choices: ["quickly", "chair", "green", "book"],
      answers: ["quickly", "adverb quickly", "the answer is quickly", "it is quickly"],
    },
    {
      question: "Which sentence is correct?",
      choices: ["i go school", "I go to school", "go I school", "school I go"],
      answers: [
        "i go to school",
        "correct sentence i go to school",
        "the answer is i go to school",
        "it is i go to school",
      ],
    },
    {
      question: "Which sentence is complete?",
      choices: ["The dog runs", "dog the", "runs quickly the", "blue and"],
      answers: ["the dog runs", "the answer is the dog runs", "it is the dog runs"],
    },
    {
      question: "Which word shows past tense?",
      choices: ["goes", "will", "go", "went"],
      answers: ["went", "past tense went", "the answer is went", "it is went"],
    },
    {
      question: "Which word shows present tense?",
      choices: ["play", "played", "will play", "was playing"],
      answers: ["play", "present tense play", "the answer is play", "it is play"],
    },
    {
      question: "Which words show future tense?",
      choices: ["will jump", "jumped", "jumps", "jumping"],
      answers: ["will jump", "future tense will jump", "the answer is will jump", "it is will jump"],
    },
    {
      question: "What type of sentence is Close the door?",
      choices: ["question", "statement", "command", "exclamation"],
      answers: ["command", "command sentence", "the answer is command", "it is command"],
    },
    {
      question: "What type of sentence is What is your name?",
      choices: ["question", "statement", "command", "exclamation"],
      answers: ["question", "question sentence", "the answer is question", "it is question"],
    },
    {
      question: "What type of sentence is I like reading books?",
      choices: ["statement", "question", "command", "exclamation"],
      answers: ["statement", "statement sentence", "the answer is statement", "it is statement"],
    },
    {
      question: "What type of sentence is Wow that is amazing?",
      choices: ["statement", "question", "command", "exclamation"],
      answers: ["exclamation", "exclamatory sentence", "the answer is exclamation", "it is exclamation"],
    },
  ],

  Filipino: [
    {
      question: "Alin ang kulay?",
      choices: ["pula", "takbo", "mesa", "kain"],
      answers: ["pula", "kulay pula", "ang sagot ay pula", "ito ay pula"],
    },
    {
      question: "Alin ang kasalungat ng mainit?",
      choices: ["malamig", "mabilis", "maliwanag", "mataas"],
      answers: ["malamig", "ang sagot ay malamig", "ito ay malamig"],
    },
    {
      question: "Alin ang kasingkahulugan ng maganda?",
      choices: ["marikit", "mabagal", "maingay", "mababa"],
      answers: ["marikit", "ang sagot ay marikit", "ito ay marikit"],
    },
    {
      question: "Alin ang pangngalan?",
      choices: ["aso", "takbo", "maganda", "mabilis"],
      answers: ["aso", "pangngalan aso", "ang sagot ay aso", "ito ay aso"],
    },
    {
      question: "Alin ang pandiwa?",
      choices: ["lakad", "mesa", "berde", "gatas"],
      answers: ["lakad", "pandiwa lakad", "ang sagot ay lakad", "ito ay lakad"],
    },
    {
      question: "Alin ang pang uri?",
      choices: ["maganda", "takbo", "mesa", "kain"],
      answers: ["maganda", "pang uri maganda", "pang-uri maganda", "ang sagot ay maganda", "ito ay maganda"],
    },
    {
      question: "Alin ang panghalip?",
      choices: ["siya", "mesa", "takbo", "gatas"],
      answers: ["siya", "panghalip siya", "ang sagot ay siya", "ito ay siya"],
    },
    {
      question: "Alin ang pang abay?",
      choices: ["mabilis", "mesa", "aso", "kain"],
      answers: ["mabilis", "pang abay mabilis", "pang-abay mabilis", "ang sagot ay mabilis", "ito ay mabilis"],
    },
    {
      question: "Ano ang uri ng pangungusap na Nasa bahay ako?",
      choices: ["pasalaysay", "pautos", "patanong", "padamdam"],
      answers: ["pasalaysay", "pasalaysay na pangungusap", "ang sagot ay pasalaysay", "ito ay pasalaysay"],
    },
    {
      question: "Ano ang uri ng pangungusap na Mag aral ka mabuti?",
      choices: ["pasalaysay", "pautos", "patanong", "padamdam"],
      answers: ["pautos", "pautos na pangungusap", "ang sagot ay pautos", "ito ay pautos"],
    },
    {
      question: "Ano ang uri ng pangungusap na Saan ka pupunta?",
      choices: ["patanong", "pasalaysay", "pautos", "padamdam"],
      answers: ["patanong", "patanong na pangungusap", "ang sagot ay patanong", "ito ay patanong"],
    },
    {
      question: "Ano ang uri ng pangungusap na Ang saya natin?",
      choices: ["padamdam", "patanong", "pasalaysay", "pautos"],
      answers: ["padamdam", "padamdam na pangungusap", "ang sagot ay padamdam", "ito ay padamdam"],
    },
    {
      question: "Alin ang tamang pangungusap?",
      choices: ["Ako ay nag aaral", "nag aaral ako ay", "aral ako nag", "ako aral"],
      answers: ["ako ay nag aaral", "ang sagot ay ako ay nag aaral", "ito ay ako ay nag aaral"],
    },
    {
      question: "Alin ang buong pangungusap?",
      choices: ["Masaya ang bata", "masaya bata", "ang bata", "bata masaya"],
      answers: ["masaya ang bata", "ang sagot ay masaya ang bata", "ito ay masaya ang bata"],
    },
    {
      question: "Ano ang salitang ugat ng kumain?",
      choices: ["kain", "kuma", "main", "umain"],
      answers: ["kain", "ugat kain", "salitang ugat kain", "ang sagot ay kain", "ito ay kain"],
    },
    {
      question: "Ano ang salitang ugat ng tumalon?",
      choices: ["talon", "tuma", "alon", "tumal"],
      answers: ["talon", "ugat talon", "salitang ugat talon", "ang sagot ay talon", "ito ay talon"],
    },
    {
      question: "Alin ang may panlapi?",
      choices: ["kumanta", "kanta", "bahay", "mesa"],
      answers: ["kumanta", "ang sagot ay kumanta", "ito ay kumanta"],
    },
    {
      question: "Alin ang tambalang salita?",
      choices: ["bahay kubo", "kain", "takbo", "ganda"],
      answers: ["bahay kubo", "tambalang bahay kubo", "ang sagot ay bahay kubo", "ito ay bahay kubo"],
    },
    {
      question: "Alin ang tambalang salita?",
      choices: ["balik aral", "mesa", "pula", "takbo"],
      answers: ["balik aral", "tambalang balik aral", "ang sagot ay balik aral", "ito ay balik aral"],
    },
    {
      question: "Alin ang tamang gamit ng panghalip?",
      choices: ["Siya ay mabait", "siya mabait ay", "mabait siya ay", "ay siya mabait"],
      answers: ["siya ay mabait", "ang sagot ay siya ay mabait", "ito ay siya ay mabait"],
    },
  ],

  Science: [
    {
      question: "Which one is a living thing?",
      choices: ["dog", "chair", "table", "rock"],
      answers: ["dog", "living dog", "the answer is dog", "it is dog"],
    },
    {
      question: "Which one is not living?",
      choices: ["rock", "dog", "tree", "bird"],
      answers: ["rock", "not living rock", "the answer is rock", "it is rock"],
    },
    {
      question: "Which part of the body helps us speak?",
      choices: ["eyes", "ears", "nose", "mouth"],
      answers: ["mouth", "the answer is mouth", "it is mouth"]
    },
    {
      question: "Which part of the body helps us hear?",
      choices: ["ears", "eyes", "nose", "feet"],
      answers: ["ears", "ears for hearing", "the answer is ears", "it is ears"],
    },
    {
      question: "Which part of the body helps us smell?",
      choices: ["nose", "ears", "hands", "legs"],
      answers: ["nose", "nose for smelling", "the answer is nose", "it is nose"],
    },
    {
      question: "Which plant part is under the soil?",
      choices: ["root", "leaf", "flower", "fruit"],
      answers: ["root", "plant root", "the answer is root", "it is root"],
    },
    {
      question: "Which plant part makes food for the plant?",
      choices: ["leaf", "root", "seed", "branch"],
      answers: ["leaf", "plant leaf", "the answer is leaf", "it is leaf"],
    },
    {
      question: "Which animal lives in water?",
      choices: ["fish", "horse", "goat", "chicken"],
      answers: ["fish", "the answer is fish", "it is fish"],
    },
    {
      question: "What do plants need to grow?",
      choices: ["water", "plastic", "metal", "glass"],
      answers: ["water", "plants need water", "the answer is water", "it is water"],
    },
    {
      question: "What do humans breathe?",
      choices: ["air", "sand", "rock", "wood"],
      answers: ["air", "the answer is air", "it is air"],
    },
    {
      question: "What state is water?",
      choices: ["solid", "liquid", "gas", "plasma"],
      answers: ["liquid", "liquid water", "the answer is liquid", "it is liquid"],
    },
    {
      question: "What state is ice?",
      choices: ["solid", "liquid", "gas", "steam"],
      answers: ["solid", "solid ice", "the answer is solid", "it is solid"],
    },
    {
      question: "What state is steam?",
      choices: ["gas", "solid", "liquid", "ice"],
      answers: ["gas", "the answer is gas", "it is gas"],
    },
    {
      question: "What gives light during the day?",
      choices: ["sun", "moon", "star", "cloud"],
      answers: ["sun", "sun gives light", "the answer is sun", "it is sun"],
    },
    {
      question: "What shines at night in the sky?",
      choices: ["moon", "chair", "book", "bag"],
      answers: ["moon", "the answer is moon", "it is moon"],
    },
    {
      question: "What moves objects?",
      choices: ["force", "water", "light", "sound"],
      answers: ["force", "force moves objects", "the answer is force", "it is force"],
    },
    {
      question: "Which word means a push or a pull?",
      choices: ["force", "plant", "light", "water"],
      answers: ["force", "the answer is force", "it is force"],
    },
    {
      question: "What is at the center of the solar system?",
      choices: ["sun", "moon", "earth", "star"],
      answers: ["sun", "sun center solar system", "the answer is sun", "it is sun"],
    },
    {
      question: "Which planet is the one we live on?",
      choices: ["earth", "mars", "venus", "jupiter"],
      answers: ["earth", "planet earth", "the answer is earth", "it is earth"],
    },
    {
      question: "Which helps keep our surroundings clean?",
      choices: ["proper waste disposal", "littering", "burning plastic", "spilling oil"],
      answers: [
        "proper waste disposal",
        "the answer is proper waste disposal",
        "it is proper waste disposal",
      ],
    },
  ],
};

export const SUBJECTS = [
  { name: "Math", image: "/subjects/math.png" },
  { name: "English", image: "/subjects/english.png" },
  { name: "Filipino", image: "/subjects/filipino.png" },
  { name: "Science", image: "/subjects/science.png" },
];

export const MAX_WRONG_ATTEMPTS = 3;
export const MIC_HOLDER_PNG = "/ui/assessment/mic.png";
export const NPC_GUIDE_PNG = "/ui/assessment/Guide-Char.png";
export const LEVEL_BOOK_PNG = "/ui/assessment/book.png";
export const LEVEL_LOCK_PNG = "/ui/assessment/lock.png";

export function createDefaultProgress(): ProgressData {
  const progress: ProgressData = {};
  for (const subject of Object.keys(quizData)) {
    progress[subject] = {};
    quizData[subject].forEach((_, index) => {
      const levelKey = `level${index + 1}`;
      progress[subject][levelKey] = {
        unlocked: index === 0,
        completed: false,
        stars: 0,
      };
    });
  }
  return progress;
}

export function mergeProgress(rows: ProgressRow[] | null | undefined) {
  const defaults = createDefaultProgress();

  for (const row of rows || []) {
    if (!defaults[row.subject]) continue;
    const levelKey = `level${row.level_number}`;
    if (!defaults[row.subject][levelKey]) continue;

    defaults[row.subject][levelKey] = {
      unlocked: row.unlocked,
      completed: row.completed,
      stars: row.stars || 0,
    };
  }

  return defaults;
}