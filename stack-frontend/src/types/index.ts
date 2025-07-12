export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  reputation: number;
  role: 'user' | 'moderator' | 'admin' | 'banned';
  createdAt: string;
  bio?: string;
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
  color?: string;
  questionCount: number;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  author: User;
  tags: Tag[];
  votes: number;
  views: number;
  answers: Answer[];
  comments: Comment[];
  acceptedAnswerId?: string;
  createdAt: string;
  updatedAt: string;
  isClosed: boolean;
  bounty?: number;
}

export interface Answer {
  id: string;
  content: string;
  author: User;
  questionId: string;
  votes: number;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  questionId?: string;
  answerId?: string;
  votes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: 'answer' | 'comment' | 'mention' | 'vote' | 'accept';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  questionId?: string;
  answerId?: string;
  commentId?: string;
  fromUser?: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QuestionFilters {
  tags?: string[];
  search?: string;
  sort?: 'newest' | 'votes' | 'views' | 'unanswered';
  page?: number;
  limit?: number;
} 