import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
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
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Sparkles, Download, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import * as api from '../api/curriculumApi';
import { escapeHtml, exportPdfDocument, exportWordDocument } from '../utils/exportUtils';
import { getFullNameFromToken } from '../utils/jwt';

type SubjectItem = {
  id: number;
  name: string;
  description?: string;
};

type ChapterItem = {
  id: number;
  name: string;
  subject?: SubjectItem;
};

type TopicItem = {
  id: number;
  title: string;
  chapter?: ChapterItem;
};

type TemplateItem = {
  id: number;
  name: string;
  description?: string;
  gradeLevel?: string;
  structureJson?: string;
  subject?: {
    id: number;
    name: string;
  };
};

type SampleItem = {
  id: number;
  title: string;
  content?: string;
  topic?: {
    id: number;
    title: string;
  };
  curriculumTemplate?: {
    id: number;
    name: string;
  };
};

type LessonActivity = {
  time: string;
  activity: string;
  description?: string;
};

type GeneratedPlan = {
  title: string;
  subject: string;
  grade: string;
  topic: string;
  duration: number;
  objectives: string[];
  materials: string[];
  activities: LessonActivity[];
  assessment: string;
  homework: string;
  notes: string;
  templateName?: string;
  sampleTitle?: string;
};

function getNameFromToken(): string {
  return getFullNameFromToken();
}

function normalizeGrade(raw?: string | null) {
  if (!raw) return '10';
  const match = raw.match(/(10|11|12)/);
  return match ? match[1] : raw;
}

function formatTemplateStructure(structureJson?: string) {
  if (!structureJson) return '';
  try {
    const parsed = JSON.parse(structureJson);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item)).join(', ');
    }
    if (typeof parsed === 'object') {
      return JSON.stringify(parsed, null, 2);
    }
    return String(parsed);
  } catch {
    return structureJson;
  }
}

function parsePlanContent(rawContent: string | undefined, fallback: Partial<GeneratedPlan>): GeneratedPlan {
  if (!rawContent) {
    return {
      title: fallback.title || '',
      subject: fallback.subject || '',
      grade: fallback.grade || '10',
      topic: fallback.topic || '',
      duration: fallback.duration || 45,
      objectives: [],
      materials: [],
      activities: [],
      assessment: '',
      homework: '',
      notes: '',
      templateName: fallback.templateName,
      sampleTitle: fallback.sampleTitle,
    };
  }

  try {
    const parsed = JSON.parse(rawContent);
    return {
      title: parsed.title || fallback.title || '',
      subject: parsed.subject || fallback.subject || '',
      grade: parsed.grade || fallback.grade || '10',
      topic: parsed.topic || fallback.topic || '',
      duration: Number(parsed.duration || fallback.duration || 45),
      objectives: Array.isArray(parsed.objectives) ? parsed.objectives : [],
      materials: Array.isArray(parsed.materials) ? parsed.materials : [],
      activities: Array.isArray(parsed.activities)
        ? parsed.activities.map((activity: any) => ({
          time: typeof activity.time === 'number' ? `${activity.time} phút` : String(activity.time || ''),
          activity: activity.activity || '',
          description: activity.description || '',
        }))
        : [],
      assessment: parsed.assessment || '',
      homework: parsed.homework || '',
      notes: parsed.notes || '',
      templateName: parsed.templateName || fallback.templateName,
      sampleTitle: parsed.sampleTitle || fallback.sampleTitle,
    };
  } catch {
    return {
      title: fallback.title || '',
      subject: fallback.subject || '',
      grade: fallback.grade || '10',
      topic: fallback.topic || '',
      duration: fallback.duration || 45,
      objectives: [],
      materials: [],
      activities: [],
      assessment: '',
      homework: '',
      notes: rawContent,
      templateName: fallback.templateName,
      sampleTitle: fallback.sampleTitle,
    };
  }
}

