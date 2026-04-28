import { useState } from 'react';

import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

import type { CreatePromptPayload } from '../../api/promptApi';
import {
    getPromptDefaultType,
    preparePromptContentForSave,
    PROMPT_NAME_OPTIONS,
    PROMPT_TYPE_OPTIONS,
} from '../../utils/promptDisplay';

interface PromptFormProps {
    isSubmitting: boolean;
    onSubmit: (payload: CreatePromptPayload) => Promise<void>;
}

export default function PromptForm({ isSubmitting, onSubmit }: PromptFormProps) {
    const [name, setName] = useState('generate_exercise');
    const [type, setType] = useState('exercise');
    const [content, setContent] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        await onSubmit({
            name: name.trim(),
            type: type.trim(),
            content: preparePromptContentForSave(name.trim(), content),
        });
        setContent('');
    };

    const handleNameChange = (value: string) => {
        setName(value);
        setType(getPromptDefaultType(value));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tạo mẫu lời nhắc mới</CardTitle>
                <CardDescription>
                    Mẫu mới sẽ được gửi Manager duyệt trước khi được dùng cho AI.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="prompt-name">Công cụ AI</Label>
                            <select
                                id="prompt-name"
                                value={name}
                                onChange={(event) => handleNameChange(event.target.value)}
                                className="h-10 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm"
                                required
                            >
                                {PROMPT_NAME_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="prompt-type">Loại lời nhắc</Label>
                            <select
                                id="prompt-type"
                                value={type}
                                onChange={(event) => setType(event.target.value)}
                                className="h-10 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm"
                                required
                            >
                                {PROMPT_TYPE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="prompt-content">Nội dung lời nhắc</Label>
                        <Textarea
                            id="prompt-content"
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            placeholder="Nhập hướng dẫn AI bằng văn bản thường."
                            className="min-h-40"
                            required
                        />
                    </div>

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Đang tạo...' : 'Tạo mẫu'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
