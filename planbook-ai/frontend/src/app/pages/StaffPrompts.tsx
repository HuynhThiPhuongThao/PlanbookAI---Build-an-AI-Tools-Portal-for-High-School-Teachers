import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';

import DashboardLayout from '../components/DashboardLayout';
import PromptForm from '../components/prompts/PromptForm';
import PromptList from '../components/prompts/PromptList';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Sparkles } from 'lucide-react';

import {
    promptApi,
    type CreatePromptPayload,
    type PromptTemplate,
} from '../api/promptApi';

export default function StaffPrompts() {
    const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [busyPromptId, setBusyPromptId] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const sortedPrompts = useMemo(() => {
        return [...prompts].sort((a, b) => b.id - a.id);
    }, [prompts]);

    const loadPrompts = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await promptApi.getAll();
            setPrompts(data);
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Failed to load prompt templates.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadPrompts();
    }, []);

    const handleCreate = async (payload: CreatePromptPayload) => {
        setCreating(true);
        setError('');
        setMessage('');
        try {
            await promptApi.create(payload);
            setMessage('Prompt created successfully.');
            await loadPrompts();
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Failed to create prompt.');
        } finally {
            setCreating(false);
        }
    };

    const handleSaveContent = async (promptId: number, content: string) => {
        if (!content) {
            setError('Prompt content cannot be empty.');
            return;
        }

        setBusyPromptId(promptId);
        setError('');
        setMessage('');
        try {
            await promptApi.update(promptId, { content });
            setMessage('Prompt content updated.');
            await loadPrompts();
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Failed to update prompt content.');
        } finally {
            setBusyPromptId(null);
        }
    };

    const handleSetActive = async (promptId: number) => {
        setBusyPromptId(promptId);
        setError('');
        setMessage('');
        try {
            await promptApi.update(promptId, { is_active: true });
            setMessage('Prompt activated.');
            await loadPrompts();
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Failed to activate prompt.');
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
            setMessage('Prompt deleted.');
            await loadPrompts();
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Failed to delete prompt.');
        } finally {
            setBusyPromptId(null);
        }
    };

    return (
        <DashboardLayout role="staff" userName="Staff Nguyễn Lan">
            <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">AI Prompt Templates</h1>
                        <p className="text-gray-600 mt-2">
                            Staff can create, edit, activate, and remove prompt templates for AI services.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link to="/staff">Back to Staff Dashboard</Link>
                    </Button>
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
                    <p className="text-sm text-gray-600">Loading prompt templates...</p>
                ) : (
                    <PromptList
                        prompts={sortedPrompts}
                        busyPromptId={busyPromptId}
                        onRefresh={loadPrompts}
                        onSaveContent={handleSaveContent}
                        onSetActive={handleSetActive}
                        onDelete={handleDelete}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
