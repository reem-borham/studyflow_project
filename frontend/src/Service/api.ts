const API_BASE_URL = 'http://localhost:8000/api';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  bio?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user_id: number;
  username: string;
  email: string;
  role: string;
  bio?: string;
}

export interface DashboardStats {
  username: string;
  stats: {
    questions_asked: number;
    questions_answered: number;
    reputation_score: number;
    breakdown: {
      question_votes: number;
      answer_votes: number;
    };
  };
}

export interface Question {
  id: number;
  title: string;
  body: string;
  user: User;
  tags?: Tag[];
  created_at: string;
  updated_at: string;
  views: number;
  is_closed: boolean;
  vote_count?: number;
  comment_count?: number;
}

export interface Answer {
  id: number;
  body: string;
  user: User;
  question: number;
  is_accepted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Notification {
  id: number;
  message: string;
  created_at: string;
  is_read: boolean;
}

// Auth API - Using simple function-based endpoints
export const authAPI = {
  async register(data: {
    username: string;
    email: string;
    password: string;
    role: string;
    bio?: string;
  }): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const result = await response.json();

      // Store user data
      localStorage.setItem('user', JSON.stringify({
        id: result.user_id,
        username: result.username,
        email: result.email,
        role: result.role,
        bio: result.bio
      }));

      return result;
    } catch (error: any) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Is the backend running?');
      }
      throw error;
    }
  },

  async login(data: { email: string; password: string }): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const result = await response.json();

      // Store user data
      localStorage.setItem('user', JSON.stringify({
        id: result.user_id,
        username: result.username,
        email: result.email,
        role: result.role,
        bio: result.bio
      }));

      return result;
    } catch (error: any) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Is the backend running?');
      }
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// Dashboard API - Calculate stats from actual data
export const dashboardAPI = {
  async getStats(): Promise<DashboardStats> {
    const user = authAPI.getCurrentUser();

    if (!user) {
      throw new Error('User not logged in');
    }

    try {
      // Fetch all questions to count user's questions
      const allQuestions = await questionsAPI.getAll();
      const userQuestions = allQuestions.filter(q => q.user.username === user.username);

      return {
        username: user.username,
        stats: {
          questions_asked: userQuestions.length,
          questions_answered: 0, // We'll implement this when answers are working
          reputation_score: 0,
          breakdown: {
            question_votes: 0,
            answer_votes: 0
          }
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default stats if error
      return {
        username: user.username,
        stats: {
          questions_asked: 0,
          questions_answered: 0,
          reputation_score: 0,
          breakdown: {
            question_votes: 0,
            answer_votes: 0
          }
        }
      };
    }
  },
};

// Questions API
export const questionsAPI = {
  async getAll(): Promise<Question[]> {
    const response = await fetch(`${API_BASE_URL}/questions/`);
    if (!response.ok) throw new Error('Failed to fetch questions');
    return response.json();
  },

  async getById(id: number): Promise<Question> {
    const response = await fetch(`${API_BASE_URL}/questions/${id}/`);
    if (!response.ok) throw new Error('Failed to fetch question');
    return response.json();
  },

  async create(data: { title: string; body: string; tags?: number[] }): Promise<Question> {
    const user = authAPI.getCurrentUser();
    const response = await fetch(`${API_BASE_URL}/questions/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...data, username: user?.username }),
    });

    if (!response.ok) throw new Error('Failed to create question');
    return response.json();
  },

  async update(id: number, data: { title?: string; body?: string }): Promise<Question> {
    const response = await fetch(`${API_BASE_URL}/questions/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to update question');
    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/questions/${id}/`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete question');
  },
};

// Answers API
export const answersAPI = {
  async getAll(): Promise<Answer[]> {
    const response = await fetch(`${API_BASE_URL}/answers/`);
    if (!response.ok) throw new Error('Failed to fetch answers');
    return response.json();
  },

  async create(data: { body: string; question: number }): Promise<Answer> {
    const user = authAPI.getCurrentUser();

    const response = await fetch(`${API_BASE_URL}/answers/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        username: user?.username
      }),
    });

    if (!response.ok) throw new Error('Failed to create answer');
    return response.json();
  },
};

// Notifications API
export const notificationsAPI = {
  async getAll(): Promise<Notification[]> {
    // Mock response for now
    return [];
  },
};

// Voting API
export const votingAPI = {
  async vote(data: {
    content_type: 'question' | 'answer';
    object_id: number;
    vote_type: 'up' | 'down';
  }): Promise<{ message: string; vote_type?: string }> {
    const user = authAPI.getCurrentUser();

    const response = await fetch(`${API_BASE_URL}/core/votes/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        username: user?.username
      }),
    });

    if (!response.ok) throw new Error('Failed to vote');
    return response.json();
  },
};

// Tags API  
export const tagsAPI = {
  async getAll(): Promise<Tag[]> {
    const response = await fetch(`${API_BASE_URL}/core/tags/`);
    if (!response.ok) throw new Error('Failed to fetch tags');
    return response.json();
  },

  async create(name: string): Promise<Tag> {
    const response = await fetch(`${API_BASE_URL}/core/tags/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) throw new Error('Failed to create tag');
    return response.json();
  },
};