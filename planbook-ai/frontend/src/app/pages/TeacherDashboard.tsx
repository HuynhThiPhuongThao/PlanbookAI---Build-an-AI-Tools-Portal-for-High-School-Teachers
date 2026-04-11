import { Link } from 'react-router';
import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  BookOpen,
  FileText,
  ClipboardCheck,
  ScanLine,
  Database,
  BarChart3,
  Sparkles,
  Clock,
  TrendingUp,
  Users,
} from 'lucide-react';

function getNameFromToken(): string {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return 'Teacher';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.fullName || 'Teacher';
  } catch { return 'Teacher'; }
}

export default function TeacherDashboard() {
  const [userName, setUserName] = React.useState(getNameFromToken());

  React.useEffect(() => {
    const handler = (e: any) => { if (e.detail?.fullName) setUserName(e.detail.fullName); };
    window.addEventListener('profileUpdated', handler);
    return () => window.removeEventListener('profileUpdated', handler);
  }, []);
  const quickStats = [
    { label: 'Questions Created', value: '156', icon: Database, change: '+12 this week' },
    { label: 'Exams Generated', value: '23', icon: FileText, change: '+3 this week' },
    { label: 'Students Graded', value: '485', icon: Users, change: '+45 today' },
    { label: 'Avg. Time Saved', value: '8.5h', icon: Clock, change: 'per week' },
  ];

  const aiTools = [
    {
      title: 'Lesson Planner',
      description: 'Create comprehensive lesson plans with AI assistance',
      icon: BookOpen,
      href: '/lesson-planner',
      color: 'bg-blue-500',
    },
    {
      title: 'Exercise Creator',
      description: 'Generate custom exercises aligned with curriculum',
      icon: ClipboardCheck,
      href: '/exercise-creator',
      color: 'bg-green-500',
    },
    {
      title: 'Exam Generator',
      description: 'Create multiple choice exams with question variations',
      icon: FileText,
      href: '/exam-generator',
      color: 'bg-purple-500',
    },
    {
      title: 'OCR Grading',
      description: 'Automatically grade scanned answer sheets',
      icon: ScanLine,
      href: '/ocr-grading',
      color: 'bg-orange-500',
    },
    {
      title: 'Question Bank',
      description: 'Manage and organize your question repository',
      icon: Database,
      href: '/question-bank',
      color: 'bg-pink-500',
    },
    {
      title: 'Student Results',
      description: 'View analytics and track student progress',
      icon: BarChart3,
      href: '/student-results',
      color: 'bg-cyan-500',
    },
  ];

  const recentActivity = [
    { action: 'Generated exam', title: 'Chemistry Midterm - Grade 10', time: '2 hours ago' },
    { action: 'Graded assignment', title: '25 students - Atomic Structure Quiz', time: '5 hours ago' },
    { action: 'Created lesson plan', title: 'Chemical Bonding Introduction', time: '1 day ago' },
    { action: 'Added questions', title: '8 new questions to Organic Chemistry', time: '2 days ago' },
  ];

  return (
    <DashboardLayout role="teacher" userName={userName}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chào mừng trở lại, {userName}! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your classes today
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI-Powered Features Banner */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">AI-Powered Teaching Assistant</h3>
                <p className="text-blue-100 mb-4">
                  Save up to 10 hours per week with our intelligent tools powered by Gemini AI. From lesson planning to automated grading, we've got you covered.
                </p>
                <Button variant="secondary" size="sm">
                  Learn More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Tools Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Teaching Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiTools.map((tool) => (
              <Link key={tool.title} to={tool.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div className={`${tool.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <tool.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle>{tool.title}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full justify-start group-hover:bg-gray-100">
                      Open Tool →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions on PlanbookAI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.title}</p>
                  </div>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
