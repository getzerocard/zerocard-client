import apiService from './api';

// Types for user data
export interface User {
  id: string;
  email: string;
  name: string;
  walletAddress?: string;
  createdAt: string;
  updatedAt: string;
}

// Types for responses
interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// User API endpoints
const UserApi = {
  /**
   * Get the current user's profile
   */
  getCurrentUser: async (): Promise<User> => {
    return apiService.get<User>('/users/me');
  },

  /**
   * Update the current user's profile
   */
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    return apiService.put<User>('/users/me', userData);
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: string): Promise<ApiResponse<User>> => {
    return apiService.get<ApiResponse<User>>(`/users/${userId}`);
  },

  /**
   * Link wallet address to user
   */
  linkWallet: async (walletAddress: string): Promise<ApiResponse<User>> => {
    return apiService.post<ApiResponse<User>>('/users/wallet', { walletAddress });
  },
};

export default UserApi; 