import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Sparkles, Download, Loader2, FileText, ListChecks, Save, Trash2 } from 'lucide-react';
import * as curriculumApi from '../api/curriculumApi';
import * as examApi from '../api/examApi';
import * as questionApi from '../api/questionApi';
import { escapeHtml, exportWordDocument, openPrintPreview } from '../utils/exportUtils';
import { getFullNameFromToken } from '../utils/jwt';

type SubjectItem = { id: number; name: string };
type ChapterItem = { id: number; name: string };
type TopicItem = { id: number; title: string };
const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20];

function getNameFromToken(): string {
  return getFullNameFromToken();
}

function parseAnswerKey(answerKey: string) {
  return answerKey
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function stripAnswerPrefix(value: string) {
  return value.replace(/^\s*[A-Fa-f1-6][.)]\s*/, '').trim();
}

function getQuestionAnswerLetter(question: examApi.ExamQuestion) {
  const answer = question.correctAnswer?.trim() || '';
  const exactAnswerLetter = answer.match(/^[A-D]$/i)?.[0];
  if (exactAnswerLetter) return exactAnswerLetter.toUpperCase();

  const normalizedAnswer = stripAnswerPrefix(answer).toLowerCase();
  const optionIndex = (question.options || []).findIndex((option) =>
    option.trim().toLowerCase() === answer.toLowerCase()
    || stripAnswerPrefix(option).toLowerCase() === normalizedAnswer,
  );
  if (optionIndex >= 0) return String.fromCharCode(65 + optionIndex);

  const prefixedAnswerLetter = answer.match(/^\s*([A-D])[.)]/i)?.[1];
  return prefixedAnswerLetter ? prefixedAnswerLetter.toUpperCase() : '';
}

function getTotalQuestionCount(payload: any) {
  const data = payload?.data ?? payload;
  const total = data?.totalElements ?? data?.total;
  if (Number.isFinite(Number(total))) return Number(total);
  if (Array.isArray(data?.content)) return data.content.length;
  if (Array.isArray(data)) return data.length;
  return null;
}

