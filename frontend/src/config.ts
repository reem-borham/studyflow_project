// Quick config helper - import this instead of hardcoding URLs
import { API_BASE_URL } from './services/api';

// Get base server URL (for things like profile pictures)
export const SERVER_URL = API_BASE_URL.replace('/api', '');

// Get base server URL function (for template literals)
export const getServerUrl = () => SERVER_URL;

// Get full API URL
export const API_URL = API_BASE_URL;

// Helper to build API endpoint URL
export const apiUrl = (path: string) => {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${SERVER_URL}/${cleanPath}`;
};

export default { SERVER_URL, API_URL, apiUrl, getServerUrl };
