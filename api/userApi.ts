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
 * Creates or syncs a user with the backend
 * @param accessToken Privy access token
 * @param identityToken Privy identity token
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
  console.log('=== User Account Creation Process ===');
  
  try {
    const response = await axios.post<UserResponse>(
      `${API_BASE_URL}/users/me`,
      {},
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'x-identity-token': identityToken
        }
      }
    );
    
    // First check if we have a valid response
    if (!response.data) {
      throw new Error('No response data received');
    }
    
    // Log the full response for debugging
    console.log('API Response:', JSON.stringify(response.data, null, 2));
    
    const userData = response.data.data;
    
    // Check if userData exists
    if (!userData) {
      console.log('=== User Account Creation Result ===');
      console.log('Status: SUCCESS ✅');
      console.log(`Is New User: ${response.data.message?.includes('new') ? 'Yes' : 'No'}`);
      console.log('=== End User Account Creation Process ===');
      
      throw new Error('User data is null in the response');
    }
    
    // Log detailed information only if it exists
    console.log('=== User Account Creation Result ===');
    console.log('Status: SUCCESS ✅');
    console.log(`User Type: ${userData.userType || 'undefined'}`);
    console.log(`User ID: ${userData.userId || 'undefined'}`);
    console.log(`Email: ${userData.email || 'undefined'}`);
    console.log(`Account Status: ${userData.isNewUser ? 'NEW ACCOUNT CREATED' : 'EXISTING ACCOUNT SYNCED'}`);
    console.log(`Time Created: ${userData.timeCreated || 'undefined'}`);
    console.log(`Time Updated: ${userData.timeUpdated || 'undefined'}`);
    console.log('Wallet Addresses:');
    console.log(userData.walletAddresses || {});
    console.log('=== End User Account Creation Process ===');
    
    return {
      success: true,
      data: userData,
      isNewUser: userData.isNewUser || false
    };
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    
    // Log the full error for debugging
    console.log('Full error:', JSON.stringify(axiosError.response?.data, null, 2));
    
    const errorMessage = axiosError.response?.data?.data?.message || 
                         axiosError.message || 
                         'Unknown error occurred';
    
    console.log('=== User Account Creation Error ===');
    console.log('Status: ERROR ❌');
    console.log(`Error Message: ${errorMessage}`);
    console.log('=== End User Account Creation Process ===');
    
    // Handle duplicate key error more gracefully
    if (errorMessage.includes('duplicate key value')) {
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

/**
 * Creates a new user account with detailed data validation
 * @param accessToken Privy access token
 * @param identityToken Privy identity token
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
  console.log('=== New User Creation Process ===');
  
  try {
    const response = await axios.post<UserResponse>(
      `${API_BASE_URL}/users/me`,
      {},
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'x-identity-token': identityToken
        }
      }
    );
    
    // Validate response structure
    if (!response.data || !response.data.success) {
      throw new Error('Invalid response format or operation failed');
    }
    
    // Log full response for debugging
    console.log('Full API Response:', JSON.stringify(response.data, null, 2));
    
    const userData = response.data.data;
    
    // If userData is null or not a new user, return error
    if (!userData || !userData.isNewUser) {
      return {
        success: false,
        error: userData ? 'User already exists' : 'No user data returned'
      };
    }
    
    // Log successful user creation
    console.log('=== New User Creation Result ===');
    console.log('Status: SUCCESS ✅');
    console.log(`User Type: ${userData.userType}`);
    console.log(`User ID: ${userData.userId}`);
    console.log(`Email: ${userData.email}`);
    console.log('Account Status: NEW ACCOUNT CREATED');
    console.log(`Time Created: ${userData.timeCreated}`);
    console.log(`Time Updated: ${userData.timeUpdated}`);
    console.log('Wallet Addresses:');
    console.log(userData.walletAddresses);
    console.log('=== End New User Creation Process ===');
    
    // Return all user data fields explicitly
    return {
      success: true,
      userId: userData.userId,
      userType: userData.userType,
      email: userData.email,
      timeCreated: userData.timeCreated,
      timeUpdated: userData.timeUpdated,
      walletAddresses: {
        ethereum: userData.walletAddresses?.ethereum || '',
        solana: userData.walletAddresses?.solana || '',
        bitcoin: userData.walletAddresses?.bitcoin || '',
        tron: userData.walletAddresses?.tron || ''
      }
    };
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    const errorData = axiosError.response?.data;
    
    // Log detailed error information
    console.log('Full error response:', JSON.stringify(errorData, null, 2));
    
    const errorMessage = errorData?.data?.message || 
                         axiosError.message || 
                         'Unknown error during user creation';
    
    console.log('=== New User Creation Error ===');
    console.log('Status: ERROR ❌');
    console.log(`Error Message: ${errorMessage}`);
    console.log('=== End New User Creation Process ===');
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Syncs an existing user with detailed data validation
 * @param accessToken Privy access token
 * @param identityToken Privy identity token
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
  console.log('=== Existing User Sync Process ===');
  
  try {
    const response = await axios.post<UserResponse>(
      `${API_BASE_URL}/users/me`,
      {},
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'x-identity-token': identityToken
        }
      }
    );
    
    // Validate response structure
    if (!response.data) {
      throw new Error('No response data received');
    }
    
    // Log full response for debugging
    console.log('Full API Response:', JSON.stringify(response.data, null, 2));
    
    // Check if we have proper success status
    if (!response.data.success) {
      throw new Error(`API returned error: ${response.data.message}`);
    }
    
    const userData = response.data.data;
    
    // Handle case where userData might be null but response is success
    if (!userData) {
      console.log('=== Existing User Sync Warning ===');
      console.log('Status: PARTIAL SUCCESS ⚠️');
      console.log('User data missing from successful response');
      console.log('=== End Existing User Sync Process ===');
      
      return {
        success: true,
        error: 'User synchronized but data is incomplete'
      };
    }
    
    // For existing users, isNewUser should be false
    if (userData.isNewUser) {
      console.log('=== Existing User Sync Warning ===');
      console.log('Status: UNEXPECTED RESULT ⚠️');
      console.log('Expected existing user but received new user status');
      console.log('=== End Existing User Sync Process ===');
    }
    
    // Log successful user sync with fallbacks for undefined values
    console.log('=== Existing User Sync Result ===');
    console.log('Status: SUCCESS ✅');
    console.log(`User Type: ${userData.userType || 'Not provided'}`);
    console.log(`User ID: ${userData.userId || 'Not provided'}`);
    console.log(`Email: ${userData.email || 'Not provided'}`);
    console.log('Account Status: EXISTING ACCOUNT SYNCED');
    console.log(`Time Created: ${userData.timeCreated || 'Not provided'}`);
    console.log(`Time Updated: ${userData.timeUpdated || 'Not provided'}`);
    console.log('Wallet Addresses:');
    console.log(userData.walletAddresses || 'Not provided');
    console.log('=== End Existing User Sync Process ===');
    
    // Return all user data fields explicitly with fallbacks
    return {
      success: true,
      userId: userData.userId,
      userType: userData.userType,
      email: userData.email,
      timeCreated: userData.timeCreated,
      timeUpdated: userData.timeUpdated,
      walletAddresses: {
        ethereum: userData.walletAddresses?.ethereum || '',
        solana: userData.walletAddresses?.solana || '',
        bitcoin: userData.walletAddresses?.bitcoin || '',
        tron: userData.walletAddresses?.tron || ''
      }
    };
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    
    // Try to extract detailed error information
    const errorData = axiosError.response?.data;
    console.log('Full error response:', JSON.stringify(errorData, null, 2));
    
    const errorMessage = errorData?.data?.message || 
                         axiosError.message || 
                         'Unknown error during user sync';
    
    // Check for specific error types
    const isDuplicateKey = errorMessage.includes('duplicate key value');
    
    console.log('=== Existing User Sync Error ===');
    console.log('Status: ERROR ❌');
    console.log(`Error Message: ${errorMessage}`);
    
    // For duplicate key errors, this might actually indicate success for existing users
    if (isDuplicateKey) {
      console.log('Note: Duplicate key errors may indicate the user already exists');
      console.log('=== End Existing User Sync Process ===');
      
      return {
        success: true,
        error: 'User already exists in system',
      };
    }
    
    console.log('=== End Existing User Sync Process ===');
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

export default UserApi; 