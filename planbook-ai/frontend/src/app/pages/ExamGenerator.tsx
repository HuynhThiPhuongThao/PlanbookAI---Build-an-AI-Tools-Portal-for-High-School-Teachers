import { useState } from 'react';
import { Link } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Sparkles, Download, Shuffle, Loader2, FileText } from 'lucide-react';
import { mockQuestions } from '../mockData';

import React from 'react';

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

export default function ExamGenerator() {
  const realName = useRealUserName();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedExam, setGeneratedExam] = useState<any>(null);
  const [examTitle, setExamTitle] = useState('');
  const [subject, setSubject] = useState('Chemistry');
  const [grade, setGrade] = useState('Grade 10');
  const [questionCount, setQuestionCount] = useState('10');
  const [duration, setDuration] = useState('60');
  const [randomizeOrder, setRandomizeOrder] = useState(true);
  const [multipleVersions, setMultipleVersions] = useState(false);
  const [versionCount, setVersionCount] = useState('2');

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      const selectedQuestions = mockQuestions.slice(0, parseInt(questionCount));
      setGeneratedExam({
        title: examTitle || `${subject} ${grade} Exam`,
        subject,
        grade,
        duration: parseInt(duration),
        totalMarks: selectedQuestions.length * 10,
        questions: selectedQuestions.map((q, idx) => ({
          ...q,
          questionNumber: idx + 1,
          marks: 10
        })),
        versions: multipleVersions ? parseInt(versionCount) : 1,
        generatedAt: new Date().toISOString()
      });
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <DashboardLayout role="teacher" userName={realName}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/teacher">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exam Generator</h1>
            <p className="text-gray-600">Create multiple choice exams with AI-powered question selection</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Exam Configuration
              </CardTitle>
              <CardDescription>Set up your exam parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Exam Title</Label>
                <Input
                  placeholder="e.g., Chemistry Midterm Exam"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Grade Level</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grade 10">Grade 10</SelectItem>
                    <SelectItem value="Grade 11">Grade 11</SelectItem>
                    <SelectItem value="Grade 12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Number of Questions</Label>
                  <Select value={questionCount} onValueChange={setQuestionCount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Duration (min)</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="45">45</SelectItem>
                      <SelectItem value="60">60</SelectItem>
                      <SelectItem value="90">90</SelectItem>
                      <SelectItem value="120">120</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="randomize"
                    checked={randomizeOrder}
                    onCheckedChange={(checked) => setRandomizeOrder(!!checked)}
                  />
                  <label
                    htmlFor="randomize"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Randomize question order
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="versions"
                    checked={multipleVersions}
                    onCheckedChange={(checked) => setMultipleVersions(!!checked)}
                  />
                  <label
                    htmlFor="versions"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Generate multiple versions
                  </label>
                </div>

                {multipleVersions && (
                  <div className="ml-6 space-y-2">
                    <Label>Number of Versions</Label>
                    <Select value={versionCount} onValueChange={setVersionCount}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 Versions</SelectItem>
                        <SelectItem value="3">3 Versions</SelectItem>
                        <SelectItem value="4">4 Versions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Exam...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Exam
                  </>
                )}
              </Button>

              <div className="pt-4 border-t">
                <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-900 space-y-2">
                  <p className="font-semibold">Smart Question Selection:</p>
                  <ul className="space-y-1 ml-3">
                    <li>• Balanced difficulty distribution</li>
                    <li>• Topic coverage optimization</li>
                    <li>• Aligned with curriculum standards</li>
                    <li>• Auto-generated answer keys</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exam Preview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Exam Preview</CardTitle>
                  <CardDescription>Review your generated exam</CardDescription>
                </div>
                {generatedExam && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Shuffle className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Save Exam
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!generatedExam ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-6 rounded-full mb-4">
                    <FileText className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Exam Generated Yet
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    Configure your exam settings and click "Generate Exam" to create a professionally formatted exam paper.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Exam Header */}
                  <div className="text-center pb-6 border-b-2 border-gray-300">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      {generatedExam.title}
                    </h2>
                    <div className="flex justify-center gap-4 mb-4">
                      <div className="text-sm">
                        <span className="font-semibold">Subject:</span> {generatedExam.subject}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">Grade:</span> {generatedExam.grade}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">Duration:</span> {generatedExam.duration} minutes
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">Total Marks:</span> {generatedExam.totalMarks}
                      </div>
                    </div>
                    <div className="flex justify-center gap-2">
                      <Badge variant="outline">{generatedExam.questions.length} Questions</Badge>
                      {generatedExam.versions > 1 && (
                        <Badge className="bg-purple-100 text-purple-700">
                          Version A of {generatedExam.versions}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-semibold mb-2">Instructions:</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Read each question carefully</li>
                      <li>• Choose the best answer for each multiple choice question</li>
                      <li>• Each question carries equal marks</li>
                      <li>• Use a pencil to mark your answers on the answer sheet</li>
                    </ul>
                  </div>

                  {/* Questions */}
                  <div className="space-y-6">
                    {generatedExam.questions.map((q: any) => (
                      <div key={q.id} className="p-5 border-2 rounded-lg bg-white">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <span className="font-bold text-lg text-gray-900">
                              {q.questionNumber}.
                            </span>
                            <span className="ml-2 text-gray-900">{q.question}</span>
                          </div>
                          <Badge className="bg-blue-100 text-blue-700">{q.marks} marks</Badge>
                        </div>

                        {q.options && (
                          <div className="ml-6 space-y-2 mt-3">
                            {q.options.map((option: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50">
                                <span className="font-medium min-w-[24px]">
                                  {String.fromCharCode(65 + idx)}.
                                </span>
                                <span>{option}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Answer Key Section */}
                  <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                    <h3 className="font-bold text-lg mb-4 text-green-900">Answer Key (Teacher Copy)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {generatedExam.questions.map((q: any) => (
                        <div key={q.id} className="bg-white p-3 rounded border border-green-300">
                          <span className="font-semibold">Q{q.questionNumber}:</span>{' '}
                          <span className="font-bold text-green-700">
                            {String.fromCharCode(65 + (q.correctAnswer as number))}
                          </span>
                        </div>
                      ))}
                    </div>
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


