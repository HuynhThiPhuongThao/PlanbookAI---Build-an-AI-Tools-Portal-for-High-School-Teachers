import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import {
  ArrowLeft, Sparkles, Save, Loader2, BookOpen,
  ChevronRight, Clock, FileText, Pencil, Trash2,
} from 'lucide-react';
import React from 'react';
import {
  getSubjects, getChaptersBySubject, getTopicsByChapter,
  createSampleLessonPlan, updateSampleLessonPlan,
  aiGenerateLessonPlan,
  getSampleLessonPlans, getSampleLessonPlanById, getActiveCurriculumTemplates, getTopicById,
  deleteSampleLessonPlan,
} from '../api/curriculumApi';
import { getAccessTokenPayload } from '../utils/jwt';

// ---- helpers ----
function getFromToken(field: string): string {
  return getAccessTokenPayload()[field] || '';
}
function useRealUserName() {
  const [name, setName] = React.useState(getFromToken('fullName'));
  React.useEffect(() => {
    const h = (e: any) => { if (e.detail?.fullName) setName(e.detail.fullName); };
    window.addEventListener('profileUpdated', h);
    return () => window.removeEventListener('profileUpdated', h);
  }, []);
  return name;
}

function toList<T>(value: any): T[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  return [];
}

// ---- types ----
interface Subject { id: number; name: string; }
interface Chapter { id: number; name: string; }
interface Topic   { id: number; title: string; name?: string; }
interface CurriculumTemplate {
  id: number;
  name: string;
  description?: string;
  gradeLevel?: string;
  structureJson?: string;
  subject?: { id: number; name: string };
}
interface SamplePlan {
  id: number; title: string; status: string; topic?: { title?: string; name?: string };
}

