import React, { useEffect, useState, createContext, useContext } from 'react';
import { usePrivy, useHeadlessDelegatedActions } from '@privy-io/expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserWallets } from '../common/hooks/useUserWalletAddress';
import { useDelegationStore } from '../store/delegationStore';
import { useCreateUser } from '../api/hooks/createUser';
import { useRouter, Slot, usePathname } from 'expo-router';
import { UserApiResponse } from '../api/hooks/useGetUser';

export type UserCardStage = 'not_ordered' | 'pending_activation' | 'activated' | 'unknown';

const UserContext = createContext<{
  isReady: boolean,
  isLoadingUserCreation: boolean,
  isNewUser: boolean,
  refetchCreateUserMutation: () => void,
  updateIsNewUserState: (newValue: boolean, caller: string) => void,
  cardStage: UserCardStage;
}>({
  isReady: false,
  isLoadingUserCreation: false,
  isNewUser: false,
  refetchCreateUserMutation: () => {},
  updateIsNewUserState: () => {},
  cardStage: 'unknown',
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
  const [cardStage, setCardStage] = useState<UserCardStage>('unknown'); // New state for card stage
  const { mutate: actualCreateUserMutate, ...createUserRest } = useCreateUser();
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname

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

  console.log(`[UserProvider] Rendering. cardStage state: ${cardStage}, isNewUserState: ${isNewUserState}`);

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
            console.log('[UserProvider] actualCreateUserMutate.onSuccess: Received userData:', JSON.stringify(userData, null, 2));
            console.log('[UserProvider] createUser/fetchUser onSuccess. Raw API userData:', JSON.stringify(userData, null, 2));

            const apiIsNewUser = userData?.isNewUser === true;
            const usernameFromApi = userData?.username;
            const apiCardOrderStatus = userData?.cardOrderStatus as string | undefined; // Assuming this field exists

            // Determine UserCardStage
            let derivedCardStage: UserCardStage = 'unknown';
            if (apiCardOrderStatus) {
              const upperStatus = apiCardOrderStatus.toUpperCase();
              if (upperStatus === 'NOT_ORDERED') {
                derivedCardStage = 'not_ordered';
              } else if (
                upperStatus === 'ORDERED' ||
                upperStatus === 'SHIPPED' ||
                upperStatus === 'DELIVERED' ||
                upperStatus === 'PROCESSED' ||
                upperStatus === 'IN_DELIVERY' ||
                upperStatus === 'IN_TRANSIT'
              ) {
                derivedCardStage = 'pending_activation';
              } else if (upperStatus === 'ACTIVATED') {
                derivedCardStage = 'activated';
              } else {
                console.warn(`[UserProvider] Unknown cardOrderStatus from API: ${apiCardOrderStatus}`);
                derivedCardStage = 'unknown'; // Default for unrecognized statuses
              }
            } else {
              // If cardOrderStatus is null/undefined, assume not ordered.
              derivedCardStage = 'not_ordered'; 
              console.log('[UserProvider] cardOrderStatus missing in API response, defaulting to not_ordered.');
            }
            console.log(`[UserProvider] About to setCardStage. Current state: ${cardStage}, Derived from userData: ${derivedCardStage}`);
            setCardStage(derivedCardStage);
            console.log(`[UserProvider] Derived cardStage: ${derivedCardStage} from API status: ${apiCardOrderStatus}`);

            // Determine if username is missing (check API response first, then AsyncStorage as fallback)
            let usernameValue = usernameFromApi;
            let usernameSource = 'API (createUser response)';

            if (!usernameValue || String(usernameValue).trim() === '') {
              console.log('[UserProvider] Username not in API response from createUser. Attempting AsyncStorage fallback for full profile.');
              try {
                const storedUserProfileString = await AsyncStorage.getItem('user_profile'); // Use the main profile storage key
                if (storedUserProfileString) {
                  console.log('[UserProvider] Found stored user profile string:', storedUserProfileString);
                  const storedUserProfile: UserApiResponse = JSON.parse(storedUserProfileString);
                  if (storedUserProfile && storedUserProfile.data && storedUserProfile.data.username && String(storedUserProfile.data.username).trim() !== '') {
                    usernameValue = storedUserProfile.data.username;
                    usernameSource = 'AsyncStorage (user_profile key)';
                    console.log(`[UserProvider] Used username from full profile in AsyncStorage: ${usernameValue}`);
                  } else {
                    console.log('[UserProvider] Parsed stored user profile does not contain a valid username.');
                  }
                } else {
                  console.log('[UserProvider] No user_profile found in AsyncStorage for fallback.');
                }
              } catch (e) {
                console.error('[UserProvider] Error reading/parsing user_profile from AsyncStorage during fallback:', e);
              }
            }
            
            const finalUsernameIsMissing = !usernameValue || String(usernameValue).trim() === '';
            console.log(`[UserProvider] API isNewUser: ${apiIsNewUser}. Effective username after fallback: '${usernameValue}' (from ${usernameSource}). Final username missing: ${finalUsernameIsMissing}`);

            updateIsNewUserState(finalUsernameIsMissing, 'createUser.onSuccess (username check)'); // This drives modal visibility
            
            setIsLoadingUserCreation(false);
            setIsReady(true);
            setActiveSession(true);

            if (user) {
                lastProcessedUserIdRef.current = user.id;
            }
            lastProcessedRefreshTriggerRef.current = refreshUserTrigger;

            if (isMounted && !hasNavigated) {
              setTimeout(() => {
                const currentPath = pathname; // Use pathname from usePathname()
                console.log(`[UserProvider] Current path before navigation decision: ${currentPath}`);

                if (apiIsNewUser && finalUsernameIsMissing) {
                  // Scenario 1: API new user AND effective username is missing.
                  console.log('[UserProvider] Scenario 1: API new user AND username missing. Navigating to /post-auth.');
                  if (currentPath !== '/(app)/post-auth' && currentPath !== '/post-auth') { // Check both with and without group
                    router.replace('/(app)/post-auth');
                  }
                  setHasNavigated(true);
                } else if (!apiIsNewUser && finalUsernameIsMissing) {
                  // Scenario 2: API existing user BUT effective username is missing.
                  console.log('[UserProvider] Scenario 2: API existing user BUT username missing. Considering navigation to /home.');
                  // Check if currentPath is one of the card ordering flow paths (without group prefix if pathname provides it that way)
                  const isCardOrderingFlow = [
                    '/card-ordering', 
                    '/(app)/card-ordering',
                    '/shipping-address', 
                    '/(app)/shipping-address',
                    '/identity-verification', 
                    '/(app)/identity-verification',
                    '/order-confirmation', 
                    '/(app)/order-confirmation'
                  ].includes(currentPath);

                  if (!isCardOrderingFlow && currentPath !== '/(tab)/home' && currentPath !== '/home') {
                    router.replace('/(tab)/home');
                    console.log('[UserProvider] Scenario 2: Navigated to /home.');
                  } else {
                    console.log('[UserProvider] Scenario 2: Skipping navigation to /home, current path is:', currentPath);
                  }
                  setHasNavigated(true); // Mark navigation attempt as handled
                } else if (!finalUsernameIsMissing) {
                  // Scenario 3: Effective username is present.
                  console.log('[UserProvider] Scenario 3: Username exists. Considering navigation to /home.');
                  // Check if currentPath is one of the card ordering flow paths or other (app) routes
                  const isAppOrCardOrderingFlow = currentPath.startsWith('/(app)/') || 
                                                currentPath.startsWith('/app/') || // Fallback for potential normalization
                                                [
                                                  '/card-ordering', 
                                                  '/shipping-address', 
                                                  '/identity-verification', 
                                                  '/order-confirmation'
                                                  // Add other specific non-grouped /app/ paths here if necessary
                                                ].includes(currentPath);

                  if (!isAppOrCardOrderingFlow && currentPath !== '/(tab)/home' && currentPath !== '/home') {
                    router.replace('/(tab)/home');
                    console.log('[UserProvider] Scenario 3: Navigated to /home.');
                  } else {
                    console.log('[UserProvider] Scenario 3: Skipping navigation to /home, current path is:', currentPath);
                  }
                  setHasNavigated(true); // Mark navigation attempt as handled
                }
              }, 100);
            }
          },
          onError: async (err) => {
            console.error('❌ Create/Fetch user failed:', err);

            // Logout user and reset state if backend fails
            await logout();
            resetDelegation();
            updateIsNewUserState(false, 'createUser.onError'); // Use wrapper
            setCardStage('unknown'); // Reset card stage on error
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
      setCardStage('unknown'); // Reset card stage on logout
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
    setIsReady,
    setCardStage,
    pathname
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
      setCardStage('unknown'); // Reset card stage
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
      refetchCreateUserMutation,
      updateIsNewUserState,
      cardStage, // Provide cardStage in context
    }}>
      {isReadyState ? children : null}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);