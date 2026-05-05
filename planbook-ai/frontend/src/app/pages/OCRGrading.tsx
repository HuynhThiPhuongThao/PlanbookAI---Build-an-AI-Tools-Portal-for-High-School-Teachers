import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Input } from '../components/ui/input';
import { AlertCircle, ArrowLeft, Upload, ScanLine, CheckCircle, Loader2, Eye, X } from 'lucide-react';
import * as examApi from '../api/examApi';
import { getFullNameFromToken } from '../utils/jwt';

interface DisplayError {
  title: string;
  message: string;
  detail?: string;
  status?: number;
  service?: string;
}

function getNameFromToken(): string {
  return getFullNameFromToken();
}

function scoreToPercent(score?: number) {
  return score ? Math.round((score / 10) * 100) : 0;
}

function formatFeedback(feedback?: string) {
  const value = String(feedback || '').trim();
  const wrongAnswerMatch = value.match(/^Dung\s+(\d+)\/(\d+)\s+cau\.\s+Sai cac cau:\s*(.+)\.$/i);
  if (wrongAnswerMatch) {
    return `Đúng ${wrongAnswerMatch[1]}/${wrongAnswerMatch[2]} câu. Sai các câu: ${wrongAnswerMatch[3]}.`;
  }
  if (/^Lam bai rat tot\. Khong co cau nao sai\.$/i.test(value)) {
    return 'Làm bài rất tốt. Không có câu nào sai.';
  }
  return value;
}

