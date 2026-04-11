import { useState } from 'react';
import { Link } from 'react-router';
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

export default function LessonPlanner() {
  const realName = useRealUserName();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Chemistry');
  const [grade, setGrade] = useState('Grade 10');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('45');

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedPlan({
        title: title || `${topic || subject} Lesson Plan`,
        subject,
        grade,
        topic: topic || 'Introduction to the Topic',
        duration: parseInt(duration),
        objectives: [
          'Students will understand the fundamental concepts of the topic',
          'Students will be able to apply knowledge to solve basic problems',
          'Students will develop critical thinking skills through hands-on activities'
        ],
        materials: [
          'Textbook: Chapter references',
          'Whiteboard and markers',
          'Laboratory equipment (if applicable)',
          'Student worksheets',
          'Multimedia presentation',
          'Safety equipment (if needed)'
        ],
        activities: [
          {
            time: `0-${Math.floor(duration * 0.2)} min`,
            activity: 'Introduction & Warm-up',
            description: 'Review previous lesson concepts. Introduce today\'s topic with a real-world connection or engaging question to capture student interest.'
          },
          {
            time: `${Math.floor(duration * 0.2)}-${Math.floor(duration * 0.5)} min`,
            activity: 'Direct Instruction',
            description: 'Present the main concepts using visual aids and examples. Encourage student questions and provide clear explanations. Break down complex ideas into manageable parts.'
          },
          {
            time: `${Math.floor(duration * 0.5)}-${Math.floor(duration * 0.75)} min`,
            activity: 'Guided Practice',
            description: 'Work through examples together as a class. Students participate in solving problems with teacher support. Address misconceptions immediately.'
          },
          {
            time: `${Math.floor(duration * 0.75)}-${Math.floor(duration * 0.9)} min`,
            activity: 'Independent Practice',
            description: 'Students work on problems individually or in small groups. Teacher circulates to provide assistance and check for understanding.'
          },
          {
            time: `${Math.floor(duration * 0.9)}-${duration} min`,
            activity: 'Closure & Assessment',
            description: 'Review key concepts learned. Students complete exit ticket or quick assessment. Preview homework and next lesson.'
          }
        ],
        assessment: 'Formative assessment through class participation, guided practice observation, and exit ticket (3-5 questions on key concepts). Monitor student understanding throughout the lesson.',
        homework: 'Complete worksheet problems 1-10. Read textbook pages for next lesson. Prepare questions for clarification.',
        notes: 'Adjust timing based on student understanding. Have extension activities ready for advanced students. Prepare additional support materials for struggling students.'
      });
      setIsGenerating(false);
    }, 2500);
  };

  const addObjective = () => {
    if (generatedPlan) {
      setGeneratedPlan({
        ...generatedPlan,
        objectives: [...generatedPlan.objectives, '']
      });
    }
  };

  const addMaterial = () => {
    if (generatedPlan) {
      setGeneratedPlan({
        ...generatedPlan,
        materials: [...generatedPlan.materials, '']
      });
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Lesson Planner</h1>
            <p className="text-gray-600">Create comprehensive lesson plans with AI assistance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI Lesson Generator
              </CardTitle>
              <CardDescription>Configure your lesson plan parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Lesson Title</Label>
                <Input
                  placeholder="e.g., Introduction to Chemical Bonding"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Topic / Chapter</Label>
                <Input
                  placeholder="e.g., Ionic and Covalent Bonds"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Additional Context (Optional)</Label>
                <Textarea
                  placeholder="Any specific requirements, teaching methods, or learning goals you want to emphasize..."
                  rows={4}
                />
              </div>

              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Lesson Plan
                  </>
                )}
              </Button>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-600 mb-2">Powered by Gemini AI</p>
                <div className="bg-purple-50 p-3 rounded-lg text-xs text-purple-900">
                  The AI will create a structured lesson plan following best practices in education, including objectives, activities, and assessment methods.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lesson Plan Preview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lesson Plan</CardTitle>
                  <CardDescription>Review and customize before saving</CardDescription>
                </div>
                {generatedPlan && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save Plan
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!generatedPlan ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-6 rounded-full mb-4">
                    <Sparkles className="w-12 h-12 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Lesson Plan Generated Yet
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    Fill in the details on the left and click "Generate Lesson Plan" to create a comprehensive lesson plan using AI.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Header Info */}
                  <div className="border-b-2 pb-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      {generatedPlan.title}
                    </h2>
                    <div className="flex gap-2 mb-3">
                      <Badge variant="outline">{generatedPlan.subject}</Badge>
                      <Badge variant="outline">{generatedPlan.grade}</Badge>
                      <Badge className="bg-blue-100 text-blue-700">
                        {generatedPlan.duration} minutes
                      </Badge>
                    </div>
                    {generatedPlan.topic && (
                      <p className="text-gray-700">
                        <span className="font-semibold">Topic:</span> {generatedPlan.topic}
                      </p>
                    )}
                  </div>

                  {/* Learning Objectives */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900">Learning Objectives</h3>
                      <Button variant="outline" size="sm" onClick={addObjective}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {generatedPlan.objectives.map((obj: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <span className="font-semibold text-blue-700 mt-0.5">{idx + 1}.</span>
                          <p className="flex-1 text-gray-900">{obj}</p>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Trash2 className="w-3 h-3 text-gray-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Materials Needed */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900">Materials Needed</h3>
                      <Button variant="outline" size="sm" onClick={addMaterial}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {generatedPlan.materials.map((material: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                          <span className="text-gray-900">• {material}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activities Timeline */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Lesson Activities</h3>
                    <div className="space-y-4">
                      {generatedPlan.activities.map((activity: any, idx: number) => (
                        <div key={idx} className="relative pl-8 pb-4 border-l-2 border-purple-300 last:border-l-0">
                          <div className="absolute left-[-9px] top-0 w-4 h-4 bg-purple-600 rounded-full" />
                          <div className="bg-white p-4 rounded-lg border shadow-sm">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <Badge className="bg-purple-100 text-purple-700 mb-2">
                                  {activity.time}
                                </Badge>
                                <h4 className="font-bold text-gray-900">{activity.activity}</h4>
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm">{activity.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assessment */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Assessment</h3>
                    <p className="text-gray-900">{generatedPlan.assessment}</p>
                  </div>

                  {/* Homework */}
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Homework Assignment</h3>
                    <p className="text-gray-900">{generatedPlan.homework}</p>
                  </div>

                  {/* Teacher Notes */}
                  {generatedPlan.notes && (
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Teacher Notes</h3>
                      <p className="text-gray-700 text-sm">{generatedPlan.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}


