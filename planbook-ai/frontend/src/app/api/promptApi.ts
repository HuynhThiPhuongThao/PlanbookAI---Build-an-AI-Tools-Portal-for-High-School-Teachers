import axios from 'axios';

export interface PromptTemplate {
    id: number;
    name: string;
    type: string;
    content: string;
    version: number;
    is_active: boolean;
}

export interface CreatePromptPayload {
    name: string;
    type: string;
    content: string;
}

export interface UpdatePromptPayload {
    content?: string;
    is_active?: boolean;
}

const promptClient = axios.create({
    baseURL: 'http://localhost:8086/api/ai/prompts',
    headers: {
        'Content-Type': 'application/json',
    },
});

promptClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const promptApi = {
    async getAll(): Promise<PromptTemplate[]> {
        const response = await promptClient.get<PromptTemplate[]>('');
        return response.data;
    },

    async getActive(name: string): Promise<PromptTemplate> {
        const response = await promptClient.get<PromptTemplate>(`/active/${name}`);
        return response.data;
    },

    async create(payload: CreatePromptPayload): Promise<PromptTemplate> {
        const response = await promptClient.post<PromptTemplate>('', payload);
        return response.data;
    },

    async update(promptId: number, payload: UpdatePromptPayload): Promise<PromptTemplate> {
        const response = await promptClient.put<PromptTemplate>(`/${promptId}`, payload);
        return response.data;
    },

    async remove(promptId: number): Promise<void> {
        await promptClient.delete(`/${promptId}`);
    },
};
