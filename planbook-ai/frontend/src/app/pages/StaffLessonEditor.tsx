import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
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
  ArrowLeft, Sparkles, Save, Send, Loader2, BookOpen,
  ChevronRight, CheckCircle, Clock, FileText, Pencil,
} from 'lucide-react';
import React from 'react';
import {
  getSubjects, getChaptersBySubject, getTopicsByChapter,
  createSampleLessonPlan, updateSampleLessonPlan,
  submitForReview, aiGenerateLessonPlan,
  getSampleLessonPlans, getSampleLessonPlanById,
} from '../api/curriculumApi';

// ---- helpers ----
function getFromToken(field: string): string {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return '';
    return JSON.parse(atob(token.split('.')[1]))[field] || '';
  } catch { return ''; }
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
interface SamplePlan {
  id: number; title: string; status: string; topic?: { name: string };
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

  // --- state: editor ---
  const [title,   setTitle]   = useState('');
  const [content, setContent] = useState('');
  const [isSaving,      setIsSaving]      = useState(false);
  const [isGenerating,  setIsGenerating]  = useState(false);
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  // savedId: khi CREATE mới → backend trả về id. Khi EDIT → dùng editId luôn
  const [savedId,       setSavedId]       = useState<number | null>(isEditMode ? editId : null);
  const [isLoadingEdit, setIsLoadingEdit] = useState(isEditMode);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  // --- state: my plans list ---
  const [myPlans, setMyPlans] = useState<SamplePlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // ---- load subjects + (nếu edit mode) load plan cũ ----
  useEffect(() => {
    getSubjects()
      .then((data: any) => setSubjects(toList<Subject>(data)))
      .catch(() => setSubjects([]));

    getSampleLessonPlans()
      .then((data: any) => setMyPlans(toList<SamplePlan>(data)))
      .catch(() => setMyPlans([]))
      .finally(() => setLoadingPlans(false));

    // Edit mode: fill dữ liệu cũ vào form
    if (isEditMode && editId) {
      setIsLoadingEdit(true);
      getSampleLessonPlanById(editId)
        .then((data: any) => {
          setTitle(data.title || '');
          setContent(data.content || '');
          // topic id nếu backend trả về
          if (data.topic?.id) setSelectedTopic(String(data.topic.id));
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

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ---- Format: biến JSON Object từ AI thành văn bản dễ đọc cho textarea ----
  const formatLessonPlan = (data: any): string => {
    // Nếu data không phải object hợp lệ → trả về chuỗi rỗng
    if (!data || typeof data !== 'object') return '';

    let text = '';

    // 1. Tiêu đề bài học
    if (data.title) {
      text += `TIÊU ĐỀ: ${data.title}\n`;
      text += '─'.repeat(50) + '\n\n';
    }

    // 2. Thông tin chung
    if (data.grade || data.durationMinutes) {
      if (data.grade)           text += `Lớp: ${data.grade}\n`;
      if (data.durationMinutes) text += `Thời lượng: ${data.durationMinutes} phút\n`;
      text += '\n';
    }

    // 3. Mục tiêu bài học — lặp qua mảng objectives
    if (Array.isArray(data.objectives) && data.objectives.length > 0) {
      text += 'MỤC TIÊU BÀI HỌC:\n';
      data.objectives.forEach((obj: string, idx: number) => {
        text += `  ${idx + 1}. ${obj}\n`;
      });
      text += '\n';
    }

    // 4. Các hoạt động — lặp qua mảng activities
    // Mỗi activity có: time (số phút) + activity (chuỗi mô tả)
    if (Array.isArray(data.activities) && data.activities.length > 0) {
      text += `CÁC HOẠT ĐỘNG:\n`;
      data.activities.forEach((act: any) => {
        const timeLabel = act.time ? `[${act.time} phút]` : '';
        // Dòng đầu của activity.activity là tên hoạt động
        const lines = (act.activity || '').split('\n');
        const actTitle = lines[0]?.trim() || '';
        const actDetail = lines.slice(1).join('\n').trim();

        text += `\n+ ${timeLabel} ${actTitle}\n`;
        if (actDetail) {
          // Thụt lề nội dung chi tiết vào 2 spaces
          actDetail.split('\n').forEach((line: string) => {
            text += `  ${line}\n`;
          });
        }
      });
      text += '\n';
    }

    // 5. Đánh giá
    if (data.assessment) {
      text += 'ĐÁNH GIÁ:\n';
      text += `  ${data.assessment}\n`;
    }

    return text.trim();
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
      if (isEditMode && editId) {
        // ── UPDATE (PUT) ──
        await updateSampleLessonPlan(editId, { title, content });
        setSavedId(editId); // unlock nút Gửi duyệt
        showToast('Đã cập nhật giáo án!', 'ok');
      } else {
        // ── CREATE (POST) ──
        const res: any = await createSampleLessonPlan({
          title, content, topicId: Number(selectedTopic),
        });
        setSavedId(res?.id || null);
        showToast('Đã lưu thành công!', 'ok');
      }
      getSampleLessonPlans()
        .then((d: any) => setMyPlans(toList<SamplePlan>(d)))
        .catch(() => {});
    } catch {
      showToast('Lưu thất bại — kiểm tra service đang chạy không!', 'err');
    } finally {
      setIsSaving(false);
    }
  };

  // ---- Submit for review ----
  const handleSubmit = async () => {
    if (!savedId) { showToast('Bạn phải lưu trước đã rồi mới gửi duyệt được!', 'err'); return; }
    setIsSubmitting(true);
    try {
      await submitForReview(savedId);
      showToast('Đã gửi Manager duyệt! Chờ kết quả nhé.', 'ok');
      setSavedId(null);
      getSampleLessonPlans()
        .then((d: any) => setMyPlans(toList<SamplePlan>(d)))
        .catch(() => {});
    } catch {
      showToast('Gửi duyệt thất bại!', 'err');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                ? 'Cập nhật nội dung → Lưu → Gửi Manager duyệt lại'
                : 'Chọn bài học → Gọi AI gợi ý → Chỉnh sửa → Gửi Manager duyệt'}
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

              </CardContent>
            </Card>

            {/* Nút AI */}
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="pt-4 space-y-3">
                <p className="text-sm font-medium text-purple-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Gọi AI Gemini gợi ý
                </p>
                <p className="text-xs text-purple-700">
                  AI sẽ tự động sinh nội dung giáo án theo bài học mày đang chọn.
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
              <Button
                id="btn-submit-review"
                variant="outline"
                className="w-full border-green-500 text-green-700 hover:bg-green-50"
                onClick={handleSubmit}
                disabled={isSubmitting || !savedId}
              >
                {isSubmitting
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang gửi...</>
                  : <><Send className="w-4 h-4 mr-2" />Gửi Manager duyệt</>
                }
              </Button>
              {!savedId && (
                <p className="text-xs text-gray-400 text-center">
                  Hãy lưu bài trước, sau đó mới gửi duyệt được nhé!
                </p>
              )}
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
                {savedId && (
                  <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                    Đã lưu bài (ID: #{savedId}) — sẵn sàng gửi duyệt!
                  </div>
                )}
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
                          {p.topic?.name && (
                            <p className="text-xs text-gray-500">{p.topic.name}</p>
                          )}
                        </div>
                        <Badge className={statusColor[p.status] || 'bg-gray-100 text-gray-700'}>
                          {p.status}
                        </Badge>
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
