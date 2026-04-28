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
import {
    formatPromptContentForDisplay,
    getPromptNameLabel,
    getPromptTypeLabel,
    preparePromptContentForSave,
} from '../../utils/promptDisplay';

interface PromptListProps {
    prompts: PromptTemplate[];
    busyPromptId: number | null;
    onRefresh: () => Promise<void>;
    onSaveContent: (promptId: number, content: string) => Promise<void>;
    onDelete: (promptId: number) => Promise<void>;
}

function getReviewStatus(prompt: PromptTemplate) {
    switch (prompt.approval_status) {
        case 'PENDING_REVIEW':
            return { label: 'Chờ Manager duyệt', className: 'bg-yellow-100 text-yellow-700' };
        case 'REJECTED':
            return { label: 'Bị từ chối', className: 'bg-red-100 text-red-700' };
        case 'APPROVED':
            return { label: 'Đã duyệt', className: 'bg-green-100 text-green-700' };
        default:
            return { label: prompt.is_active ? 'Đã duyệt' : 'Chờ Manager duyệt', className: 'bg-gray-100 text-gray-700' };
    }
}

export default function PromptList({
    prompts,
    busyPromptId,
    onRefresh,
    onSaveContent,
    onDelete,
}: PromptListProps) {
    const [editingContent, setEditingContent] = useState<Record<number, string>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [nameFilter, setNameFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [deleteCandidate, setDeleteCandidate] = useState<PromptTemplate | null>(null);

    const availableNames = useMemo(() => {
        return [...new Set(prompts.map((prompt) => prompt.name))]
            .sort((a, b) => getPromptNameLabel(a).localeCompare(getPromptNameLabel(b)));
    }, [prompts]);

    const availableTypes = useMemo(() => {
        return [...new Set(prompts.map((prompt) => prompt.type))]
            .sort((a, b) => getPromptTypeLabel(a).localeCompare(getPromptTypeLabel(b)));
    }, [prompts]);

    const filteredPrompts = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        return prompts.filter((prompt) => {
            const formattedContent = formatPromptContentForDisplay(prompt.content, prompt.name).toLowerCase();
            const promptNameLabel = getPromptNameLabel(prompt.name).toLowerCase();
            const promptTypeLabel = getPromptTypeLabel(prompt.type).toLowerCase();
            const matchesSearch = !keyword ||
                prompt.name.toLowerCase().includes(keyword) ||
                promptNameLabel.includes(keyword) ||
                prompt.type.toLowerCase().includes(keyword) ||
                promptTypeLabel.includes(keyword) ||
                prompt.content.toLowerCase().includes(keyword) ||
                formattedContent.includes(keyword);

            const matchesName = nameFilter === 'all' || prompt.name === nameFilter;
            const matchesType = typeFilter === 'all' || prompt.type === typeFilter;

            return matchesSearch && matchesName && matchesType;
        });
    }, [prompts, searchTerm, nameFilter, typeFilter]);

    const getContent = (prompt: PromptTemplate) => {
        if (Object.prototype.hasOwnProperty.call(editingContent, prompt.id)) {
            return editingContent[prompt.id];
        }
        return formatPromptContentForDisplay(prompt.content, prompt.name);
    };

    const handleSaveContent = (prompt: PromptTemplate) => {
        const content = preparePromptContentForSave(prompt.name, getContent(prompt));
        return onSaveContent(prompt.id, content);
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
                            <CardTitle>Danh sách mẫu lời nhắc</CardTitle>
                            <CardDescription>
                                Chỉnh sửa nội dung, gửi Manager duyệt hoặc xóa mẫu lời nhắc.
                            </CardDescription>
                        </div>
                        <Button variant="outline" onClick={onRefresh}>Tải lại</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                            placeholder="Tìm theo tên, loại, nội dung..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />

                        <select
                            title="Lọc theo tên mẫu lời nhắc"
                            aria-label="Lọc theo tên mẫu lời nhắc"
                            className="h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                            value={nameFilter}
                            onChange={(event) => setNameFilter(event.target.value)}
                        >
                            <option value="all">Tất cả tên</option>
                            {availableNames.map((name) => (
                                <option key={name} value={name}>{getPromptNameLabel(name)}</option>
                            ))}
                        </select>

                        <select
                            title="Lọc theo loại lời nhắc"
                            aria-label="Lọc theo loại lời nhắc"
                            className="h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                            value={typeFilter}
                            onChange={(event) => setTypeFilter(event.target.value)}
                        >
                            <option value="all">Tất cả loại</option>
                            {availableTypes.map((type) => (
                                <option key={type} value={type}>{getPromptTypeLabel(type)}</option>
                            ))}
                        </select>
                    </div>

                    <p className="text-xs text-gray-500">
                        Đang hiển thị {filteredPrompts.length} / {prompts.length} mẫu
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {filteredPrompts.length === 0 && (
                        <p className="text-sm text-gray-600">Không có mẫu lời nhắc phù hợp.</p>
                    )}

                    {filteredPrompts.map((prompt) => (
                        <div key={prompt.id} className="border rounded-lg p-4 space-y-3">
                            {(() => {
                                const status = getReviewStatus(prompt);
                                return (
                                    <>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-semibold text-gray-900">{getPromptNameLabel(prompt.name)}</h3>
                                    <Badge variant="outline">Loại: {getPromptTypeLabel(prompt.type)}</Badge>
                                    <Badge variant="outline">v{prompt.version}</Badge>
                                    <Badge className={status.className}>{status.label}</Badge>
                                    {prompt.is_active && <Badge className="bg-green-600">Đang dùng</Badge>}
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
                                    onClick={() => handleSaveContent(prompt)}
                                >
                                    Lưu và gửi duyệt
                                </Button>
                                <Button
                                    variant="destructive"
                                    disabled={busyPromptId === prompt.id}
                                    onClick={() => setDeleteCandidate(prompt)}
                                >
                                    Xóa
                                </Button>
                            </div>
                                    </>
                                );
                            })()}
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
                        <AlertDialogTitle>Xóa mẫu lời nhắc này?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteCandidate
                                ? `Mẫu #${deleteCandidate.id} (${getPromptNameLabel(deleteCandidate.name)}) sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.`
                                : 'Hành động này không thể hoàn tác.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={busyPromptId === deleteCandidate?.id}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={busyPromptId === deleteCandidate?.id}
                        >
                            {busyPromptId === deleteCandidate?.id ? 'Đang xóa...' : 'Xóa'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
