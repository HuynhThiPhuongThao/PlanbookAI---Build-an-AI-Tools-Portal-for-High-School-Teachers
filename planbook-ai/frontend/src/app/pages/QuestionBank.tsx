import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Eye, Loader2, Plus, Search, Sparkles } from 'lucide-react';
import * as questionApi from '../api/questionApi';
import { getSubjects, getChaptersBySubject, getTopicsByChapter } from '../api/curriculumApi';
import { getAccessTokenPayload } from '../utils/jwt';

type Role = 'teacher' | 'staff';
type Subject = { id: number; name: string };
type Chapter = { id: number; name: string };
type Topic = { id: number; title?: string; name?: string };

function getTokenPayload(): any {
  return getAccessTokenPayload();
}

function useUserContext() {
  const payload = getTokenPayload();
  const role = String(payload.role || 'TEACHER').toLowerCase() === 'staff' ? 'staff' : 'teacher';
  return {
    role: role as Role,
    userName: payload.fullName || '',
  };
}

function toList<T>(value: any): T[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  return [];
}

function unwrapQuestions(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
}

function getDifficultyColor(diff?: string) {
  switch ((diff || '').toUpperCase()) {
    case 'EASY':
      return 'bg-green-100 text-green-700';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-700';
    case 'HARD':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export default function QuestionBank() {
  const { role, userName } = useUserContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [questions, setQuestions] = useState<any[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  const [formData, setFormData] = useState({
    difficultyLevel: 'MEDIUM',
    content: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
  });

  const selectedSubjectObj = subjects.find((s) => String(s.id) === selectedSubject);
  const selectedTopicObj = topics.find((t) => String(t.id) === selectedTopic);

  const backHref = role === 'staff' ? '/staff' : '/teacher';

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res: any = await questionApi.getQuestions({
        subjectId: selectedSubject ? Number(selectedSubject) : undefined,
        chapterId: selectedChapter ? Number(selectedChapter) : undefined,
        topicId: selectedTopic ? Number(selectedTopic) : undefined,
        difficultyLevel: difficultyFilter === 'all' ? undefined : difficultyFilter,
        keyword: searchTerm || undefined,
        size: 100,
      });
      setQuestions(unwrapQuestions(res));
    } catch (e) {
      console.error(e);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSubjects().then((data: any) => setSubjects(toList<Subject>(data))).catch(() => setSubjects([]));
  }, []);

  useEffect(() => {
    const savedQuestions = Number((location.state as any)?.savedQuestions || 0);
    if (!savedQuestions) return;

    setNotice(`Đã lưu ${savedQuestions} câu hỏi vào danh sách câu hỏi.`);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!selectedSubject) {
      setChapters([]);
      setTopics([]);
      setSelectedChapter('');
      setSelectedTopic('');
      return;
    }
    getChaptersBySubject(Number(selectedSubject))
      .then((data: any) => setChapters(toList<Chapter>(data)))
      .catch(() => setChapters([]));
    setTopics([]);
    setSelectedChapter('');
    setSelectedTopic('');
  }, [selectedSubject]);

  useEffect(() => {
    if (!selectedChapter) {
      setTopics([]);
      setSelectedTopic('');
      return;
    }
    getTopicsByChapter(Number(selectedChapter))
      .then((data: any) => setTopics(toList<Topic>(data)))
      .catch(() => setTopics([]));
    setSelectedTopic('');
  }, [selectedChapter]);

  useEffect(() => {
    fetchQuestions();
  }, [selectedSubject, selectedChapter, selectedTopic, difficultyFilter]);

  const filteredQuestions = useMemo(() => {
    if (!searchTerm.trim()) return questions;
    const q = searchTerm.toLowerCase();
    return questions.filter((item) =>
      String(item.content || '').toLowerCase().includes(q)
      || String(item.topic || '').toLowerCase().includes(q),
    );
  }, [questions, searchTerm]);

  const handleOptionChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt, idx) => (idx === index ? value : opt)),
    }));
  };

  const handleSaveQuestion = async () => {
    if (!selectedSubjectObj || !selectedTopicObj) {
      alert('Chon mon/chuong/bai truoc khi tao cau hoi');
      return;
    }
    if (!formData.content.trim() || !formData.correctAnswer.trim()) {
      alert('Nhap noi dung cau hoi va dap an dung');
      return;
    }

    const cleanOptions = formData.options.map((o) => o.trim()).filter(Boolean);
    if (cleanOptions.length < 4) {
      alert('Can it nhat 4 dap an');
      return;
    }

    setSaving(true);
    try {
      await questionApi.createQuestion({
        content: formData.content,
        subject: selectedSubjectObj.name,
        topic: selectedTopicObj.title || selectedTopicObj.name || '',
        subjectId: Number(selectedSubject),
        chapterId: selectedChapter ? Number(selectedChapter) : undefined,
        topicId: Number(selectedTopic),
        difficultyLevel: formData.difficultyLevel,
        correctAnswer: formData.correctAnswer,
        options: cleanOptions,
        explanation: formData.explanation,
      });
      setDialogOpen(false);
      setFormData({
        difficultyLevel: 'MEDIUM',
        content: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
      });
      setNotice('Đã lưu câu hỏi vào danh sách câu hỏi.');
      fetchQuestions();
    } catch {
      alert('Luu cau hoi that bai');
    } finally {
      setSaving(false);
    }
  };

  const handleAiSuggest = async () => {
    if (!selectedTopicObj) {
      alert('Chon bai hoc truoc khi goi AI');
      return;
    }
    setAiLoading(true);
    try {
      const suggestion: any = await questionApi.aiSuggestQuestion({
        topic: selectedTopicObj.title || selectedTopicObj.name || '',
        difficultyLevel: formData.difficultyLevel,
        description: `Tao cau hoi trac nghiem cho bai ${selectedTopicObj.title || selectedTopicObj.name}`,
        numberOfOptions: 4,
      });
      const aiQuestion = suggestion?.data || suggestion;
      setFormData((prev) => ({
        ...prev,
        content: aiQuestion?.content || prev.content,
        options: Array.isArray(aiQuestion?.options) && aiQuestion.options.length > 0 ? aiQuestion.options : prev.options,
        correctAnswer: aiQuestion?.correctAnswer || prev.correctAnswer,
        explanation: aiQuestion?.explanation || prev.explanation,
      }));
    } catch {
      alert('AI goi y that bai');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <DashboardLayout role={role} userName={userName}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={backHref}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ngan hang Cau hoi</h1>
              <p className="text-gray-600">Quan ly cau hoi theo Mon -&gt; Chuong -&gt; Bai</p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Them cau hoi
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tao cau hoi moi</DialogTitle>
                <DialogDescription>Cau hoi se duoc luu truc tiep vao danh sach cau hoi</DialogDescription>
              </DialogHeader>

              <div className="flex gap-2 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                <Button variant="outline" size="sm" onClick={handleAiSuggest} disabled={aiLoading}>
                  {aiLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  AI goi y
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                <div className="space-y-1">
                  <Label>Mon hoc</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger><SelectValue placeholder="Chon mon" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={String(subject.id)}>{subject.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Chuong</Label>
                  <Select value={selectedChapter} onValueChange={setSelectedChapter} disabled={!selectedSubject}>
                    <SelectTrigger><SelectValue placeholder="Chon chuong" /></SelectTrigger>
                    <SelectContent>
                      {chapters.map((chapter) => (
                        <SelectItem key={chapter.id} value={String(chapter.id)}>{chapter.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Bai hoc</Label>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic} disabled={!selectedChapter}>
                    <SelectTrigger><SelectValue placeholder="Chon bai" /></SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic.id} value={String(topic.id)}>
                          {topic.title || topic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 mt-3">
                <Label>Do kho</Label>
                <Select value={formData.difficultyLevel} onValueChange={(value) => setFormData((prev) => ({ ...prev, difficultyLevel: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">De</SelectItem>
                    <SelectItem value="MEDIUM">Trung binh</SelectItem>
                    <SelectItem value="HARD">Kho</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 mt-3">
                <Label>Noi dung cau hoi</Label>
                <Textarea
                  rows={3}
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                />
              </div>

              <div className="space-y-2 mt-3">
                <Label>Dap an</Label>
                {formData.options.map((option, idx) => (
                  <Input key={idx} value={option} onChange={(e) => handleOptionChange(idx, e.target.value)} placeholder={`Lua chon ${idx + 1}`} />
                ))}
              </div>

              <div className="space-y-2 mt-3">
                <Label>Dap an dung</Label>
                <Input
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData((prev) => ({ ...prev, correctAnswer: e.target.value }))}
                />
              </div>

              <div className="space-y-2 mt-3">
                <Label>Giai thich</Label>
                <Textarea
                  rows={2}
                  value={formData.explanation}
                  onChange={(e) => setFormData((prev) => ({ ...prev, explanation: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 pt-4 border-t mt-4">
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleSaveQuestion} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Luu cau hoi
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                  Huy
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tim kiem & Loc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Tu khoa</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" placeholder="Tim noi dung..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Do kho</Label>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tat ca</SelectItem>
                    <SelectItem value="EASY">De</SelectItem>
                    <SelectItem value="MEDIUM">Trung binh</SelectItem>
                    <SelectItem value="HARD">Kho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full" onClick={fetchQuestions}>
                  Tai lai
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {notice ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {notice}
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Danh sach cau hoi ({filteredQuestions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 flex items-center justify-center text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Dang tai...
              </div>
            ) : filteredQuestions.length === 0 ? (
              <p className="py-10 text-center text-gray-500">Khong co cau hoi nao</p>
            ) : (
              <div className="space-y-3">
                {filteredQuestions.map((question) => (
                  <div key={question.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="outline">{question.subject}</Badge>
                          <Badge variant="outline">{question.topic}</Badge>
                          <Badge className={getDifficultyColor(question.difficultyLevel)}>{question.difficultyLevel}</Badge>
                          <Badge variant="secondary">{question.status}</Badge>
                        </div>
                        <p className="font-medium text-gray-900 line-clamp-2">{question.content}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedQuestion(question)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedQuestion && (
          <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Chi tiet cau hoi</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge variant="outline">{selectedQuestion.subject}</Badge>
                  <Badge variant="outline">{selectedQuestion.topic}</Badge>
                  <Badge className={getDifficultyColor(selectedQuestion.difficultyLevel)}>{selectedQuestion.difficultyLevel}</Badge>
                </div>
                <div>
                  <Label className="font-semibold">Cau hoi</Label>
                  <p className="mt-2 p-3 bg-gray-50 border rounded">{selectedQuestion.content}</p>
                </div>
                {Array.isArray(selectedQuestion.options) && (
                  <div>
                    <Label className="font-semibold">Lua chon</Label>
                    <div className="mt-2 space-y-2">
                      {selectedQuestion.options.map((option: string, index: number) => {
                        const isCorrect = option.trim().toLowerCase() === String(selectedQuestion.correctAnswer || '').trim().toLowerCase();
                        return (
                          <div key={index} className={`p-3 border rounded ${isCorrect ? 'bg-green-50 border-green-300' : 'bg-gray-50'}`}>
                            {String.fromCharCode(65 + index)}. {option}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {selectedQuestion.explanation ? (
                  <div>
                    <Label className="font-semibold">Giai thich</Label>
                    <p className="mt-2 p-3 bg-orange-50 border border-orange-100 rounded">{selectedQuestion.explanation}</p>
                  </div>
                ) : null}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
