import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { BookOpen } from 'lucide-react';
import * as api from '../api/curriculumApi';

function getNameFromToken(): string {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return '';
    return JSON.parse(atob(token.split('.')[1])).fullName || '';
  } catch { return ''; }
}

function toList(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  return [];
}

export default function StaffCurriculum() {
  const userName = getNameFromToken();

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
      setSubjects(toList(res));
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
          setChaptersBySubject(prev => ({ ...prev, [subjId]: toList(res) }));
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
          setTopicsByChapter(prev => ({ ...prev, [chapId]: toList(res) }));
        } catch (e) { console.error(e); }
      }
    }
  };

  const openSubjectModal = () => { setDialogType('subject'); setInputValue(''); setDialogOpen(true); };
  const openChapterModal = (subjId: number) => { setDialogType('chapter'); setDialogParentId(subjId); setInputValue(''); setDialogOpen(true); };
  const openTopicModal = (chapId: number) => { setDialogType('topic'); setDialogParentId(chapId); setInputValue(''); setDialogOpen(true); };

  const handleDialogSubmit = async () => {
    if (!inputValue.trim()) return;
    try {
      if (dialogType === 'subject') {
        await api.createSubject({ name: inputValue });
        loadSubjects();
      } else if (dialogType === 'chapter' && dialogParentId) {
        await api.createChapter({ name: inputValue, subjectId: dialogParentId });
        const res: any = await api.getChaptersBySubject(dialogParentId);
        setChaptersBySubject(prev => ({ ...prev, [dialogParentId!]: toList(res) }));
        setExpandedSubjects(prev => new Set(prev).add(dialogParentId!));
      } else if (dialogType === 'topic' && dialogParentId) {
        await api.createTopic({ title: inputValue, chapterId: dialogParentId });
        const res: any = await api.getTopicsByChapter(dialogParentId);
        setTopicsByChapter(prev => ({ ...prev, [dialogParentId!]: toList(res) }));
        setExpandedChapters(prev => new Set(prev).add(dialogParentId!));
      }
      setDialogOpen(false);
    } catch (e) { alert('Có lỗi xảy ra khi tạo!'); }
  };

  const handleDeleteSubject = async (id: number) => {
    if (!window.confirm('Xóa môn học này sẽ xóa cả chương và bài học. Chắc chưa?')) return;
    try { await api.deleteSubject(id); loadSubjects(); } catch { alert('Lỗi'); }
  };

  const handleDeleteChapter = async (subjId: number, chapId: number) => {
    if (!window.confirm('Xóa chương này?')) return;
    try {
      await api.deleteChapter(chapId);
      const res: any = await api.getChaptersBySubject(subjId);
      setChaptersBySubject(prev => ({ ...prev, [subjId]: toList(res) }));
    } catch { alert('Lỗi'); }
  };

  const handleDeleteTopic = async (chapId: number, topicId: number) => {
    if (!window.confirm('Xóa bài học này?')) return;
    try {
      await api.deleteTopic(topicId);
      const res: any = await api.getTopicsByChapter(chapId);
      setTopicsByChapter(prev => ({ ...prev, [chapId]: toList(res) }));
    } catch { alert('Lỗi'); }
  };

  return (
    <DashboardLayout role="staff" userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cấu Trúc Môn Học</h1>
          <p className="text-gray-600">Quản lý hệ thống Môn học – Chương – Bài học</p>
        </div>

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
                        <div className="text-gray-400">{expandedSubjects.has(subj.id) ? '▼' : '▶'}</div>
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
                                  <div className="text-gray-400 text-xs">{expandedChapters.has(chap.id) ? '▼' : '▶'}</div>
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
      </div>
    </DashboardLayout>
  );
}
