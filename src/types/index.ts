export type QuestionType = 'MCQ' | 'MSQ' | 'NAT';

export interface Question {
  id: number;
  type: QuestionType;
  answer?: string | string[] | number;
  skipped?: boolean;
}

export interface PracticeSession {
  id: string;
  subject: string;
  startQuestion: number;
  endQuestion: number;
  questions: Question[];
  startTime: Date;
  endTime?: Date;
  completed: boolean;
}

export interface Subject {
  name: string;
  totalQuestions: number;
  totalSessions: number;
  lastPracticed?: Date;
}