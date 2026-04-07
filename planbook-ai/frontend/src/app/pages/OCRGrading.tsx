import { useState } from 'react';
import { Link } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { ArrowLeft, Upload, ScanLine, CheckCircle, AlertCircle, Loader2, Download, Eye } from 'lucide-react';

export default function OCRGrading() {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gradingResults, setGradingResults] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file.name);
      setIsProcessing(true);
      
      // Simulate OCR processing
      setTimeout(() => {
        setGradingResults({
          examTitle: 'Chemistry Midterm Exam - Grade 10',
          totalStudents: 5,
          processed: 5,
          averageScore: 86.2,
          highestScore: 95,
          lowestScore: 72,
          gradedAt: new Date().toISOString(),
          results: [
            {
              studentId: 'S001',
              studentName: 'Nguyễn Văn An',
              score: 85,
              totalMarks: 100,
              percentage: 85,
              correctAnswers: 17,
              totalQuestions: 20,
              timeSpent: '52 min',
              status: 'completed'
            },
            {
              studentId: 'S002',
              studentName: 'Trần Thị Bình',
              score: 95,
              totalMarks: 100,
              percentage: 95,
              correctAnswers: 19,
              totalQuestions: 20,
              timeSpent: '48 min',
              status: 'completed'
            },
            {
              studentId: 'S003',
              studentName: 'Lê Minh Châu',
              score: 72,
              totalMarks: 100,
              percentage: 72,
              correctAnswers: 14,
              totalQuestions: 20,
              timeSpent: '55 min',
              status: 'completed'
            },
            {
              studentId: 'S004',
              studentName: 'Phạm Quốc Dũng',
              score: 88,
              totalMarks: 100,
              percentage: 88,
              correctAnswers: 18,
              totalQuestions: 20,
              timeSpent: '50 min',
              status: 'completed'
            },
            {
              studentId: 'S005',
              studentName: 'Hoàng Thu Hà',
              score: 91,
              totalMarks: 100,
              percentage: 91,
              correctAnswers: 18,
              totalQuestions: 20,
              timeSpent: '47 min',
              status: 'completed'
            }
          ]
        });
        setIsProcessing(false);
      }, 3000);
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-700';
    if (percentage >= 75) return 'bg-blue-100 text-blue-700';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
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
            <h1 className="text-3xl font-bold text-gray-900">OCR-Based Exam Grading</h1>
            <p className="text-gray-600">Automatically grade scanned answer sheets using AI</p>
          </div>
        </div>

        {!uploadedFile ? (
          <>
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Answer Sheets</CardTitle>
                <CardDescription>
                  Upload scanned answer sheets (PDF or images) for automatic grading
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-4">
                      <div className="bg-blue-100 p-6 rounded-full">
                        <Upload className="w-12 h-12 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900 mb-2">
                          Drop your files here or click to browse
                        </p>
                        <p className="text-sm text-gray-600">
                          Supports PDF, JPG, PNG files • Max size: 10MB per file
                        </p>
                      </div>
                      <Button type="button" className="mt-4">
                        Select Files
                      </Button>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <ScanLine className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Advanced OCR</h3>
                      <p className="text-sm text-gray-600">
                        Accurately reads both printed and handwritten responses
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Instant Results</h3>
                      <p className="text-sm text-gray-600">
                        Get grading results in seconds, not hours
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Error Detection</h3>
                      <p className="text-sm text-gray-600">
                        Flags unclear or ambiguous responses for review
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Prepare Answer Sheets</h4>
                      <p className="text-sm text-gray-600">
                        Ensure students use the standard answer sheet format with clear bubbles for multiple choice answers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Scan Documents</h4>
                      <p className="text-sm text-gray-600">
                        Scan all answer sheets using a standard scanner or high-quality phone camera
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Upload & Process</h4>
                      <p className="text-sm text-gray-600">
                        Upload the scanned files and let our AI-powered OCR system automatically grade them
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Review & Export</h4>
                      <p className="text-sm text-gray-600">
                        Review results, add comments if needed, and export grades to your gradebook
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {isProcessing ? (
              <Card>
                <CardContent className="py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="bg-blue-100 p-6 rounded-full mb-6">
                      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Processing Answer Sheets...
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Using OCR to scan and grade {uploadedFile}
                    </p>
                    <div className="w-full max-w-md">
                      <Progress value={66} className="mb-2" />
                      <p className="text-sm text-gray-600">Processing 3 of 5 students...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : gradingResults && (
              <>
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-gray-600 mb-1">Students Graded</div>
                      <div className="text-3xl font-bold text-gray-900">
                        {gradingResults.processed}/{gradingResults.totalStudents}
                      </div>
                      <Badge className="mt-2 bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-gray-600 mb-1">Average Score</div>
                      <div className="text-3xl font-bold text-blue-600">
                        {gradingResults.averageScore}%
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Class average</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-gray-600 mb-1">Highest Score</div>
                      <div className="text-3xl font-bold text-green-600">
                        {gradingResults.highestScore}%
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Top performer</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-sm text-gray-600 mb-1">Lowest Score</div>
                      <div className="text-3xl font-bold text-orange-600">
                        {gradingResults.lowestScore}%
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Needs attention</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Results Table */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{gradingResults.examTitle}</CardTitle>
                        <CardDescription>
                          Graded {gradingResults.results.length} students • {new Date(gradingResults.gradedAt).toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export CSV
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Save to Gradebook
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {gradingResults.results.map((result: any) => (
                        <div key={result.studentId} className="p-4 border rounded-lg hover:bg-gray-50">
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
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span>{result.correctAnswers}/{result.totalQuestions} correct</span>
                                  <span>•</span>
                                  <span>Time: {result.timeSpent}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className={`text-2xl font-bold ${getScoreColor(result.percentage)}`}>
                                  {result.score}
                                </div>
                                <div className="text-sm text-gray-600">out of {result.totalMarks}</div>
                              </div>
                              <Badge className={getScoreBadgeColor(result.percentage)}>
                                {result.percentage}%
                              </Badge>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUploadedFile(null);
                      setGradingResults(null);
                    }}
                  >
                    Grade Another Batch
                  </Button>
                  <Link to="/student-results">
                    <Button variant="outline">
                      View All Student Results
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