function stringifyDetail(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function normalizeOcrError(error: any, fallback: string): DisplayError {
  const data = error?.response?.data;
  const status = error?.response?.status;
  const rawMessage = data?.message || data?.detail || error?.message || fallback;
  const detail = stringifyDetail(data) || stringifyDetail(error?.toJSON?.());

  let service = 'Frontend';
  if (String(rawMessage).includes('ai-service') || String(detail).includes('ai-service')) {
    service = 'AI Service OCR';
  } else if (String(rawMessage).includes('exam-service') || status) {
    service = 'Exam Service';
  }

  let message = String(rawMessage);
  const haystack = `${message} ${detail || ''}`;
  if (haystack.includes('does not support image input')) {
    message = 'Model Gemini đang được gọi không hỗ trợ đọc ảnh. Hãy kiểm tra GEMINI_OCR_MODEL và đảm bảo request OCR đi qua ai-service mới nhất.';
  } else if (haystack.includes('RESOURCE_EXHAUSTED') || haystack.includes('Quota exceeded')) {
    message = 'Gemini API key đã hết quota hoặc chưa bật billing cho model OCR. Đây không phải lỗi ảnh bài làm; hãy đổi API key/model hoặc chờ quota reset.';
  } else if (haystack.includes('API key expired') || haystack.includes('API_KEY_INVALID')) {
    message = 'Gemini API key dùng cho OCR đã hết hạn hoặc không hợp lệ. Hãy đổi GEMINI_API_KEY trong file .env rồi chạy lại ai-service.';
  } else if (haystack.includes('UNAVAILABLE') || haystack.includes('high demand')) {
    message = 'Gemini đang quá tải tạm thời. Vui lòng thử lại sau ít phút hoặc đổi sang model khác.';
  }

  return {
    title: 'Không chấm được bài bằng OCR',
    message,
    detail,
    status,
    service,
  };
}

export default function OCRGrading() {
  const realName = getNameFromToken();
  const [exams, setExams] = useState<examApi.ExamItem[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<DisplayError | null>(null);
  const [lastSubmission, setLastSubmission] = useState<examApi.SubmissionResult | null>(null);
  const [results, setResults] = useState<examApi.ResultItem[]>([]);

  const selectedExam = useMemo(
    () => exams.find((item) => String(item.id) === selectedExamId) || null,
    [exams, selectedExamId],
  );

  useEffect(() => {
    void loadExams();
  }, []);

  useEffect(() => {
    if (!selectedExamId) {
      setResults([]);
      return;
    }
    void loadResults(Number(selectedExamId));
  }, [selectedExamId]);

  const loadExams = async () => {
    setLoading(true);
    try {
      const list = await examApi.getExams();
      const nextExams = Array.isArray(list) ? list : [];
      setExams(nextExams);
      if (nextExams[0]) {
        setSelectedExamId(String(nextExams[0].id));
      }
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message || error?.message || 'Không tải được đề thi.');
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async (examId: number) => {
    try {
      const list = await examApi.getExamResults(examId);
      setResults(Array.isArray(list) ? list : []);
    } catch {
      setResults([]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedExamId || !studentName.trim() || !selectedFile) {
      setErrorMsg('Cần chọn đề thi, nhập tên học sinh và tải ảnh bài làm.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setOcrError(null);
    try {
      const response = await examApi.submitExamForOcr(Number(selectedExamId), studentName.trim(), selectedFile);
      setLastSubmission(response);
      setStudentName('');
      setSelectedFile(null);
      await loadResults(Number(selectedExamId));
    } catch (error: any) {
      const nextError = normalizeOcrError(error, 'Không chấm được bài bằng OCR.');
      setErrorMsg(nextError.message);
      setOcrError(nextError);
    } finally {
      setIsProcessing(false);
    }
  };

  const averageScore = results.length
    ? (results.reduce((sum, item) => sum + (item.score || 0), 0) / results.length).toFixed(2)
    : '0.00';
  const highestScore = results.length ? Math.max(...results.map((item) => item.score || 0)).toFixed(2) : '0.00';
  const lowestScore = results.length ? Math.min(...results.map((item) => item.score || 0)).toFixed(2) : '0.00';

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
            <h1 className="text-3xl font-bold text-gray-900">Chấm điểm bằng OCR</h1>
            <p className="text-gray-600">Tải bài làm lên, AI đọc đáp án và chấm theo đề thi đã tạo.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin chấm bài</CardTitle>
            <CardDescription>Chức năng này áp dụng cho đề trắc nghiệm đã tạo trong hệ thống.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Đề thi</label>
              <Select value={selectedExamId} onValueChange={setSelectedExamId} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đề thi" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={String(exam.id)}>
                      {exam.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tên học sinh</label>
              <Input value={studentName} onChange={(event) => setStudentName(event.target.value)} placeholder="Ví dụ: Nguyễn Văn An" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Ảnh bài làm</label>
              <Input type="file" accept=".jpg,.jpeg,.png" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} />
            </div>
          </CardContent>
        </Card>

        {selectedExam ? (
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-blue-100 p-3">
                    <ScanLine className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Đề đang chọn</h3>
                    <p className="text-sm text-gray-600">{selectedExam.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{selectedExam.questions?.length || 0} câu hỏi</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-green-100 p-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Đã chấm</h3>
                    <p className="text-sm text-gray-600">{results.length} bài làm</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleSubmit} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang xử lý OCR...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Chấm bài ngay
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {isProcessing ? (
          <Card>
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="rounded-full bg-blue-100 p-6 mb-6">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Đang quét bài làm...</h3>
                <p className="mb-6 text-gray-600">AI đang đọc đáp án từ ảnh và đối chiếu với đáp án của đề thi.</p>
                <div className="w-full max-w-md">
                  <Progress value={70} className="mb-2" />
                  <p className="text-sm text-gray-600">Đang xử lý OCR và chấm điểm</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {errorMsg ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMsg}</div>
        ) : null}

        {ocrError ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b px-5 py-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 rounded-full bg-red-100 p-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{ocrError.title}</h3>
                    <p className="text-sm text-gray-500">
                      Service: {ocrError.service || 'Không xác định'}
                      {ocrError.status ? ` · HTTP ${ocrError.status}` : ''}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOcrError(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4 px-5 py-4">
                <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-800">
                  {ocrError.message}
                </div>
                {ocrError.detail ? (
                  <div>
                    <div className="mb-2 text-sm font-medium text-gray-700">Chi tiết lỗi kỹ thuật</div>
                    <pre className="max-h-72 overflow-auto rounded-lg bg-gray-950 p-3 text-xs text-gray-100 whitespace-pre-wrap">
                      {ocrError.detail}
                    </pre>
                  </div>
                ) : null}
              </div>
              <div className="flex justify-end gap-2 border-t px-5 py-4">
                <Button variant="outline" onClick={() => setOcrError(null)}>Đóng</Button>
              </div>
            </div>
          </div>
        ) : null}

        {lastSubmission ? (
          <Card>
            <CardHeader>
              <CardTitle>Kết quả chấm mới nhất</CardTitle>
              <CardDescription>{lastSubmission.studentName}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border bg-slate-50 p-4">
                <div className="text-sm text-gray-500">Điểm</div>
                <div className="text-3xl font-bold text-blue-600">{lastSubmission.score}</div>
              </div>
              <div className="rounded-lg border bg-slate-50 p-4">
                <div className="text-sm text-gray-500">Đúng</div>
                <div className="text-3xl font-bold text-green-600">
                  {lastSubmission.correctCount || 0}/{lastSubmission.totalQuestions || 0}
                </div>
              </div>
              <div className="rounded-lg border bg-slate-50 p-4">
                <div className="text-sm text-gray-500">Sai</div>
                <div className="text-xl font-bold text-orange-600">{lastSubmission.wrongQuestionIds || 'Không có'}</div>
              </div>
              <div className="rounded-lg border bg-slate-50 p-4">
                <div className="text-sm text-gray-500">Nhận xét</div>
                <div className="text-sm font-medium text-gray-800">{formatFeedback(lastSubmission.feedback)}</div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600 mb-1">Bài đã chấm</div>
              <div className="text-3xl font-bold text-gray-900">{results.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600 mb-1">Điểm trung bình</div>
              <div className="text-3xl font-bold text-blue-600">{averageScore}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600 mb-1">Cao nhất</div>
              <div className="text-3xl font-bold text-green-600">{highestScore}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600 mb-1">Thấp nhất</div>
              <div className="text-3xl font-bold text-orange-600">{lowestScore}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kết quả của đề thi</CardTitle>
            <CardDescription>Danh sách bài làm đã chấm bằng OCR.</CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="py-10 text-center text-gray-500">Chưa có bài làm nào được chấm.</div>
            ) : (
              <div className="space-y-3">
                {results.map((result) => (
                  <div key={result.resultId} className="rounded-lg border p-4 hover:bg-gray-50">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{result.studentName}</p>
                        <p className="text-sm text-gray-500">{formatFeedback(result.feedback)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-blue-100 text-blue-700">{scoreToPercent(result.score)}%</Badge>
                        <span className="font-semibold text-gray-900">{result.score}/10</span>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Chi tiết
                        </Button>
                      </div>
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
