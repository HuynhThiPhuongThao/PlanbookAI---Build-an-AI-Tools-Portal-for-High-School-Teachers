import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { ArrowLeft, Plus, Search, Sparkles, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import * as api from '../api/questionApi';

function getNameFromToken(): string {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.fullName || '';
  } catch { return ''; }
}

function useRealUserName() {
  const [name, setName] = React.useState(getNameFromToken());
  React.useEffect(() => {
    const h = (e: any) => { if (e.detail?.fullName) setName(e.detail.fullName); };
    window.addEventListener('profileUpdated', h);
    return () => window.removeEventListener('profileUpdated', h);
  }, []);
  return name;
}

export default function QuestionBank() {
  const realName = useRealUserName();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // Dialog & Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);

  // New Question Form
  const [formData, setFormData] = useState({
    subject: 'Chemistry',
    topic: '',
    difficultyLevel: 'MEDIUM',
    content: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: ''
  });
  
  const [aiLoading, setAiLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res: any = await api.getQuestions({
        size: 100 // load max for now
      });
      // The API returns PaginatedResponse, so data is in res.data
      setQuestions(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = (q.content && q.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (q.topic && q.topic.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = subjectFilter === 'all' || q.subject === subjectFilter;
    const matchesDifficulty = difficultyFilter === 'all' || q.difficultyLevel === difficultyFilter.toUpperCase();
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const getDifficultyColor = (diff: string) => {
    if (!diff) return 'bg-gray-100 text-gray-700';
    switch (diff.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // --- Handlers for New Question ---
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSaveQuestion = async () => {
    if (!formData.content || !formData.topic || !formData.correctAnswer) {
      alert("Vui lòng điền đủ Topic, Question Content và Correct Answer!");
      return;
    }
    setSaveLoading(true);
    try {
      await api.createQuestion({
        ...formData,
        options: formData.options.filter(o => o.trim() !== '') // remove empty options
      });
      alert("Đã gửi câu hỏi thành công! Đang chờ duyệt.");
      setIsDialogOpen(false);
      setFormData({
        subject: 'Chemistry', topic: '', difficultyLevel: 'MEDIUM', content: '',
        options: ['', '', '', ''], correctAnswer: '', explanation: ''
      });
      fetchQuestions();
    } catch (e) {
      alert("Lỗi khi lưu câu hỏi");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if(!window.confirm("Xóa câu hỏi này?")) return;
    try {
      await api.deleteQuestion(id);
      fetchQuestions();
    } catch(e) {
      alert("Lỗi xóa");
    }
  }

  // --- AI Tools ---
  const handleAiSuggest = async () => {
    if (!formData.topic) {
      alert("Vui lòng nhập Topic trước khi nhờ AI gợi ý.");
      return;
    }
    setAiLoading(true);
    try {
      const res: any = await api.aiSuggestQuestion({
        subject: formData.subject,
        topic: formData.topic,
        difficultyLevel: formData.difficultyLevel
      });
      
      if (res && res.length > 0) {
        const aiQ = res[0]; // lấy câu đầu tiên gợi ý
        setFormData({
          ...formData,
          content: aiQ.content || '',
          options: aiQ.options && aiQ.options.length > 0 ? aiQ.options : ['', '', '', ''],
          correctAnswer: aiQ.correctAnswer || '',
          explanation: aiQ.explanation || ''
        });
      }
    } catch (e) {
      alert("Lỗi AI Suggest");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiImprove = async () => {
    if (!formData.content) {
      alert("Vui lòng nhập nội dung câu hỏi cần cải thiện.");
      return;
    }
    setAiLoading(true);
    try {
      const res: any = await api.aiImproveQuestion({
        content: formData.content,
        options: formData.options.filter(o => o.trim() !== ''),
        correctAnswer: formData.correctAnswer,
        improvementGoal: 'Make it clearer and more engaging'
      });
      
      setFormData({
        ...formData,
        content: res.improvedContent || formData.content,
        options: res.improvedOptions || formData.options,
        correctAnswer: res.improvedCorrectAnswer || formData.correctAnswer,
        explanation: res.explanation || formData.explanation
      });
    } catch (e) {
      alert("Lỗi AI Improve");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <DashboardLayout role="teacher" userName={realName}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/teacher">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ngân hàng Câu hỏi</h1>
              <p className="text-gray-600">Quản lý và đóng góp câu hỏi trắc nghiệm</p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Thêm Câu hỏi
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Thêm Câu hỏi Mới</DialogTitle>
                <DialogDescription>Nhập thủ công hoặc sử dụng AI để hỗ trợ soạn câu hỏi.</DialogDescription>
              </DialogHeader>
              
              {/* AI Tool Bar */}
              <div className="flex gap-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <Button variant="outline" size="sm" className="text-purple-700 border-purple-300 hover:bg-purple-100" onClick={handleAiSuggest} disabled={aiLoading}>
                  {aiLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  AI Gợi ý
                </Button>
                <Button variant="outline" size="sm" className="text-blue-700 border-blue-300 hover:bg-blue-100" onClick={handleAiImprove} disabled={aiLoading}>
                  {aiLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Edit className="w-4 h-4 mr-2" />}
                  AI Cải thiện
                </Button>
              </div>

              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Môn học</Label>
                    <Select value={formData.subject} onValueChange={(val) => setFormData({...formData, subject: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Chemistry">Chemistry</SelectItem>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Biology">Biology</SelectItem>
                        <SelectItem value="Math">Math</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Bài (Topic)</Label>
                    <Input placeholder="VD: Cấu tạo nguyên tử" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Độ khó</Label>
                  <Select value={formData.difficultyLevel} onValueChange={(val) => setFormData({...formData, difficultyLevel: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Dễ</SelectItem>
                      <SelectItem value="MEDIUM">Trung bình</SelectItem>
                      <SelectItem value="HARD">Khó</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Nội dung câu hỏi</Label>
                  <Textarea placeholder="Nhập câu hỏi..." rows={3} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
                </div>
                
                <div className="space-y-2">
                  <Label>Các đáp án (Options)</Label>
                  {formData.options.map((opt, idx) => (
                    <Input key={idx} placeholder={`Đáp án ${idx + 1}`} value={opt} onChange={e => handleOptionChange(idx, e.target.value)} />
                  ))}
                </div>
                
                <div className="space-y-2">
                  <Label>Đáp án đúng (Copy chính xác nội dung đáp án)</Label>
                  <Input placeholder="VD: Proton và nơtron" value={formData.correctAnswer} onChange={e => setFormData({...formData, correctAnswer: e.target.value})} />
                </div>
                
                <div className="space-y-2">
                  <Label>Giải thích (Tùy chọn)</Label>
                  <Textarea placeholder="Vì sao lại chọn đáp án này?" rows={2} value={formData.explanation} onChange={e => setFormData({...formData, explanation: e.target.value})} />
                </div>
                
                <div className="flex gap-2 pt-4 border-t">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleSaveQuestion} disabled={saveLoading}>
                    {saveLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Gửi Câu Hỏi (Chờ Duyệt)
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Tìm kiếm & Lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tìm kiếm</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Tìm nội dung câu hỏi..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Môn học</Label>
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Độ khó</Label>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="easy">Dễ</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="hard">Khó</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách Câu hỏi ({filteredQuestions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : filteredQuestions.length === 0 ? (
               <p className="text-center text-gray-500 py-10">Không có câu hỏi nào.</p>
            ) : (
              <div className="space-y-3">
                {filteredQuestions.map((q) => (
                  <div key={q.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 cursor-pointer" onClick={() => setSelectedQuestion(q)}>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{q.subject}</Badge>
                          <Badge variant="outline">{q.topic}</Badge>
                          <Badge className={getDifficultyColor(q.difficultyLevel)}>
                            {q.difficultyLevel}
                          </Badge>
                          <Badge variant="secondary" className={q.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                            {q.status}
                          </Badge>
                        </div>
                        <p className="font-medium text-gray-900 line-clamp-2">{q.content}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedQuestion(q)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(q.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Question Detail Dialog */}
        {selectedQuestion && (
          <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Chi tiết Câu hỏi</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex gap-2">
                  <Badge variant="outline">{selectedQuestion.subject}</Badge>
                  <Badge variant="outline">{selectedQuestion.topic}</Badge>
                  <Badge className={getDifficultyColor(selectedQuestion.difficultyLevel)}>
                    {selectedQuestion.difficultyLevel}
                  </Badge>
                </div>
                <div>
                  <Label className="text-base font-bold text-purple-700">Câu hỏi:</Label>
                  <p className="mt-2 text-gray-900 bg-gray-50 p-3 rounded border">{selectedQuestion.content}</p>
                </div>
                {selectedQuestion.options && (
                  <div>
                    <Label className="text-base font-bold text-blue-700">Các đáp án:</Label>
                    <div className="mt-2 space-y-2">
                      {selectedQuestion.options.map((option: string, index: number) => {
                         const isCorrect = option.trim().toLowerCase() === selectedQuestion.correctAnswer?.trim().toLowerCase();
                         return (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${
                              isCorrect ? 'bg-green-50 border-green-500 font-bold' : 'bg-gray-50'
                            }`}
                          >
                            <span className="mr-2">{String.fromCharCode(65 + index)}.</span>
                            {option}
                            {isCorrect && (
                              <Badge className="ml-2 bg-green-600">Đúng</Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                {selectedQuestion.explanation && (
                  <div>
                    <Label className="text-base font-bold text-orange-700">Giải thích:</Label>
                    <p className="mt-2 text-gray-700 bg-orange-50 p-3 rounded-lg border border-orange-100">
                      {selectedQuestion.explanation}
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