export default function ExamGenerator() {
  const realName = getNameFromToken();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [savedExams, setSavedExams] = useState<examApi.ExamItem[]>([]);
  const [selectedExam, setSelectedExam] = useState<examApi.ExamItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingExams, setLoadingExams] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingExam, setIsSavingExam] = useState(false);
  const [deletingExamId, setDeletingExamId] = useState<number | null>(null);
  const [pendingDeleteExam, setPendingDeleteExam] = useState<examApi.ExamItem | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [availableQuestionCount, setAvailableQuestionCount] = useState<number | null>(null);

  const [examTitle, setExamTitle] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [questionCount, setQuestionCount] = useState('10');

  const selectedTopic = useMemo(
    () => topics.find((item) => String(item.id) === selectedTopicId) || null,
    [topics, selectedTopicId],
  );

  useEffect(() => {
    void loadReferenceData();
    void loadSavedExams();
  }, []);

  useEffect(() => {
    if (!selectedSubjectId) {
      setChapters([]);
      setSelectedChapterId('');
      return;
    }
    void loadChapters(Number(selectedSubjectId));
  }, [selectedSubjectId]);

  useEffect(() => {
    if (!selectedChapterId) {
      setTopics([]);
      setSelectedTopicId('');
      return;
    }
    void loadTopics(Number(selectedChapterId));
  }, [selectedChapterId]);

  useEffect(() => {
    if (!selectedTopicId) {
      setAvailableQuestionCount(null);
      return;
    }
    void loadAvailableQuestionCount(Number(selectedTopicId));
  }, [selectedTopicId]);

  useEffect(() => {
    if (availableQuestionCount === null || Number(questionCount) <= availableQuestionCount) return;
    const nextOption = QUESTION_COUNT_OPTIONS.filter((count) => count <= availableQuestionCount).pop();
    if (nextOption) {
      setQuestionCount(String(nextOption));
    }
  }, [availableQuestionCount, questionCount]);

  const loadReferenceData = async () => {
    setLoading(true);
    try {
      const subjectList = await curriculumApi.getSubjects();
      const nextSubjects = Array.isArray(subjectList) ? subjectList : [];
      setSubjects(nextSubjects);
      if (nextSubjects[0]) {
        setSelectedSubjectId(String(nextSubjects[0].id));
      }
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message || error?.message || 'Không tải được dữ liệu môn học.');
    } finally {
      setLoading(false);
    }
  };

  const loadChapters = async (subjectId: number) => {
    try {
      const chapterList = await curriculumApi.getChaptersBySubject(subjectId);
      const nextChapters = Array.isArray(chapterList) ? chapterList : [];
      setChapters(nextChapters);
      setSelectedChapterId(nextChapters[0] ? String(nextChapters[0].id) : '');
    } catch {
      setChapters([]);
      setSelectedChapterId('');
    }
  };

  const loadTopics = async (chapterId: number) => {
    try {
      const topicList = await curriculumApi.getTopicsByChapter(chapterId);
      const nextTopics = Array.isArray(topicList) ? topicList : [];
      setTopics(nextTopics);
      setSelectedTopicId(nextTopics[0] ? String(nextTopics[0].id) : '');
    } catch {
      setTopics([]);
      setSelectedTopicId('');
    }
  };

  const loadAvailableQuestionCount = async (topicId: number) => {
    try {
      const response: any = await questionApi.getQuestions({
        topicId,
        status: 'APPROVED',
        page: 0,
        size: 1,
      });
      setAvailableQuestionCount(getTotalQuestionCount(response));
    } catch {
      setAvailableQuestionCount(null);
    }
  };

  const loadSavedExams = async () => {
    setLoadingExams(true);
    try {
      const list = await examApi.getExams();
      const nextExams = Array.isArray(list) ? list : [];
      setSavedExams(nextExams);
      const requestedExamId = Number(searchParams.get('examId') || 0);
      const requestedExam = requestedExamId ? nextExams.find((exam) => exam.id === requestedExamId) : null;
      if (requestedExam) {
        setSelectedExam(requestedExam);
        setExamTitle(requestedExam.title || '');
      } else if (!selectedExam && nextExams[0]) {
        setSelectedExam(nextExams[0]);
      }
    } catch {
      setSavedExams([]);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTopicId) {
      setErrorMsg('Cần chọn bài học trước khi tạo đề thi.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setSaveMsg(null);
    try {
      const createdExam = await examApi.createExam({
        title: examTitle.trim() || undefined,
        topicId: Number(selectedTopicId),
        level: difficulty,
        numQuestions: Number(questionCount),
      });
      setSelectedExam(createdExam);
      setExamTitle(createdExam.title || '');
      setSaveMsg(`Đã lưu đề thi "${createdExam.title}" vào danh sách đề đã lưu.`);
      await loadSavedExams();
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message || error?.message || 'Không tạo được đề thi.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveExam = async () => {
    if (!selectedExam) return;
    setIsSavingExam(true);
    setErrorMsg(null);
    try {
      const saved = await examApi.updateExam(selectedExam.id, {
        title: examTitle.trim() || selectedExam.title,
        questions: selectedExam.questions || [],
      });
      setSelectedExam(saved);
      setSavedExams((current) => current.map((exam) => exam.id === saved.id ? saved : exam));
      setSaveMsg(`Đã lưu cập nhật đề thi "${saved.title}".`);
      navigate('/teacher/exams', {
        state: {
          notice: `Đã lưu đề thi "${saved.title}" vào danh sách bài kiểm tra.`,
        },
      });
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message || error?.message || 'Không lưu được đề thi.');
    } finally {
      setIsSavingExam(false);
    }
  };

  const updateSelectedExam = (patch: Partial<examApi.ExamItem>) => {
    setSelectedExam((current) => current ? { ...current, ...patch } : current);
  };

  const updateExamQuestion = (index: number, patch: Partial<examApi.ExamQuestion>) => {
    setSelectedExam((current) => {
      if (!current) return current;
      const questions = current.questions.map((question, idx) => idx === index ? { ...question, ...patch } : question);
      return {
        ...current,
        questions,
        questionCount: questions.length,
        answerKey: questions.map(getQuestionAnswerLetter).join(','),
      };
    });
  };

  const updateExamOption = (questionIndex: number, optionIndex: number, value: string) => {
    setSelectedExam((current) => {
      if (!current) return current;
      const questions = current.questions.map((question, idx) => idx === questionIndex ? {
        ...question,
        options: question.options.map((option, optIdx) => optIdx === optionIndex ? value : option),
      } : question);
      return {
        ...current,
        questions,
        answerKey: questions.map(getQuestionAnswerLetter).join(','),
      };
    });
  };

  const handleDeleteExam = async (exam: examApi.ExamItem) => {
    setDeletingExamId(exam.id);
    setErrorMsg(null);
    try {
      await examApi.deleteExam(exam.id);
      const nextExams = savedExams.filter((item) => item.id !== exam.id);
      setSavedExams(nextExams);
      if (selectedExam?.id === exam.id) {
        setSelectedExam(nextExams[0] || null);
      }
      setSaveMsg('Đã xóa đề thi khỏi danh sách đã lưu.');
      setPendingDeleteExam(null);
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message || error?.message || 'Không xóa được đề thi.');
    } finally {
      setDeletingExamId(null);
    }
  };

  const activeAnswerKey = selectedExam?.questions?.length
    ? selectedExam.questions.map(getQuestionAnswerLetter)
    : selectedExam ? parseAnswerKey(selectedExam.answerKey) : [];
  const selectedQuestionCount = Number(questionCount);
  const hasEnoughApprovedQuestions =
    availableQuestionCount === null || availableQuestionCount >= selectedQuestionCount;

  const buildExamExportHtml = () => {
    if (!selectedExam) return '';

    const questionBlocks = (selectedExam.questions || [])
      .map((question, index) => {
        const optionItems = (question.options || [])
          .map((option, optionIndex) => `<li>${String.fromCharCode(65 + optionIndex)}. ${escapeHtml(option)}</li>`)
          .join('');

        return `
          <div class="card">
            <h3>Câu ${index + 1}</h3>
            <p>${escapeHtml(question.content || '')}</p>
            <ol type="A">${optionItems}</ol>
          </div>
        `;
      })
      .join('');

    const answerItems = activeAnswerKey
      .map((answer, index) => `<li>Câu ${index + 1}: <strong>${escapeHtml(answer)}</strong></li>`)
      .join('');

    return `
      <h1>${escapeHtml(selectedExam.title || 'Đề thi trắc nghiệm')}</h1>
      <p><strong>Số câu hỏi:</strong> ${selectedExam.questions?.length || 0}</p>
      ${selectedExam.createdAt ? `<p class="muted">Tạo lúc: ${escapeHtml(new Date(selectedExam.createdAt).toLocaleString('vi-VN'))}</p>` : ''}

      <div class="section">
        <h2>Phần đề thi</h2>
        ${questionBlocks || '<p>Chưa có câu hỏi.</p>'}
      </div>

      <div class="section page-break">
        <h2>Đáp án</h2>
        ${answerItems ? `<ol>${answerItems}</ol>` : '<p>Chưa có đáp án.</p>'}
      </div>
    `;
  };

  const handleExportExamPdf = () => {
    if (!selectedExam) return;
    openPrintPreview(selectedExam.title || 'Đề thi trắc nghiệm', buildExamExportHtml());
  };

  const handleExportExamWord = () => {
    if (!selectedExam) return;
    exportWordDocument(
      `de-thi-${selectedExam.id}`,
      selectedExam.title || 'Đề thi trắc nghiệm',
      buildExamExportHtml(),
    );
  };

  return (
    <DashboardLayout role="teacher" userName={realName}>
      {pendingDeleteExam ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-full bg-red-50 p-2 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Xóa đề thi?</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Đề "{pendingDeleteExam.title}" sẽ bị xóa khỏi danh sách đề đã lưu.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPendingDeleteExam(null)} disabled={deletingExamId === pendingDeleteExam.id}>
                Giữ lại
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={() => handleDeleteExam(pendingDeleteExam)} disabled={deletingExamId === pendingDeleteExam.id}>
                {deletingExamId === pendingDeleteExam.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Xóa đề
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/teacher">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tạo đề kiểm tra trắc nghiệm</h1>
            <p className="text-gray-600">Lấy câu hỏi đã được duyệt từ ngân hàng câu hỏi để tạo đề kiểm tra</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Cấu hình đề kiểm tra
              </CardTitle>
              <CardDescription>Chọn bài học và độ khó để hệ thống trộn câu hỏi tự động.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tiêu đề đề kiểm tra</Label>
                <Input
                  placeholder="Ví dụ: Kiểm tra 15 phút - Bài phản ứng oxi hóa khử"
                  value={examTitle}
                  onChange={(event) => setExamTitle(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Môn học</Label>
                <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={String(subject.id)}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Chương</Label>
                <Select value={selectedChapterId} onValueChange={setSelectedChapterId} disabled={!chapters.length}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chương" />
                  </SelectTrigger>
                  <SelectContent>
                    {chapters.map((chapter) => (
                      <SelectItem key={chapter.id} value={String(chapter.id)}>
                        {chapter.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Bài học</Label>
                <Select value={selectedTopicId} onValueChange={setSelectedTopicId} disabled={!topics.length}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn bài học" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={String(topic.id)}>
                        {topic.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Độ khó</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Dễ</SelectItem>
                      <SelectItem value="MEDIUM">Trung bình</SelectItem>
                      <SelectItem value="HARD">Khó</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Số câu hỏi</Label>
                  <Select value={questionCount} onValueChange={setQuestionCount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUESTION_COUNT_OPTIONS.map((count) => (
                        <SelectItem
                          key={count}
                          value={String(count)}
                          disabled={availableQuestionCount !== null && count > availableQuestionCount}
                        >
                          {count} câu
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {availableQuestionCount !== null ? (
                <div className="rounded-lg border bg-slate-50 p-3 text-sm text-gray-600">
                  Bài này hiện có {availableQuestionCount} câu hỏi đã duyệt trong ngân hàng câu hỏi.
                </div>
              ) : null}

              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" onClick={handleGenerate} disabled={isGenerating || !hasEnoughApprovedQuestions}>
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tạo đề thi...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Tạo đề thi
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleSaveExam}
                disabled={!selectedExam || isSavingExam}
              >
                {isSavingExam ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Lưu đề thi
              </Button>

              {selectedTopic ? (
                <div className="rounded-lg border bg-slate-50 p-3 text-xs text-slate-600">
                  Đề sẽ lấy câu hỏi đã duyệt thuộc bài <span className="font-semibold">{selectedTopic.title}</span>.
                </div>
              ) : null}

              {errorMsg ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {errorMsg}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Xem trước đề thi</CardTitle>
                  <CardDescription>Đề mới tạo và các đề đã lưu của giáo viên.</CardDescription>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={handleSaveExam} disabled={!selectedExam || isSavingExam}>
                    {isSavingExam ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Lưu đề thi
                  </Button>
                {selectedExam ? (
                  <>
                  <Button variant="outline" size="sm" onClick={handleExportExamPdf}>
                    <Download className="w-4 h-4 mr-2" />
                    Xuất PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportExamWord}>
                    <Download className="w-4 h-4 mr-2" />
                    Xuất Word
                  </Button>
                  </>
                ) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {saveMsg ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  {saveMsg}
                </div>
              ) : null}

              {loadingExams ? (
                <div className="flex items-center justify-center py-10 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Đang tải danh sách đề thi...
                </div>
              ) : savedExams.length === 0 && !selectedExam ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-6 rounded-full mb-4">
                    <FileText className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có đề thi nào</h3>
                  <p className="text-gray-600 max-w-md">
                    Chọn chương, bài học và bấm tạo đề để hệ thống lấy câu hỏi thật từ ngân hàng.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-3 md:grid-cols-2">
                    {savedExams.map((exam) => (
                      <div
                        key={exam.id}
                        className={`flex items-start justify-between gap-3 rounded-xl border p-4 transition ${selectedExam?.id === exam.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-200'}`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedExam(exam);
                            setExamTitle(exam.title || '');
                          }}
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate font-semibold text-gray-900">{exam.title}</p>
                            <Badge variant="outline">{exam.questionCount || exam.questions?.length || 0} câu</Badge>
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            {exam.createdAt ? new Date(exam.createdAt).toLocaleString('vi-VN') : 'Không rõ thời gian'}
                          </p>
                        </button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                          onClick={() => setPendingDeleteExam(exam)}
                          disabled={deletingExamId === exam.id}
                          title="Xóa đề thi"
                        >
                          {deletingExamId === exam.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    ))}
                  </div>

                  {selectedExam ? (
                    <div className="space-y-6">
                      <div className="border-b-2 border-gray-300 pb-6 text-center">
                        <Label className="mb-2 block text-left">Tiêu đề đề thi</Label>
                        <Input
                          className="mx-auto mb-3 max-w-2xl text-center text-lg font-semibold"
                          value={examTitle || selectedExam.title}
                          onChange={(event) => {
                            setExamTitle(event.target.value);
                            updateSelectedExam({ title: event.target.value });
                          }}
                        />
                        <div className="flex justify-center gap-2 flex-wrap">
                          <Badge variant="outline">{selectedExam.questions?.length || 0} câu hỏi</Badge>
                          <Badge className="bg-blue-100 text-blue-700">{difficulty}</Badge>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {selectedExam.questions?.map((question, index) => (
                          <div key={`${question.id}-${index}`} className="rounded-lg border-2 bg-white p-5">
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div className="flex flex-1 items-start gap-2">
                                <span className="mt-2 text-lg font-bold text-gray-900">{index + 1}.</span>
                                <Textarea
                                  value={question.content}
                                  onChange={(event) => updateExamQuestion(index, { content: event.target.value })}
                                  placeholder="Nội dung câu hỏi..."
                                  rows={2}
                                />
                              </div>
                              {question.difficultyLevel ? <Badge>{question.difficultyLevel}</Badge> : null}
                            </div>
                            <div className="ml-6 mt-3 space-y-2">
                              {question.options?.map((option, optionIndex) => (
                                <div key={`${question.id}-${optionIndex}`} className="flex items-center gap-3 rounded p-2 hover:bg-gray-50">
                                  <span className="min-w-[24px] font-medium">{String.fromCharCode(65 + optionIndex)}.</span>
                                  <Input
                                    value={option}
                                    onChange={(event) => updateExamOption(index, optionIndex, event.target.value)}
                                  />
                                </div>
                              ))}
                              <div className="grid gap-3 pt-2 md:grid-cols-[180px_1fr]">
                                <div className="space-y-2">
                                  <Label>Đáp án đúng</Label>
                                  <Select
                                    value={getQuestionAnswerLetter(question) || question.correctAnswer || 'A'}
                                    onValueChange={(value) => updateExamQuestion(index, { correctAnswer: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {(question.options || []).map((_, optionIndex) => (
                                        <SelectItem key={optionIndex} value={String.fromCharCode(65 + optionIndex)}>
                                          {String.fromCharCode(65 + optionIndex)}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Giải thích</Label>
                                  <Textarea
                                    value={question.explanation || ''}
                                    onChange={(event) => updateExamQuestion(index, { explanation: event.target.value })}
                                    placeholder="Giải thích ngắn..."
                                    rows={2}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6">
                        <h3 className="mb-4 text-lg font-bold text-green-900">Đáp án</h3>
                        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                          {activeAnswerKey.map((answer, index) => (
                            <div key={`${answer}-${index}`} className="rounded border border-green-300 bg-white p-3">
                              <span className="font-semibold">Câu {index + 1}:</span>{' '}
                              <span className="font-bold text-green-700">{answer}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-green-600" />
              Luồng tiếp theo
            </CardTitle>
            <CardDescription>Sau khi có đề thi, chuyển sang OCR để chấm bài học sinh.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/ocr-grading">
              <Button className="bg-green-600 hover:bg-green-700">Mở chấm điểm OCR</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
