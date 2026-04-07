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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Sparkles, Download, Eye, Loader2 } from 'lucide-react';

export default function ExerciseCreator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedExercise, setGeneratedExercise] = useState<any>(null);
  const [subject, setSubject] = useState('Chemistry');
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('Grade 10');
  const [questionCount, setQuestionCount] = useState('5');
  const [difficulty, setDifficulty] = useState('medium');

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedExercise({
        title: `${topic || 'Chemistry'} Practice Exercise`,
        subject,
        grade,
        questions: [
          {
            id: 1,
            question: 'Define the term "mole" in chemistry and explain its significance in stoichiometry.',
            type: 'Short Answer',
            points: 10,
            answer: 'A mole is the amount of substance that contains 6.022 × 10²³ particles (Avogadro\'s number). It is significant in stoichiometry as it allows us to convert between mass, number of particles, and volume of gases.'
          },
          {
            id: 2,
            question: 'Calculate the number of moles in 36 grams of water (H₂O). (Molar mass of H₂O = 18 g/mol)',
            type: 'Calculation',
            points: 15,
            answer: 'Number of moles = mass / molar mass = 36 g / 18 g/mol = 2 moles'
          },
          {
            id: 3,
            question: 'Balance the following chemical equation: __Al + __O₂ → __Al₂O₃',
            type: 'Fill in the Blank',
            points: 10,
            answer: '4Al + 3O₂ → 2Al₂O₃'
          },
          {
            id: 4,
            question: 'How many grams of CO₂ are produced when 10 grams of C is completely burned in oxygen? (C + O₂ → CO₂)',
            type: 'Problem Solving',
            points: 20,
            answer: 'Moles of C = 10g / 12g/mol = 0.833 mol. From equation, 1 mol C produces 1 mol CO₂. Mass of CO₂ = 0.833 mol × 44 g/mol = 36.7 g'
          },
          {
            id: 5,
            question: 'Explain the difference between a limiting reactant and an excess reactant with an example.',
            type: 'Short Answer',
            points: 15,
            answer: 'A limiting reactant is completely consumed in a reaction and determines the amount of product formed. An excess reactant is left over after the reaction. Example: In 2H₂ + O₂ → 2H₂O, if we have 4 mol H₂ and 1 mol O₂, O₂ is limiting (needs 2 mol H₂ only), and H₂ is in excess.'
          }
        ]
      });
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <DashboardLayout role="teacher" userName="Dr. Nguyễn Minh Hà">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/teacher">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exercise Creator</h1>
            <p className="text-gray-600">Generate custom exercises with AI assistance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI Exercise Generator
              </CardTitle>
              <CardDescription>Configure your exercise parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Label>Topic / Chapter</Label>
                <Input
                  placeholder="e.g., Stoichiometry, Mole Concept"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
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

              <div className="space-y-2">
                <Label>Number of Questions</Label>
                <Select value={questionCount} onValueChange={setQuestionCount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Questions</SelectItem>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="8">8 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Learning Objectives (Optional)</Label>
                <Textarea
                  placeholder="Enter specific learning objectives or topics to focus on..."
                  rows={3}
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
                    Generate Exercise
                  </>
                )}
              </Button>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-600 mb-2">Powered by Gemini AI</p>
                <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-900">
                  The AI will generate diverse question types including short answer, calculations, and problem-solving questions aligned with your curriculum.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Output Preview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Exercise</CardTitle>
                  <CardDescription>Preview and customize before saving</CardDescription>
                </div>
                {generatedExercise && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Save Exercise
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!generatedExercise ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-6 rounded-full mb-4">
                    <Sparkles className="w-12 h-12 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Exercise Generated Yet
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    Configure the parameters on the left and click "Generate Exercise" to create a custom exercise using AI.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Exercise Header */}
                  <div className="pb-4 border-b">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {generatedExercise.title}
                    </h2>
                    <div className="flex gap-2">
                      <Badge variant="outline">{generatedExercise.subject}</Badge>
                      <Badge variant="outline">{generatedExercise.grade}</Badge>
                      <Badge className="bg-purple-100 text-purple-700">
                        {generatedExercise.questions.length} Questions
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-700">
                        {generatedExercise.questions.reduce((sum: number, q: any) => sum + q.points, 0)} Total Points
                      </Badge>
                    </div>
                  </div>

                  {/* Questions */}
                  <Tabs defaultValue="questions" className="w-full">
                    <TabsList>
                      <TabsTrigger value="questions">Questions</TabsTrigger>
                      <TabsTrigger value="answers">Answer Key</TabsTrigger>
                    </TabsList>

                    <TabsContent value="questions" className="space-y-6 mt-6">
                      {generatedExercise.questions.map((q: any) => (
                        <div key={q.id} className="p-4 border rounded-lg bg-white">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-gray-900">Question {q.id}.</span>
                                <Badge variant="outline">{q.type}</Badge>
                                <Badge className="bg-green-100 text-green-700">{q.points} pts</Badge>
                              </div>
                              <p className="text-gray-900">{q.question}</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t">
                            <Textarea
                              placeholder="Student's answer space..."
                              rows={3}
                              className="bg-gray-50"
                            />
                          </div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="answers" className="space-y-4 mt-6">
                      {generatedExercise.questions.map((q: any) => (
                        <div key={q.id} className="p-4 border rounded-lg bg-green-50 border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-gray-900">Question {q.id}.</span>
                            <Badge variant="outline">{q.type}</Badge>
                            <Badge className="bg-green-600 text-white">{q.points} pts</Badge>
                          </div>
                          <p className="text-gray-900 mb-3">{q.question}</p>
                          <div className="bg-white p-3 rounded-lg">
                            <p className="text-sm font-medium text-green-700 mb-1">Answer:</p>
                            <p className="text-gray-900">{q.answer}</p>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
