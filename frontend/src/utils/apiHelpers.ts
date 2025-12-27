// Helper utilities for making API calls
// This provides a consistent way to make authen ticated requests across the app

import { API_BASE_URL } from '../config/api';

// Get auth token from localStorage
export const getAuthToken = (): string | null => {
    return localStorage.getItem('token');
};

// Get headers for API requests
export const getHeaders = (includeAuth = true): HeadersInit => {
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

// Make authenticated GET request
export const apiGet = async (endpoint: string, requireAuth = false) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(requireAuth),
    });
    return response;
};

// Make authenticated POST request
export const apiPost = async (endpoint: string, data: any, requireAuth = true) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(requireAuth),
        body: JSON.stringify(data),
    });
    return response;
};

// Export API_BASE_URL for direct use
export { API_BASE_URL };
