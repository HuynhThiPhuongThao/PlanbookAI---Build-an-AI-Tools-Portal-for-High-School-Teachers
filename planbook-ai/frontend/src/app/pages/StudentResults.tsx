import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, Download } from 'lucide-react';
import * as examApi from '../api/examApi';
import { exportCsv } from '../utils/exportUtils';
import { getFullNameFromToken } from '../utils/jwt';

function getNameFromToken(): string {
  return getFullNameFromToken();
}

function toPercentage(result: examApi.ResultItem) {
  const score = result.score || 0;
  return Math.round((score / 10) * 100);
}

function parseWrongQuestionIds(raw?: string) {
  if (!raw) return [];
  return raw
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0);
}

export default function StudentResults() {
  const realName = getNameFromToken();
  const [exams, setExams] = useState<examApi.ExamItem[]>([]);
  const [selectedExam, setSelectedExam] = useState('all');
  const [results, setResults] = useState<examApi.ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    void loadData('all');
  }, []);

  const loadData = async (examId: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const examList = await examApi.getExams();
      const nextExams = Array.isArray(examList) ? examList : [];
      setExams(nextExams);
      setSelectedExam(examId);

      if (examId === 'all') {
        const allResults = await Promise.all(
          nextExams.map(async (exam) => {
            const examResults = await examApi.getExamResults(exam.id);
            return (Array.isArray(examResults) ? examResults : []).map((result) => ({
              ...result,
              examTitle: result.examTitle || exam.title,
            }));
          }),
        );
        setResults(allResults.flat());
      } else {
        const list = await examApi.getExamResults(Number(examId));
        setResults(Array.isArray(list) ? list : []);
      }
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message || error?.message || 'Không tải được kết quả học sinh.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const metrics = useMemo(() => {
    if (!results.length) {
      return {
        averageScore: 0,
        passRate: 0,
        topScore: 0,
        lowScore: 0,
      };
    }

    const percentages = results.map(toPercentage);
    const passed = percentages.filter((item) => item >= 50).length;
    return {
      averageScore: percentages.reduce((sum, item) => sum + item, 0) / percentages.length,
      passRate: (passed / percentages.length) * 100,
      topScore: Math.max(...percentages),
      lowScore: Math.min(...percentages),
    };
  }, [results]);

  const gradeDistribution = useMemo(() => ({
    A: results.filter((item) => toPercentage(item) >= 90).length,
    B: results.filter((item) => toPercentage(item) >= 80 && toPercentage(item) < 90).length,
    C: results.filter((item) => toPercentage(item) >= 70 && toPercentage(item) < 80).length,
    D: results.filter((item) => toPercentage(item) >= 50 && toPercentage(item) < 70).length,
    F: results.filter((item) => toPercentage(item) < 50).length,
  }), [results]);

  const mostMissedQuestions = useMemo(() => {
    const counter = new Map<number, number>();
    results.forEach((result) => {
      parseWrongQuestionIds(result.wrongQuestionIds).forEach((questionId) => {
        counter.set(questionId, (counter.get(questionId) || 0) + 1);
      });
    });

    return Array.from(counter.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [results]);

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A', color: 'bg-green-100 text-green-700' };
    if (percentage >= 80) return { grade: 'B', color: 'bg-blue-100 text-blue-700' };
    if (percentage >= 70) return { grade: 'C', color: 'bg-yellow-100 text-yellow-700' };
    if (percentage >= 50) return { grade: 'D', color: 'bg-orange-100 text-orange-700' };
    return { grade: 'F', color: 'bg-red-100 text-red-700' };
  };

  const handleExportReport = () => {
    const rows = [
      ['Học sinh', 'Đề thi', 'Điểm', 'Tỷ lệ %', 'Số câu đúng', 'Tổng câu', 'Số câu sai', 'Nhận xét'],
      ...results.map((result) => [
        result.studentName || '',
        result.examTitle || '',
        String(result.score || 0),
        String(toPercentage(result)),
        String(result.correctCount || 0),
        String(result.totalQuestions || 0),
        result.wrongQuestionIds || '',
        result.feedback || '',
      ]),
    ];

    exportCsv(`bao-cao-ket-qua-${selectedExam}`, rows);
  };

  return (
    <DashboardLayout role="teacher" userName={realName}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/teacher">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kết quả và phân tích học sinh</h1>
              <p className="text-gray-600">Tổng hợp từ các bài làm đã được OCR chấm điểm.</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleExportReport} disabled={!results.length}>
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="max-w-xs flex-1">
                <Select value={selectedExam} onValueChange={(value) => void loadData(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn đề thi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả đề thi</SelectItem>
                    {exams.map((exam) => (
                      <SelectItem key={exam.id} value={String(exam.id)}>
                        {exam.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Badge variant="outline" className="text-sm">
                {results.length} Kết quả
              </Badge>
            </div>
          </CardContent>
        </Card>

        {errorMsg ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMsg}</div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-2 flex items-center justify-between">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-bold text-blue-600">{metrics.averageScore.toFixed(1)}%</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Điểm trung bình</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                {metrics.averageScore >= 70 ? (
                  <>
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-green-600">Lớp đang ổn</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3 h-3 text-orange-600" />
                    <span className="text-orange-600">Cần hỗ trợ thêm</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-2">{metrics.passRate.toFixed(0)}%</div>
              <p className="text-sm text-gray-600">Tỷ lệ đạt</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">{metrics.topScore}%</div>
              <p className="text-sm text-gray-600">Điểm cao nhất</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">{metrics.lowScore}%</div>
              <p className="text-sm text-gray-600">Điểm thấp nhất</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="results" className="w-full">
          <TabsList>
            <TabsTrigger value="results">Danh sách kết quả</TabsTrigger>
            <TabsTrigger value="analytics">Phân tích</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Kết quả từng học sinh</CardTitle>
                <CardDescription>Danh sách điểm đã chấm từ OCR.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-10 text-center text-gray-500">Đang tải kết quả...</div>
                ) : results.length === 0 ? (
                  <div className="py-10 text-center text-gray-500">Chưa có dữ liệu kết quả.</div>
                ) : (
                  <div className="space-y-3">
                    {results.map((result) => {
                      const percentage = toPercentage(result);
                      const gradeInfo = getGrade(percentage);
                      return (
                        <div key={result.resultId} className="rounded-lg border p-4 hover:bg-gray-50">
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex-1">
                              <div className="mb-1 flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-gray-900">{result.studentName}</p>
                                {result.examTitle ? <Badge variant="outline">{result.examTitle}</Badge> : null}
                              </div>
                              <p className="text-sm text-gray-600">
                                Đúng {result.correctCount || 0}/{result.totalQuestions || 0} câu
                              </p>
                              <p className="text-sm text-gray-500">Sai các câu: {result.wrongQuestionIds || 'Không có'}</p>
                              {result.feedback ? <p className="mt-1 text-sm text-gray-500">{result.feedback}</p> : null}
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900">{result.score}/10</div>
                                <div className="text-sm text-gray-600">{percentage}%</div>
                              </div>
                              <Badge className={gradeInfo.color}>Xếp loại {gradeInfo.grade}</Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Phân bố kết quả</CardTitle>
                <CardDescription>Thống kê theo nhóm điểm.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(gradeDistribution).map(([grade, count]) => {
                    const percentage = results.length ? (count / results.length) * 100 : 0;
                    return (
                      <div key={grade}>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={getGrade(
                              grade === 'A' ? 95 :
                                grade === 'B' ? 85 :
                                  grade === 'C' ? 75 :
                                    grade === 'D' ? 60 : 40,
                            ).color}>
                              Mức {grade}
                            </Badge>
                            <span className="text-sm text-gray-600">{count} học sinh</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{percentage.toFixed(0)}%</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-gray-200">
                          <div className="h-3 rounded-full bg-blue-600" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Câu hỏi bị sai nhiều</CardTitle>
                <CardDescription>Dùng để biết phần kiến thức nào cần dạy lại.</CardDescription>
              </CardHeader>
              <CardContent>
                {mostMissedQuestions.length === 0 ? (
                  <div className="text-sm text-gray-500">Chưa đủ dữ liệu để phân tích câu sai.</div>
                ) : (
                  <div className="space-y-3">
                    {mostMissedQuestions.map(([questionId, count]) => (
                      <div key={questionId} className="rounded-lg border bg-red-50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">Câu {questionId}</span>
                          <Badge className="bg-red-100 text-red-700">{count} lượt sai</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
