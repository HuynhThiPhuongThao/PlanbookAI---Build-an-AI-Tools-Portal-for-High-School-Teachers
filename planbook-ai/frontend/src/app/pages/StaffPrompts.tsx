import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';

import DashboardLayout from '../components/DashboardLayout';
import PromptForm from '../components/prompts/PromptForm';
import PromptList from '../components/prompts/PromptList';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';

import {
    promptApi,
    type CreatePromptPayload,
    type PromptTemplate,
} from '../api/promptApi';
import { getFullNameFromToken } from '../utils/jwt';

function getErrorMessage(error: any, fallback: string) {
    return error?.response?.data?.detail || error?.response?.data?.message || fallback;
}

function getNameFromToken(): string {
    return getFullNameFromToken();
}

export default function StaffPrompts() {
    const userName = getNameFromToken();
    const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [busyPromptId, setBusyPromptId] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const sortedPrompts = useMemo(() => {
        return [...prompts].sort((a, b) => b.id - a.id);
    }, [prompts]);

    const loadPrompts = async (showLoading = true) => {
        if (showLoading) {
            setLoading(true);
            setError('');
        }
        try {
            const data = await promptApi.getAll();
            setPrompts(data);
        } catch (err: any) {
            if (showLoading) setError(getErrorMessage(err, 'Không tải được danh sách mẫu lời nhắc.'));
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        void loadPrompts();

        const handleFirebaseNotification = (event: Event) => {
            const payload = (event as CustomEvent<any>).detail;
            const type = payload?.data?.type;
            const contentKind = payload?.data?.contentKind;
            if ((type === 'CONTENT_APPROVED' || type === 'CONTENT_REJECTED') && (!contentKind || contentKind === 'PROMPT')) {
                void loadPrompts(false);
            }
        };

        const intervalId = window.setInterval(() => {
            if (document.visibilityState === 'visible') void loadPrompts(false);
        }, 5000);

        window.addEventListener('firebaseNotificationReceived', handleFirebaseNotification as EventListener);
        return () => {
            window.removeEventListener('firebaseNotificationReceived', handleFirebaseNotification as EventListener);
            window.clearInterval(intervalId);
        };
    }, []);

    const handleCreate = async (payload: CreatePromptPayload) => {
        setCreating(true);
        setError('');
        setMessage('');
        try {
            await promptApi.create(payload);
            setMessage('Đã tạo mẫu lời nhắc và gửi Manager duyệt.');
            await loadPrompts();
        } catch (err: any) {
            setError(getErrorMessage(err, 'Tạo mẫu lời nhắc thất bại.'));
        } finally {
            setCreating(false);
        }
    };

    const handleSaveContent = async (promptId: number, content: string) => {
        if (!content.trim()) {
            setError('Nội dung mẫu lời nhắc không được để trống.');
            return;
        }

        setBusyPromptId(promptId);
        setError('');
        setMessage('');
        try {
            await promptApi.update(promptId, { content });
            setMessage('Đã tạo phiên bản mới và gửi Manager duyệt.');
            await loadPrompts();
        } catch (err: any) {
            setError(getErrorMessage(err, 'Cập nhật nội dung mẫu lời nhắc thất bại.'));
        } finally {
            setBusyPromptId(null);
        }
    };

    const handleDelete = async (promptId: number) => {
        setBusyPromptId(promptId);
        setError('');
        setMessage('');
        try {
            await promptApi.remove(promptId);
            setMessage('Đã xóa mẫu lời nhắc.');
            await loadPrompts();
        } catch (err: any) {
            setError(getErrorMessage(err, 'Xóa mẫu lời nhắc thất bại.'));
        } finally {
            setBusyPromptId(null);
        }
    };

    return (
        <DashboardLayout role="staff" userName={userName || 'Nhân viên'}>
            <div className="space-y-6">
                <div>
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <Button asChild variant="outline" size="sm" className="gap-1">
                                <Link to="/staff">
                                    <ArrowLeft className="h-4 w-4" />
                                    Quay lại trang nhân viên
                                </Link>
                            </Button>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Quản lý mẫu lời nhắc AI</h1>
                        <p className="text-gray-600 mt-2">
                            Tạo, chỉnh sửa và xóa mẫu lời nhắc hướng dẫn AI để sinh nội dung giáo dục.
                        </p>
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {message && (
                    <Alert>
                        <Sparkles className="h-4 w-4" />
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}

                <PromptForm isSubmitting={creating} onSubmit={handleCreate} />

                {loading ? (
                    <p className="text-sm text-gray-600">Đang tải danh sách mẫu lời nhắc...</p>
                ) : (
                    <PromptList
                        prompts={sortedPrompts}
                        busyPromptId={busyPromptId}
                        onRefresh={loadPrompts}
                        onSaveContent={handleSaveContent}
                        onDelete={handleDelete}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
