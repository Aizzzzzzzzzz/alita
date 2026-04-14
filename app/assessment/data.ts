import { ProgressData, ProgressRow, QuizData } from "./types";

export const quizData: QuizData = {
  Math: [
    { question: "What is one plus one?", choices: ["one", "two", "three", "four"], answer: "two" },
    { question: "What is two plus one?", choices: ["two", "three", "four", "five"], answer: "three" },
    { question: "What is two plus two?", choices: ["three", "four", "five", "six"], answer: "four" },
    { question: "What is three plus two?", choices: ["four", "five", "six", "seven"], answer: "five" },
    { question: "What is three plus three?", choices: ["five", "six", "seven", "eight"], answer: "six" },
    { question: "What is four plus three?", choices: ["six", "seven", "eight", "nine"], answer: "seven" },
    { question: "What is four plus four?", choices: ["six", "seven", "eight", "nine"], answer: "eight" },
    { question: "What is five plus four?", choices: ["eight", "nine", "ten", "eleven"], answer: "nine" },
    { question: "What is five plus five?", choices: ["nine", "ten", "eleven", "twelve"], answer: "ten" },
    { question: "What is six plus five?", choices: ["ten", "eleven", "twelve", "thirteen"], answer: "eleven" },

    { question: "What is six plus six?", choices: ["ten", "eleven", "twelve", "thirteen"], answer: "twelve" },
    { question: "What is seven plus six?", choices: ["twelve", "thirteen", "fourteen", "fifteen"], answer: "thirteen" },
    { question: "What is seven plus seven?", choices: ["twelve", "thirteen", "fourteen", "fifteen"], answer: "fourteen" },
    { question: "What is eight plus seven?", choices: ["fourteen", "fifteen", "sixteen", "seventeen"], answer: "fifteen" },
    { question: "What is eight plus eight?", choices: ["fourteen", "fifteen", "sixteen", "seventeen"], answer: "sixteen" },
    { question: "What is nine plus eight?", choices: ["sixteen", "seventeen", "eighteen", "nineteen"], answer: "seventeen" },
    { question: "What is nine plus nine?", choices: ["sixteen", "seventeen", "eighteen", "nineteen"], answer: "eighteen" },
    { question: "What is ten plus nine?", choices: ["eighteen", "nineteen", "twenty", "twenty one"], answer: "nineteen" },
    { question: "What is ten plus ten?", choices: ["eighteen", "nineteen", "twenty", "twenty one"], answer: "twenty" },
    { question: "What is eleven plus ten?", choices: ["twenty", "twenty one", "twenty two", "twenty three"], answer: "twenty one" },
  ],

  English: [
    { question: "Which word is a color?", choices: ["red", "run", "dog", "book"], answer: "red" },
    { question: "Which word is an animal?", choices: ["cat", "blue", "jump", "chair"], answer: "cat" },
    { question: "Which word is a fruit?", choices: ["apple", "table", "sing", "shoe"], answer: "apple" },
    { question: "Which word is a body part?", choices: ["hand", "ball", "tree", "sleep"], answer: "hand" },
    { question: "Which word is a shape?", choices: ["circle", "bird", "dance", "milk"], answer: "circle" },
    { question: "Which word is a number word?", choices: ["three", "banana", "green", "chair"], answer: "three" },
    { question: "Which word is a school thing?", choices: ["book", "fish", "run", "orange"], answer: "book" },
    { question: "Which word is a toy?", choices: ["ball", "ear", "rice", "write"], answer: "ball" },
    { question: "Which word is an action?", choices: ["run", "apple", "red", "bag"], answer: "run" },
    { question: "Which word is a place?", choices: ["school", "jump", "yellow", "bread"], answer: "school" },

    { question: "Which word is a drink?", choices: ["milk", "pencil", "fast", "dog"], answer: "milk" },
    { question: "Which word is a family word?", choices: ["mother", "table", "blue", "swim"], answer: "mother" },
    { question: "Which word is a vehicle?", choices: ["car", "rice", "sleep", "arm"], answer: "car" },
    { question: "Which word is clothing?", choices: ["shirt", "egg", "read", "sun"], answer: "shirt" },
    { question: "Which word is in the sky?", choices: ["star", "chair", "bread", "run"], answer: "star" },
    { question: "Which word is a food?", choices: ["bread", "jump", "blue", "nose"], answer: "bread" },
    { question: "Which word is a room thing?", choices: ["bed", "orange", "sing", "bird"], answer: "bed" },
    { question: "Which word is a sound word?", choices: ["bell", "banana", "shoe", "green"], answer: "bell" },
    { question: "Which word is a weather word?", choices: ["rain", "book", "sleep", "shirt"], answer: "rain" },
    { question: "Which word is an insect?", choices: ["ant", "desk", "write", "water"], answer: "ant" },
  ],

  Filipino: [
    { question: "Alin ang kulay?", choices: ["pula", "takbo", "aso", "mesa"], answer: "pula" },
    { question: "Alin ang hayop?", choices: ["pusa", "lapis", "kain", "upuan"], answer: "pusa" },
    { question: "Alin ang prutas?", choices: ["mangga", "libro", "lakad", "damit"], answer: "mangga" },
    { question: "Alin ang bahagi ng katawan?", choices: ["kamay", "bola", "ulan", "sulat"], answer: "kamay" },
    { question: "Alin ang hugis?", choices: ["bilog", "ibon", "gatas", "tulog"], answer: "bilog" },
    { question: "Alin ang bilang?", choices: ["isa", "silya", "puno", "takbo"], answer: "isa" },
    { question: "Alin ang gamit sa paaralan?", choices: ["lapis", "isda", "awit", "saging"], answer: "lapis" },
    { question: "Alin ang laruan?", choices: ["manika", "tenga", "kanin", "sulat"], answer: "manika" },
    { question: "Alin ang kilos?", choices: ["takbo", "mansanas", "bughaw", "bag"], answer: "takbo" },
    { question: "Alin ang lugar?", choices: ["paaralan", "lundag", "dilaw", "tinapay"], answer: "paaralan" },

    { question: "Alin ang inumin?", choices: ["tubig", "lapis", "mabilis", "aso"], answer: "tubig" },
    { question: "Alin ang miyembro ng pamilya?", choices: ["nanay", "mesa", "berde", "langoy"], answer: "nanay" },
    { question: "Alin ang sasakyan?", choices: ["kotse", "bigas", "tulog", "braso"], answer: "kotse" },
    { question: "Alin ang damit?", choices: ["damit", "itlog", "basa", "araw"], answer: "damit" },
    { question: "Alin ang nasa langit?", choices: ["bituin", "silya", "tinapay", "takbo"], answer: "bituin" },
    { question: "Alin ang pagkain?", choices: ["kanin", "talon", "ube", "ilong"], answer: "kanin" },
    { question: "Alin ang bagay sa silid?", choices: ["kama", "kahel", "awit", "ibon"], answer: "kama" },
    { question: "Alin ang tunog?", choices: ["kampana", "saging", "sapatos", "berde"], answer: "kampana" },
    { question: "Alin ang panahon?", choices: ["ulan", "libro", "higa", "damit"], answer: "ulan" },
    { question: "Alin ang insekto?", choices: ["langgam", "mesa", "sulat", "gatas"], answer: "langgam" },
  ],

  Science: [
    { question: "Which animal barks?", choices: ["dog", "fish", "bird", "ant"], answer: "dog" },
    { question: "Which animal flies?", choices: ["bird", "cat", "cow", "goat"], answer: "bird" },
    { question: "Which animal swims?", choices: ["fish", "duck", "dog", "hen"], answer: "fish" },
    { question: "What do we drink?", choices: ["water", "sand", "rock", "leaf"], answer: "water" },
    { question: "What do we breathe?", choices: ["air", "soil", "paper", "wood"], answer: "air" },
    { question: "What gives light in the day?", choices: ["sun", "moon", "star", "cloud"], answer: "sun" },
    { question: "What shines at night?", choices: ["moon", "chair", "book", "bag"], answer: "moon" },
    { question: "Which part helps us see?", choices: ["eye", "ear", "nose", "hand"], answer: "eye" },
    { question: "Which part helps us hear?", choices: ["ear", "eye", "mouth", "foot"], answer: "ear" },
    { question: "Which part helps us smell?", choices: ["nose", "ear", "arm", "leg"], answer: "nose" },

    { question: "Which plant part is under the soil?", choices: ["root", "leaf", "flower", "fruit"], answer: "root" },
    { question: "Which plant part is green?", choices: ["leaf", "root", "seed", "branch"], answer: "leaf" },
    { question: "Which one is living?", choices: ["dog", "ball", "chair", "spoon"], answer: "dog" },
    { question: "Which one is not living?", choices: ["rock", "bird", "tree", "cat"], answer: "rock" },
    { question: "What falls from clouds?", choices: ["rain", "fire", "paper", "dust"], answer: "rain" },
    { question: "What do plants need?", choices: ["water", "plastic", "glass", "metal"], answer: "water" },
    { question: "Which one is hot?", choices: ["fire", "ice", "rain", "mud"], answer: "fire" },
    { question: "Which one is cold?", choices: ["ice", "sun", "steam", "sand"], answer: "ice" },
    { question: "Which one can grow?", choices: ["seed", "stone", "shoe", "cup"], answer: "seed" },
    { question: "Where do fish live?", choices: ["water", "tree", "road", "sky"], answer: "water" },
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