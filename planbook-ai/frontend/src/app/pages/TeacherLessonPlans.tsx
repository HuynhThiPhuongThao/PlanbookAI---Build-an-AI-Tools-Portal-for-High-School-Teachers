import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileText, Plus, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import * as api from '../api/curriculumApi';

function getNameFromToken(): string {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return '';
    return JSON.parse(atob(token.split('.')[1])).fullName || '';
  } catch { return ''; }
}

export default function TeacherLessonPlans() {
  const userName = getNameFromToken();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res: any = await api.getMyLessonPlans();
      setPlans(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách giáo án:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa giáo án này không?")) return;
    try {
      await api.deleteLessonPlan(id);
      fetchPlans();
    } catch (e) {
      alert("Xóa thất bại!");
    }
  };

  return (
    <DashboardLayout role="teacher" userName={userName}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Giáo Án Của Tôi</h1>
            <p className="text-gray-600">Quản lý các giáo án bạn đã tạo</p>
          </div>
          <Link to="/lesson-planner">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Tạo Giáo Án Mới
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Danh sách Giáo Án
            </CardTitle>
            <CardDescription>
              Hiển thị tất cả giáo án bạn đang sở hữu
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">Chưa có giáo án nào.</p>
                <p className="text-sm mt-1">Hãy bấm "Tạo Giáo Án Mới" để bắt đầu.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map(plan => (
                  <div key={plan.id} className="border p-4 rounded-lg bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{plan.title}</h3>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {plan.topic?.name ? `Chủ đề: ${plan.topic.name}` : 'Không có chủ đề'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-4 border-t mt-2">
                      <Link to={`/teacher/lesson-plans/${plan.id}`} className="flex-1">
                        <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">
                          <Eye className="w-4 h-4 mr-2" /> Xem / Sửa
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0" onClick={() => handleDelete(plan.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
