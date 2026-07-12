import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
};

export const ticketAPI = {
  create: (data) => api.post('/tickets', data),
  getAll: (params) => api.get('/tickets', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  assign: (id, agentId) => api.post(`/tickets/${id}/assign`, { agent_id: agentId }),
  updateStatus: (id, data) => api.patch(`/tickets/${id}/status`, data),
  addMessage: (id, data) => api.post(`/tickets/${id}/messages`, data),
  getClientStats: () => api.get('/tickets/stats/client'),
  getAgentStats: () => api.get('/tickets/stats/agent'),
  getManagerStats: () => api.get('/tickets/stats/manager'),
  getTeamWorkload: () => api.get('/tickets/team-workload'),
};

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getAgents: () => api.get('/users/agents'),
};

export default api;
