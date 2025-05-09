import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
} from 'axios';
import { getAuthTokens, TokenGetters } from '../common/utils/handleToken';

export interface ExtendedRequestConfig extends AxiosRequestConfig {
  useSessionToken?: boolean;
}

const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

export class ApiService {
  private axiosInstance: AxiosInstance;
  private tokenAccessors: TokenGetters | null = null;

  constructor() {
    if (!API_CONFIG.BASE_URL) {
      console.error('[ApiService] API_BASE_URL is not defined.');
    }

    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    this.setupRequestInterceptor();
  }

  setTokenAccessors(accessors: TokenGetters) {
    this.tokenAccessors = accessors;
  }

  private getUserIdFromToken(token: string | null): string | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub ?? null;
    } catch {
      return null;
    }
  }

  private setupRequestInterceptor() {
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        if (this.tokenAccessors) {
          try {
            const { accessToken, identityToken } = await getAuthTokens(this.tokenAccessors);

            if (identityToken) {
              // Set Authorization header strictly with access token, no fallback
              if (accessToken) {
                config.headers = {
                  ...config.headers,
                  'Authorization': `Bearer ${accessToken}`,
                  'x-identity-token': identityToken,
                } as any;
              }

              // Handle URL special patterns - rewrite /users/{id} to /users/me
              if (config.url?.match(/\/users\/(did:privy:[^\/]+|:userId|{userId})/)) {
                config.url = config.url.replace(/\/users\/[^\/]+/, '/users/me');
              }
            }
          } catch (err) {
            console.error('[ApiService] Error in request interceptor:', err);
          }
        }
        
        return config;
      },
      (error) => Promise.reject(error),
    );
  }

  async get<T>(url: string, config: ExtendedRequestConfig = {}): Promise<{ data: T }> {
    const response = await this.axiosInstance.get<T>(url, config);
    return { data: response.data };
  }

  async post<T>(url: string, data?: any, config: ExtendedRequestConfig = {}): Promise<{ data: T }> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return { data: response.data };
  }

  async put<T>(url: string, data?: any, config: ExtendedRequestConfig = {}): Promise<{ data: T }> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return { data: response.data };
  }

  async delete<T>(url: string, config: ExtendedRequestConfig = {}): Promise<{ data: T }> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return { data: response.data };
  }
}

// Create a singleton instance
const apiServiceInstance = new ApiService();

// Export the singleton instance
export default apiServiceInstance;
export const apiService = apiServiceInstance;