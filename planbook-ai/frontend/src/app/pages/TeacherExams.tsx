import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Download, Eye, FileText, Loader2, Plus, Trash2 } from 'lucide-react';
import * as examApi from '../api/examApi';
import { escapeHtml, exportWordDocument, openPrintPreview } from '../utils/exportUtils';
import { getFullNameFromToken } from '../utils/jwt';

function parseAnswerKey(answerKey: string) {
  return answerKey
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildExamExportHtml(exam: examApi.ExamItem) {
  const questionBlocks = (exam.questions || [])
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

  const answerItems = parseAnswerKey(exam.answerKey || '')
    .map((answer, index) => `<li>Câu ${index + 1}: <strong>${escapeHtml(answer)}</strong></li>`)
    .join('');

  return `
    <h1>${escapeHtml(exam.title || 'Đề thi trắc nghiệm')}</h1>
    <p><strong>Số câu hỏi:</strong> ${exam.questions?.length || exam.questionCount || 0}</p>
    ${exam.createdAt ? `<p class="muted">Tạo lúc: ${escapeHtml(new Date(exam.createdAt).toLocaleString('vi-VN'))}</p>` : ''}
    <div class="section">
      <h2>Phần đề thi</h2>
      ${questionBlocks || '<p>Chưa có câu hỏi.</p>'}
    </div>
    <div class="section page-break">
      <h2>Đáp án</h2>
      ${answerItems ? `<ol>${answerItems}</ol>` : '<p>Chưa có đáp án.</p>'}
    </div>
  `;
}

export default function TeacherExams() {
  const userName = getFullNameFromToken();
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState<examApi.ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [notice, setNotice] = useState('');

  const loadItems = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const list = await examApi.getExams();
      setItems(Array.isArray(list) ? list : []);
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message || error?.message || 'Không tải được danh sách đề thi.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();

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

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    setErrorMsg('');
    try {
      await examApi.deleteExam(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message || error?.message || 'Không xóa được đề thi.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpen = (id: number) => {
    navigate(`/exam-generator?examId=${id}`);
  };

  const handleExportPdf = (item: examApi.ExamItem) => {
    openPrintPreview(item.title || 'Đề thi trắc nghiệm', buildExamExportHtml(item));
  };

  const handleExportWord = (item: examApi.ExamItem) => {
    exportWordDocument(`de-thi-${item.id}`, item.title || 'Đề thi trắc nghiệm', buildExamExportHtml(item));
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
              <h1 className="mb-2 text-3xl font-bold text-gray-900">Bài kiểm tra của tôi</h1>
              <p className="text-gray-600">Quản lý các bài kiểm tra bạn đã tạo</p>
            </div>
          </div>
          <Link to="/exam-generator">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Tạo bài kiểm tra mới
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
              Danh sách Bài Kiểm Tra
            </CardTitle>
            <CardDescription>Hiển thị tất cả bài kiểm tra bạn đang sở hữu</CardDescription>
          </CardHeader>
          <CardContent>
            {errorMsg ? (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMsg}</div>
            ) : null}

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : items.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                <FileText className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                <p className="font-medium">Chưa có bài kiểm tra nào.</p>
                <p className="mt-1 text-sm">Hãy bấm "Tạo bài kiểm tra mới" để bắt đầu.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <div key={item.id} className="flex flex-col justify-between rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div>
                      <h3 className="mb-1 line-clamp-1 text-lg font-bold text-gray-900">{item.title}</h3>
                      <p className="mb-3 line-clamp-2 text-sm text-gray-500">
                        {item.createdAt ? `Tạo lúc: ${new Date(item.createdAt).toLocaleString('vi-VN')}` : 'Không rõ thời gian'}
                      </p>
                      <Badge variant="outline">{item.questionCount || item.questions?.length || 0} câu</Badge>
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
                      <Button
                        variant="ghost"
                        className="text-red-500 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
