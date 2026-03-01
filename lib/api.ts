const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface ApiOptions extends RequestInit {
    // Custom options can go here
}

/**
 * Base API client that automatically handles authentication tokens
 * and standardizes JSON responses/errors.
 */
export async function fetchApi<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers = new Headers(options.headers);

    // Automatically attach auth token if available
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth-token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
    }

    // Default to JSON if not explicitly sending FormData
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    const config: RequestInit = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, config);

        // Handle 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        const data = await response.json();

        if (!response.ok) {
            // If unauthorized, you might want to automatically clear the token
            // and redirect to login, but we'll let auth.ts handle session logic for now.
            throw new Error(data.message || 'An error occurred during the request');
        }

        return data.data as T;
    } catch (error) {
        console.error(`API Request failed for ${endpoint}:`, error);
        throw error;
    }
}
