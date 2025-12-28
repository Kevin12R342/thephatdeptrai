export type QuestionType = 'mcq' | 'tf4';

export interface Question {
  id: string;
  type: QuestionType;
  theme: string;
  lesson: string;
  q: string;
  options?: string[]; // For MCQ
  statements?: string[]; // For TF4
  a: number | boolean[]; // number index for MCQ, array of booleans for TF4
  explain?: string;
  source?: string;
  a_conf?: number; // Confidence level from source, optional
}

export type QuizMode = 'practice' | 'exam' | 'full' | null;

export interface QuizState {
  mode: QuizMode;
  userName: string; // Added userName
  questions: Question[];
  currentIndex: number;
  answers: Map<string, any>; // questionId -> answer
  revealed: Set<string>; // questionIds that have been revealed (practice mode)
  isFinished: boolean;
  score: number;
  timeRemaining: number;
}