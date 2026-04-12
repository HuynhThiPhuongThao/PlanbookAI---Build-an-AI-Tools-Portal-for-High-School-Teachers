import { useState } from 'react';

import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

import type { CreatePromptPayload } from '../../api/promptApi';

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
            content: content.trim(),
        });
        setContent('');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Prompt Template</CardTitle>
                <CardDescription>
                    Create a new prompt. If same name exists, backend will mark older active prompt inactive.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="prompt-name">Prompt Name</Label>
                            <Input
                                id="prompt-name"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="generate_exercise"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="prompt-type">Prompt Type</Label>
                            <Input
                                id="prompt-type"
                                value={type}
                                onChange={(event) => setType(event.target.value)}
                                placeholder="exercise"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="prompt-content">Prompt Content</Label>
                        <Textarea
                            id="prompt-content"
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            placeholder="Write your prompt template..."
                            className="min-h-40"
                            required
                        />
                    </div>

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Prompt'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
