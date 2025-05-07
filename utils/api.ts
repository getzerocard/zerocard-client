import Constants from 'expo-constants';
import { withPrivyAuth } from './privy';

// Get the API base URL from environment variables
const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || '';

/**
 * Makes an authenticated API request to the backend
 * @param endpoint - API endpoint path (without base URL)
 * @param options - Fetch options
 * @returns Promise resolving to the API response
 */
export async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T | null> {
  try {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };
    
    // Add authentication token to headers
    const authHeaders = await withPrivyAuth(headers);
    
    const response = await fetch(url, {
      ...options,
      headers: authHeaders,
    });
    
    // Handle unauthorized requests
    if (response.status === 401) {
      console.warn('Unauthorized API request:', endpoint);
      return null;
    }
    
    // Handle server errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API error:', response.status, errorData);
      throw new Error(`API error: ${response.status}`);
    }
    
    // Parse and return response data
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * GET request helper
 */
export async function apiGet<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  return apiRequest<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request helper
 */
export async function apiPost<T>(
  endpoint: string, 
  data: any, 
  options: RequestInit = {}
): Promise<T | null> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request helper
 */
export async function apiPut<T>(
  endpoint: string, 
  data: any, 
  options: RequestInit = {}
): Promise<T | null> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
}

export default {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete
}; 