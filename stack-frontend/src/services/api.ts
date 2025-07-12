import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { 
  User, 
  Question, 
  Answer, 
  Comment, 
  Tag, 
  Notification, 
  ApiResponse, 
  PaginatedResponse,
  QuestionFilters 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
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

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(username: string, email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.api.post('/auth/register', { username, email, password });
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Questions endpoints
  async getQuestions(filters?: QuestionFilters): Promise<ApiResponse<PaginatedResponse<Question>>> {
    const response = await this.api.get('/questions', { params: filters });
    return response.data;
  }

  async getQuestion(id: string): Promise<ApiResponse<Question>> {
    const response = await this.api.get(`/questions/${id}`);
    return response.data;
  }

  async createQuestion(data: { title: string; content: string; tags: string[] }): Promise<ApiResponse<Question>> {
    const response = await this.api.post('/questions', data);
    return response.data;
  }

  async updateQuestion(id: string, data: { title?: string; content?: string; tags?: string[] }): Promise<ApiResponse<Question>> {
    const response = await this.api.put(`/questions/${id}`, data);
    return response.data;
  }

  async deleteQuestion(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/questions/${id}`);
    return response.data;
  }

  async voteQuestion(id: string, vote: 1 | -1): Promise<ApiResponse<Question>> {
    const response = await this.api.post(`/questions/${id}/vote`, { vote });
    return response.data;
  }

  // Answers endpoints
  async createAnswer(questionId: string, content: string): Promise<ApiResponse<Answer>> {
    const response = await this.api.post(`/questions/${questionId}/answers`, { content });
    return response.data;
  }

  async updateAnswer(id: string, content: string): Promise<ApiResponse<Answer>> {
    const response = await this.api.put(`/answers/${id}`, { content });
    return response.data;
  }

  async deleteAnswer(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/answers/${id}`);
    return response.data;
  }

  async voteAnswer(id: string, vote: 1 | -1): Promise<ApiResponse<Answer>> {
    const response = await this.api.post(`/answers/${id}/vote`, { vote });
    return response.data;
  }

  async acceptAnswer(id: string): Promise<ApiResponse<Answer>> {
    const response = await this.api.post(`/answers/${id}/accept`);
    return response.data;
  }

  // Comments endpoints
  async createComment(data: { content: string; questionId?: string; answerId?: string }): Promise<ApiResponse<Comment>> {
    const response = await this.api.post('/comments', data);
    return response.data;
  }

  async updateComment(id: string, content: string): Promise<ApiResponse<Comment>> {
    const response = await this.api.put(`/comments/${id}`, { content });
    return response.data;
  }

  async deleteComment(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/comments/${id}`);
    return response.data;
  }

  async voteComment(id: string, vote: 1 | -1): Promise<ApiResponse<Comment>> {
    const response = await this.api.post(`/comments/${id}/vote`, { vote });
    return response.data;
  }

  // Tags endpoints
  async getTags(): Promise<ApiResponse<Tag[]>> {
    const response = await this.api.get('/tags');
    return response.data;
  }

  async createTag(data: { name: string; description?: string; color?: string }): Promise<ApiResponse<Tag>> {
    const response = await this.api.post('/tags', data);
    return response.data;
  }

  // Notifications endpoints
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    const response = await this.api.get('/notifications');
    return response.data;
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<Notification>> {
    const response = await this.api.put(`/notifications/${id}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    const response = await this.api.put('/notifications/read-all');
    return response.data;
  }

  // Users endpoints
  async getUser(id: string): Promise<ApiResponse<User>> {
    const response = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async updateProfile(data: { username?: string; bio?: string; avatar?: string }): Promise<ApiResponse<User>> {
    const response = await this.api.put('/users/profile', data);
    return response.data;
  }

  // Search endpoints
  async searchQuestions(query: string, filters?: QuestionFilters): Promise<ApiResponse<PaginatedResponse<Question>>> {
    const response = await this.api.get('/search/questions', { 
      params: { q: query, ...filters } 
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 