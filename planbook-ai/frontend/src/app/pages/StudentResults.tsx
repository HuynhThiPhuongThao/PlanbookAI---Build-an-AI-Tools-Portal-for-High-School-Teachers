import { useState } from 'react';
import { Link } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, Download, Eye } from 'lucide-react';
import { mockStudentResults } from '../mockData';

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

export default function StudentResults() {
  const realName = useRealUserName();
  const [selectedExam, setSelectedExam] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const results = selectedExam === 'all' 
    ? mockStudentResults 
    : mockStudentResults.filter(r => r.examId === selectedExam);

  const averageScore = results.reduce((sum, r) => sum + r.percentage, 0) / results.length;
  const passRate = (results.filter(r => r.percentage >= 60).length / results.length) * 100;
  const topScore = Math.max(...results.map(r => r.percentage));
  const lowScore = Math.min(...results.map(r => r.percentage));

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A', color: 'bg-green-100 text-green-700' };
    if (percentage >= 80) return { grade: 'B', color: 'bg-blue-100 text-blue-700' };
    if (percentage >= 70) return { grade: 'C', color: 'bg-yellow-100 text-yellow-700' };
    if (percentage >= 60) return { grade: 'D', color: 'bg-orange-100 text-orange-700' };
    return { grade: 'F', color: 'bg-red-100 text-red-700' };
  };

  const gradeDistribution = {
    A: results.filter(r => r.percentage >= 90).length,
    B: results.filter(r => r.percentage >= 80 && r.percentage < 90).length,
    C: results.filter(r => r.percentage >= 70 && r.percentage < 80).length,
    D: results.filter(r => r.percentage >= 60 && r.percentage < 70).length,
    F: results.filter(r => r.percentage < 60).length,
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
              <h1 className="text-3xl font-bold text-gray-900">Student Results & Analytics</h1>
              <p className="text-gray-600">Track student progress and performance</p>
            </div>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-xs">
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Exams</SelectItem>
                    <SelectItem value="exam1">Chemistry Midterm Exam - Grade 10</SelectItem>
                    <SelectItem value="exam2">Organic Chemistry Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Badge variant="outline" className="text-sm">
                {results.length} students
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <span className="text-3xl font-bold text-blue-600">{averageScore.toFixed(1)}%</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Class Average</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                {averageScore >= 75 ? (
                  <>
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <span className="text-green-600">Above target</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3 h-3 text-orange-600" />
                    <span className="text-orange-600">Below target</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-2">{passRate.toFixed(0)}%</div>
              <p className="text-sm text-gray-600">Pass Rate</p>
              <p className="text-xs text-gray-500 mt-1">
                {results.filter(r => r.percentage >= 60).length} of {results.length} students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">{topScore}%</div>
              <p className="text-sm text-gray-600">Highest Score</p>
              <p className="text-xs text-gray-500 mt-1">
                {results.find(r => r.percentage === topScore)?.studentName}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">{lowScore}%</div>
              <p className="text-sm text-gray-600">Lowest Score</p>
              <p className="text-xs text-gray-500 mt-1">
                {results.find(r => r.percentage === lowScore)?.studentName}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="results" className="w-full">
          <TabsList>
            <TabsTrigger value="results">Student Results</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Performance</CardTitle>
                <CardDescription>Detailed results for each student</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.map((result) => {
                    const gradeInfo = getGrade(result.percentage);
                    return (
                      <div
                        key={result.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedStudent(result)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                              {result.studentName.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-gray-900">{result.studentName}</p>
                                <Badge variant="outline">{result.studentId}</Badge>
                              </div>
                              <p className="text-sm text-gray-600">{result.examTitle}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900">
                                {result.score}/{result.totalMarks}
                              </div>
                              <div className="text-sm text-gray-600">
                                {result.percentage}%
                              </div>
                            </div>
                            <Badge className={gradeInfo.color}>
                              Grade: {gradeInfo.grade}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>Overview of student performance levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(gradeDistribution).map(([grade, count]) => {
                    const percentage = (count / results.length) * 100;
                    return (
                      <div key={grade}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Badge className={getGrade(
                              grade === 'A' ? 95 : 
                              grade === 'B' ? 85 : 
                              grade === 'C' ? 75 : 
                              grade === 'D' ? 65 : 55
                            ).color}>
                              Grade {grade}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {count} student{count !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-blue-600 h-3 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Question Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Question Analysis</CardTitle>
                <CardDescription>Most challenging questions for students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">Question 3</span>
                      <Badge className="bg-red-100 text-red-700">40% correct</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      What is the pH of a solution with [H+] = 1 × 10^-5 M?
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Action:</strong> Review pH calculations in next class
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">Question 4</span>
                      <Badge className="bg-yellow-100 text-yellow-700">60% correct</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      How many moles of O2 are needed to react with 2 moles of H2?
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Action:</strong> Provide additional practice on stoichiometry
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">Question 1</span>
                      <Badge className="bg-green-100 text-green-700">100% correct</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      What is the atomic number of Carbon?
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Status:</strong> Well understood by all students
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>Key observations and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Strong Performance</p>
                      <p className="text-sm text-gray-700">
                        Students show excellent understanding of basic atomic structure and periodic table concepts. 
                        Consider introducing more advanced topics.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Needs Improvement</p>
                      <p className="text-sm text-gray-700">
                        pH calculations and stoichiometry problems need additional practice. 
                        Recommend extra worksheets and one-on-one tutoring for struggling students.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Class Progress</p>
                      <p className="text-sm text-gray-700">
                        Overall class average of {averageScore.toFixed(1)}% shows solid progress. 
                        Continue current teaching methods while focusing on identified weak areas.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}


