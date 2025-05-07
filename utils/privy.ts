import { createPrivyClient } from '@privy-io/expo';
import Constants from 'expo-constants';

// Constants from environment variables
const PRIVY_APP_ID = Constants.expoConfig?.extra?.EXPO_PUBLIC_PRIVY_APP_ID;
const PRIVY_CLIENT_ID = Constants.expoConfig?.extra?.EXPO_PUBLIC_PRIVY_CLIENT_ID;

// Initialize Privy client
const privy = createPrivyClient({
  appId: PRIVY_APP_ID || '',
  clientId: PRIVY_CLIENT_ID || '',
});

/**
 * Function to get the current access token
 * @returns Promise resolving to the access token string or null if not available
 */
export async function getPrivyAccessToken(): Promise<string | null> {
  try {
    const accessToken = await privy.getAccessToken();
    return accessToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}

/**
 * Function to include auth token in request headers
 * @param headers - Existing headers object to add token to
 * @returns Promise resolving to headers with auth token included
 */
export async function withPrivyAuth(headers: Record<string, string> = {}): Promise<Record<string, string>> {
  const token = await getPrivyAccessToken();
  if (!token) return headers;
  
  return {
    ...headers,
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Function to handle authorized API requests
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @returns Promise resolving to fetch response
 */
export async function privyAuthorizedFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const authHeaders = await withPrivyAuth(options.headers as Record<string, string> || {});
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: authHeaders,
    });
    
    // Handle 401 (Unauthorized) by returning null instead of throwing
    if (response.status === 401) {
      console.warn('Authentication token expired or invalid');
      return response;
    }
    
    return response;
  } catch (error) {
    console.error('Error making authorized request:', error);
    throw error;
  }
}

/**
 * Function to check if user has valid token and refresh if needed
 * @returns Promise resolving to boolean indicating if user is authenticated
 */
export async function ensurePrivyAuthentication(): Promise<boolean> {
  try {
    const token = await getPrivyAccessToken();
    return !!token;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
}

/**
 * Get Privy client instance
 * @returns The initialized Privy client
 */
export function getPrivyClient() {
  return privy;
}

export default {
  getPrivyAccessToken,
  withPrivyAuth,
  privyAuthorizedFetch,
  ensurePrivyAuthentication,
  getPrivyClient,
}; 