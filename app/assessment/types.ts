export type Question = {
  question: string;
  choices: string[];
  answer: string;
};

export type QuizData = {
  [subject: string]: Question[];
};

export type LevelProgress = {
  unlocked: boolean;
  completed: boolean;
  stars: number;
};

export type SubjectProgress = {
  [levelKey: string]: LevelProgress;
};

export type ProgressData = {
  [subject: string]: SubjectProgress;
};

export type SpecialQuiz = {
  id: string;
  title: string;
  subject: string;
  grade_level: string;
  status?: "draft" | "published" | "archived";
};

export type SpecialQuestion = {
  id: string;
  quiz_id: string;
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_answer: string;
};

export type ProgressRow = {
  subject: string;
  level_number: number;
  unlocked: boolean;
  completed: boolean;
  stars: number;
};

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}