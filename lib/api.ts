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

        let data: { message?: string; data?: T } = {};
        const text = await response.text();
        try {
            data = text ? JSON.parse(text) : {};
        } catch {
            throw new Error(
                !response.ok
                    ? `HTTP ${response.status} ${response.statusText}. Expected JSON from API — check NEXT_PUBLIC_API_URL.`
                    : 'Invalid JSON from server'
            );
        }

        if (!response.ok) {
            throw new Error(data.message || `Request failed (${response.status})`);
        }

        return data.data as T;
    } catch (error) {
        console.error(`API Request failed for ${endpoint}:`, error);
        throw error;
    }
}
