import axiosClient from './axiosClient';

export interface ExamQuestion {
  id: number;
  content: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficultyLevel?: string;
  subject?: string;
  topic?: string;
  topicId?: number;
}

export interface ExamItem {
  id: number;
  title: string;
  teacherId: number;
  questionIds: string;
  answerKey: string;
  questionCount?: number;
  questions: ExamQuestion[];
  createdAt: string;
}

export interface CreateExamPayload {
  title?: string;
  topicId: number;
  level?: string;
  numQuestions?: number;
  numVersions?: number;
}

export interface UpdateExamPayload {
  title?: string;
  questions?: ExamQuestion[];
}

export interface SubmissionResult {
  submissionId: number;
  studentName: string;
  status: string;
  score: number;
  feedback: string;
  totalQuestions?: number;
  correctCount?: number;
  wrongQuestionIds?: string;
  submittedAt: string;
}

export interface ResultItem {
  resultId: number;
  submissionId: number;
  examTitle?: string;
  studentName: string;
  score: number;
  totalQuestions?: number;
  correctCount?: number;
  wrongQuestionIds?: string;
  feedback?: string;
  gradedAt: string;
}

export const getExams = () => axiosClient.get('/exams') as unknown as Promise<ExamItem[]>;

export const createExam = (payload: CreateExamPayload) =>
  axiosClient.post('/exams', payload) as unknown as Promise<ExamItem>;

export const updateExam = (examId: number, payload: UpdateExamPayload) =>
  axiosClient.put(`/exams/${examId}`, payload) as unknown as Promise<ExamItem>;

export const deleteExam = (examId: number) =>
  axiosClient.delete(`/exams/${examId}`) as unknown as Promise<void>;

export const submitExamForOcr = (examId: number, studentName: string, file: File) => {
  const formData = new FormData();
  formData.append('studentName', studentName);
  formData.append('image', file);

  return axiosClient.post(`/exams/${examId}/submissions`, formData, {
    timeout: 120000,
  }) as unknown as Promise<SubmissionResult>;
};

export const getExamResults = (examId: number) =>
  axiosClient.get(`/exams/${examId}/results`) as unknown as Promise<ResultItem[]>;
