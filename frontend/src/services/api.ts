// API Base Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
    return localStorage.getItem('token');
};

// Helper function to get headers
const getHeaders = (includeAuth = true): HeadersInit => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (includeAuth) {
        const token = getAuthToken();
        if (token) {
            headers['Authorization'] = `Token ${token}`;
        }
    }

    return headers;
};

// ==================== VOTING API ====================
export const votingAPI = {
    // Cast or toggle vote
    vote: async (voteType: 'up' | 'down', contentType: 'question' | 'answer', objectId: number) => {
        const response = await fetch(`${API_BASE_URL}/votes/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                vote_type: voteType,
                content_type: contentType,
                object_id: objectId,
            }),
        });
        return response.json();
    },

    // Get votes for an object
    getVotes: async (contentType: 'question' | 'answer', objectId: number) => {
        const response = await fetch(
            `${API_BASE_URL}/votes/list/?content_type=${contentType}&object_id=${objectId}`,
            { headers: getHeaders(false) }
        );
        return response.json();
    },
};

// ==================== COMMENTS API ====================
export const commentsAPI = {
    // Get comments for an object
    getComments: async (contentType: 'question' | 'answer', objectId: number) => {
        const response = await fetch(
            `${API_BASE_URL}/comments/?content_type=${contentType}&object_id=${objectId}`,
            { headers: getHeaders(false) }
        );
        return response.json();
    },

    // Create a comment
    createComment: async (
        content: string,
        contentType: 'question' | 'answer',
        objectId: number,
        parentCommentId?: number
    ) => {
        const response = await fetch(`${API_BASE_URL}/comments/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                content,
                content_type: contentType,
                object_id: objectId,
                parent_comment: parentCommentId,
            }),
        });
        return response.json();
    },

    // Update a comment
    updateComment: async (commentId: number, content: string) => {
        const response = await fetch(`${API_BASE_URL}/comments/${commentId}/`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ content }),
        });
        return response.json();
    },

    // Delete a comment
    deleteComment: async (commentId: number) => {
        const response = await fetch(`${API_BASE_URL}/comments/${commentId}/`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return response.ok;
    },
};

// ==================== BEST ANSWER API ====================
export const bestAnswerAPI = {
    // Mark an answer as best
    markBestAnswer: async (answerId: number) => {
        const response = await fetch(`${API_BASE_URL}/answers/${answerId}/mark-best/`, {
            method: 'POST',
            headers: getHeaders(),
        });
        return response.json();
    },
};

// ==================== ANSWER API ====================
export const answersAPI = {
    // Get answers for a question
    getAnswers: async (questionId: number) => {
        const response = await fetch(`${API_BASE_URL}/answers/?question=${questionId}`, {
            headers: getHeaders(false),
        });
        return response.json();
    },

    // Create an answer
    createAnswer: async (questionId: number, body: string) => {
        const response = await fetch(`${API_BASE_URL}/answers/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                question: questionId,
                body,
            }),
        });
        return response.json();
    },

    // Update an answer
    updateAnswer: async (answerId: number, body: string) => {
        const response = await fetch(`${API_BASE_URL}/answers/${answerId}/`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ body }),
        });
        return response.json();
    },

    // Delete an answer
    deleteAnswer: async (answerId: number) => {
        const response = await fetch(`${API_BASE_URL}/answers/${answerId}/`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return response.ok;
    },
};

// ==================== REPORTING API ====================
export const reportingAPI = {
    // Report content
    reportContent: async (
        reportType: 'spam' | 'harassment' | 'inappropriate' | 'copyright' | 'other',
        description: string,
        contentType: 'question' | 'answer' | 'comment',
        objectId: number
    ) => {
        const response = await fetch(`${API_BASE_URL}/reports/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                report_type: reportType,
                description,
                content_type: contentType,
                object_id: objectId,
            }),
        });
        return response.json();
    },
};

// ==================== AUTH API ====================
export const authAPI = {
    // Register
    register: async (username: string, email: string, password: string, role: 'student' | 'instructor') => {
        const response = await fetch(`${API_BASE_URL}/register/`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify({
                username,
                email,
                password,
                role,
            }),
        });
        return response.json();
    },

    // Login
    login: async (email: string, password: string) => {
        const response = await fetch(`${API_BASE_URL}/login/`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify({ email, password }),
        });
        return response.json();
    },

    // Logout
    logout: async () => {
        const response = await fetch(`${API_BASE_URL}/logout/`, {
            method: 'POST',
            headers: getHeaders(),
        });
        if (response.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return response.ok;
    },
};

export default {
    votingAPI,
    commentsAPI,
    bestAnswerAPI,
    answersAPI,
    reportingAPI,
    authAPI,
};