// ---- status badge color ----
const statusColor: Record<string, string> = {
  DRAFT:    'bg-gray-100 text-gray-700',
  PENDING:  'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

// =====================================================================
export default function StaffLessonEditor() {
  const realName = useRealUserName();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // --- edit mode: đọc ?id= từ URL ---
  const editIdParam = searchParams.get('id');
  const editId      = editIdParam ? Number(editIdParam) : null;
  const isEditMode  = editId !== null;

  // --- state: dropdown data ---
  const [subjects, setSubjects]   = useState<Subject[]>([]);
  const [chapters, setChapters]   = useState<Chapter[]>([]);
  const [topics,   setTopics]     = useState<Topic[]>([]);

  // --- state: selection ---
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedTopic,   setSelectedTopic]   = useState('');
  const [templates, setTemplates] = useState<CurriculumTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [templateError, setTemplateError] = useState('');

  // --- state: editor ---
  const [title,   setTitle]   = useState('');
  const [content, setContent] = useState('');
  const [isSaving,      setIsSaving]      = useState(false);
  const [isGenerating,  setIsGenerating]  = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(isEditMode);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  // --- state: my plans list ---
  const [myPlans, setMyPlans] = useState<SamplePlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const filteredTemplates = templates;

  const loadActiveTemplates = () => {
    setIsLoadingTemplates(true);
    setTemplateError('');

    return getActiveCurriculumTemplates()
      .then((data: any) => setTemplates(toList<CurriculumTemplate>(data)))
      .catch(() => {
        setTemplates([]);
        setTemplateError('Không tải được khung giáo án');
      })
      .finally(() => setIsLoadingTemplates(false));
  };

  const hydrateTopicSelection = async (topicId: number) => {
    const topicDetail: any = await getTopicById(topicId);
    const subjectId = topicDetail?.chapter?.subject?.id;
    const chapterId = topicDetail?.chapter?.id;

    if (!subjectId || !chapterId) {
      setSelectedTopic(String(topicId));
      return;
    }

    setSelectedSubject(String(subjectId));

    const chapterList: any = await getChaptersBySubject(Number(subjectId));
    setChapters(toList<Chapter>(chapterList));
    setSelectedChapter(String(chapterId));

    const topicList: any = await getTopicsByChapter(Number(chapterId));
    setTopics(toList<Topic>(topicList));
    setSelectedTopic(String(topicId));
  };

  // ---- load subjects + (nếu edit mode) load plan cũ ----
  useEffect(() => {
    getSubjects()
      .then((data: any) => setSubjects(toList<Subject>(data)))
      .catch(() => setSubjects([]));

    getSampleLessonPlans()
      .then((data: any) => setMyPlans(toList<SamplePlan>(data)))
      .catch(() => setMyPlans([]))
      .finally(() => setLoadingPlans(false));

    loadActiveTemplates();

    // Edit mode: fill dữ liệu cũ vào form
    if (isEditMode && editId) {
      setIsLoadingEdit(true);
      getSampleLessonPlanById(editId)
        .then(async (data: any) => {
          setTitle(data.title || '');
          setContent(data.content || '');
          if (data.curriculumTemplate?.id) setSelectedTemplate(String(data.curriculumTemplate.id));
          if (data.topic?.id) {
            await hydrateTopicSelection(Number(data.topic.id));
          }
          showToast(`Đang chỉnh sửa: "${data.title}"`, 'ok');
        })
        .catch(() => showToast('Không tải được giáo án cũ — kiểm tra ID!', 'err'))
        .finally(() => setIsLoadingEdit(false));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- load chapters when subject changes ----
  useEffect(() => {
    if (!selectedSubject) { setChapters([]); setTopics([]); return; }
    setChapters([]); setTopics([]);
    setSelectedChapter(''); setSelectedTopic('');
    getChaptersBySubject(Number(selectedSubject))
      .then((data: any) => setChapters(toList<Chapter>(data)))
      .catch(() => setChapters([]));
  }, [selectedSubject]);

  // ---- load topics when chapter changes ----
  useEffect(() => {
    if (!selectedChapter) { setTopics([]); return; }
    setTopics([]); setSelectedTopic('');
    getTopicsByChapter(Number(selectedChapter))
      .then((data: any) => setTopics(toList<Topic>(data)))
      .catch(() => setTopics([]));
  }, [selectedChapter]);

  useEffect(() => {
    if (filteredTemplates.length === 0) {
      if (selectedTemplate) {
        setSelectedTemplate('');
      }
      return;
    }

    const hasCurrentTemplate = filteredTemplates.some((template) => String(template.id) === selectedTemplate);
    if (!hasCurrentTemplate && selectedTemplate) {
      setSelectedTemplate('');
    }
  }, [filteredTemplates, selectedTemplate]);

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const buildTemplateContext = () => {
    const template = templates.find((item) => String(item.id) === selectedTemplate);

    if (!template) return '';

    const parts = [
      `Tên khung: ${template.name}`,
      template.subject?.name ? `Môn học: ${template.subject.name}` : '',
      template.gradeLevel ? `Khối/lớp: ${template.gradeLevel}` : '',
      template.description ? `Mô tả: ${template.description}` : '',
    ].filter(Boolean);

    if (template.structureJson) {
      try {
        const parsed = JSON.parse(template.structureJson);
        parts.push(`Cấu trúc: ${JSON.stringify(parsed)}`);
      } catch {
        parts.push(`Cấu trúc: ${template.structureJson}`);
      }
    }

    return parts.join('\n');
  };

  // ---- Format: biến JSON Object từ AI thành văn bản dễ đọc cho textarea ----
  const formatLessonPlan = (data: any): string => {
    if (!data || typeof data !== 'object') return '';

    const lines: string[] = [];

    lines.push(`GIÁO ÁN: ${data.title || 'Chưa có tiêu đề'}`);
    lines.push('='.repeat(60));
    lines.push('');
    lines.push('I. THÔNG TIN CHUNG');
    lines.push(`- Chủ đề/Bài học: ${data.topic || data.title || ''}`);
    lines.push(`- Khối/lớp: ${data.grade || 'THPT'}`);
    lines.push(`- Thời lượng: ${data.durationMinutes || 45} phút`);

    const template = templates.find((item) => String(item.id) === selectedTemplate);
    if (template) {
      lines.push(`- Khung giáo án: ${template.name}`);
    }

    lines.push('');
    lines.push('II. MỤC TIÊU BÀI HỌC');
    if (Array.isArray(data.objectives) && data.objectives.length > 0) {
      data.objectives.forEach((obj: string, idx: number) => lines.push(`${idx + 1}. ${obj}`));
    } else {
      lines.push('1. Học sinh nắm được kiến thức trọng tâm của bài học.');
      lines.push('2. Vận dụng kiến thức để giải quyết câu hỏi/bài tập phù hợp.');
    }

    lines.push('');
    lines.push('III. CHUẨN BỊ');
    lines.push('- Giáo viên: Giáo án, học liệu, câu hỏi kiểm tra nhanh, thiết bị trình chiếu/thí nghiệm nếu có.');
    lines.push('- Học sinh: Ôn kiến thức liên quan, chuẩn bị vở ghi và dụng cụ học tập.');

    lines.push('');
    lines.push('IV. TIẾN TRÌNH DẠY HỌC');
    if (Array.isArray(data.activities) && data.activities.length > 0) {
      data.activities.forEach((act: any, idx: number) => {
        const timeLabel = act.time ? `[${act.time} phút]` : '';
        const activityLines = (act.activity || '').split('\n');
        const actTitle = activityLines[0]?.trim() || '';
        const actDetail = activityLines.slice(1).join('\n').trim();

        lines.push(`${idx + 1}. ${timeLabel} ${actTitle}`.trim());
        if (actDetail) {
          actDetail.split('\n').forEach((line: string) => lines.push(`   - ${line}`));
        }
      });
    } else {
      lines.push('1. Khởi động');
      lines.push('2. Hình thành kiến thức');
      lines.push('3. Luyện tập');
      lines.push('4. Vận dụng');
    }

    lines.push('');
    lines.push('V. ĐÁNH GIÁ VÀ PHẢN HỒI');
    lines.push(data.assessment || '- Quan sát mức độ tham gia, kiểm tra câu trả lời và bài luyện tập của học sinh.');

    lines.push('');
    lines.push('VI. GHI CHÚ SAU TIẾT DẠY');
    lines.push('- Nội dung cần điều chỉnh/bổ sung:');

    return lines.join('\n').trim();
  };

  // ---- AI generate ----
  const handleAI = async () => {
    const topicObj = topics.find(t => String(t.id) === selectedTopic);
    const subjectObj = subjects.find(s => String(s.id) === selectedSubject);
    if (!topicObj) { showToast('Vui lòng chọn bài (Topic) trước!', 'err'); return; }
    setIsGenerating(true);
    try {
      const res: any = await aiGenerateLessonPlan({
        topic: topicObj.title || topicObj.name || '',
        subject: subjectObj?.name || '',
        grade: 'Trung học phổ thông',
        durationMinutes: 45,
        additionalContext: buildTemplateContext(),
      });

      // Bóc tách và format JSON → văn bản dễ đọc
      // res là object (AI trả về đã parse sẵn qua axiosClient)
      const formatted = formatLessonPlan(res);

      // Fallback: nếu format thất bại → dùng JSON.stringify để debug
      setContent(formatted || JSON.stringify(res, null, 2));

      if (!title) setTitle(`Giáo án mẫu: ${topicObj.title || topicObj.name}`);
      showToast('AI đã sinh nội dung! Kiểm tra và chỉnh sửa trước khi lưu.', 'ok');
    } catch (e: any) {
      showToast('AI đang bận — thử lại sau hoặc nhập tay nha!', 'err');
    } finally {
      setIsGenerating(false);
    }
  };


  // ---- Save draft (CREATE hoặc UPDATE tuỳ mode) ----
  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      showToast('Điền tiêu đề và nội dung trước đã!', 'err'); return;
    }
    // Khi tạo mới bắt buộc phải chọn topic
    if (!isEditMode && !selectedTopic) {
      showToast('Chọn bài (Topic) để gán giáo án!', 'err'); return;
    }
    setIsSaving(true);
    try {
      let savedPlanId = editId;
      if (isEditMode && editId) {
        // ── UPDATE (PUT) ──
        await updateSampleLessonPlan(editId, {
          title,
          content,
          topicId: selectedTopic ? Number(selectedTopic) : undefined,
          curriculumTemplateId: selectedTemplate ? Number(selectedTemplate) : undefined,
        });
      } else {
        // ── CREATE (POST) ──
        const res: any = await createSampleLessonPlan({
          title,
          content,
          topicId: Number(selectedTopic),
          curriculumTemplateId: selectedTemplate ? Number(selectedTemplate) : undefined,
        });
        savedPlanId = res?.id || res?.data?.id || null;
      }
      navigate('/staff', {
        state: {
          savedPlanId,
          notice: 'Đã lưu giáo án vào trang lưu trữ. Bạn có thể gửi Manager duyệt tại danh sách.',
        },
      });
    } catch {
      showToast('Lưu thất bại — kiểm tra service đang chạy không!', 'err');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMyPlan = async (event: React.MouseEvent, planId: number) => {
    event.stopPropagation();
    const ok = window.confirm('Xóa giáo án mẫu này khỏi danh sách của bạn?');
    if (!ok) return;

    try {
      await deleteSampleLessonPlan(planId);
      setMyPlans((current) => current.filter((plan) => String(plan.id) !== String(planId)));
      showToast('Đã xóa giáo án mẫu.', 'ok');
      if (String(editId) === String(planId)) {
        navigate('/staff/lesson-editor', { replace: true });
      }
    } catch (error: any) {
      showToast(error?.response?.data?.message || error?.message || 'Xóa giáo án thất bại.', 'err');
    }
  };

  const selectedTemplateObj = filteredTemplates.find((item) => String(item.id) === selectedTemplate)
    || templates.find((item) => String(item.id) === selectedTemplate);

  // =====================================================================
  return (
    <DashboardLayout role="staff" userName={realName}>
      <div className="space-y-6">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium
            ${toast.type === 'ok' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/staff">
            <Button variant="outline" size="icon" id="staff-lesson-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditMode ? 'Chỉnh Sửa Giáo Án' : 'Soạn Giáo Án Mẫu'}
              </h1>
              {isEditMode && (
                <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                  <Pencil className="w-3 h-3" /> Chỉnh sửa #{editId}
                </span>
              )}
            </div>
            <p className="text-gray-600">
              {isEditMode
                ? 'Cập nhật nội dung → Lưu vào trang lưu trữ → Gửi Manager duyệt lại'
                : 'Chọn bài học → Gọi AI gợi ý → Chỉnh sửa → Lưu vào trang lưu trữ'}
            </p>
          </div>
        </div>

        {/* Loading overlay khi đang load plan cũ */}
        {isLoadingEdit && (
          <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang tải dữ liệu giáo án cũ...
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ==== CỘT TRÁI: Chọn bài + điều khiển ==== */}
          <div className="space-y-4">

            {/* Breadcrumb chọn Môn → Chương → Bài */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Chọn Nội Dung
                </CardTitle>
                <CardDescription>Môn → Chương → Bài</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">

                {/* Môn học */}
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Môn học</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger id="select-subject">
                      <SelectValue placeholder="Chọn môn..." />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.length === 0
                        ? <SelectItem value="__none" disabled>Đang tải...</SelectItem>
                        : subjects.map(s => (
                          <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>

                {/* Chương */}
                {selectedSubject && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-blue-600">
                      <ChevronRight className="w-3 h-3" />
                      <Label className="text-xs text-gray-500">Chương</Label>
                    </div>
                    <Select value={selectedChapter} onValueChange={setSelectedChapter}>
                      <SelectTrigger id="select-chapter">
                        <SelectValue placeholder="Chọn chương..." />
                      </SelectTrigger>
                      <SelectContent>
                        {chapters.length === 0
                          ? <SelectItem value="__none" disabled>Đang tải...</SelectItem>
                          : chapters.map(c => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Bài (Topic) */}
                {selectedChapter && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-blue-600">
                      <ChevronRight className="w-3 h-3" />
                      <ChevronRight className="w-3 h-3 -ml-2" />
                      <Label className="text-xs text-gray-500">Bài học</Label>
                    </div>
                    <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                      <SelectTrigger id="select-topic">
                        <SelectValue placeholder="Chọn bài..." />
                      </SelectTrigger>
                      <SelectContent>
                        {topics.length === 0
                          ? <SelectItem value="__none" disabled>Đang tải...</SelectItem>
                          : topics.map(t => (
                            <SelectItem key={t.id} value={String(t.id)}>{t.title || t.name}</SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Khung giáo án</Label>
                  <Select
                    value={selectedTemplate || '__none'}
                    onValueChange={(value) => setSelectedTemplate(value.startsWith('__') ? '' : value)}
                  >
                    <SelectTrigger id="select-template">
                      <SelectValue placeholder="Chọn khung giáo án (không bắt buộc)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Không dùng khung</SelectItem>
                      {isLoadingTemplates ? (
                        <SelectItem value="__loading" disabled>Đang tải khung giáo án...</SelectItem>
                      ) : templateError ? (
                        <SelectItem value="__error" disabled>{templateError}</SelectItem>
                      ) : filteredTemplates.length === 0 ? (
                        <SelectItem value="__empty" disabled>Chưa có khung ACTIVE từ Admin</SelectItem>
                      ) : (
                        filteredTemplates.map((template) => (
                          <SelectItem key={template.id} value={String(template.id)}>
                            {template.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {templateError && (
                    <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={loadActiveTemplates}>
                      Tải lại khung giáo án
                    </Button>
                  )}
                  {selectedTemplateObj && (
                    <p className="text-xs text-gray-500">
                      AI sẽ bám theo khung "{selectedTemplateObj.name}" khi sinh nội dung.
                    </p>
                  )}
                </div>

              </CardContent>
            </Card>

            {/* Nút AI */}
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="pt-4 space-y-3">
                <p className="text-sm font-medium text-purple-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Gọi AI Gemini gợi ý
                </p>
                <p className="text-xs text-purple-700">
                  AI sẽ tự động sinh nội dung giáo án theo bài học bạn đang chọn.
                </p>
                <Button
                  id="btn-ai-generate"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={handleAI}
                  disabled={isGenerating || !selectedTopic}
                >
                  {isGenerating
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang sinh...</>
                    : <><Sparkles className="w-4 h-4 mr-2" />Gọi AI gợi ý</>
                  }
                </Button>
              </CardContent>
            </Card>

            {/* Nút Save + Submit */}
            <div className="space-y-2">
              <Button
                id="btn-save-draft"
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang lưu...</>
                  : <><Save className="w-4 h-4 mr-2" />Lưu</>
                }
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Sau khi lưu, bài sẽ nằm ở trang lưu trữ để bạn gửi Manager duyệt.
              </p>
            </div>

          </div>

          {/* ==== CỘT PHẢI: Editor + danh sách ==== */}
          <div className="lg:col-span-2 space-y-4">

            {/* Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Nội dung Giáo Án
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label>Tiêu đề giáo án</Label>
                  <Input
                    id="lesson-title"
                    placeholder="VD: Giáo án mẫu - Bài 1: Nguyên tử"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Nội dung</Label>
                  <Textarea
                    id="lesson-content"
                    placeholder={
                      selectedTopic
                        ? 'Bấm "Gọi AI gợi ý" để có nội dung tự động, hoặc nhập thủ công...'
                        : 'Chọn bài học bên trái trước rồi soạn nội dung ở đây...'
                    }
                    rows={18}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="font-mono text-sm resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Danh sách giáo án của tôi */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="w-4 h-4 text-gray-500" />
                  Giáo án do tôi tạo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPlans ? (
                  <div className="flex items-center justify-center py-6 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />Đang tải...
                  </div>
                ) : myPlans.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Chưa có giáo án nào. Soạn giáo án đầu tiên đi!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {myPlans.map((p) => (
                      <div key={p.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                          {(p.topic?.title || p.topic?.name) && (
                            <p className="text-xs text-gray-500">{p.topic?.title || p.topic?.name}</p>
                          )}
                        </div>
                        <div className="ml-3 flex items-center gap-2">
                          <Badge className={statusColor[p.status] || 'bg-gray-100 text-gray-700'}>
                            {p.status}
                          </Badge>
                          {p.status !== 'APPROVED' ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                              onClick={(event) => handleDeleteMyPlan(event, Number(p.id))}
                              title="Xóa giáo án"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
