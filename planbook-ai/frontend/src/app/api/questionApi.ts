import axiosClient from './axiosClient';

export interface QuestionParams {
  subject?: string;
  topic?: string;
  subjectId?: number;
  chapterId?: number;
  topicId?: number;
  difficultyLevel?: string;
  status?: string;
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
}

export interface QuestionData {
  content: string;
  subject: string;
  topic: string;
  subjectId?: number;
  chapterId?: number;
  topicId?: number;
  difficultyLevel: string;
  correctAnswer: string;
  options: string[];
  explanation?: string;
}

export const getQuestions = (params?: QuestionParams) => axiosClient.get('/questions', { params });

export const getPendingQuestions = (params?: { page?: number; size?: number }) =>
  axiosClient.get('/questions/pending', { params });

export const createQuestion = (data: QuestionData) => axiosClient.post('/questions', data);

export const approveQuestion = (id: number, approved: boolean, rejectionReason?: string) =>
  axiosClient.post(`/questions/${id}/approve`, { approved, rejectionReason });

export const deleteQuestion = (id: number) => axiosClient.delete(`/questions/${id}`);

export const aiSuggestQuestion = (data: {
  topic: string;
  difficultyLevel: string;
  description: string;
  numberOfOptions?: number;
}) => axiosClient.post('/questions/ai/suggest', data, { timeout: 60000 });
