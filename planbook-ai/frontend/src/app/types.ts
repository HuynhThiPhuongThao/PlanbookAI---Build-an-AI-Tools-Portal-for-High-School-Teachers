export type UserRole = 'teacher' | 'admin' | 'manager' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  subject?: string; // For teachers
}

export interface Question {
  id: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'multiple-choice' | 'short-answer' | 'fill-blank' | 'essay';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  createdBy: string;
  createdAt: string;
  tags: string[];
}

export interface Exercise {
  id: string;
  title: string;
  subject: string;
  topic: string;
  grade: string;
  questions: Question[];
  createdBy: string;
  createdAt: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  grade: string;
  duration: number; // minutes
  totalMarks: number;
  questions: Question[];
  createdBy: string;
  createdAt: string;
  versions?: number;
}

export interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  grade: string;
  duration: number; // minutes
  objectives: string[];
  materials: string[];
  activities: {
    time: string;
    activity: string;
    description: string;
  }[];
  assessment: string;
  homework?: string;
  createdBy: string;
  createdAt: string;
}

export interface StudentResult {
  id: string;
  studentId: string;
  studentName: string;
  examId: string;
  examTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  submittedAt: string;
  gradedAt: string;
  answers: {
    questionId: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    marks: number;
  }[];
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  prompt: string;
  variables: string[];
  createdBy: string;
  createdAt: string;
}
