import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Sparkles, Download, Eye, Loader2, Save, Trash2 } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { escapeHtml, exportWordDocument, openPrintPreview } from '../utils/exportUtils';
import { getFullNameFromToken } from '../utils/jwt';

type ExerciseQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
};

type RawExerciseQuestion = Partial<ExerciseQuestion> & {
  content?: string;
  answer?: string;
  correct_answer?: string;
  correctOption?: string | number;
  correct_option?: string | number;
  answerKey?: string;
};

type GeneratedExercise = {
  title: string;
  subject: string;
  grade: string;
  difficulty: string;
  questions: ExerciseQuestion[];
};

type SavedExercise = GeneratedExercise & {
  id: string;
  topic: string;
  savedAt: string;
};

const GENERATED_QUESTION_COUNT_KEY = 'planbookai.generatedQuestionCount';
const SAVED_EXERCISES_KEY = 'planbookai.savedExercises';

function addGeneratedQuestionCount(count: number) {
  if (count <= 0) return;

  const current = Number(localStorage.getItem(GENERATED_QUESTION_COUNT_KEY) || 0);
  const next = current + count;
  localStorage.setItem(GENERATED_QUESTION_COUNT_KEY, String(next));
  window.dispatchEvent(new CustomEvent('generatedQuestionsUpdated', { detail: { count: next } }));
}

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

function stringifyError(value: unknown) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function getExerciseErrorMessage(error: any) {
  const data = error?.response?.data;
  const status = error?.response?.status;
  const rawMessage = data?.detail || data?.message || error?.message || 'Không tạo được bài tập bằng AI.';
  const rawDetail = `${stringifyError(rawMessage)} ${stringifyError(data)}`;

  if (
    status === 503 ||
    rawDetail.includes('UNAVAILABLE') ||
    rawDetail.includes('high demand') ||
    rawDetail.includes('overloaded') ||
    rawDetail.includes('quá tải') ||
    rawDetail.includes('qua tai')
  ) {
    return 'Gemini đang quá tải tạm thời. Vui lòng bấm tạo lại sau ít phút hoặc đổi sang model khác.';
  }

  if (rawDetail.includes('RESOURCE_EXHAUSTED') || rawDetail.includes('Quota exceeded') || rawDetail.includes('quota')) {
    return 'Gemini API key đã hết quota hoặc đang bị giới hạn tần suất. Vui lòng đổi API key/model hoặc chờ quota reset.';
  }

  if (error?.code === 'ECONNABORTED' || rawDetail.includes('timeout')) {
    return 'Tạo bài tập mất quá lâu. Vui lòng thử lại với ít câu hơn hoặc thử lại sau.';
  }

  return String(rawMessage);
}

function stripAnswerPrefix(value: string) {
  return value.replace(/^\s*[A-Fa-f1-6][.)]\s*/, '').trim();
}

function getRawCorrectAnswer(question: RawExerciseQuestion) {
  const candidates = [
    question.correctAnswer,
    question.correct_answer,
    question.answer,
    question.correctOption,
    question.correct_option,
    question.answerKey,
  ];

  const answer = candidates.find((candidate) => candidate !== undefined && candidate !== null && String(candidate).trim());
  return answer === undefined || answer === null ? '' : String(answer).trim();
}

function normalizeExerciseQuestion(question: RawExerciseQuestion, index: number): ExerciseQuestion {
  const options = Array.isArray(question.options)
    ? question.options.map((option) => String(option).trim()).filter(Boolean)
    : [];

  return {
    id: question.id || `q${index + 1}`,
    question: String(question.question || question.content || '').trim(),
    options,
    correctAnswer: getRawCorrectAnswer(question),
    explanation: question.explanation ? String(question.explanation) : '',
  };
}

function getCorrectLetter(question: ExerciseQuestion) {
  const answer = question.correctAnswer?.trim() || '';
  const answerLetter = answer.match(/^([A-Fa-f])(?:[.)\s]|$)/)?.[1];
  if (answerLetter) return answerLetter.toUpperCase();

  if (/^[1-6]$/.test(answer)) {
    return String.fromCharCode(64 + Number(answer));
  }

  if (answer === '0') {
    return 'A';
  }

  const normalizedAnswer = stripAnswerPrefix(answer).toLowerCase();
  const index = question.options.findIndex((option) => {
    const normalizedOption = stripAnswerPrefix(option).toLowerCase();
    return option.trim().toLowerCase() === answer.toLowerCase() || normalizedOption === normalizedAnswer;
  });

  return index >= 0 ? String.fromCharCode(65 + index) : question.correctAnswer;
}

