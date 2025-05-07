import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  AppState,
  AppStateStatus,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import * as Network from 'expo-network';
import * as Haptics from 'expo-haptics';

// SVG icons for network states
const networkErrorSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4 13.7C7.5 13.7 10.3 16.5 10.3 20C10.3 20.6 10.7 21 11.3 21C11.9 21 12.3 20.6 12.3 20C12.3 15.4 8.6 11.7 4 11.7C3.4 11.7 3 12.1 3 12.7C3 13.3 3.4 13.7 4 13.7Z" fill="#C9252D"/>
<path d="M4 9.40002C9.9 9.40002 14.6 14.2 14.6 20C14.6 20.6 15 21 15.6 21C16.2 21 16.6 20.6 16.6 20C16.6 13 11 7.40002 4 7.40002C3.4 7.40002 3 7.80002 3 8.40002C3 9.00002 3.4 9.40002 4 9.40002ZM4 18.1C5.1 18.1 5.9 19 5.9 20C5.9 20.6 6.3 21 6.9 21C7.5 21 7.9 20.6 7.9 20C7.9 17.8 6.1 16.1 4 16.1C3.4 16.1 3 16.5 3 17.1C3 17.7 3.4 18.1 4 18.1ZM19.8 4.20002C19.4 3.80002 18.8 3.80002 18.4 4.20002L17 5.60002L15.6 4.20002C15.2 3.80002 14.6 3.80002 14.2 4.20002C13.8 4.60002 13.8 5.20002 14.2 5.60002L15.6 7.00002L14.2 8.40002C13.8 8.80002 13.8 9.40002 14.2 9.80002C14.4 10 14.7 10.1 14.9 10.1C15.1 10.1 15.4 10 15.6 9.80002L17 8.40002L18.4 9.80002C18.6 10 18.9 10.1 19.1 10.1C19.3 10.1 19.6 10 19.8 9.80002C20.2 9.40002 20.2 8.80002 19.8 8.40002L18.4 7.00002L19.8 5.60002C20.2 5.20002 20.2 4.60002 19.8 4.20002Z" fill="#C9252D"/>
</svg>`;

const networkPoorSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.7 3.10002C16.8 3.30002 16.3 4.10002 16.4 5.00002L17 8.00002C17.1 8.40002 17.4 8.70002 17.8 8.80002C18.4 8.90002 18.9 8.60002 19 8.00002L19.6 5.00002V4.40002C19.4 3.60002 18.6 3.00002 17.7 3.10002ZM4 13.7C7.5 13.7 10.3 16.5 10.3 20C10.3 20.6 10.7 21 11.3 21C11.9 21 12.3 20.6 12.3 20C12.3 15.4 8.6 11.7 4 11.7C3.4 11.7 3 12.1 3 12.7C3 13.3 3.4 13.7 4 13.7Z" fill="#E99F00"/>
<path d="M4 9.40002C9.9 9.40002 14.6 14.2 14.6 20C14.6 20.6 15 21 15.6 21C16.2 21 16.6 20.6 16.6 20C16.6 13 11 7.40002 4 7.40002C3.4 7.40002 3 7.80002 3 8.40002C3 9.00002 3.4 9.40002 4 9.40002ZM4 18.1C5.1 18.1 5.9 19 5.9 20C5.9 20.6 6.3 21 6.9 21C7.5 21 7.9 20.6 7.9 20C7.9 17.8 6.1 16.1 4 16.1C3.4 16.1 3 16.5 3 17.1C3 17.7 3.4 18.1 4 18.1Z" fill="#E99F00"/>
<path d="M18 12C18.5523 12 19 11.5523 19 11C19 10.4477 18.5523 10 18 10C17.4477 10 17 10.4477 17 11C17 11.5523 17.4477 12 18 12Z" fill="#E99F00"/>
</svg>`;

// Network status types
type NetworkStatusType = 'POOR' | 'NONE' | null;

interface NetworkStatusProps {
  // Optional onClose callback
  onClose?: () => void;
}

// Track failed network requests globally to detect poor connectivity
const failedRequests = {
  count: 0,
  lastCheck: 0,
  resetTime: 60000, // Reset counter after 1 minute
};

