import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { FileText, ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react';
import * as api from '../api/curriculumApi';

function getNameFromToken(): string {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return '';
    return JSON.parse(atob(token.split('.')[1])).fullName || '';
  } catch { return ''; }
}

/* ── Cấu trúc mặc định 6 sections chuẩn THPT ── */
const DEFAULT_SECTIONS = [
  {
    title: 'I. Thông tin bài học',
    fields: ['Môn học', 'Lớp', 'Chủ đề / Bài học', 'Thời lượng (tiết)'],
  },
  {
    title: 'II. Mục tiêu bài học',
    fields: ['Kiến thức', 'Năng lực', 'Phẩm chất'],
  },
  {
    title: 'III. Thiết bị dạy học và học liệu',
    fields: ['Giáo viên chuẩn bị', 'Học sinh chuẩn bị'],
  },
  {
    title: 'IV. Tiến trình dạy học',
    fields: ['1. Khởi động', '2. Hình thành kiến thức', '3. Luyện tập', '4. Vận dụng', '5. Củng cố – Dặn dò'],
  },
  {
    title: 'V. Kiểm tra, đánh giá',
    fields: ['Câu hỏi đánh giá', 'Tiêu chí đánh giá', 'Hình thức đánh giá'],
  },
  {
    title: 'VI. Phụ lục',
    fields: ['Phiếu học tập', 'Bài tập', 'Đáp án / Gợi ý'],
  },
];

type Section = { title: string; fields: string[] };

/* ── Parse description: JSON hoặc plain text fallback ── */
function parseDescription(description: string): Section[] | null {
  try {
    const parsed = JSON.parse(description);
    if (Array.isArray(parsed)) return parsed;
    if (parsed.sections) return parsed.sections;
    return null;
  } catch {
    return null;
  }
}

/* ── Hiển thị một template card ── */
function TemplateCard({ t, onDelete }: { t: any; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const sections = parseDescription(t.description);

  return (
    <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{t.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {sections ? `${sections.length} phần` : 'Plain text'} · Tạo:{' '}
              {t.createdAt ? new Date(t.createdAt).toLocaleDateString('vi-VN') : '—'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(p => !p)}
            className="text-gray-500 hover:text-gray-700"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {expanded ? 'Thu gọn' : 'Xem cấu trúc'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t px-5 py-4 bg-gray-50">
          {sections ? (
            <div className="space-y-4">
              {sections.map((sec: Section, i: number) => (
                <div key={i}>
                  <p className="font-semibold text-purple-700 text-sm mb-1">{sec.title}</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {sec.fields.map((f: string, j: number) => (
                      <li key={j} className="text-sm text-gray-600">{f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans">{t.description}</pre>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Form tạo template: Admin chỉ đặt tên, cấu trúc 6 sections là default ── */
function CreateTemplateDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS.map(s => ({ ...s, fields: [...s.fields] })));
  const [saving, setSaving] = useState(false);

  const handleAddField = (secIdx: number) => {
    setSections(prev =>
      prev.map((s, i) => i === secIdx ? { ...s, fields: [...s.fields, ''] } : s)
    );
  };

  const handleFieldChange = (secIdx: number, fieldIdx: number, value: string) => {
    setSections(prev =>
      prev.map((s, i) =>
        i === secIdx
          ? { ...s, fields: s.fields.map((f, j) => j === fieldIdx ? value : f) }
          : s
      )
    );
  };

  const handleRemoveField = (secIdx: number, fieldIdx: number) => {
    setSections(prev =>
      prev.map((s, i) =>
        i === secIdx ? { ...s, fields: s.fields.filter((_, j) => j !== fieldIdx) } : s
      )
    );
  };

  const handleSave = async () => {
    if (!name.trim()) return alert('Vui lòng nhập tên mẫu!');
    setSaving(true);
    try {
      const description = JSON.stringify(sections);
      await api.createCurriculumTemplate({ name: name.trim(), description, isActive: true });
      onCreated();
      onClose();
      setName('');
      setSections(DEFAULT_SECTIONS.map(s => ({ ...s, fields: [...s.fields] })));
    } catch {
      alert('Lỗi tạo mẫu!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo Mẫu Giáo Án Mới</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Cấu trúc 6 phần chuẩn THPT được điền sẵn. Admin có thể thêm/sửa/xóa từng mục.
          </p>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Tên mẫu */}
          <div>
            <Label className="font-semibold">Tên Mẫu</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ví dụ: Mẫu Giáo Án Chuẩn THPT 2024"
              autoFocus
              className="mt-1"
            />
          </div>

          {/* Sections */}
          {sections.map((sec, secIdx) => (
            <div key={secIdx} className="border rounded-lg overflow-hidden">
              <div className="bg-purple-50 px-4 py-2 border-b">
                <p className="font-semibold text-purple-700 text-sm">{sec.title}</p>
              </div>
              <div className="px-4 py-3 space-y-2">
                {sec.fields.map((f, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs w-4">{fIdx + 1}.</span>
                    <Input
                      value={f}
                      onChange={e => handleFieldChange(secIdx, fIdx, e.target.value)}
                      className="flex-1 h-8 text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                      onClick={() => handleRemoveField(secIdx, fIdx)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-600 hover:bg-purple-50 text-xs mt-1"
                  onClick={() => handleAddField(secIdx)}
                >
                  <Plus className="w-3 h-3 mr-1" /> Thêm mục
                </Button>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Hủy</Button>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu Mẫu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main ── */
export default function AdminCurriculum() {
  const userName = getNameFromToken();
  const [templates, setTemplates] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadTemplates = async () => {
    try {
      const res: any = await api.getCurriculumTemplates();
      setTemplates(res || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadTemplates(); }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa mẫu này? Hành động không thể hoàn tác.')) return;
    try { await api.deleteCurriculumTemplate(id); loadTemplates(); } catch { alert('Lỗi'); }
  };

  return (
    <DashboardLayout role="admin" userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mẫu Giáo Án</h1>
          <p className="text-gray-600">Định nghĩa khung chuẩn (template) để Staff viết giáo án mẫu và Teacher sử dụng</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Danh sách Template</CardTitle>
              <CardDescription>Mỗi template là một khung giáo án chuẩn 6 phần theo quy định THPT</CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
              <FileText className="w-4 h-4 mr-2" /> Tạo Mẫu Mới
            </Button>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">Chưa có mẫu giáo án nào</p>
                <p className="text-sm mt-1">Bấm "Tạo Mẫu Mới" để thêm template đầu tiên</p>
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map(t => (
                  <TemplateCard key={t.id} t={t} onDelete={() => handleDelete(t.id)} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <CreateTemplateDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onCreated={loadTemplates}
        />
      </div>
    </DashboardLayout>
  );
}
