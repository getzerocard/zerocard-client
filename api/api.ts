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
            console.log('Full Identity Token:', authTokens.identityToken || 'Not available');
            console.log('Full Access Token:', authTokens.accessToken || 'Not available');
            console.log('=== End Authentication Tokens ===');
            
            // Set the Authorization header with the Access Token
            if (authTokens.accessToken) {
              config.headers['Authorization'] = `Bearer ${authTokens.accessToken}`;
              console.log('Setting Authorization header with Access Token.');
            } else {
              // Remove Authorization header if no access token is available
              delete config.headers['Authorization'];
              console.log('No Access Token available, Authorization header removed.');
            }

            // Set the x-identity-token header with the Identity Token
            if (authTokens.identityToken) {
              config.headers['x-identity-token'] = authTokens.identityToken;
              console.log('Setting x-identity-token header.');
            } else {
              // Remove x-identity-token header if no identity token is available
              delete config.headers['x-identity-token'];
              console.log('No Identity Token available, x-identity-token header removed.');
            }
          } catch (error) {
            console.error('Error getting auth tokens:', error);
            // Ensure headers are cleared on error
            delete config.headers['Authorization'];
            delete config.headers['x-identity-token'];
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

  /**
   * Create a new user or sync existing user based on authenticated user data
   * This endpoint only accepts 'me' as the userId parameter
   * 
   * @returns Promise with user data including creation status
   */
  async createOrSyncUser(): Promise<{
    userId: string;
    userType: string;
    timeCreated: string;
    timeUpdated: string;
    walletAddresses: {
      ethereum?: string;
      solana?: string;
      bitcoin?: string;
      tron?: string;
    };
    email: string;
    isNewUser: boolean;
  }> {
    try {
      console.log('=== User Account Creation Process Started ===');
      if (this.tokenProvider) {
        console.log('Privy Authentication Status:', this.tokenProvider.user ? 'Authenticated' : 'Not Authenticated');
        console.log('Privy User ID:', this.tokenProvider.user?.id || 'Not available');
      } else {
        console.log('No token provider available');
      }

      // Call API to create or sync user
      const response = await this.post('/users/me');
      
      console.log('=== User Account Creation Result ===');
      console.log('Status: SUCCESS ✅');
      console.log('Is New User:', response.isNewUser ? 'Yes' : 'No');
      console.log('=== End User Account Creation Process ===');
      
      return response;
    } catch (error) {
      console.log('=== User Account Creation Error ===');
      console.log('Status: ERROR ❌');
      console.log('Error Message:', (error as Error).message);
      console.log('=== End User Account Creation Process ===');
      
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }
}

// Create a singleton instance
const apiService = new ApiService();

// Export the singleton instance
export default apiService;

// Export types for better TypeScript integration
export type { AxiosRequestConfig, AxiosResponse, AxiosError };
