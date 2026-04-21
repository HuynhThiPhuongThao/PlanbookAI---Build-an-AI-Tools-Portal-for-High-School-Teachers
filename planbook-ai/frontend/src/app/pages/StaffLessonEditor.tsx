import { useState, useEffect } from 'react';
import { Link } from 'react-router';
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
  ChevronRight, CheckCircle, Clock, FileText,
} from 'lucide-react';
import React from 'react';
import {
  getSubjects, getChaptersBySubject, getTopicsByChapter,
  createSampleLessonPlan, submitForReview, aiGenerateLessonPlan,
  getSampleLessonPlans,
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

// ---- types ----
interface Subject { id: number; name: string; }
interface Chapter { id: number; name: string; }
interface Topic   { id: number; name: string; }
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
  const [savedId,       setSavedId]       = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  // --- state: my plans list ---
  const [myPlans, setMyPlans] = useState<SamplePlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // ---- load subjects on mount ----
  useEffect(() => {
    getSubjects()
      .then((data: any) => setSubjects(Array.isArray(data) ? data : []))
      .catch(() => setSubjects([]));
    // Load my plans
    getSampleLessonPlans()
      .then((data: any) => setMyPlans(Array.isArray(data) ? data : []))
      .catch(() => setMyPlans([]))
      .finally(() => setLoadingPlans(false));
  }, []);

  // ---- load chapters when subject changes ----
  useEffect(() => {
    if (!selectedSubject) { setChapters([]); setTopics([]); return; }
    setChapters([]); setTopics([]);
    setSelectedChapter(''); setSelectedTopic('');
    getChaptersBySubject(Number(selectedSubject))
      .then((data: any) => setChapters(Array.isArray(data) ? data : []))
      .catch(() => setChapters([]));
  }, [selectedSubject]);

  // ---- load topics when chapter changes ----
  useEffect(() => {
    if (!selectedChapter) { setTopics([]); return; }
    setTopics([]); setSelectedTopic('');
    getTopicsByChapter(Number(selectedChapter))
      .then((data: any) => setTopics(Array.isArray(data) ? data : []))
      .catch(() => setTopics([]));
  }, [selectedChapter]);

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ---- AI generate ----
  const handleAI = async () => {
    const topicObj = topics.find(t => String(t.id) === selectedTopic);
    const subjectObj = subjects.find(s => String(s.id) === selectedSubject);
    if (!topicObj) { showToast('Vui lòng chọn bài (Topic) trước!', 'err'); return; }
    setIsGenerating(true);
    try {
      const res: any = await aiGenerateLessonPlan({
        topic: topicObj.name,
        subject: subjectObj?.name || '',
        grade: 'Trung học phổ thông',
      });
      // ai-service trả về JSON có field content hoặc lesson_plan
      const aiContent = res?.content || res?.lesson_plan ||
        JSON.stringify(res, null, 2);
      setContent(aiContent);
      if (!title) setTitle(`Giáo án mẫu: ${topicObj.name}`);
      showToast('AI đã sinh nội dung! Kiểm tra và chỉnh sửa trước khi lưu.', 'ok');
    } catch (e: any) {
      showToast('AI đang bận — thử lại sau hoặc nhập tay nha!', 'err');
    } finally {
      setIsGenerating(false);
    }
  };

  // ---- Save draft ----
  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      showToast('Điền tiêu đề và nội dung trước đã!', 'err'); return;
    }
    if (!selectedTopic) {
      showToast('Chọn bài (Topic) để gán giáo án!', 'err'); return;
    }
    setIsSaving(true);
    try {
      const res: any = await createSampleLessonPlan({
        title, content, topicId: Number(selectedTopic),
      });
      setSavedId(res?.id || null);
      showToast('Đã lưu nháp thành công!', 'ok');
      // refresh list
      getSampleLessonPlans()
        .then((d: any) => setMyPlans(Array.isArray(d) ? d : []))
        .catch(() => {});
    } catch {
      showToast('Lưu thất bại — kiểm tra service đang chạy không!', 'err');
    } finally {
      setIsSaving(false);
    }
  };

  // ---- Submit for review ----
  const handleSubmit = async () => {
    if (!savedId) { showToast('Lưu nháp trước đã rồi mới gửi duyệt được!', 'err'); return; }
    setIsSubmitting(true);
    try {
      await submitForReview(savedId);
      showToast('Đã gửi Manager duyệt! Chờ kết quả nhé.', 'ok');
      setSavedId(null);
      getSampleLessonPlans()
        .then((d: any) => setMyPlans(Array.isArray(d) ? d : []))
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
            <h1 className="text-3xl font-bold text-gray-900">Soạn Giáo Án Mẫu</h1>
            <p className="text-gray-600">Chọn bài học → Gọi AI gợi ý → Chỉnh sửa → Gửi Manager duyệt</p>
          </div>
        </div>

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
                            <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
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
                  : <><Save className="w-4 h-4 mr-2" />Lưu nháp</>
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
                  Lưu nháp trước, sau đó mới gửi duyệt được nhé!
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
                    Đã lưu nháp (ID: #{savedId}) — sẵn sàng gửi duyệt!
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
