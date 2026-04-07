import { ProgressData, ProgressRow, QuizData } from "./types";

export const quizData: QuizData = {
  Math: [
    { question: "What is five plus three?", choices: ["six", "seven", "eight", "nine"], answer: "eight" },
    { question: "What is ten minus four?", choices: ["five", "six", "seven", "eight"], answer: "six" },
    { question: "What is two times three?", choices: ["five", "six", "seven", "eight"], answer: "six" },
    { question: "What is twelve divided by three?", choices: ["two", "three", "four", "five"], answer: "four" },
    { question: "What is seven plus two?", choices: ["eight", "nine", "ten", "eleven"], answer: "nine" },
    { question: "What is fifteen minus five?", choices: ["nine", "ten", "eleven", "twelve"], answer: "ten" },
    { question: "What is four times two?", choices: ["six", "seven", "eight", "nine"], answer: "eight" },
    { question: "What is eighteen divided by two?", choices: ["eight", "nine", "ten", "eleven"], answer: "nine" },
    { question: "What is six plus six?", choices: ["ten", "eleven", "twelve", "thirteen"], answer: "twelve" },
    { question: "What is twenty minus seven?", choices: ["twelve", "thirteen", "fourteen", "fifteen"], answer: "thirteen" },
  ],
  English: [
    { question: "Which word is a noun?", choices: ["run", "jump", "school", "quickly"], answer: "school" },
    { question: "Which word starts with a vowel?", choices: ["ball", "cat", "apple", "dog"], answer: "apple" },
    { question: "Choose the correct spelling.", choices: ["frend", "friend", "freind", "frind"], answer: "friend" },
    { question: "Which word is a pronoun?", choices: ["he", "blue", "table", "fast"], answer: "he" },
    { question: "Which word is an adjective?", choices: ["happy", "run", "sing", "jump"], answer: "happy" },
    { question: "Which word rhymes with cat?", choices: ["dog", "hat", "sun", "box"], answer: "hat" },
    { question: "What is the plural of child?", choices: ["childs", "children", "childes", "child"], answer: "children" },
    { question: "Which sentence is correct?", choices: ["she go to school", "she goes to school", "she going to school", "she gone to school"], answer: "she goes to school" },
    { question: "Which word is a verb?", choices: ["run", "book", "happy", "red"], answer: "run" },
    { question: "Which word means big?", choices: ["small", "large", "tiny", "short"], answer: "large" },
  ],
  Filipino: [
    { question: "Ano ang kabaligtaran ng malaki?", choices: ["mataas", "maliit", "mabait", "mabagal"], answer: "maliit" },
    { question: "Alin ang tamang panghalip?", choices: ["ako", "mabilis", "maganda", "masaya"], answer: "ako" },
    { question: "Ano ang simula ng alpabetong Filipino?", choices: ["a", "b", "c", "d"], answer: "a" },
    { question: "Ano ang kabaligtaran ng mabilis?", choices: ["mabagal", "maliwanag", "malaki", "mataas"], answer: "mabagal" },
    { question: "Alin ang pangngalan?", choices: ["tumakbo", "bahay", "mabilis", "masaya"], answer: "bahay" },
    { question: "Ano ang tamang baybay?", choices: ["eskwela", "iskwela", "esquela", "eskwla"], answer: "eskwela" },
    { question: "Ano ang kasingkahulugan ng masaya?", choices: ["malungkot", "masigla", "mabagal", "maliit"], answer: "masigla" },
    { question: "Ano ang tawag sa salitang naglalarawan?", choices: ["pandiwa", "pang-uri", "panghalip", "pang-abay"], answer: "pang-uri" },
    { question: "Ano ang panghalip sa pangungusap na ako ay masaya?", choices: ["ako", "ay", "masaya", "pangungusap"], answer: "ako" },
    { question: "Ano ang unang araw ng linggo?", choices: ["lunes", "linggo", "martes", "biyernes"], answer: "linggo" },
  ],
  Science: [
    { question: "Which part of the plant absorbs water?", choices: ["leaf", "flower", "root", "stem"], answer: "root" },
    { question: "What do we need to breathe?", choices: ["water", "air", "soil", "rock"], answer: "air" },
    { question: "Which one is a living thing?", choices: ["chair", "dog", "book", "bag"], answer: "dog" },
    { question: "Which planet do we live on?", choices: ["mars", "venus", "earth", "jupiter"], answer: "earth" },
    { question: "What gives us light during the day?", choices: ["moon", "sun", "star", "cloud"], answer: "sun" },
    { question: "Which sense organ is used for hearing?", choices: ["eye", "ear", "nose", "tongue"], answer: "ear" },
    { question: "What do plants need to grow?", choices: ["plastic", "water", "stone", "paper"], answer: "water" },
    { question: "What state of matter is ice?", choices: ["solid", "liquid", "gas", "smoke"], answer: "solid" },
    { question: "Which animal can fly?", choices: ["fish", "bird", "dog", "cat"], answer: "bird" },
    { question: "What do we call water falling from clouds?", choices: ["wind", "rain", "heat", "fog"], answer: "rain" },
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