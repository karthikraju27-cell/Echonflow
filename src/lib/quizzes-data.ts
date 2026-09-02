import raw from "./quizzes-data.json";

// Question bank migrated from the Swasthi Primer reference build — one
// quiz per module, 13 total. See build brief follow-up: module
// certification.

export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  explain: string;
}

export interface ModuleQuiz {
  moduleId: string;
  questions: QuizQuestion[];
}

interface QuizzesData {
  passPct: number;
  quizzes: ModuleQuiz[];
}

const DATA = raw as QuizzesData;

export const QUIZ_PASS_PCT = DATA.passPct;
export const QUIZZES = DATA.quizzes;

export function findQuiz(moduleId: string): ModuleQuiz | undefined {
  return QUIZZES.find((q) => q.moduleId === moduleId);
}
