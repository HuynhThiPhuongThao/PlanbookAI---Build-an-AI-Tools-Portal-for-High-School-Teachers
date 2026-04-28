import axiosClient from './axiosClient';

export interface PromptTemplate {
    id: number;
    name: string;
    type: string;
    content: string;
    version: number;
    is_active: boolean;
    approval_status?: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
    review_note?: string | null;
    reviewed_by?: string | null;
    reviewed_at?: string | null;
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

export const promptApi = {
    async getAll(): Promise<PromptTemplate[]> {
        return axiosClient.get('/ai/prompts');
    },

    async getPending(): Promise<PromptTemplate[]> {
        return axiosClient.get('/ai/prompts/pending');
    },

    async getActive(name: string): Promise<PromptTemplate> {
        return axiosClient.get(`/ai/prompts/active/${name}`);
    },

    async create(payload: CreatePromptPayload): Promise<PromptTemplate> {
        return axiosClient.post('/ai/prompts', payload);
    },

    async update(promptId: number, payload: UpdatePromptPayload): Promise<PromptTemplate> {
        return axiosClient.put(`/ai/prompts/${promptId}`, payload);
    },

    async approve(promptId: number, reviewNote?: string): Promise<PromptTemplate> {
        return axiosClient.put(`/ai/prompts/${promptId}/approve`, {
            review_note: reviewNote || 'Duyet mau loi nhac',
            reviewed_by: 'manager',
        });
    },

    async reject(promptId: number, reviewNote?: string): Promise<PromptTemplate> {
        return axiosClient.put(`/ai/prompts/${promptId}/reject`, {
            review_note: reviewNote || 'Tu choi mau loi nhac',
            reviewed_by: 'manager',
        });
    },

    async remove(promptId: number): Promise<void> {
        await axiosClient.delete(`/ai/prompts/${promptId}`);
    },
};
