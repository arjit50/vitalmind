import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';


const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const authAPI = {
    register: async (username, email, password) => {
        const response = await api.post('/auth/register', { username, email, password });
        return response.data;
    },

    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    }
};


export const chatAPI = {
    createNewChat: async (title = "New Chat") => {
        const response = await api.post('/chat/new', { title });
        return response.data;
    },

    getChatHistory: async () => {
        const response = await api.get('/chat/history');
        return response.data;
    },

    getChatMessages: async (chatId) => {
        const response = await api.get(`/chat/${chatId}/messages`);
        return response.data;
    },

    sendMessage: async (chatId, content) => {
        const response = await api.post(`/chat/${chatId}/message`, { content });
        return response.data;
    },

    deleteChat: async (chatId) => {
        const response = await api.delete(`/chat/${chatId}`);
        return response.data;
    }
};

export const userAPI = {
    getProfile: async () => {
        const response = await api.get('/user/profile');
        return response.data;
    },
    updateProfile: async (data) => {
        const response = await api.put('/user/profile', data);
        return response.data;
    }
};

export const analysisAPI = {
    uploadReport: async (formData) => {
        const response = await api.post('/analysis/analyze', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};

export default api;
