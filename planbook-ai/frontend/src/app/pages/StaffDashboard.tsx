import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  FileText,
  Database,
  Sparkles,
  PlusCircle,
  CheckCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router';

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

export default function StaffDashboard() {
  const realName = useRealUserName();
  const staffStats = [
    { label: 'Lesson Plans Created', value: '34', icon: FileText, change: '+8 this week' },
    { label: 'Questions Added', value: '256', icon: Database, change: '+45 this week' },
    { label: 'Prompts Developed', value: '18', icon: Sparkles, change: '3 pending review' },
    { label: 'Approved Content', value: '89%', icon: CheckCircle, change: 'Approval rate' },
  ];

  const contentActions = [
    {
      title: 'Create Sample Lesson Plans',
      description: 'Develop structured lesson plans based on curriculum templates',
      icon: FileText,
      color: 'bg-blue-500',
      action: 'Create Lesson Plan',
      href: '/lesson-planner',
    },
    {
      title: 'Build Question Bank',
      description: 'Add categorized questions by topic, subject, and difficulty level',
      icon: Database,
      color: 'bg-green-500',
      action: 'Add Questions',
      href: '/question-bank',
    },
    {
      title: 'Manage AI Prompts',
      description: 'Create and update AI prompt templates for content generation',
      icon: Sparkles,
      color: 'bg-purple-500',
      action: 'Manage Prompts',
      href: '/staff/prompts',
    },
  ];

  const recentContent = [
    { type: 'Lesson Plan', title: 'Introduction to Organic Chemistry', status: 'Approved', date: '2026-03-03' },
    { type: 'Questions', title: '15 Questions - Stoichiometry', status: 'Pending', date: '2026-03-03' },
    { type: 'Prompt Template', title: 'Exam Generator - Chemistry', status: 'Approved', date: '2026-03-02' },
    { type: 'Lesson Plan', title: 'Chemical Bonding Basics', status: 'Approved', date: '2026-03-02' },
    { type: 'Questions', title: '20 Questions - Atomic Structure', status: 'In Review', date: '2026-03-01' },
  ];

  const topicsCovered = [
    { subject: 'Chemistry', topics: 12, questions: 156 },
    { subject: 'Organic Chemistry', topics: 8, questions: 89 },
    { subject: 'Inorganic Chemistry', topics: 6, questions: 67 },
    { subject: 'Physical Chemistry', topics: 5, questions: 54 },
  ];

  return (
    <DashboardLayout role="staff" userName={realName}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Staff Dashboard
          </h1>
          <p className="text-gray-600">
            Content creation and educational resource management
          </p>
        </div>

        {/* Staff Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {staffStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-8 h-8 text-green-600" />
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

        {/* Content Creation Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Creation Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contentActions.map((item) => (
              <Card key={item.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to={item.href}>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      {item.action}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Content</CardTitle>
                  <CardDescription>Your latest contributions</CardDescription>
                </div>
                <Button variant="outline" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentContent.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{item.type}</Badge>
                        <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                      </div>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                    <Badge className={
                      item.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                    }>
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Topics Covered */}
          <Card>
            <CardHeader>
              <CardTitle>Topics Coverage</CardTitle>
              <CardDescription>Questions by subject area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topicsCovered.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">{item.subject}</p>
                      <span className="text-2xl font-bold text-blue-600">{item.questions}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{item.topics} topics covered</span>
                      <span className="text-xs">questions</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Tips */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-500 p-3 rounded-full">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Content Creation Tips</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Ensure all questions have clear, unambiguous wording</li>
                  <li>• Include explanations for correct answers to aid student learning</li>
                  <li>• Tag content appropriately for easy searching and filtering</li>
                  <li>• Follow curriculum standards when creating lesson plans</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}