export default function LessonPlanner() {
  const realName = getNameFromToken();
  const navigate = useNavigate();
  const { id } = useParams();
  const lessonPlanId = id ? Number(id) : null;
  const isEditMode = Boolean(lessonPlanId);

  const [loadingReferences, setLoadingReferences] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);

  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [samplePlans, setSamplePlans] = useState<SampleItem[]>([]);

  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState('10');
  const [duration, setDuration] = useState('45');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedSampleId, setSelectedSampleId] = useState<string>('none');

  const selectedSubject = useMemo(
    () => subjects.find((item) => String(item.id) === selectedSubjectId) || null,
    [subjects, selectedSubjectId],
  );
  const selectedTopic = useMemo(
    () => topics.find((item) => String(item.id) === selectedTopicId) || null,
    [topics, selectedTopicId],
  );
  const selectedTemplate = useMemo(
    () => templates.find((item) => String(item.id) === selectedTemplateId) || null,
    [templates, selectedTemplateId],
  );
  const selectedSample = useMemo(
    () => samplePlans.find((item) => String(item.id) === selectedSampleId) || null,
    [samplePlans, selectedSampleId],
  );

  const filteredTemplates = useMemo(() => {
    return templates;
  }, [templates]);

  useEffect(() => {
    if (filteredTemplates.length === 0) {
      if (selectedTemplateId) {
        setSelectedTemplateId('');
      }
      return;
    }

    const hasCurrentTemplate = filteredTemplates.some((item) => String(item.id) === selectedTemplateId);
    if (hasCurrentTemplate) {
      return;
    }

    const nextTemplate = filteredTemplates[0];
    setSelectedTemplateId(String(nextTemplate.id));
    if (nextTemplate.gradeLevel) {
      setGrade(normalizeGrade(nextTemplate.gradeLevel));
    }
  }, [filteredTemplates, selectedTemplateId]);

  useEffect(() => {
    void loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedSubjectId) {
      setChapters([]);
      setSelectedChapterId('');
      return;
    }

    void loadChapters(Number(selectedSubjectId));
  }, [selectedSubjectId]);

  useEffect(() => {
    if (!selectedChapterId) {
      setTopics([]);
      setSelectedTopicId('');
      return;
    }

    void loadTopics(Number(selectedChapterId));
  }, [selectedChapterId]);

  useEffect(() => {
    if (!selectedTopicId) {
      setSamplePlans([]);
      setSelectedSampleId('none');
      return;
    }

    void loadSamplePlans(Number(selectedTopicId));
  }, [selectedTopicId]);

  const loadInitialData = async () => {
    setLoadingReferences(true);
    try {
      const [subjectResult, templateResult] = await Promise.allSettled([
        api.getSubjects(),
        api.getActiveCurriculumTemplates(),
      ]);

      const nextSubjects = subjectResult.status === 'fulfilled' && Array.isArray(subjectResult.value)
        ? subjectResult.value
        : [];
      const nextTemplates = templateResult.status === 'fulfilled' && Array.isArray(templateResult.value)
        ? templateResult.value
        : [];
      setSubjects(nextSubjects);
      setTemplates(nextTemplates);

      if (subjectResult.status === 'rejected' || templateResult.status === 'rejected') {
        setErrorMsg('Một số dữ liệu chưa tải được. Bạn vẫn có thể chọn lại hoặc tải trang.');
      }

      if (isEditMode && lessonPlanId) {
        await loadLessonPlanDetail(lessonPlanId, nextSubjects, nextTemplates);
      } else if (nextSubjects[0]) {
        setSelectedSubjectId(String(nextSubjects[0].id));
      }
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message || error?.message || 'Không tải được dữ liệu giáo án.');
    } finally {
      setLoadingReferences(false);
    }
  };

  const loadChapters = async (subjectId: number) => {
    try {
      const chapterList = await api.getChaptersBySubject(subjectId);
      const nextChapters = Array.isArray(chapterList) ? chapterList : [];
      setChapters(nextChapters);

      setSelectedChapterId((prev) =>
        nextChapters.find((item) => String(item.id) === prev)
          ? prev
          : nextChapters[0]
            ? String(nextChapters[0].id)
            : '',
      );
    } catch {
      setChapters([]);
      setSelectedChapterId('');
    }
  };

  const loadTopics = async (chapterId: number) => {
    try {
      const topicList = await api.getTopicsByChapter(chapterId);
      const nextTopics = Array.isArray(topicList) ? topicList : [];
      setTopics(nextTopics);

      setSelectedTopicId((prev) =>
        nextTopics.find((item) => String(item.id) === prev)
          ? prev
          : nextTopics[0]
            ? String(nextTopics[0].id)
            : '',
      );
    } catch {
      setTopics([]);
      setSelectedTopicId('');
    }
  };

  const loadSamplePlans = async (topicId: number, curriculumTemplateId?: number) => {
    try {
      const list = await api.getApprovedSampleLessonPlans({ topicId, curriculumTemplateId });
      const nextSamplePlans = Array.isArray(list) ? list : [];
      setSamplePlans(nextSamplePlans);

      if (selectedSampleId !== 'none' && !nextSamplePlans.find((item) => String(item.id) === selectedSampleId)) {
        setSelectedSampleId('none');
      }
    } catch {
      setSamplePlans([]);
      setSelectedSampleId('none');
    }
  };

  const loadLessonPlanDetail = async (planId: number, subjectList: SubjectItem[], templateList: TemplateItem[]) => {
    setLoadingDetail(true);
    try {
      const plan: any = await api.getLessonPlanById(planId);
      const subjectId = plan.topic?.chapter?.subject?.id;
      const chapterId = plan.topic?.chapter?.id;
      const topicId = plan.topic?.id;
      const templateId = plan.curriculumTemplate?.id;
      const sampleId = plan.sampleLessonPlan?.id;

      setTitle(plan.title || '');
      setGrade(normalizeGrade(plan.curriculumTemplate?.gradeLevel || plan.content?.grade || plan.topic?.chapter?.subject?.name));
      setDuration('45');
      setSelectedSubjectId(subjectId ? String(subjectId) : subjectList[0] ? String(subjectList[0].id) : '');
      setSelectedTemplateId(templateId ? String(templateId) : '');

      if (subjectId) {
        const chapterList = await api.getChaptersBySubject(subjectId);
        const nextChapters = Array.isArray(chapterList) ? chapterList : [];
        setChapters(nextChapters);
        setSelectedChapterId(chapterId ? String(chapterId) : nextChapters[0] ? String(nextChapters[0].id) : '');
      }

      if (chapterId) {
        const topicList = await api.getTopicsByChapter(chapterId);
        const nextTopics = Array.isArray(topicList) ? topicList : [];
        setTopics(nextTopics);
        setSelectedTopicId(topicId ? String(topicId) : nextTopics[0] ? String(nextTopics[0].id) : '');
      }

      if (topicId) {
        const approvedSamples = await api.getApprovedSampleLessonPlans({
          topicId,
          curriculumTemplateId: templateId,
        });
        const nextSamples = Array.isArray(approvedSamples) ? approvedSamples : [];
        setSamplePlans(nextSamples);
        setSelectedSampleId(sampleId ? String(sampleId) : 'none');
      }

      const template = templateList.find((item) => item.id === templateId);
      const parsedPlan = parsePlanContent(plan.content, {
        title: plan.title,
        subject: plan.topic?.chapter?.subject?.name || '',
        grade: normalizeGrade(template?.gradeLevel),
        topic: plan.topic?.title || '',
        duration: 45,
        templateName: plan.curriculumTemplate?.name,
        sampleTitle: plan.sampleLessonPlan?.title,
      });

      setGeneratedPlan(parsedPlan);
      setGrade(normalizeGrade(parsedPlan.grade || template?.gradeLevel));
      setTeacherNotes(parsedPlan.notes || '');
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message || error?.message || 'Không tải được giáo án cần sửa.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const buildAdditionalContext = () => {
    const chunks: string[] = [];

    if (selectedTemplate) {
      chunks.push(
        [
          `Mẫu trình bày đã chọn: ${selectedTemplate.name}`,
          selectedTemplate.description ? `Mô tả: ${selectedTemplate.description}` : '',
          selectedTemplate.structureJson ? `Cấu trúc: ${formatTemplateStructure(selectedTemplate.structureJson)}` : '',
        ].filter(Boolean).join('\n'),
      );
    }

    if (selectedSample?.content) {
      chunks.push(`Bài mẫu tham khảo:\n${selectedSample.content}`);
    }

    if (teacherNotes.trim()) {
      chunks.push(`Yêu cầu bổ sung của giáo viên:\n${teacherNotes.trim()}`);
    }

    return chunks.join('\n\n');
  };

  const handleGenerate = async () => {
    if (!selectedTopic || !selectedTemplate) {
      setErrorMsg('Cần chọn bài học và mẫu trình bày trước khi tạo.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response: any = await api.aiGenerateLessonPlan({
        topic: selectedTopic.title,
        subject: selectedSubject?.name || 'Hóa học',
        grade,
        durationMinutes: Number(duration),
        additionalContext: buildAdditionalContext(),
      });

      const nextPlan: GeneratedPlan = {
        title: title.trim() || response.title || `${selectedTopic.title} - Giáo án`,
        subject: selectedSubject?.name || 'Hóa học',
        grade,
        topic: response.topic || selectedTopic.title,
        duration: response.durationMinutes ?? Number(duration),
        objectives: Array.isArray(response.objectives) ? response.objectives : [],
        materials: [],
        activities: Array.isArray(response.activities)
          ? response.activities.map((activity: any) => ({
            time: typeof activity.time === 'number' ? `${activity.time} phút` : String(activity.time || ''),
            activity: activity.activity || '',
            description: activity.description || '',
          }))
          : [],
        assessment: response.assessment || '',
        homework: response.homework || '',
        notes: teacherNotes.trim(),
        templateName: selectedTemplate.name,
        sampleTitle: selectedSample?.title,
      };

      setGeneratedPlan(nextPlan);
      if (!title.trim()) {
        setTitle(nextPlan.title);
      }
    } catch (error: any) {
      const detail =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        'Đã có lỗi khi tạo giáo án.';
      setErrorMsg(String(detail));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePlan = async () => {
    if (!generatedPlan || !selectedTopicId || !selectedTemplateId) {
      setErrorMsg('Cần tạo giáo án trước khi lưu.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    try {
      const payload = {
        title: title.trim() || generatedPlan.title,
        content: JSON.stringify({
          ...generatedPlan,
          title: title.trim() || generatedPlan.title,
          notes: teacherNotes.trim(),
        }),
        topicId: Number(selectedTopicId),
        curriculumTemplateId: Number(selectedTemplateId),
        sampleLessonPlanId: selectedSampleId !== 'none' ? Number(selectedSampleId) : undefined,
        status: 'DONE' as const,
      };

      if (isEditMode && lessonPlanId) {
        await api.updateLessonPlan(lessonPlanId, payload);
      } else {
        await api.createLessonPlan(payload);
      }

      navigate('/teacher/lesson-plans');
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message || error?.message || 'Không lưu được giáo án.');
    } finally {
      setIsSaving(false);
    }
  };

  const addObjective = () => {
    if (!generatedPlan) return;
    setGeneratedPlan({
      ...generatedPlan,
      objectives: [...generatedPlan.objectives, ''],
    });
  };

  const addMaterial = () => {
    if (!generatedPlan) return;
    setGeneratedPlan({
      ...generatedPlan,
      materials: [...generatedPlan.materials, ''],
    });
  };

  const removeObjective = (index: number) => {
    if (!generatedPlan) return;
    setGeneratedPlan({
      ...generatedPlan,
      objectives: generatedPlan.objectives.filter((_, idx) => idx !== index),
    });
  };

  const removeMaterial = (index: number) => {
    if (!generatedPlan) return;
    setGeneratedPlan({
      ...generatedPlan,
      materials: generatedPlan.materials.filter((_, idx) => idx !== index),
    });
  };

  const buildLessonPlanExportHtml = () => {
    if (!generatedPlan) return '';

    const objectiveItems = generatedPlan.objectives
      .map((objective) => `<li>${escapeHtml(objective)}</li>`)
      .join('');
    const materialItems = generatedPlan.materials
      .map((material) => `<li>${escapeHtml(material)}</li>`)
      .join('');
    const activityBlocks = generatedPlan.activities
      .map((activity, index) => `
        <div class="card">
          <h3>${index + 1}. ${escapeHtml(activity.activity || 'Hoạt động')}</h3>
          <p class="muted">Thời lượng: ${escapeHtml(activity.time || '')}</p>
          ${activity.description ? `<p>${escapeHtml(activity.description)}</p>` : ''}
        </div>
      `)
      .join('');

    return `
      <h1>${escapeHtml(title.trim() || generatedPlan.title || 'Giáo án')}</h1>
      <p><strong>Môn học:</strong> ${escapeHtml(generatedPlan.subject || '')}</p>
      <p><strong>Khối lớp:</strong> ${escapeHtml(generatedPlan.grade || '')}</p>
      <p><strong>Bài học:</strong> ${escapeHtml(generatedPlan.topic || '')}</p>
      <p><strong>Thời lượng:</strong> ${generatedPlan.duration} phút</p>
      ${generatedPlan.templateName ? `<p><strong>Mẫu trình bày:</strong> ${escapeHtml(generatedPlan.templateName)}</p>` : ''}
      ${generatedPlan.sampleTitle ? `<p><strong>Bài mẫu tham khảo:</strong> ${escapeHtml(generatedPlan.sampleTitle)}</p>` : ''}

      <div class="section">
        <h2>I. Mục tiêu bài học</h2>
        ${objectiveItems ? `<ol>${objectiveItems}</ol>` : '<p>Chưa có mục tiêu.</p>'}
      </div>

      <div class="section">
        <h2>II. Học liệu và chuẩn bị</h2>
        ${materialItems ? `<ul>${materialItems}</ul>` : '<p>Chưa có học liệu riêng.</p>'}
      </div>

      <div class="section">
        <h2>III. Tiến trình dạy học</h2>
        ${activityBlocks || '<p>Chưa có hoạt động.</p>'}
      </div>

      <div class="section">
        <h2>IV. Đánh giá</h2>
        <p>${escapeHtml(generatedPlan.assessment || 'Chưa có nội dung đánh giá.')}</p>
      </div>

      <div class="section">
        <h2>V. Bài tập/Dặn dò</h2>
        <p>${escapeHtml(generatedPlan.homework || 'Chưa có nội dung bài tập.')}</p>
      </div>

      <div class="section">
        <h2>VI. Ghi chú giáo viên</h2>
        <p>${escapeHtml(teacherNotes.trim() || generatedPlan.notes || 'Không có ghi chú bổ sung.')}</p>
      </div>
    `;
  };

  const handleExportLessonPlanPdf = () => {
    if (!generatedPlan) return;
    exportPdfDocument(title.trim() || generatedPlan.title || 'Giáo án', buildLessonPlanExportHtml());
  };

  const handleExportLessonPlanWord = () => {
    if (!generatedPlan) return;
    exportWordDocument(
      `giao-an-${generatedPlan.topic || generatedPlan.title || 'planbook-ai'}`,
      title.trim() || generatedPlan.title || 'Giáo án',
      buildLessonPlanExportHtml(),
    );
  };

  if (loadingReferences || loadingDetail) {
    return (
      <DashboardLayout role="teacher" userName={realName}>
        <div className="flex min-h-[50vh] items-center justify-center text-gray-600">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Đang tải dữ liệu giáo án...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher" userName={realName}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to={isEditMode ? '/teacher/lesson-plans' : '/teacher'}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Cập nhật giáo án' : 'Soạn giáo án'}
            </h1>
            <p className="text-gray-600">Chọn khung, bài học và dùng AI để tạo giáo án đúng cấu trúc.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Cấu hình giáo án
              </CardTitle>
              <CardDescription>Chọn dữ liệu thật từ hệ thống trước khi gọi AI.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tiêu đề giáo án</Label>
                <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ví dụ: Phản ứng oxi hóa - khử" />
              </div>

              <div className="space-y-2">
                <Label>Môn học</Label>
                <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={String(subject.id)}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Chương</Label>
                <Select value={selectedChapterId} onValueChange={setSelectedChapterId} disabled={!chapters.length}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chương" />
                  </SelectTrigger>
                  <SelectContent>
                    {chapters.map((chapter) => (
                      <SelectItem key={chapter.id} value={String(chapter.id)}>
                        {chapter.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Bài học</Label>
                <Select value={selectedTopicId} onValueChange={setSelectedTopicId} disabled={!topics.length}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn bài học" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={String(topic.id)}>
                        {topic.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <Label>Thời lượng</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 phút</SelectItem>
                      <SelectItem value="45">45 phút</SelectItem>
                      <SelectItem value="60">60 phút</SelectItem>
                      <SelectItem value="90">90 phút</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mẫu trình bày</Label>
                <Select value={selectedTemplateId} onValueChange={(value) => {
                  setSelectedTemplateId(value);
                  const nextTemplate = filteredTemplates.find((item) => String(item.id) === value);
                  if (nextTemplate?.gradeLevel) {
                    setGrade(normalizeGrade(nextTemplate.gradeLevel));
                  }
                }} disabled={!filteredTemplates.length}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn mẫu trình bày" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTemplates.map((template) => (
                      <SelectItem key={template.id} value={String(template.id)}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate?.description ? (
                  <p className="text-xs text-gray-500">{selectedTemplate.description}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Bài mẫu tham khảo</Label>
                <Select value={selectedSampleId} onValueChange={setSelectedSampleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn bài mẫu (không bắt buộc)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không dùng bài mẫu</SelectItem>
                    {samplePlans.map((sample) => (
                      <SelectItem key={sample.id} value={String(sample.id)}>
                        {sample.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTopicId && samplePlans.length === 0 ? (
                  <p className="text-xs text-gray-500">Chưa có bài mẫu phù hợp. AI sẽ tạo mới theo mẫu trình bày.</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Yêu cầu bổ sung</Label>
                <Textarea
                  value={teacherNotes}
                  onChange={(event) => setTeacherNotes(event.target.value)}
                  placeholder="Ví dụ: Tập trung hoạt động nhóm, có câu hỏi kiểm tra nhanh cuối tiết..."
                  rows={4}
                />
              </div>

              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang tạo giáo án...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Tạo giáo án bằng AI
                  </>
                )}
              </Button>

              {errorMsg ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {errorMsg}
                </div>
              ) : null}

              <div className="rounded-lg border bg-slate-50 p-3 text-xs text-slate-600">
                {selectedTemplate ? (
                  <>
                    <p className="font-medium text-slate-800 mb-1">Mẫu đang áp dụng</p>
                    <p>{selectedTemplate.name}</p>
                    {selectedTemplate.structureJson ? (
                      <pre className="mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap rounded border bg-white p-2 font-sans text-[11px] text-slate-600">
                        {formatTemplateStructure(selectedTemplate.structureJson)}
                      </pre>
                    ) : null}
                  </>
                ) : (
                  <p>Chọn mẫu trình bày để AI bám theo cấu trúc mong muốn.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bản nháp giáo án</CardTitle>
                  <CardDescription>Xem lại nội dung trước khi lưu vào kho giáo án cá nhân.</CardDescription>
                </div>
                {generatedPlan ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportLessonPlanPdf}>
                      <Download className="w-4 h-4 mr-2" />
                      Xuất PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportLessonPlanWord}>
                      <Download className="w-4 h-4 mr-2" />
                      Xuất Word
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleSavePlan} disabled={isSaving}>
                      {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      {isEditMode ? 'Lưu cập nhật' : 'Lưu giáo án'}
                    </Button>
                  </div>
                ) : null}
              </div>
            </CardHeader>
            <CardContent>
              {!generatedPlan ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-6 rounded-full mb-4">
                    <Sparkles className="w-12 h-12 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có giáo án</h3>
                  <p className="max-w-md text-gray-600">
                    Chọn bài học, mẫu trình bày và bấm tạo để nhận nội dung đúng cấu trúc.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="border-b-2 pb-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{generatedPlan.title}</h2>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline">{generatedPlan.subject}</Badge>
                      <Badge variant="outline">Khối {generatedPlan.grade}</Badge>
                      <Badge className="bg-blue-100 text-blue-700">{generatedPlan.duration} phút</Badge>
                      {generatedPlan.templateName ? <Badge className="bg-purple-100 text-purple-700">{generatedPlan.templateName}</Badge> : null}
                      {generatedPlan.sampleTitle ? <Badge className="bg-amber-100 text-amber-700">Mẫu: {generatedPlan.sampleTitle}</Badge> : null}
                    </div>
                    <p className="text-gray-700">
                      <span className="font-semibold">Bài học:</span> {generatedPlan.topic}
                    </p>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">Mục tiêu bài học</h3>
                      <Button variant="outline" size="sm" onClick={addObjective}>
                        <Plus className="w-4 h-4 mr-1" />
                        Thêm
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {generatedPlan.objectives.map((objective, index) => (
                        <div key={`${objective}-${index}`} className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                          <span className="mt-0.5 font-semibold text-blue-700">{index + 1}.</span>
                          <p className="flex-1 text-gray-900">{objective}</p>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeObjective(index)}>
                            <Trash2 className="w-3 h-3 text-gray-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">Học liệu và chuẩn bị</h3>
                      <Button variant="outline" size="sm" onClick={addMaterial}>
                        <Plus className="w-4 h-4 mr-1" />
                        Thêm
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {generatedPlan.materials.length === 0 ? (
                        <div className="rounded border border-dashed p-3 text-sm text-gray-500">Chưa có học liệu riêng.</div>
                      ) : (
                        generatedPlan.materials.map((material, index) => (
                          <div key={`${material}-${index}`} className="flex items-center justify-between rounded border bg-gray-50 p-3">
                            <span>{material}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeMaterial(index)}>
                              <Trash2 className="w-3 h-3 text-gray-500" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-lg font-bold text-gray-900">Tiến trình dạy học</h3>
                    <div className="space-y-4">
                      {generatedPlan.activities.map((activity, index) => (
                        <div key={`${activity.activity}-${index}`} className="relative border-l-2 border-purple-300 pl-8 pb-4 last:border-l-0">
                          <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full bg-purple-600" />
                          <div className="rounded-lg border bg-white p-4 shadow-sm">
                            <div className="mb-2 flex items-center gap-2">
                              <Badge className="shrink-0 bg-purple-100 text-purple-700">{activity.time}</Badge>
                              <h4 className="font-bold text-gray-900">{activity.activity}</h4>
                            </div>
                            {activity.description ? (
                              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{activity.description}</p>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <h3 className="mb-2 text-lg font-bold text-gray-900">Đánh giá</h3>
                    <p className="text-gray-900">{generatedPlan.assessment || 'Chưa có nội dung đánh giá.'}</p>
                  </div>

                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                    <h3 className="mb-2 text-lg font-bold text-gray-900">Bài tập/Dặn dò</h3>
                    <p className="text-gray-900">{generatedPlan.homework || 'Chưa có nội dung bài tập.'}</p>
                  </div>

                  <div className="rounded-lg border bg-gray-50 p-4">
                    <h3 className="mb-2 text-lg font-bold text-gray-900">Ghi chú giáo viên</h3>
                    <p className="whitespace-pre-line text-sm text-gray-700">
                      {teacherNotes.trim() || 'Không có ghi chú bổ sung.'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
