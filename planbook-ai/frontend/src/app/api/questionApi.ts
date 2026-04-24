import axiosClient from './axiosClient';

// Định nghĩa kiểu dữ liệu
interface QuestionParams {
  subject?: string;
  topic?: string;
  difficultyLevel?: string;
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
}

interface QuestionData {
  content: string;
  subject: string;
  topic: string;
  difficultyLevel: string;
  correctAnswer: string;
  options: string[];
  explanation?: string;
}

// Lấy danh sách câu hỏi (có phân trang + filter)
export const getQuestions = (params?: QuestionParams) => {
  return axiosClient.get('/questions', { params });
};

// Lấy danh sách câu hỏi chờ duyệt (cho Manager)
export const getPendingQuestions = () => {
  return axiosClient.get('/questions/pending');
};

// Tạo câu hỏi mới
export const createQuestion = (data: QuestionData) => {
  return axiosClient.post('/questions', data);
};

// Duyệt câu hỏi (APPROVED hoặc REJECTED)
export const approveQuestion = (id: number, status: string, reviewNote?: string) => {
  return axiosClient.post(`/questions/${id}/approve`, null, { params: { status, reviewNote } });
};

// Xóa câu hỏi (cho Admin)
export const deleteQuestion = (id: number) => {
  return axiosClient.delete(`/questions/${id}`);
};

// ==========================================
// AI Question Endpoints (gọi qua Gateway -> Question Bank Service -> AI Service)
// ==========================================

export const aiSuggestQuestion = (data: {
  subject: string;
  topic: string;
  difficultyLevel: string;
  keyword?: string;
  additionalContext?: string;
}) => {
  return axiosClient.post('/questions/ai/suggest', data, { timeout: 60000 });
};

export const aiImproveQuestion = (data: {
  content: string;
  options: string[];
  correctAnswer: string;
  improvementGoal?: string;
}) => {
  return axiosClient.post('/questions/ai/improve', data, { timeout: 60000 });
};

export const aiGenerateAnswer = (data: {
  content: string;
  options: string[];
  correctAnswer: string;
}) => {
  return axiosClient.post('/questions/ai/generate-answer', data, { timeout: 60000 });
};