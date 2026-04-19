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
export const approveQuestion = (id: number, approved: boolean, rejectionReason?: string) => {
  return axiosClient.post(`/questions/${id}/approve`, { approved, rejectionReason });
};

// Xóa câu hỏi (cho Admin)
export const deleteQuestion = (id: number) => {
  return axiosClient.delete(`/questions/${id}`);
};