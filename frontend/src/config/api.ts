// API CONFIGURATION
// This file centralizes the API base URL configuration
// It uses the VITE_API_URL environment variable in production
// and falls back to localhost:8000 for local development

const getApiBaseUrl = (): string => {
    // In production (Render/Railway), use VITE_API_URL environment variable
    // In development, use localhost:8000
    return import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/api`
        : 'http://localhost:8000/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Export a helper to get full URL
export const getApiUrl = (endpoint: string): string => {
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}${normalizedEndpoint}`;
};

export default API_BASE_URL;
