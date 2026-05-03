import axios from 'axios';

const API_URL = 'https://taskmanager-production-25e3.up.railway.app/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle validation errors properly
    if (error.response?.status === 422) {
      const errors = error.response.data?.detail;
      if (Array.isArray(errors)) {
        const errorMessages = errors.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ');
        error.userMessage = errorMessages;
      } else {
        error.userMessage = 'Validation error. Please check your input.';
      }
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth APIs
export const signup = (userData) => api.post('/auth/signup', userData);
export const login = (credentials) => api.post('/auth/login', credentials);
export const getCurrentUser = () => api.get('/auth/me');

// Project APIs
export const getProjects = () => api.get('/projects');
export const getProject = (id) => api.get(`/projects/${id}`);
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// Task APIs
export const getTasks = (projectId = null) => {
  const url = projectId ? `/tasks?project_id=${projectId}` : '/tasks';
  return api.get(url);
};
export const getTask = (id) => api.get(`/tasks/${id}`);
export const createTask = (data) => {
  console.log('Sending task data:', data); // Debug log
  return api.post('/tasks', data);
};
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const updateMilestoneProgress = (taskId, milestoneId, progress) => 
  api.post(`/tasks/${taskId}/milestones/${milestoneId}/progress`, { progress_percentage: progress });

// Member APIs (Admin only)
export const getMembers = () => api.get('/members');
export const getAdminDashboard = () => api.get('/members/dashboard');
export const getMemberTasksSummary = () => api.get('/members/member-tasks');

export default api;
