import { useMemo, useState } from 'react';

import { Badge } from '../ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

import type { PromptTemplate } from '../../api/promptApi';

interface PromptListProps {
    prompts: PromptTemplate[];
    busyPromptId: number | null;
    onRefresh: () => Promise<void>;
    onSaveContent: (promptId: number, content: string) => Promise<void>;
    onSetActive: (promptId: number) => Promise<void>;
    onDelete: (promptId: number) => Promise<void>;
}

export default function PromptList({
    prompts,
    busyPromptId,
    onRefresh,
    onSaveContent,
    onSetActive,
    onDelete,
}: PromptListProps) {
    const [editingContent, setEditingContent] = useState<Record<number, string>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [nameFilter, setNameFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [deleteCandidate, setDeleteCandidate] = useState<PromptTemplate | null>(null);

    const availableNames = useMemo(() => {
        return [...new Set(prompts.map((prompt) => prompt.name))].sort((a, b) => a.localeCompare(b));
    }, [prompts]);

    const availableTypes = useMemo(() => {
        return [...new Set(prompts.map((prompt) => prompt.type))].sort((a, b) => a.localeCompare(b));
    }, [prompts]);

    const filteredPrompts = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        return prompts.filter((prompt) => {
            const matchesSearch = !keyword ||
                prompt.name.toLowerCase().includes(keyword) ||
                prompt.type.toLowerCase().includes(keyword) ||
                prompt.content.toLowerCase().includes(keyword);

            const matchesName = nameFilter === 'all' || prompt.name === nameFilter;
            const matchesType = typeFilter === 'all' || prompt.type === typeFilter;

            return matchesSearch && matchesName && matchesType;
        });
    }, [prompts, searchTerm, nameFilter, typeFilter]);

    const getContent = (prompt: PromptTemplate) => {
        if (Object.prototype.hasOwnProperty.call(editingContent, prompt.id)) {
            return editingContent[prompt.id];
        }
        return prompt.content;
    };

    const handleConfirmDelete = async () => {
        if (!deleteCandidate) {
            return;
        }

        await onDelete(deleteCandidate.id);
        setDeleteCandidate(null);
    };

    return (
        <Card>
            <CardHeader>
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <CardTitle>Prompt Templates</CardTitle>
                            <CardDescription>Update content, switch active version, or delete prompt templates.</CardDescription>
                        </div>
                        <Button variant="outline" onClick={onRefresh}>Refresh</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                            placeholder="Search by name, type, content..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />

                        <select
                            title="Filter by prompt name"
                            aria-label="Filter by prompt name"
                            className="h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                            value={nameFilter}
                            onChange={(event) => setNameFilter(event.target.value)}
                        >
                            <option value="all">All names</option>
                            {availableNames.map((name) => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>

                        <select
                            title="Filter by prompt type"
                            aria-label="Filter by prompt type"
                            className="h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                            value={typeFilter}
                            onChange={(event) => setTypeFilter(event.target.value)}
                        >
                            <option value="all">All types</option>
                            {availableTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <p className="text-xs text-gray-500">
                        Showing {filteredPrompts.length} / {prompts.length} prompts
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {filteredPrompts.length === 0 && (
                        <p className="text-sm text-gray-600">No prompt templates match your filters.</p>
                    )}

                    {filteredPrompts.map((prompt) => (
                        <div key={prompt.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-semibold text-gray-900">{prompt.name}</h3>
                                    <Badge variant="outline">type: {prompt.type}</Badge>
                                    <Badge variant="outline">v{prompt.version}</Badge>
                                    {prompt.is_active && <Badge className="bg-green-600">active</Badge>}
                                </div>
                                <div className="text-xs text-gray-500">ID: {prompt.id}</div>
                            </div>

                            <Textarea
                                className="min-h-36"
                                value={getContent(prompt)}
                                onChange={(event) => {
                                    setEditingContent((prev) => ({
                                        ...prev,
                                        [prompt.id]: event.target.value,
                                    }));
                                }}
                            />

                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    disabled={busyPromptId === prompt.id}
                                    onClick={() => onSaveContent(prompt.id, getContent(prompt).trim())}
                                >
                                    Save Content
                                </Button>
                                <Button
                                    variant="secondary"
                                    disabled={busyPromptId === prompt.id || prompt.is_active}
                                    onClick={() => onSetActive(prompt.id)}
                                >
                                    Set Active
                                </Button>
                                <Button
                                    variant="destructive"
                                    disabled={busyPromptId === prompt.id}
                                    onClick={() => setDeleteCandidate(prompt)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>

            <AlertDialog open={!!deleteCandidate} onOpenChange={(open) => {
                if (!open) {
                    setDeleteCandidate(null);
                }
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this prompt template?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteCandidate
                                ? `This will permanently delete prompt #${deleteCandidate.id} (${deleteCandidate.name}). This action cannot be undone.`
                                : 'This action cannot be undone.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={busyPromptId === deleteCandidate?.id}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={busyPromptId === deleteCandidate?.id}
                        >
                            {busyPromptId === deleteCandidate?.id ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
