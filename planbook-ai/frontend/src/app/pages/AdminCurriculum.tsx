import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ChevronDown, ChevronUp, FileText, Plus, Trash2 } from 'lucide-react';
import * as api from '../api/curriculumApi';
import { getFullNameFromToken } from '../utils/jwt';

type Section = { title: string; fields: string[] };
type Subject = { id: number; name: string };

const DEFAULT_SECTIONS: Section[] = [
  { title: 'I. Thong tin bai hoc', fields: ['Mon hoc', 'Lop', 'Chu de / Bai hoc', 'Thoi luong'] },
  { title: 'II. Muc tieu bai hoc', fields: ['Kien thuc', 'Nang luc', 'Pham chat'] },
  { title: 'III. Hoc lieu', fields: ['Giao vien chuan bi', 'Hoc sinh chuan bi'] },
  { title: 'IV. Tien trinh day hoc', fields: ['Khoi dong', 'Hinh thanh kien thuc', 'Luyen tap', 'Van dung'] },
  { title: 'V. Danh gia', fields: ['Cau hoi danh gia', 'Tieu chi', 'Hinh thuc'] },
  { title: 'VI. Phu luc', fields: ['Phieu hoc tap', 'Bai tap', 'Dap an / Goi y'] },
];

function getNameFromToken(): string {
  return getFullNameFromToken();
}

function toList<T>(value: any): T[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  return [];
}

function parseSections(raw?: string): Section[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Section[];
    if (Array.isArray(parsed?.sections)) return parsed.sections as Section[];
    return null;
  } catch {
    return null;
  }
}

function TemplateCard({ template, onDelete }: { template: any; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const sections = useMemo(
    () => parseSections(template.structureJson || template.description),
    [template.structureJson, template.description],
  );

  return (
    <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{template.name}</h3>
            <p className="text-xs text-gray-500">
              {template.subject?.name || 'Dùng chung'} · {template.gradeLevel || 'THPT'} ·{' '}
              {template.status || 'ACTIVE'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setExpanded((v) => !v)}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {expanded ? 'Thu gon' : 'Xem cau truc'}
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t bg-gray-50 px-5 py-4">
          {sections ? (
            <div className="space-y-4">
              {sections.map((sec, idx) => (
                <div key={idx}>
                  <p className="font-medium text-purple-700 text-sm mb-1">{sec.title}</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {sec.fields.map((field, fIdx) => (
                      <li key={fIdx}>{field}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans">
              {template.description || template.structureJson}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

function CreateTemplateDialog({
  open,
  onClose,
  onCreated,
  subjects,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  subjects: Subject[];
}) {
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('THPT');
  const [subjectId, setSubjectId] = useState('');
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS.map((s) => ({ ...s, fields: [...s.fields] })));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return alert('Vui long nhap ten mau');

    setSaving(true);
    try {
      await api.createCurriculumTemplate({
        name: name.trim(),
        description: `Template ${name.trim()} (${gradeLevel})`,
        gradeLevel,
        subjectId: subjectId ? Number(subjectId) : undefined,
        structureJson: JSON.stringify({ sections }),
        status: 'ACTIVE',
      });
      onCreated();
      onClose();
      setName('');
      setGradeLevel('THPT');
      setSubjectId('');
      setSections(DEFAULT_SECTIONS.map((s) => ({ ...s, fields: [...s.fields] })));
    } catch {
      alert('Tao template that bai');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (sectionIdx: number, fieldIdx: number, value: string) => {
    setSections((prev) =>
      prev.map((sec, idx) =>
        idx === sectionIdx ? { ...sec, fields: sec.fields.map((f, j) => (j === fieldIdx ? value : f)) } : sec,
      ),
    );
  };

  const addField = (sectionIdx: number) => {
    setSections((prev) =>
      prev.map((sec, idx) => (idx === sectionIdx ? { ...sec, fields: [...sec.fields, ''] } : sec)),
    );
  };

  const removeField = (sectionIdx: number, fieldIdx: number) => {
    setSections((prev) =>
      prev.map((sec, idx) =>
        idx === sectionIdx ? { ...sec, fields: sec.fields.filter((_, j) => j !== fieldIdx) } : sec,
      ),
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tao mau giao an moi</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Ten mau</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Mau THPT Co Ban" />
            </div>
            <div>
              <Label>Cap hoc</Label>
              <Input value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Pham vi khung</Label>
            <Select
              value={subjectId || '__shared'}
              onValueChange={(value) => setSubjectId(value === '__shared' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chon pham vi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__shared">Dùng chung cho Hóa 10, 11, 12</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={String(subject.id)}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {sections.map((section, secIdx) => (
            <div key={secIdx} className="border rounded-lg overflow-hidden">
              <div className="bg-purple-50 px-4 py-2 border-b">
                <p className="text-sm font-medium text-purple-700">{section.title}</p>
              </div>
              <div className="px-4 py-3 space-y-2">
                {section.fields.map((field, fieldIdx) => (
                  <div key={fieldIdx} className="flex items-center gap-2">
                    <Input
                      value={field}
                      onChange={(e) => updateField(secIdx, fieldIdx, e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => removeField(secIdx, fieldIdx)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button variant="ghost" size="sm" onClick={() => addField(secIdx)} className="text-purple-600">
                  <Plus className="w-3 h-3 mr-1" />
                  Them muc
                </Button>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Huy
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
            {saving ? 'Dang luu...' : 'Luu mau'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminCurriculum() {
  const userName = getNameFromToken();
  const [templates, setTemplates] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadTemplates = async () => {
    try {
      const res: any = await api.getCurriculumTemplates();
      setTemplates(toList(res));
    } catch (e) {
      console.error(e);
      setTemplates([]);
    }
  };

  const loadSubjects = async () => {
    try {
      const res: any = await api.getSubjects();
      setSubjects(toList<Subject>(res));
    } catch (e) {
      console.error(e);
      setSubjects([]);
    }
  };

  useEffect(() => {
    loadTemplates();
    loadSubjects();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xoa template nay?')) return;
    try {
      await api.deleteCurriculumTemplate(id);
      loadTemplates();
    } catch {
      alert('Xoa that bai');
    }
  };

  return (
    <DashboardLayout role="admin" userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mau Giao An</h1>
          <p className="text-gray-600">Admin tao khung, Staff dua vao do de soan giao an mau</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Danh sach template</CardTitle>
              <CardDescription>Template dang ACTIVE se duoc Staff nhin thay trong man hinh soan bai</CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
              <FileText className="w-4 h-4 mr-2" />
              Tao mau moi
            </Button>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Chua co template nao</p>
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => (
                  <TemplateCard key={template.id} template={template} onDelete={() => handleDelete(template.id)} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <CreateTemplateDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onCreated={loadTemplates}
          subjects={subjects}
        />
      </div>
    </DashboardLayout>
  );
}
