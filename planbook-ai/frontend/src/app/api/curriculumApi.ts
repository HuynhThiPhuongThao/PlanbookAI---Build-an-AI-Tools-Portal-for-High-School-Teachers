import axiosClient from './axiosClient';

// =====================================================================
// CURRICULUM API — Gọi curriculum-service qua API Gateway
// Port gateway: 8080 → route tới curriculum-service: 8083
// =====================================================================

// --- Danh mục Môn / Chương / Bài ---

export const getSubjects = () =>
  axiosClient.get('/subjects');

export const getChaptersBySubject = (subjectId: number) =>
  axiosClient.get(`/subjects/${subjectId}/chapters`);

export const getTopicsByChapter = (chapterId: number) =>
  axiosClient.get(`/chapters/${chapterId}/topics`);

// --- Sample Lesson Plans (STAFF tạo, gửi Manager duyệt) ---

export const getSampleLessonPlans = () =>
  axiosClient.get('/sample-lesson-plans');

export const createSampleLessonPlan = (data: {
  title: string;
  content: string;
  topicId: number;
  curriculumTemplateId?: number;
}) => axiosClient.post('/sample-lesson-plans', data);

export const updateSampleLessonPlan = (id: number, data: {
  title?: string;
  content?: string;
}) => axiosClient.put(`/sample-lesson-plans/${id}`, data);

export const submitForReview = (id: number) =>
  axiosClient.put(`/sample-lesson-plans/${id}/submit`);

// --- AI Generate (gọi ai-service qua gateway) ---

export const aiGenerateLessonPlan = (data: {
  topic: string;
  subject: string;
  grade?: string;
  additionalContext?: string;
}) => axiosClient.post('/ai/generate-lesson-plan', data, {
  baseURL: 'http://localhost:8086',  // Trực tiếp ai-service vì chưa route qua gateway
  timeout: 30000, // AI cần thời gian lâu hơn
});
