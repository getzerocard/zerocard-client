import React, { useEffect, useState, createContext, useContext } from 'react';
import { usePrivy, useHeadlessDelegatedActions } from '@privy-io/expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserWallets } from '../common/hooks/useUserWalletAddress';
import { useDelegationStore } from '../store/delegationStore';
import { useCreateUser } from '../api/hooks/createUser';
import { useRouter } from 'expo-router';

const UserContext = createContext<{
  isReady: boolean,
  isLoadingUserCreation: boolean,
  isNewUser: boolean,
  refetchCreateUserMutation: () => void
}>({
  isReady: false,
  isLoadingUserCreation: false,
  isNewUser: false,
  refetchCreateUserMutation: () => {}
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { isReady: privyReady, user, logout } = usePrivy();
  const { delegateWallet } = useHeadlessDelegatedActions();
  const wallets = useUserWallets();
  const { isDelegated, setDelegated, reset: resetDelegation, setActiveSession } = useDelegationStore();
  const [isReadyState, setIsReady] = useState(false);
  const [isLoadingUserCreation, setIsLoadingUserCreation] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // Track if layout is mounted
  const [hasNavigated, setHasNavigated] = useState(false); // Track if navigation has occurred
  const [refreshUserTrigger, setRefreshUserTrigger] = useState(0); // New state for triggering refetch
  const [isNewUserState, setIsNewUserState] = useState(false); // Decoupled state for isNewUser
  const { mutate: actualCreateUserMutate, ...createUserRest } = useCreateUser();
  const router = useRouter();

  // Refs to track processed user and trigger
  const lastProcessedUserIdRef = React.useRef<string | null>(null);
  const lastProcessedRefreshTriggerRef = React.useRef<number | null>(null);

  // Wrapper for setIsNewUserState with logging
  const updateIsNewUserState = React.useCallback((newValue: boolean, caller: string) => {
    console.log(`[UserProvider] updateIsNewUserState called by ${caller}. Attempting to set to: ${newValue}. Current value before set: ${isNewUserState}`);
    setIsNewUserState(newValue);
  }, [isNewUserState]);

  // Mark the layout as mounted after the first render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const refetchCreateUserMutation = React.useCallback(() => { // Memoize if passing down often, good practice
    setHasNavigated(false); // Reset navigation lock to allow navigation after refetch
    setRefreshUserTrigger(prev => prev + 1);
    console.log('[UserProvider] Triggering refetch of createUser mutation.');
  }, []);

  // Handle fresh login: always run createUser mutation on login
  useEffect(() => {
    if (privyReady && user) {
      const currentUserId = user.id; // Assuming user.id exists and is the unique identifier

      if (
        currentUserId !== lastProcessedUserIdRef.current ||
        refreshUserTrigger !== lastProcessedRefreshTriggerRef.current
      ) {
        console.log(`[UserProvider] New user session (ID: ${currentUserId}) or refresh trigger (Val: ${refreshUserTrigger}) detected. Current refs - UserID: ${lastProcessedUserIdRef.current}, Trigger: ${lastProcessedRefreshTriggerRef.current}. Initiating user creation.`);
        // Reset state when user logs in again for a fresh login or trigger occurs
        setDelegated(false); // Ensure delegation starts fresh
        setIsLoadingUserCreation(true); // Set loading state during user creation
        
        actualCreateUserMutate(undefined, {
          onSuccess: async (userData: any) => {
            console.log('[UserProvider] createUser/fetchUser onSuccess. Raw userData (typecast to any):', userData);

            // Determine if username is missing from the profile
            let usernameValue = userData?.username;
            let usernameSource = 'API';

            // If username is not in API response, try to get it from AsyncStorage as a fallback
            if (!usernameValue || String(usernameValue).trim() === '') {
              try {
                const storedUsername = await AsyncStorage.getItem('username');
                if (storedUsername && String(storedUsername).trim() !== '') {
                  usernameValue = storedUsername;
                  usernameSource = 'AsyncStorage';
                  console.log(`[UserProvider] Used username from AsyncStorage fallback: ${usernameValue}`);
                }
              } catch (e) {
                console.error('[UserProvider] Error reading username from AsyncStorage during fallback:', e);
              }
            }
            
            const usernameIsMissing = !usernameValue || String(usernameValue).trim() === '';
            console.log(`[UserProvider] Checked for username. Value found: '${usernameValue}' (from ${usernameSource}), Determined missing: ${usernameIsMissing}`);

            updateIsNewUserState(usernameIsMissing, 'createUser.onSuccess (username check)');
            
            setIsLoadingUserCreation(false);
            setIsReady(true);
            setActiveSession(true);

            if (user) {
                lastProcessedUserIdRef.current = user.id;
            }
            lastProcessedRefreshTriggerRef.current = refreshUserTrigger;

            if (isMounted && !hasNavigated) {
              setTimeout(() => {
                if (usernameIsMissing) {
                  console.log('[UserProvider] Username is missing, navigating to /post-auth');
                  router.replace('/(app)/post-auth');
                } else {
                  console.log('[UserProvider] Username exists, navigating to /home');
                  router.replace('/(tab)/home');
                }
                setHasNavigated(true);
              }, 100);
            }
          },
          onError: async (err) => {
            console.error('❌ Create/Fetch user failed:', err);

            // Logout user and reset state if backend fails
            await logout();
            resetDelegation();
            updateIsNewUserState(false, 'createUser.onError'); // Use wrapper
            setIsLoadingUserCreation(false);
            setIsReady(false); // Prevent children from rendering
            // Clear session flag on logout due to error
            setActiveSession(false);

            // Update refs to mark this user/trigger as processed (even on error to prevent loops)
            lastProcessedUserIdRef.current = currentUserId;
            lastProcessedRefreshTriggerRef.current = refreshUserTrigger;

            // Delay navigation to ensure layout is fully mounted
            if (isMounted && !hasNavigated) {
              setTimeout(() => {
                router.replace('/'); // Back to login
                setHasNavigated(true); // Mark navigation as done
              }, 100);
            }
          },
        });
      }
    }

    if (privyReady && !user) {
      resetDelegation(); // Reset delegation when user logs out
      setIsLoadingUserCreation(false); // Ensure loading state is cleared
      setIsReady(true); // Ensure the app is ready after logout (so the UI doesn't block)
      // Clear session flag when user logs out
      setActiveSession(false);
      setHasNavigated(false); // Reset navigation tracking
      updateIsNewUserState(false, 'privyReady && !user (logout)'); // Use wrapper

      // Reset processed markers on logout
      lastProcessedUserIdRef.current = null;
      lastProcessedRefreshTriggerRef.current = null;
    }
  }, [
    privyReady, 
    user?.id, // Changed from user
    isMounted, 
    hasNavigated, 
    refreshUserTrigger, 
    actualCreateUserMutate, 
    logout, 
    resetDelegation, 
    setActiveSession, 
    setDelegated, 
    router, 
    updateIsNewUserState, 
    setIsLoadingUserCreation, 
    setIsReady
  ]);

  // Delegate wallets after user logs in
  useEffect(() => {
    const delegate = async () => {
      try {
        const promises: Promise<any>[] = [];

        if (wallets.ethereum) {
          promises.push(delegateWallet({ address: wallets.ethereum, chainType: 'ethereum' }));
        }
        if (wallets.solana) {
          promises.push(delegateWallet({ address: wallets.solana, chainType: 'solana' }));
        }

        await Promise.all(promises);
        setDelegated(true);
        console.log('✅ Wallet(s) delegated');
      } catch (err) {
        console.error('❌ Wallet delegation failed:', err);
      }
    };

    if (privyReady && user && !isDelegated) {
      delegate(); // Run delegation once user is logged in
    }
  }, [privyReady, user?.id, wallets, isDelegated, delegateWallet, setDelegated]); // Changed from user

  // Handle logout, reset session and state
  const handleLogout = async () => {
    try {
      // Call Privy logout method (if available)
      await logout();
      resetDelegation(); // Reset delegation and any other state you want to clear
      updateIsNewUserState(false, 'handleLogout'); // Use wrapper
      setIsLoadingUserCreation(false); // Clear loading state
      setIsReady(false); // Reset isReady while the logout process is ongoing
      // Clear session flag on logout
      setActiveSession(false);
      if (isMounted && !hasNavigated) {
        setTimeout(() => {
          router.replace('/'); // Redirect to login screen
          setHasNavigated(true); // Mark navigation as done
        }, 100);
      }
    } catch (err) {
      console.error('❌ Logout failed:', err);
    }
  };

  // Check for existing session on app startup
  useEffect(() => {
    if (privyReady && user && !isReadyState && !isLoadingUserCreation && !createUserRest.isPending) {
      // If user is already logged in on app startup, set ready state
      setIsReady(true);
      setActiveSession(true);
      if (isMounted && !hasNavigated) {
        setTimeout(() => {
          router.replace('/(tab)/home');
          setHasNavigated(true); // Mark navigation as done
        }, 100); // Delay navigation to ensure stack is ready
      }
    }
  }, [privyReady, user?.id, isReadyState, isLoadingUserCreation, isMounted, hasNavigated, router, createUserRest.isPending, isNewUserState, setActiveSession]); // Changed from user

  console.log('[UserProvider] Context value being set. isNewUser from state:', isNewUserState);

  return (
    <UserContext.Provider value={{
      isReady: isReadyState,
      isLoadingUserCreation,
      isNewUser: isNewUserState,
      refetchCreateUserMutation
    }}>
      {isReadyState ? children : null}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);