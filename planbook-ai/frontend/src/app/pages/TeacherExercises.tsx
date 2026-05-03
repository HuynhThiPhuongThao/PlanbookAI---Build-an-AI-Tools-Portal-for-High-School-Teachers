import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Download, Eye, FileText, Loader2, Plus, Trash2 } from 'lucide-react';
import { escapeHtml, exportWordDocument, openPrintPreview } from '../utils/exportUtils';
import { getFullNameFromToken } from '../utils/jwt';

type ExerciseQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
};

type SavedExercise = {
  id: string;
  title: string;
  subject: string;
  grade: string;
  difficulty: string;
  topic: string;
  savedAt: string;
  questions: ExerciseQuestion[];
};

const SAVED_EXERCISES_KEY = 'planbookai.savedExercises';

function readSavedExercises(): SavedExercise[] {
  try {
    const raw = localStorage.getItem(SAVED_EXERCISES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSavedExercises(items: SavedExercise[]) {
  localStorage.setItem(SAVED_EXERCISES_KEY, JSON.stringify(items));
}

function getCorrectLetter(question: ExerciseQuestion) {
  const answer = question.correctAnswer?.trim() || '';
  const answerLetter = answer.match(/^([A-Fa-f])(?:[.)\s]|$)/)?.[1];
  return answerLetter ? answerLetter.toUpperCase() : answer;
}

function buildExerciseExportHtml(exercise: SavedExercise) {
  const questionsHtml = exercise.questions
    .map((question, index) => {
      const optionsHtml = question.options
        .map((option, optionIndex) => `<li>${String.fromCharCode(65 + optionIndex)}. ${escapeHtml(option)}</li>`)
        .join('');
      return `
        <div class="card">
          <h3>Câu ${index + 1}</h3>
          <p>${escapeHtml(question.question)}</p>
          <ol type="A">${optionsHtml}</ol>
        </div>
      `;
    })
    .join('');

  const answersHtml = exercise.questions
    .map((question, index) => `<li>Câu ${index + 1}: <strong>${escapeHtml(getCorrectLetter(question) || 'Chưa có đáp án')}</strong></li>`)
    .join('');

  return `
    <h1>${escapeHtml(exercise.title)}</h1>
    <p><strong>Môn học:</strong> ${escapeHtml(exercise.subject)}</p>
    <p><strong>Khối lớp:</strong> ${escapeHtml(exercise.grade)}</p>
    <p><strong>Độ khó:</strong> ${escapeHtml(exercise.difficulty)}</p>
    <p><strong>Số câu:</strong> ${exercise.questions.length}</p>
    <div class="section">
      <h2>Câu hỏi</h2>
      ${questionsHtml || '<p>Chưa có câu hỏi.</p>'}
    </div>
    <div class="section page-break">
      <h2>Đáp án</h2>
      ${answersHtml ? `<ol>${answersHtml}</ol>` : '<p>Chưa có đáp án.</p>'}
    </div>
  `;
}

export default function TeacherExercises() {
  const userName = getFullNameFromToken();
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState<SavedExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const loadItems = () => {
    setLoading(true);
    setItems(readSavedExercises());
    setLoading(false);
  };

  useEffect(() => {
    loadItems();

    const routeNotice = (location.state as { notice?: string } | null)?.notice;
    if (routeNotice) {
      setNotice(routeNotice);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const handleDelete = (id: string) => {
    const next = items.filter((item) => item.id !== id);
    writeSavedExercises(next);
    setItems(next);
    window.dispatchEvent(new CustomEvent('savedExercisesUpdated', { detail: { count: next.length } }));
  };

  const handleOpen = (id: string) => {
    navigate(`/exercise-creator?savedExerciseId=${encodeURIComponent(id)}`);
  };

  const handleExportPdf = (item: SavedExercise) => {
    openPrintPreview(item.title || 'Bài tập', buildExerciseExportHtml(item));
  };

  const handleExportWord = (item: SavedExercise) => {
    exportWordDocument(`bai-tap-${item.id}`, item.title || 'Bài tập', buildExerciseExportHtml(item));
  };

  return (
    <DashboardLayout role="teacher" userName={userName}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/teacher">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Bài Tập Của Tôi</h1>
              <p className="text-gray-600">Quản lý các bài tập bạn đã tạo hoặc lưu</p>
            </div>
          </div>
          <Link to="/exercise-creator">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Tạo Bài Tập Mới
            </Button>
          </Link>
        </div>

        {notice ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {notice}
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Danh sách Bài Tập
            </CardTitle>
            <CardDescription>Hiển thị tất cả bài tập bạn đang sở hữu</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : items.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                <FileText className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                <p className="font-medium">Chưa có bài tập nào.</p>
                <p className="mt-1 text-sm">Hãy bấm "Tạo Bài Tập Mới" để bắt đầu.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <div key={item.id} className="flex flex-col justify-between rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div>
                      <h3 className="mb-1 line-clamp-1 text-lg font-bold text-gray-900">{item.title}</h3>
                      <p className="mb-3 line-clamp-2 text-sm text-gray-500">
                        {item.topic ? `Chủ đề: ${item.topic}` : 'Không có chủ đề'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Khối {item.grade}</Badge>
                        <Badge variant="outline">{item.questions.length} câu</Badge>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-4">
                      <Button variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50" onClick={() => handleOpen(item.id)}>
                        <Eye className="mr-2 h-4 w-4" /> Xem / Sửa
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => handleExportPdf(item)}>
                        <Download className="mr-2 h-4 w-4" /> PDF
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => handleExportWord(item)}>
                        <Download className="mr-2 h-4 w-4" /> Word
                      </Button>
                      <Button variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-700" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
