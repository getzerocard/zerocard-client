import apiService from './api';
import axios, { AxiosError } from 'axios';

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

// API response types
interface UserResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: UserData | null;
}

interface UserData {
  userId: string;
  userType: string;
  timeCreated: string;
  timeUpdated: string;
  walletAddresses: {
    ethereum: string;
    solana: string;
    bitcoin: string;
    tron: string;
  };
  email: string;
  isNewUser: boolean;
}

interface ErrorResponse {
  data: {
    data: null;
    message: string;
    statusCode: number;
    success: false;
  };
  status: number;
}

// Base API configuration
const API_BASE_URL = 'https://zerocardbackend-dev.railway.app/api/v1';

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

/**
 * Creates or syncs a user with the backend with detailed data validation
 * @param options Configuration options
 * @returns User data and account status
 */
export async function syncUser(options?: {
  expectNewUser?: boolean;
  expectExistingUser?: boolean;
}): Promise<{
  success: boolean;
  userId?: string;
  userType?: string;
  email?: string;
  timeCreated?: string;
  timeUpdated?: string;
  walletAddresses?: {
    ethereum?: string;
    solana?: string;
    bitcoin?: string;
    tron?: string;
  };
  data?: UserData;
  error?: string;
  isNewUser?: boolean;
}> {
  const processType = options?.expectNewUser 
    ? 'New User Creation' 
    : options?.expectExistingUser 
      ? 'Existing User Sync' 
      : 'User Account Creation';
  
  console.log(`=== ${processType} Process ===`);
  
  try {
    const response = await apiService.post<UserResponse>('/users/me');
    
    // First check if we have a valid response
    if (!response) {
      throw new Error('No response data received');
    }
    
    // Log the full response for debugging
    console.log('API Response:', JSON.stringify(response, null, 2));
    
    const userData = response.data;
    
    // Check if userData exists
    if (!userData) {
      console.log(`=== ${processType} Result ===`);
      console.log('Status: SUCCESS ✅');
      console.log(`Is New User: ${response.message?.includes('new') ? 'Yes' : 'No'}`);
      console.log(`=== End ${processType} Process ===`);
      
      throw new Error('User data is null in the response');
    }
    
    // Validate expectations if provided
    if (options?.expectNewUser && !userData.isNewUser) {
      console.log(`=== ${processType} Warning ===`);
      console.log('Status: UNEXPECTED RESULT ⚠️');
      console.log('Expected new user but received existing user status');
      console.log(`=== End ${processType} Process ===`);
    }
    
    if (options?.expectExistingUser && userData.isNewUser) {
      console.log(`=== ${processType} Warning ===`);
      console.log('Status: UNEXPECTED RESULT ⚠️');
      console.log('Expected existing user but received new user status');
      console.log(`=== End ${processType} Process ===`);
    }
    
    // Log detailed information only if it exists
    console.log(`=== ${processType} Result ===`);
    console.log('Status: SUCCESS ✅');
    console.log(`User Type: ${userData.userType || 'undefined'}`);
    console.log(`User ID: ${userData.userId || 'undefined'}`);
    console.log(`Email: ${userData.email || 'undefined'}`);
    console.log(`Account Status: ${userData.isNewUser ? 'NEW ACCOUNT CREATED' : 'EXISTING ACCOUNT SYNCED'}`);
    console.log(`Time Created: ${userData.timeCreated || 'undefined'}`);
    console.log(`Time Updated: ${userData.timeUpdated || 'undefined'}`);
    console.log('Wallet Addresses:');
    console.log(userData.walletAddresses || {});
    console.log(`=== End ${processType} Process ===`);
    
    // Return all user data fields explicitly with fallbacks
    return {
      success: true,
      userId: userData.userId,
      userType: userData.userType,
      email: userData.email,
      timeCreated: userData.timeCreated,
      timeUpdated: userData.timeUpdated,
      data: userData,
      isNewUser: userData.isNewUser,
      walletAddresses: {
        ethereum: userData.walletAddresses?.ethereum || '',
        solana: userData.walletAddresses?.solana || '',
        bitcoin: userData.walletAddresses?.bitcoin || '',
        tron: userData.walletAddresses?.tron || ''
      }
    };
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    
    // Log the full error for debugging
    console.log('Full error:', JSON.stringify(axiosError.response?.data, null, 2));
    
    const errorMessage = axiosError.response?.data?.data?.message || 
                         axiosError.message || 
                         `Unknown error during ${processType.toLowerCase()}`;
    
    // Check for specific error types
    const isDuplicateKey = errorMessage.includes('duplicate key value');
    
    console.log(`=== ${processType} Error ===`);
    console.log('Status: ERROR ❌');
    console.log(`Error Message: ${errorMessage}`);
    
    // For duplicate key errors when syncing existing users
    if (isDuplicateKey && options?.expectExistingUser) {
      console.log('Note: Duplicate key errors may indicate the user already exists');
      console.log(`=== End ${processType} Process ===`);
      
      return {
        success: true,
        error: 'User already exists in system',
      };
    }
    
    console.log(`=== End ${processType} Process ===`);
    
    // Handle duplicate key error more gracefully for regular sync
    if (isDuplicateKey) {
      return {
        success: false,
        error: 'User already exists with this email or wallet address',
        isNewUser: false
      };
    }
    
    return {
      success: false,
      error: errorMessage,
      isNewUser: false
    };
  }
}

// Keep these functions for backwards compatibility, but implement them using the consolidated function
/**
 * Creates or syncs a user with the backend
 * @param accessToken Privy access token (not used with apiService)
 * @param identityToken Privy identity token (not used with apiService)
 * @returns User data and account status
 */
export async function createOrSyncUser(
  accessToken: string,
  identityToken: string
): Promise<{
  success: boolean;
  data?: UserData;
  error?: string;
  isNewUser: boolean;
}> {
  const result = await syncUser();
  
  return {
    success: result.success,
    data: result.data,
    error: result.error,
    isNewUser: result.isNewUser || false
  };
}

/**
 * Creates a new user account with detailed data validation
 * @param accessToken Privy access token (not used with apiService)
 * @param identityToken Privy identity token (not used with apiService)
 * @returns Detailed user creation result
 */
export async function createNewUser(
  accessToken: string,
  identityToken: string
): Promise<{
  success: boolean;
  userId?: string;
  userType?: string;
  email?: string;
  timeCreated?: string;
  timeUpdated?: string;
  walletAddresses?: {
    ethereum?: string;
    solana?: string;
    bitcoin?: string;
    tron?: string;
  };
  error?: string;
}> {
  return syncUser({ expectNewUser: true });
}

/**
 * Syncs an existing user with detailed data validation
 * @param accessToken Privy access token (not used with apiService)
 * @param identityToken Privy identity token (not used with apiService)
 * @returns Detailed user sync result
 */
export async function syncExistingUser(
  accessToken: string,
  identityToken: string
): Promise<{
  success: boolean;
  userId?: string;
  userType?: string;
  email?: string;
  timeCreated?: string;
  timeUpdated?: string;
  walletAddresses?: {
    ethereum?: string;
    solana?: string;
    bitcoin?: string;
    tron?: string;
  };
  error?: string;
}> {
  return syncUser({ expectExistingUser: true });
}

export default UserApi; 