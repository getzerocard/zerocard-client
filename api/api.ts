import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthTokens, TokenGetters } from '../common/utils/handleToken';

// Add an optional parameter for session token
export interface ExtendedRequestConfig extends AxiosRequestConfig {
  useSessionToken?: boolean; // Flag to indicate if session token should be used
}

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

// Log the API configuration when this file is loaded
console.log('=== API CONFIG DEBUG ===');
console.log('API Base URL from ENV:', process.env.EXPO_PUBLIC_API_BASE_URL);
console.log('API Base URL (final):', API_CONFIG.BASE_URL);
console.log('=== END API CONFIG DEBUG ===');

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
  private tokenAccessors: TokenGetters | null = null;

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
   * Sets the functions required for token retrieval.
   */
  setTokenAccessors(accessors: TokenGetters) {
    console.log('[ApiService] Setting token accessors.');
    this.tokenAccessors = accessors;
  }

  /**
   * Extract user ID from a JWT token
   */
  private getUserIdFromToken(token: string | null): string | null {
    if (!token) return null;
    
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length < 2) return null;
      
      const payload = JSON.parse(atob(tokenParts[1]));
      // Most JWT tokens use 'sub' for the subject/user ID
      return payload.sub || null;
    } catch (error) {
      console.error('[ApiService] Error extracting user ID from token:', error);
      return null;
    }
  }

  /**
   * Configure request interceptor to add authentication tokens
   */
  private setupRequestInterceptor() {
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        console.log(`[ApiService Interceptor] Request to ${config.method?.toUpperCase()} ${config.url}`);
        // If token accessors are configured, use them to get and set tokens
        if (this.tokenAccessors) {
          try {
            console.log('[ApiService Interceptor] Token accessors found. Attempting to get tokens via getAuthTokens...');
            // Pass the entire tokenAccessors object to getAuthTokens
            const { accessToken, identityToken, sessionToken } = await getAuthTokens(this.tokenAccessors);

            console.log('=== [ApiService] Tokens from Interceptor ===');
            console.log('[ApiService] Identity Token (raw):', identityToken);
            console.log('[ApiService] Session Token (raw):', sessionToken);
            console.log('[ApiService] Access Token (raw):', accessToken);
            
            // Extra debugging - log token details if available
            let userId = null;
            if (identityToken) {
              const tokenParts = identityToken.split('.');
              if (tokenParts.length >= 2) {
                try {
                  const decoded = JSON.parse(atob(tokenParts[1]));
                  console.log('[ApiService] JWT payload:', decoded);
                  console.log('[ApiService] JWT subject:', decoded.sub);
                  console.log('[ApiService] JWT issuer:', decoded.iss);
                  console.log('[ApiService] JWT expiration:', new Date(decoded.exp * 1000).toISOString());
                  
                  // Store userId for potential use in URL or headers
                  userId = decoded.sub;
                } catch (e) {
                  console.error('[ApiService] Error decoding JWT:', e);
                }
              }
            }
            console.log('=== [ApiService] End Tokens ===');

            // Set identity token as x-identity-token header as shown in working curl example
            if (identityToken) {
              // Identity token should be sent as x-identity-token based on the working curl
              config.headers['x-identity-token'] = identityToken;
              console.log('[ApiService Interceptor] "x-identity-token" header set.');
              
              // Use session token for Authorization if available, otherwise use identity token
              const authToken = sessionToken || identityToken;
              config.headers.Authorization = `Bearer ${authToken}`;
              console.log('[ApiService Interceptor] Authorization header with Bearer token set.');
              
              // If we have a userId, add it to headers for backend identification
              if (userId) {
                config.headers['x-user-id'] = userId;
                console.log(`[ApiService Interceptor] Added x-user-id header: ${userId}`);
              }
            } else {
              console.warn('[ApiService Interceptor] No identity token available; authentication headers not set.');
            }

            // Fix user routes - replace user-specific URLs with /users/me endpoint for authentication
            if (config.url && (
                config.url.includes('/users/did:privy:') || 
                config.url.includes('/users/:userId') || 
                config.url.includes('/users/{userId}')
              )) {
              // Replace any user-specific paths with /users/me which is used in the working curl example
              const newUrl = config.url.replace(/\/users\/[^\/]+/, '/users/me');
              console.log(`[ApiService Interceptor] Replacing user-specific path with /users/me: ${config.url} -> ${newUrl}`);
              config.url = newUrl;
            }
            
          } catch (error) {
            console.error('[ApiService Interceptor] Error getting or setting auth tokens:', error);
          }
        } else {
          console.warn('[ApiService Interceptor] No token accessors set. Request may use fallback or be unauthenticated.');
          // Fallback to AsyncStorage (if still desired for non-Privy auth)
          try {
            const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            if (storedToken) {
              console.log('[ApiService Interceptor] Using token from AsyncStorage as fallback.');
              config.headers.Authorization = `Bearer ${storedToken}`;
            }
          } catch (error) {
            console.error('[ApiService Interceptor] Error retrieving auth token from storage (fallback):', error);
          }
        }
        return config;
      },
      (error) => {
        console.error('[ApiService Interceptor] Request error before sending:', error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Validates if the token is still valid
   * @returns true if token is valid, false otherwise
   */
  private isTokenValid(token: string | null): boolean {
    if (!token) return false;
    
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length < 2) return false;
      
      const payload = JSON.parse(atob(tokenParts[1]));
      // Check if token has expired
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      
      console.log('[ApiService] Token validation check:');
      console.log(`- Current time: ${new Date(currentTime).toISOString()}`);
      console.log(`- Token expiration: ${new Date(expirationTime).toISOString()}`);
      console.log(`- Time until expiration: ${Math.floor((expirationTime - currentTime) / 1000 / 60)} minutes`);
      
      if (currentTime >= expirationTime) {
        console.warn('[ApiService] Token has expired!');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('[ApiService] Error validating token:', error);
      return false;
    }
  }
  
  /**
   * Attempt to refresh the token if possible
   */
  private async refreshToken(): Promise<boolean> {
    if (!this.tokenAccessors) {
      console.warn('[ApiService] Cannot refresh token: No token accessors available');
      return false;
    }
    
    try {
      console.log('[ApiService] Attempting to refresh token...');
      
      // Try to get a fresh token directly from the token accessors
      const { identityToken } = await getAuthTokens(this.tokenAccessors);
      
      // Check if we got a valid new token
      if (identityToken && this.isTokenValid(identityToken)) {
        console.log('[ApiService] Successfully refreshed token');
        return true;
      } else {
        console.warn('[ApiService] Token refresh failed: No valid token returned');
        return false;
      }
    } catch (error) {
      console.error('[ApiService] Error refreshing token:', error);
      return false;
    }
  }

  /**
   * Configure response interceptor to handle errors and token refresh
   */
  private setupResponseInterceptor() {
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Log full details of every successful API response
        console.log('=== API Success Response ===');
        console.log('URL:', response.config?.method?.toUpperCase(), response.config?.url);
        console.log('Status:', response.status);
        // console.log('Headers:', response.headers); // Can be verbose
        console.log('Data:', response.data);
        console.log('=== End API Success ===');
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config;
        
        // Log detailed error information
        console.error('=== API Error Response ===');
        if (error.response) {
          console.error('Status:', error.response.status);
          console.error('Data:', error.response.data);
          console.error('Headers:', error.response.headers);
        } else if (error.request) {
          console.error('No response received, request details:', error.request);
        } else {
          console.error('Error setting up the request:', error.message);
        }
        console.error('URL:', originalRequest?.method?.toUpperCase(), originalRequest?.url);
        console.error('=== End API Error ===');
        
        // Handle 401 Unauthorized errors (token expired)
        if (error.response?.status === 401 && originalRequest && !originalRequest.headers['_retry']) {
          console.log('[ApiService] Received 401 Unauthorized - attempting to refresh token and retry');
          
          try {
            // Mark that we're retrying this request to prevent infinite loop
            originalRequest.headers['_retry'] = 'true';
            
            // Attempt to refresh token
            const refreshSuccessful = await this.refreshToken();
            
            if (refreshSuccessful) {
              console.log('[ApiService] Token refreshed, retrying original request');
              
              // Get fresh tokens for the retry
              if (this.tokenAccessors) {
                const { identityToken } = await getAuthTokens(this.tokenAccessors);
                
                if (identityToken) {
                  // Update all the auth headers for retry
                  originalRequest.headers['privy-id-token'] = identityToken;
                  originalRequest.headers['Authorization'] = `Bearer ${identityToken}`;
                  originalRequest.headers['x-auth-token'] = identityToken;
                  
                  console.log('[ApiService] Auth headers updated for retry request');
                  
                  // Retry the original request with new token
                  return this.axiosInstance(originalRequest);
                }
              }
            }
            
            // If we got here, refresh failed or we couldn't get fresh tokens
            console.error('[ApiService] Token refresh or retry failed');
            
            // Clear stored tokens if we had a refresh failure
            await AsyncStorage.multiRemove([
              STORAGE_KEYS.AUTH_TOKEN,
              STORAGE_KEYS.REFRESH_TOKEN,
            ]);
            
            // Here you could add code to navigate to login screen or handle auth failure
            
          } catch (refreshError) {
            console.error('[ApiService] Error during token refresh or request retry:', refreshError);
            
            // Clear stored tokens on refresh failure
            await AsyncStorage.multiRemove([
              STORAGE_KEYS.AUTH_TOKEN,
              STORAGE_KEYS.REFRESH_TOKEN,
            ]);
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
      console.error('API Error Response (handled):', {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error Request (handled):', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error (handled):', error.message);
    }
  }
}

// Create a singleton instance
const apiService = new ApiService();

// Export the singleton instance
export default apiService;

// Export types for better TypeScript integration
export type { AxiosRequestConfig, AxiosResponse, AxiosError };
