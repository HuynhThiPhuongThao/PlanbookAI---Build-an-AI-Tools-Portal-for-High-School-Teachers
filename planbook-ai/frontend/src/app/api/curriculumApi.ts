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

// --- Admin: Quản lý Cấu trúc môn học ---
export const createSubject = (data: { name: string; description?: string }) => axiosClient.post('/subjects', data);
export const updateSubject = (id: number, data: { name: string; description?: string }) => axiosClient.put(`/subjects/${id}`, data);
export const deleteSubject = (id: number) => axiosClient.delete(`/subjects/${id}`);

export const createChapter = (data: { name: string; subjectId: number }) => axiosClient.post('/chapters', data);
export const updateChapter = (id: number, data: { name: string; subjectId: number }) => axiosClient.put(`/chapters/${id}`, data);
export const deleteChapter = (id: number) => axiosClient.delete(`/chapters/${id}`);

export const createTopic = (data: { title: string; chapterId: number }) => axiosClient.post('/topics', data);
export const updateTopic = (id: number, data: { title: string; chapterId: number }) => axiosClient.put(`/topics/${id}`, data);
export const deleteTopic = (id: number) => axiosClient.delete(`/topics/${id}`);

// --- Admin: Quản lý Khung Giáo Án (Templates) ---
export const getCurriculumTemplates = () => axiosClient.get('/curriculum-templates');
export const getCurriculumTemplateById = (id: number) => axiosClient.get(`/curriculum-templates/${id}`);
export const createCurriculumTemplate = (data: { name: string; description: string; isActive?: boolean }) => axiosClient.post('/curriculum-templates', data);
export const updateCurriculumTemplate = (id: number, data: { name: string; description: string; isActive?: boolean }) => axiosClient.put(`/curriculum-templates/${id}`, data);
export const deleteCurriculumTemplate = (id: number) => axiosClient.delete(`/curriculum-templates/${id}`);


// --- Sample Lesson Plans (STAFF tạo, gửi Manager duyệt) ---

export const getSampleLessonPlans = () =>
  axiosClient.get('/sample-lesson-plans/my');

export const getSampleLessonPlanById = (id: number) =>
  axiosClient.get(`/sample-lesson-plans/${id}`);

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
  axiosClient.post(`/sample-lesson-plans/${id}/submit`);

// --- AI Generate (gọi ai-service qua gateway) ---

export const aiGenerateLessonPlan = (data: {
  topic: string;
  subject: string;
  grade?: string;
  additionalContext?: string;
}) => axiosClient.post('/ai/generate-lesson-plan', data, {
  timeout: 60000,
});
