import { useState } from 'react';
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
import { mockQuestions } from '../mockData';
import { Question } from '../types';
import { ArrowLeft, Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';

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

export default function QuestionBank() {
  const realName = useRealUserName();
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || q.subject === subjectFilter;
    const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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
              <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
              <p className="text-gray-600">Manage and organize your question repository</p>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Question</DialogTitle>
                <DialogDescription>Create a new question for your question bank</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select defaultValue="Chemistry">
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
                    <Label>Topic</Label>
                    <Input placeholder="e.g., Atomic Structure" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select defaultValue="multiple-choice">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                        <SelectItem value="short-answer">Short Answer</SelectItem>
                        <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                        <SelectItem value="essay">Essay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Question</Label>
                  <Textarea placeholder="Enter your question here..." rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Options (for multiple choice)</Label>
                  {[1, 2, 3, 4].map((num) => (
                    <Input key={num} placeholder={`Option ${num}`} />
                  ))}
                </div>
                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  <Input placeholder="Enter the correct answer or option number" />
                </div>
                <div className="space-y-2">
                  <Label>Explanation (Optional)</Label>
                  <Textarea placeholder="Provide an explanation for the correct answer..." rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Tags (comma separated)</Label>
                  <Input placeholder="e.g., atoms, periodic-table, elements" />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">Save Question</Button>
                  <Button variant="outline" className="flex-1">Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-900">{questions.length}</div>
              <p className="text-sm text-gray-600">Total Questions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {questions.filter(q => q.difficulty === 'easy').length}
              </div>
              <p className="text-sm text-gray-600">Easy Questions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">
                {questions.filter(q => q.difficulty === 'medium').length}
              </div>
              <p className="text-sm text-gray-600">Medium Questions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">
                {questions.filter(q => q.difficulty === 'hard').length}
              </div>
              <p className="text-sm text-gray-600">Hard Questions</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search questions or topics..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <Card>
          <CardHeader>
            <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
            <CardDescription>Click on a question to view details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedQuestion(question)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{question.subject}</Badge>
                        <Badge variant="outline">{question.topic}</Badge>
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                      </div>
                      <p className="font-medium text-gray-900 mb-2">{question.question}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Type: {question.type}</span>
                        <span>•</span>
                        <span>Tags: {question.tags.join(', ')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Question Detail Dialog */}
        {selectedQuestion && (
          <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Question Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex gap-2">
                  <Badge variant="outline">{selectedQuestion.subject}</Badge>
                  <Badge variant="outline">{selectedQuestion.topic}</Badge>
                  <Badge className={getDifficultyColor(selectedQuestion.difficulty)}>
                    {selectedQuestion.difficulty}
                  </Badge>
                </div>
                <div>
                  <Label className="text-base">Question:</Label>
                  <p className="mt-2 text-gray-900">{selectedQuestion.question}</p>
                </div>
                {selectedQuestion.options && (
                  <div>
                    <Label className="text-base">Options:</Label>
                    <div className="mt-2 space-y-2">
                      {selectedQuestion.options.map((option, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            index === selectedQuestion.correctAnswer
                              ? 'bg-green-50 border-green-500'
                              : 'bg-gray-50'
                          }`}
                        >
                          <span className="font-medium mr-2">{index + 1}.</span>
                          {option}
                          {index === selectedQuestion.correctAnswer && (
                            <Badge className="ml-2 bg-green-600">Correct Answer</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedQuestion.explanation && (
                  <div>
                    <Label className="text-base">Explanation:</Label>
                    <p className="mt-2 text-gray-700 bg-blue-50 p-3 rounded-lg">
                      {selectedQuestion.explanation}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-base">Tags:</Label>
                  <div className="flex gap-2 mt-2">
                    {selectedQuestion.tags.map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}