export default function ExerciseCreator() {
  const realName = getFullNameFromToken();
  const [searchParams] = useSearchParams();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedExercise, setGeneratedExercise] = useState<GeneratedExercise | null>(null);
  const [savedExercises, setSavedExercises] = useState<SavedExercise[]>(() => readSavedExercises());
  const [isSavingExercise, setIsSavingExercise] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [subject, setSubject] = useState('Hóa học');
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('10');
  const [questionCount, setQuestionCount] = useState('5');
  const [difficulty, setDifficulty] = useState('medium');
  const [learningObjectives, setLearningObjectives] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setErrorMsg('Cần nhập chủ đề hoặc bài học trước khi tạo bài tập.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setSaveMsg(null);
    setGeneratedExercise(null);

    try {
      const response: any = await axiosClient.post('/ai/generate-exercise', {
        topic: `${subject} - ${topic}${learningObjectives.trim() ? `\nMục tiêu: ${learningObjectives.trim()}` : ''}`,
        grade,
        difficulty,
        numberOfQuestions: Number(questionCount),
      }, { timeout: 60000 });

      const questions = Array.isArray(response?.questions)
        ? response.questions.map((question: RawExerciseQuestion, index: number) => normalizeExerciseQuestion(question, index))
        : [];
      setGeneratedExercise({
        title: `Bài tập ${topic}`,
        subject,
        grade,
        difficulty,
        questions,
      });
      addGeneratedQuestionCount(questions.length);
    } catch (error: any) {
      setErrorMsg(getExerciseErrorMessage(error));
    } finally {
      setIsGenerating(false);
    }
  };

  const normalizeCorrectAnswer = (question: ExerciseQuestion) => {
    const answer = question.correctAnswer?.trim() || '';
    const letterIndex = ['A', 'B', 'C', 'D', 'E', 'F'].indexOf(answer.toUpperCase());
    if (letterIndex >= 0 && question.options[letterIndex]) {
      return question.options[letterIndex];
    }

    const prefixedLetter = answer.match(/^([A-Fa-f])[.)\s]/)?.[1];
    if (prefixedLetter) {
      const prefixedIndex = prefixedLetter.toUpperCase().charCodeAt(0) - 65;
      if (question.options[prefixedIndex]) {
        return question.options[prefixedIndex];
      }
    }

    if (/^[1-6]$/.test(answer)) {
      const numericIndex = Number(answer) - 1;
      if (question.options[numericIndex]) {
        return question.options[numericIndex];
      }
    }

    if (answer === '0' && question.options[0]) {
      return question.options[0];
    }

    return answer;
  };

  const buildExerciseExportHtml = () => {
    if (!generatedExercise) return '';

    const questionsHtml = generatedExercise.questions
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

    const answersHtml = generatedExercise.questions
      .map((question, index) => `
        <li>
          Câu ${index + 1}: <strong>${escapeHtml(getCorrectLetter(question) || 'Chưa có đáp án')}</strong>
          ${question.explanation ? `<br /><span class="muted">Giải thích: ${escapeHtml(question.explanation)}</span>` : ''}
        </li>
      `)
      .join('');

    return `
      <h1>${escapeHtml(generatedExercise.title)}</h1>
      <p><strong>Môn học:</strong> ${escapeHtml(generatedExercise.subject)}</p>
      <p><strong>Khối lớp:</strong> ${escapeHtml(generatedExercise.grade)}</p>
      <p><strong>Độ khó:</strong> ${escapeHtml(generatedExercise.difficulty)}</p>
      <p><strong>Số câu:</strong> ${generatedExercise.questions.length}</p>

      <div class="section">
        <h2>Câu hỏi</h2>
        ${questionsHtml || '<p>Chưa có câu hỏi.</p>'}
      </div>

      <div class="section page-break">
        <h2>Đáp án</h2>
        ${answersHtml ? `<ol>${answersHtml}</ol>` : '<p>Chưa có đáp án.</p>'}
      </div>
    `;
  };

  const handleExportExercisePdf = () => {
    if (!generatedExercise) return;
    openPrintPreview(generatedExercise.title, buildExerciseExportHtml());
  };

  const handleExportExerciseWord = () => {
    if (!generatedExercise) return;
    exportWordDocument(
      `bai-tap-${topic || 'planbook-ai'}`,
      generatedExercise.title,
      buildExerciseExportHtml(),
    );
  };

  const handleSaveExercise = () => {
    if (!generatedExercise) return;

    setIsSavingExercise(true);
    const saved: SavedExercise = {
      ...generatedExercise,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      topic: topic.trim(),
      savedAt: new Date().toISOString(),
    };
    const next = [saved, ...savedExercises].slice(0, 30);
    writeSavedExercises(next);
    setSavedExercises(next);
    setSaveMsg(`Đã lưu bài tập "${generatedExercise.title}" với ${generatedExercise.questions.length} câu.`);
    window.dispatchEvent(new CustomEvent('savedExercisesUpdated', { detail: { count: next.length } }));
    setIsSavingExercise(false);
  };

  const handleDeleteSavedExercise = (id: string) => {
    const next = savedExercises.filter((item) => item.id !== id);
    writeSavedExercises(next);
    setSavedExercises(next);
    window.dispatchEvent(new CustomEvent('savedExercisesUpdated', { detail: { count: next.length } }));
  };

  const handleOpenSavedExercise = (item: SavedExercise) => {
    setGeneratedExercise({
      title: item.title,
      subject: item.subject,
      grade: item.grade,
      difficulty: item.difficulty,
      questions: item.questions,
    });
    setSubject(item.subject);
    setTopic(item.topic || item.title.replace(/^Bài tập\s*/i, ''));
    setGrade(item.grade);
    setDifficulty(item.difficulty);
    setQuestionCount(String(item.questions.length || questionCount));
    setSaveMsg(`Đang mở bài tập đã lưu "${item.title}".`);
    setErrorMsg(null);
  };

  useEffect(() => {
    const savedExerciseId = searchParams.get('savedExerciseId');
    if (!savedExerciseId) return;

    const item = readSavedExercises().find((exercise) => exercise.id === savedExerciseId);
    if (item) {
      handleOpenSavedExercise(item);
    }
  }, [searchParams]);

  const renderSavedExercises = () => (
    <div className="rounded-lg border bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">Bài tập đã lưu</h3>
          <p className="text-sm text-gray-500">Bấm vào một bài để mở lại nội dung đã lưu.</p>
        </div>
        <Badge variant="outline">{savedExercises.length} bài</Badge>
      </div>

      {savedExercises.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-white p-4 text-sm text-gray-500">
          Chưa có bài tập nào được lưu. Sau khi AI tạo bài, bấm "Lưu bài tập" để đưa vào danh sách này.
        </div>
      ) : (
        <div className="grid gap-2">
          {savedExercises.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2">
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => handleOpenSavedExercise(item)}
              >
                <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500">
                  {item.questions.length} câu · Khối {item.grade} · {new Date(item.savedAt).toLocaleString('vi-VN')}
                </p>
              </button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                onClick={() => handleDeleteSavedExercise(item.id)}
                title="Xóa bài tập đã lưu"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout role="teacher" userName={realName}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/teacher">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tạo bài tập</h1>
            <p className="text-gray-600">Sinh bài tập trắc nghiệm bằng Gemini AI theo chủ đề và độ khó.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Cấu hình bài tập
              </CardTitle>
              <CardDescription>Thông tin này được gửi trực tiếp tới AI service.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Môn học</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hóa học">Hóa học</SelectItem>
                    <SelectItem value="Vật lý">Vật lý</SelectItem>
                    <SelectItem value="Sinh học">Sinh học</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Chủ đề / bài học</Label>
                <Input
                  placeholder="Ví dụ: Cân bằng phương trình hóa học"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Khối lớp</Label>
                  <Select value={grade} onValueChange={setGrade}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">Khối 10</SelectItem>
                      <SelectItem value="11">Khối 11</SelectItem>
                      <SelectItem value="12">Khối 12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Số câu</Label>
                  <Select value={questionCount} onValueChange={setQuestionCount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 câu</SelectItem>
                      <SelectItem value="5">5 câu</SelectItem>
                      <SelectItem value="8">8 câu</SelectItem>
                      <SelectItem value="10">10 câu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Độ khó</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Dễ</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="hard">Khó</SelectItem>
                    <SelectItem value="mixed">Trộn mức độ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mục tiêu học tập</Label>
                <Textarea
                  placeholder="Ví dụ: học sinh nhận biết chất oxi hóa, chất khử và cân bằng phản ứng..."
                  rows={3}
                  value={learningObjectives}
                  onChange={(event) => setLearningObjectives(event.target.value)}
                />
              </div>

              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tạo bài tập...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Tạo bài tập
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleSaveExercise}
                disabled={!generatedExercise || isSavingExercise}
              >
                {isSavingExercise ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Lưu bài tập
              </Button>

              {errorMsg ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {errorMsg}
                </div>
              ) : null}

              <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-900">
                AI sẽ trả về câu hỏi trắc nghiệm gồm 4 lựa chọn, đáp án đúng và giải thích ngắn.
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bài tập đã tạo</CardTitle>
                  <CardDescription>Xem câu hỏi và đáp án trước khi xuất cho học sinh.</CardDescription>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={handleSaveExercise} disabled={!generatedExercise || isSavingExercise}>
                    {isSavingExercise ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Lưu bài tập
                  </Button>
                  {generatedExercise ? (
                    <>
                    <Button variant="outline" size="sm" onClick={handleExportExercisePdf}>
                      <Eye className="w-4 h-4 mr-2" />
                      Xuất PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportExerciseWord}>
                      <Download className="w-4 h-4 mr-2" />
                      Xuất Word
                    </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderSavedExercises()}
              {!generatedExercise ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-6 rounded-full mb-4">
                    <Sparkles className="w-12 h-12 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có bài tập</h3>
                  <p className="text-gray-600 max-w-md">Nhập chủ đề ở bên trái và bấm tạo để gọi AI service thật.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{generatedExercise.title}</h2>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{generatedExercise.subject}</Badge>
                      <Badge variant="outline">Khối {generatedExercise.grade}</Badge>
                      <Badge className="bg-purple-100 text-purple-700">{generatedExercise.questions.length} câu</Badge>
                      <Badge className="bg-blue-100 text-blue-700">{generatedExercise.difficulty}</Badge>
                    </div>
                    {saveMsg ? (
                      <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                        {saveMsg}
                      </div>
                    ) : null}
                  </div>

                  <Tabs defaultValue="questions" className="w-full">
                    <TabsList>
                      <TabsTrigger value="questions">Câu hỏi</TabsTrigger>
                      <TabsTrigger value="answers">Đáp án</TabsTrigger>
                    </TabsList>

                    <TabsContent value="questions" className="space-y-6 mt-6">
                      {generatedExercise.questions.map((question, index) => (
                        <div key={question.id || index} className="rounded-lg border bg-white p-4">
                          <div className="mb-3">
                            <span className="font-bold text-gray-900">Câu {index + 1}.</span>
                            <span className="ml-2 text-gray-900">{question.question}</span>
                          </div>
                          <div className="ml-4 space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <div key={`${question.id}-${optionIndex}`} className="flex gap-3 rounded p-2 hover:bg-gray-50">
                                <span className="min-w-6 font-medium">{String.fromCharCode(65 + optionIndex)}.</span>
                                <span>{option}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <h3 className="mb-3 font-bold text-green-900">Đáp án</h3>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {generatedExercise.questions.map((question, index) => (
                            <div key={`answer-${question.id || index}`} className="rounded border border-green-200 bg-white px-3 py-2 text-sm">
                              <span className="font-semibold text-gray-900">Câu {index + 1}:</span>{' '}
                              <span className="font-bold text-green-700">{getCorrectLetter(question) || 'Chưa có đáp án'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="answers" className="space-y-4 mt-6">
                      {generatedExercise.questions.map((question, index) => (
                        <div key={question.id || index} className="rounded-lg border border-green-200 bg-green-50 p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="font-bold text-gray-900">Câu {index + 1}</span>
                            <Badge className="bg-green-600 text-white">Đáp án {getCorrectLetter(question) || 'chưa có'}</Badge>
                          </div>
                          <p className="mb-3 text-gray-900">{question.question}</p>
                          <div className="rounded-lg bg-white p-3">
                            <p className="text-sm font-medium text-green-700 mb-1">Đáp án đúng:</p>
                            <p className="text-gray-900">{normalizeCorrectAnswer(question) || 'Chưa có đáp án'}</p>
                            {question.explanation ? (
                              <p className="mt-2 text-sm text-gray-600">Giải thích: {question.explanation}</p>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>

                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
