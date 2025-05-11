import { useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Network from 'expo-network';

// Network status types
export type NetworkStatusType = 'POOR' | 'NONE' | null;

// Track failed network requests globally to detect poor connectivity
const failedRequests = {
  count: 0,
  lastCheck: Date.now(), // Initialize with current time
  resetTime: 60000, // Reset counter after 1 minute
};

export function useNetworkStatusCheck() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatusType>(null);
  const isPingingRef = useRef(false);
  const lastCheckTimeRef = useRef(0);
  const appStateRef = useRef(AppState.currentState);

  const performLightPing = async (): Promise<boolean> => {
    if (isPingingRef.current) return true;

    const now = Date.now();
    if (now - lastCheckTimeRef.current < 30000) {
      return true;
    }

    try {
      isPingingRef.current = true;
      const response = await fetch('https://www.google.com.ng', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(3000),
      });
      isPingingRef.current = false;
      lastCheckTimeRef.current = now;
      return response.ok;
    } catch (error) {
      isPingingRef.current = false;
      lastCheckTimeRef.current = now;
      return false;
    }
  };

  const checkNetworkStatus = async (forceCheck: boolean = false) => {
    try {
      if (appStateRef.current !== 'active' && !forceCheck) {
        return;
      }

      const networkState = await Network.getNetworkStateAsync();

      if (!networkState.isConnected || !networkState.isInternetReachable) {
        setNetworkStatus('NONE');
        return;
      }

      let isPoorConnection = false;
      const isCellular = networkState.type === Network.NetworkStateType.CELLULAR;
      const now = Date.now();

      if (now - failedRequests.lastCheck > failedRequests.resetTime) {
        failedRequests.count = 0;
        failedRequests.lastCheck = now;
      }

      if (failedRequests.count >= 2) {
        isPoorConnection = true;
      } else if (isCellular && !(await performLightPing())) {
        isPoorConnection = true;
      }

      setNetworkStatus(isPoorConnection ? 'POOR' : null);
    } catch (error) {
      console.error('[useNetworkStatusCheck] Error checking network status:', error);
      // Potentially set to an error state or 'POOR' if check fails
      setNetworkStatus('POOR'); 
    }
  };

  // Global listener for network requests
  useEffect(() => {
    const originalFetch = global.fetch;
    global.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        // If response is not ok, but not an exception (e.g. 4xx, 5xx)
        // This part is tricky as not all non-ok responses are network errors
        // For now, only count exceptions as failures for simplicity here
        return response;
      } catch (error) {
        failedRequests.count++;
        failedRequests.lastCheck = Date.now();
        checkNetworkStatus(true); // Force check after a failure
        throw error;
      }
    };
    return () => {
      global.fetch = originalFetch;
    };
  }, []); // Empty dependency array ensures this runs once

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        checkNetworkStatus(true);
      }
      appStateRef.current = nextAppState;
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  // Initial and interval checks
  useEffect(() => {
    checkNetworkStatus(true); // Initial check
    const intervalId = setInterval(() => checkNetworkStatus(), 60000); // Check every minute
    return () => clearInterval(intervalId);
  }, []);

  return networkStatus;
} 