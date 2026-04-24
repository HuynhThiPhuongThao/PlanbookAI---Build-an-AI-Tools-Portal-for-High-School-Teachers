import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { BookOpen, FileText } from 'lucide-react';
import * as api from '../api/curriculumApi';

function getNameFromToken(): string {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return '';
    return JSON.parse(atob(token.split('.')[1])).fullName || '';
  } catch { return ''; }
}

export default function AdminCurriculum() {
  const userName = getNameFromToken();
  const [activeTab, setActiveTab] = useState<'structure' | 'templates'>('structure');

  return (
    <DashboardLayout role="admin" userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chương Trình Giảng Dạy</h1>
          <p className="text-gray-600">Quản lý cấu trúc môn học và mẫu giáo án chuẩn</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            className={`pb-4 px-4 font-medium text-sm transition-colors relative ${activeTab === 'structure' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('structure')}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Cấu trúc Môn học
            </div>
            {activeTab === 'structure' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
          </button>
          
          <button
            className={`pb-4 px-4 font-medium text-sm transition-colors relative ${activeTab === 'templates' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('templates')}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Mẫu Giáo Án
            </div>
            {activeTab === 'templates' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
          </button>
        </div>

        {/* Content */}
        {activeTab === 'structure' && <StructureTab />}
        {activeTab === 'templates' && <TemplatesTab />}

      </div>
    </DashboardLayout>
  );
}

function StructureTab() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chaptersBySubject, setChaptersBySubject] = useState<Record<number, any[]>>({});
  const [topicsByChapter, setTopicsByChapter] = useState<Record<number, any[]>>({});
  
  const [expandedSubjects, setExpandedSubjects] = useState<Set<number>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'subject' | 'chapter' | 'topic'>('subject');
  const [dialogParentId, setDialogParentId] = useState<number | undefined>();
  const [inputValue, setInputValue] = useState('');

  const loadSubjects = async () => {
    try {
      const res: any = await api.getSubjects();
      setSubjects(res || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadSubjects(); }, []);

  const toggleSubject = async (subjId: number) => {
    const newExp = new Set(expandedSubjects);
    if (newExp.has(subjId)) {
      newExp.delete(subjId);
      setExpandedSubjects(newExp);
    } else {
      newExp.add(subjId);
      setExpandedSubjects(newExp);
      if (!chaptersBySubject[subjId]) {
        try {
          const res: any = await api.getChaptersBySubject(subjId);
          setChaptersBySubject(prev => ({ ...prev, [subjId]: res || [] }));
        } catch (e) { console.error(e); }
      }
    }
  };

  const toggleChapter = async (chapId: number) => {
    const newExp = new Set(expandedChapters);
    if (newExp.has(chapId)) {
      newExp.delete(chapId);
      setExpandedChapters(newExp);
    } else {
      newExp.add(chapId);
      setExpandedChapters(newExp);
      if (!topicsByChapter[chapId]) {
        try {
          const res: any = await api.getTopicsByChapter(chapId);
          setTopicsByChapter(prev => ({ ...prev, [chapId]: res || [] }));
        } catch (e) { console.error(e); }
      }
    }
  };

  // Các hàm mở Modal
  const openSubjectModal = () => {
    setDialogType('subject');
    setInputValue('');
    setDialogOpen(true);
  };

  const openChapterModal = (subjId: number) => {
    setDialogType('chapter');
    setDialogParentId(subjId);
    setInputValue('');
    setDialogOpen(true);
  };

  const openTopicModal = (chapId: number) => {
    setDialogType('topic');
    setDialogParentId(chapId);
    setInputValue('');
    setDialogOpen(true);
  };

  // Submit Modal
  const handleDialogSubmit = async () => {
    if (!inputValue.trim()) return;
    try {
      if (dialogType === 'subject') {
        await api.createSubject({ name: inputValue });
        loadSubjects();
      } else if (dialogType === 'chapter' && dialogParentId) {
        await api.createChapter({ name: inputValue, subjectId: dialogParentId });
        const res: any = await api.getChaptersBySubject(dialogParentId);
        setChaptersBySubject(prev => ({ ...prev, [dialogParentId]: res || [] }));
        setExpandedSubjects(prev => new Set(prev).add(dialogParentId));
      } else if (dialogType === 'topic' && dialogParentId) {
        await api.createTopic({ title: inputValue, chapterId: dialogParentId });
        const res: any = await api.getTopicsByChapter(dialogParentId);
        setTopicsByChapter(prev => ({ ...prev, [dialogParentId]: res || [] }));
        setExpandedChapters(prev => new Set(prev).add(dialogParentId));
      }
      setDialogOpen(false);
    } catch (e) { alert("Có lỗi xảy ra khi tạo!"); }
  };

  const handleDeleteSubject = async (id: number) => {
    if (!window.confirm("Xóa môn học này sẽ xóa cả chương và bài học. Chắc chưa?")) return;
    try { await api.deleteSubject(id); loadSubjects(); } catch(e) { alert("Lỗi"); }
  }

  const handleDeleteChapter = async (subjId: number, chapId: number) => {
    if (!window.confirm("Xóa chương này?")) return;
    try { 
      await api.deleteChapter(chapId); 
      const res: any = await api.getChaptersBySubject(subjId);
      setChaptersBySubject(prev => ({ ...prev, [subjId]: res || [] }));
    } catch(e) { alert("Lỗi"); }
  }

  const handleDeleteTopic = async (chapId: number, topicId: number) => {
    if (!window.confirm("Xóa bài học này?")) return;
    try { 
      await api.deleteTopic(topicId); 
      const res: any = await api.getTopicsByChapter(chapId);
      setTopicsByChapter(prev => ({ ...prev, [chapId]: res || [] }));
    } catch(e) { alert("Lỗi"); }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Cấu trúc Môn học</CardTitle>
          <CardDescription>Hệ thống Môn học - Chương - Bài học</CardDescription>
        </div>
        <Button onClick={openSubjectModal} className="bg-blue-600 hover:bg-blue-700">
          <BookOpen className="w-4 h-4 mr-2" /> Thêm Môn Học
        </Button>
      </CardHeader>
      <CardContent>
        {subjects.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Chưa có môn học nào.</p>
        ) : (
          <div className="space-y-2">
            {subjects.map(subj => (
              <div key={subj.id} className="border rounded-md p-2 bg-white">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-2 font-semibold cursor-pointer hover:text-blue-600 p-2"
                    onClick={() => toggleSubject(subj.id)}
                  >
                    <div className="text-gray-400">
                      {expandedSubjects.has(subj.id) ? '▼' : '▶'}
                    </div>
                    📚 {subj.name}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openChapterModal(subj.id)}>+ Thêm Chương</Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteSubject(subj.id)}>Xóa</Button>
                  </div>
                </div>

                {expandedSubjects.has(subj.id) && (
                  <div className="ml-6 mt-2 border-l-2 border-blue-100 pl-4 space-y-2">
                    {(!chaptersBySubject[subj.id] || chaptersBySubject[subj.id].length === 0) ? (
                      <p className="text-sm text-gray-400 italic py-2">Chưa có chương nào.</p>
                    ) : (
                      chaptersBySubject[subj.id].map(chap => (
                        <div key={chap.id} className="border rounded-md p-2 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div 
                              className="flex items-center gap-2 font-medium cursor-pointer hover:text-blue-600 p-1"
                              onClick={() => toggleChapter(chap.id)}
                            >
                              <div className="text-gray-400 text-xs">
                                {expandedChapters.has(chap.id) ? '▼' : '▶'}
                              </div>
                              📖 {chap.name}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => openTopicModal(chap.id)}>+ Thêm Bài Học</Button>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteChapter(subj.id, chap.id)}>Xóa</Button>
                            </div>
                          </div>

                          {expandedChapters.has(chap.id) && (
                            <div className="ml-6 mt-2 border-l-2 border-green-100 pl-4 space-y-1">
                              {(!topicsByChapter[chap.id] || topicsByChapter[chap.id].length === 0) ? (
                                <p className="text-sm text-gray-400 italic py-1">Chưa có bài học nào.</p>
                              ) : (
                                topicsByChapter[chap.id].map(top => (
                                  <div key={top.id} className="flex justify-between items-center bg-white p-2 border rounded text-sm">
                                    <span>📄 {top.title}</span>
                                    <Button variant="ghost" size="sm" className="text-red-400 h-6 px-2 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteTopic(chap.id, top.id)}>Xóa</Button>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'subject' ? 'Thêm Môn Học' : dialogType === 'chapter' ? 'Thêm Chương' : 'Thêm Bài Học'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Tên {dialogType === 'subject' ? 'Môn học' : dialogType === 'chapter' ? 'Chương' : 'Bài học'}</Label>
            <Input 
              value={inputValue} 
              onChange={e => setInputValue(e.target.value)} 
              placeholder="Nhập tên..." 
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleDialogSubmit()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleDialogSubmit}>Lưu lại</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function TemplatesTab() {
  const [templates, setTemplates] = useState<any[]>([]);
  
  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');

  const loadTemplates = async () => {
    try {
      const res: any = await api.getCurriculumTemplates();
      setTemplates(res || []);
    } catch(e) { console.error(e); }
  }

  useEffect(() => { loadTemplates(); }, []);

  const openTemplateModal = () => {
    setTemplateName('');
    setTemplateDesc('I. Mục tiêu\nII. Nội dung\nIII. Bài tập');
    setDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!templateName.trim() || !templateDesc.trim()) return;

    try {
      await api.createCurriculumTemplate({ name: templateName, description: templateDesc, isActive: true });
      setDialogOpen(false);
      loadTemplates();
    } catch (e) { alert("Lỗi tạo mẫu!"); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Xóa mẫu này?")) return;
    try {
      await api.deleteCurriculumTemplate(id);
      loadTemplates();
    } catch (e) { alert("Lỗi"); }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Mẫu Giáo Án (Templates)</CardTitle>
          <CardDescription>Các khung giáo án chuẩn cho giáo viên sử dụng</CardDescription>
        </div>
        <Button onClick={openTemplateModal} className="bg-purple-600 hover:bg-purple-700">
          <FileText className="w-4 h-4 mr-2" /> Thêm Mẫu Mới
        </Button>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Chưa có mẫu giáo án nào.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {templates.map(t => (
              <div key={t.id} className="border p-4 rounded-lg bg-white shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-purple-700">{t.name}</h3>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(t.id)}>Xóa</Button>
                </div>
                <pre className="text-sm text-gray-600 bg-gray-50 p-3 rounded overflow-x-auto whitespace-pre-wrap font-sans">
                  {t.description}
                </pre>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo Mẫu Giáo Án Mới</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label>Tên Mẫu</Label>
              <Input 
                value={templateName} 
                onChange={e => setTemplateName(e.target.value)} 
                placeholder="Ví dụ: Mẫu Giáo Án 5 Bước" 
                autoFocus
              />
            </div>
            <div>
              <Label>Nội dung khung sườn</Label>
              <Textarea 
                value={templateDesc}
                onChange={e => setTemplateDesc(e.target.value)}
                rows={10}
                placeholder="Nhập nội dung mẫu..."
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleCreate}>Lưu Mẫu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
