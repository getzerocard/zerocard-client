import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthTokens } from '../common/utils/handleToken';

// API Configuration
const API_CONFIG = {
  // Get base URL from environment variables with fallback
  // For Expo, environment variables should be prefixed with EXPO_PUBLIC_
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.example.com',
  
  // Default timeout in milliseconds
  TIMEOUT: 30000,
  
  // Default headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: '@app_auth_token',
  REFRESH_TOKEN: '@app_refresh_token',
};

/**
 * Creates and configures an Axios instance with interceptors for authentication
 */
class ApiService {
  private axiosInstance: AxiosInstance;
  private tokenProvider: any = null;

  constructor() {
    // Create axios instance with default config
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    // Set up request interceptor for authentication
    this.setupRequestInterceptor();
    
    // Set up response interceptor for error handling
    this.setupResponseInterceptor();
  }

  /**
   * Sets the token provider (e.g., Privy client) for authentication
   */
  setTokenProvider(provider: any) {
    // Check if the provider is the same instance to avoid unnecessary reinitialization
    if (this.tokenProvider === provider) {
      return; // Skip if the same provider is being set again
    }
    this.tokenProvider = provider;
  }

  /**
   * Configure request interceptor to add authentication tokens
   */
  private setupRequestInterceptor() {
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // If we have a token provider, use it to get tokens
        if (this.tokenProvider) {
          try {
            const authTokens = await getAuthTokens(this.tokenProvider);
            console.log('=== Authentication Tokens ===');
            console.log('Identity Token:', authTokens.identityToken ? `${authTokens.identityToken.substring(0, 20)}...` : 'Not available');
            console.log('Access Token:', authTokens.accessToken ? `${authTokens.accessToken.substring(0, 20)}...` : 'Not available');
            console.log('=== End Authentication Tokens ===');
            
            if (authTokens.identityToken) {
              config.headers.Authorization = authTokens.identityToken;
            }
          } catch (error) {
            console.error('Error getting auth tokens:', error);
          }
        } 
        // Otherwise, try to get token from storage (fallback)
        else {
          try {
            const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            if (token) {
              console.log('=== Token from Storage ===');
              console.log('Auth Token:', token ? `${token.substring(0, 20)}...` : 'Not available');
              console.log('=== End Token from Storage ===');
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            console.error('Error retrieving auth token from storage:', error);
          }
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Configure response interceptor to handle errors and token refresh
   */
  private setupResponseInterceptor() {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;
        
        // Handle 401 Unauthorized errors (token expired)
        if (error.response?.status === 401 && originalRequest) {
          try {
            // Attempt to refresh token logic would go here
            // This is a placeholder for token refresh implementation
            
            // If token refresh is successful, retry the original request
            // return this.axiosInstance(originalRequest);
            
            // For now, just reject with the error
            return Promise.reject(error);
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
            
            // Clear stored tokens on refresh failure
            await AsyncStorage.multiRemove([
              STORAGE_KEYS.AUTH_TOKEN,
              STORAGE_KEYS.REFRESH_TOKEN,
            ]);
            
            // Redirect to login or handle auth failure
            // This would depend on your navigation setup
            
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make a GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.get(url, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Make a POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.post(url, data, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.put(url, data, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Make a PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.patch(url, data, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.delete(url, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }

  /**
   * Handle API errors with consistent logging and formatting
   */
  private handleApiError(error: AxiosError): void {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
    }
  }
}

// Create a singleton instance
const apiService = new ApiService();

// Export the singleton instance
export default apiService;

// Export types for better TypeScript integration
export type { AxiosRequestConfig, AxiosResponse, AxiosError };
