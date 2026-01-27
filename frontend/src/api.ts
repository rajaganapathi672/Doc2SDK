import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const mvpApi = {
    generate: async (sourceUrl: string) => {
        const response = await api.post('/generate', { source_url: sourceUrl });
        return response.data;
    },
    execute: async (data: {
        base_url: string;
        path: string;
        method: string;
        params?: any;
        headers?: any;
        json_body?: any;
    }) => {
        const response = await api.post('/playground/execute', data);
        return response.data;
    },
};

export const projectApi = {
    list: async () => {
        const response = await api.get('/projects');
        return response.data;
    },
    get: async (id: string) => {
        const response = await api.get(`/projects/${id}`);
        return response.data;
    },
    create: async (name: string, url: string, type: string) => {
        const response = await api.post('/projects', { name, source_url: url, source_type: type });
        return response.data;
    }
};

export const playgroundApi = {
    test: async (projectId: string, path: string, params: any) => {
        const response = await api.post(`/playground/test`, { project_id: projectId, path, params });
        return response.data;
    }
};

export default api;