const NetworkStatus: React.FC<NetworkStatusProps> = ({ onClose }) => {
  // State to track network status
  const [networkStatus, setNetworkStatus] = useState<NetworkStatusType>(null);

  // Animation values
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Timer for auto-dismissing poor connectivity toast
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Window dimensions for positioning
  const { width } = Dimensions.get('window');

  // Track if active ping is in progress
  const isPingingRef = useRef(false);

  // Last check time to prevent excessive checks
  const lastCheckTimeRef = useRef(0);

  // Track app state for optimized checking
  const appStateRef = useRef(AppState.currentState);

  // Lighter ping function that only checks a single local server
  // Only used when necessary
  const performLightPing = async (): Promise<boolean> => {
    // If already pinging, don't start another
    if (isPingingRef.current) return true;

    // Only check once every 30 seconds max to preserve battery
    const now = Date.now();
    if (now - lastCheckTimeRef.current < 30000) {
      return true; // Assume connection is still good
    }

    try {
      isPingingRef.current = true;

      // Use a single reliable server, preferably in Nigeria or nearby
      const response = await fetch('https://www.google.com.ng', {
        method: 'HEAD',
        cache: 'no-cache',
        // Use a longer timeout (3s) for Nigerian network conditions
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

  // Optimized network check that uses multiple indicators
  // but minimizes resource usage
  const checkNetworkStatus = async (forceCheck: boolean = false) => {
    try {
      // Only check when app is in foreground to save battery
      if (appStateRef.current !== 'active' && !forceCheck) {
        return;
      }

      // Get basic network info (uses cached values when available)
      const networkState = await Network.getNetworkStateAsync();

      // No connection case is straightforward
      if (!networkState.isConnected || !networkState.isInternetReachable) {
        setNetworkStatus('NONE');
        return;
      }

      // Detect poor connectivity using multiple signals
      let isPoorConnection = false;

      // 1. Check connection type - basic indicator
      const isCellular = networkState.type === Network.NetworkStateType.CELLULAR;

      // 2. Check if we've had failed network requests recently
      const now = Date.now();
      if (now - failedRequests.lastCheck > failedRequests.resetTime) {
        // Reset counter periodically
        failedRequests.count = 0;
        failedRequests.lastCheck = now;
      }

      // If we've had multiple failed requests recently, that's a sign of poor connection
      if (failedRequests.count >= 2) {
        isPoorConnection = true;
      }
      // If on cellular, lower our expectations for Nigerian networks
      // Only ping when on cellular and no recent failures (saves resources)
      else if (isCellular && !(await performLightPing())) {
        isPoorConnection = true;
      }

      setNetworkStatus(isPoorConnection ? 'POOR' : null);
    } catch (error) {
      console.error('Error checking network status:', error);
    }
  };

  // Function to animate the toast in
  const animateIn = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Function to animate the toast out
  const animateOut = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (callback) callback();
    });
  };

  // Global listener for network requests
  // This is the most efficient way to detect problems
  useEffect(() => {
    // Patch global fetch to track failures
    const originalFetch = global.fetch;
    global.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        return response;
      } catch (error) {
        // Record the failure for our passive detection
        failedRequests.count++;
        failedRequests.lastCheck = Date.now();

        // Check network after a failure
        checkNetworkStatus(true);

        throw error;
      }
    };

    // Restore original fetch on unmount
    return () => {
      global.fetch = originalFetch;
    };
  }, []);

  // Handle app state changes to conserve battery
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // Only check network when app comes to foreground
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

  // Set up timer for auto-dismissing poor connectivity toast
  useEffect(() => {
    if (networkStatus === 'POOR' && !dismissTimerRef.current) {
      // Show the toast
      animateIn();

      // Trigger warning haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      // Set a timer to dismiss after 3.5 seconds
      dismissTimerRef.current = setTimeout(() => {
        animateOut(() => {
          setNetworkStatus(null);
          dismissTimerRef.current = null;
        });
      }, 3500);
    } else if (networkStatus === 'NONE') {
      // Show the no connectivity toast
      animateIn();

      // Trigger error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Clear any existing dismiss timer
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    } else if (networkStatus === null) {
      // Hide the toast
      animateOut();

      // Clear any existing dismiss timer
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    }

    // Clean up timer on unmount
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, [networkStatus]);

  // Check network initially and set up very infrequent checks
  useEffect(() => {
    // Initial check
    checkNetworkStatus(true);

    // Set up less frequent checks (once per minute) to minimize resource usage
    const intervalId = setInterval(() => checkNetworkStatus(), 60000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Don't render anything if network status is null
  if (networkStatus === null) return null;

  // Content based on network status
  const isPoorConnectivity = networkStatus === 'POOR';
  const title = isPoorConnectivity ? 'Poor connectivity' : 'No connectivity';
  const message = isPoorConnectivity
    ? 'You are experiencing a weak internet\nconnection.'
    : 'You are currently not connected to the internet.\nPlease check your connection.';
  const iconSvg = isPoorConnectivity ? networkPoorSvg : networkErrorSvg;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          width: width - 40, // 20px margin on each side
          top: 60, // Position from top - increased from 40 to 60
        },
      ]}>
      <View style={styles.content}>
        <SvgXml xml={iconSvg} width={24} height={24} />

        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 1000,
    backgroundColor: '#ECECEC',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 8,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 19.2, // 120% of font size
    color: '#252525',
  },
  message: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 16.8, // 120% of font size
    color: '#767676',
    flexWrap: 'wrap',
    width: '100%',
  },
});

export default NetworkStatus;
