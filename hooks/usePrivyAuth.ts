import { useState, useEffect, useCallback } from 'react';
import { usePrivy, useLogin } from '@privy-io/expo';
import { getPrivyAccessToken } from '../utils/privy';

// Define interface for login options based on Privy types
interface LoginOptions {
  loginMethods?: Array<string>;
  prefill?: { 
    type: 'email' | 'phone'; 
    value: string; 
  };
}

/**
 * Custom hook for managing Privy authentication
 * Combines usePrivy, useLogin, and token management
 */
export function usePrivyAuth() {
  // Get Privy base hooks
  const { login } = useLogin();
  // Destructure user and logout directly from usePrivy
  // ready and authenticated will be derived
  const { user, logout: privyLogout } = usePrivy(); 
  
  // Derive authenticated state from user object
  const authenticated = !!user;
  // Assume ready when user object is no longer undefined (initial state)
  // This is a common pattern if a hook doesn't explicitly provide a `ready` flag.
  // We also track initial mount to ensure `ready` isn't true prematurely.
  const [isInitialMount, setIsInitialMount] = useState(true);
  const ready = !isInitialMount || user !== undefined;

  useEffect(() => {
    if (user !== undefined && isInitialMount) {
      setIsInitialMount(false);
    }
  }, [user, isInitialMount]);
  
  // Local state for token
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isCheckingToken, setIsCheckingToken] = useState(false);

  // Function to refresh the access token
  const refreshToken = useCallback(async () => {
    if (!authenticated) {
      setAccessToken(null);
      return null;
    }
    
    setIsCheckingToken(true);
    try {
      const token = await getPrivyAccessToken();
      setAccessToken(token);
      return token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    } finally {
      setIsCheckingToken(false);
    }
  }, [authenticated]);

  // Update token when authentication state changes and Privy is ready
  useEffect(() => {
    if (ready && authenticated) {
      refreshToken();
    } else if (ready && !authenticated) {
      setAccessToken(null); // Clear token if not authenticated but ready
    }
  }, [ready, authenticated, refreshToken]);

  // Login function with options
  const handleLogin = useCallback(async (options?: LoginOptions) => {
    try {
      await login(options as any);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }, [login]);

  // Logout function - uses logout from usePrivy()
  const handleLogout = useCallback(async () => {
    try {
      await privyLogout(); 
      setAccessToken(null);
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      return false;
    }
  }, [privyLogout]);

  // Function to ensure there's a valid token before an operation
  const withToken = useCallback(async <T>(
    callback: (token: string) => Promise<T>
  ): Promise<T | null> => {
    let token = accessToken;
    
    if (!token && authenticated) { // Only refresh if authenticated but no token
      token = await refreshToken();
    }
    
    if (!token) {
      console.warn('No valid authentication token available or not authenticated.');
      return null;
    }
    
    return callback(token);
  }, [accessToken, authenticated, refreshToken]);

  return {
    // Authentication state
    user,
    ready,
    authenticated,
    accessToken,
    isCheckingToken,
    
    // Authentication actions
    login: handleLogin,
    logout: handleLogout,
    refreshToken,
    withToken,
  };
}

export default usePrivyAuth; 