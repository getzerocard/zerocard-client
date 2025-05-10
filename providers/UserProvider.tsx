import React, { useEffect, useState, createContext, useContext } from 'react';
import { usePrivy, useHeadlessDelegatedActions } from '@privy-io/expo';
import { useUserWallets } from '../common/hooks/useUserWalletAddress';
import { useDelegationStore } from '../store/delegationStore';
import { useCreateUser } from '../api/hooks/createUser';
import { useRouter } from 'expo-router';

const UserContext = createContext<{ isReady: boolean, isLoadingUserCreation: boolean }>({ isReady: false, isLoadingUserCreation: false });

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { isReady: privyReady, user, logout } = usePrivy();
  const { delegateWallet } = useHeadlessDelegatedActions();
  const wallets = useUserWallets();
  const { isDelegated, setDelegated, reset: resetDelegation, setActiveSession } = useDelegationStore();
  const [isReadyState, setIsReady] = useState(false);
  const [isLoadingUserCreation, setIsLoadingUserCreation] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // Track if layout is mounted
  const [hasNavigated, setHasNavigated] = useState(false); // Track if navigation has occurred
  const createUser = useCreateUser();
  const router = useRouter();

  // Mark the layout as mounted after the first render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle fresh login: always run createUser mutation on login
  useEffect(() => {
    if (privyReady && user) {
      // Reset state when user logs in again for a fresh login
      setDelegated(false); // Ensure delegation starts fresh
      setIsLoadingUserCreation(true); // Set loading state during user creation
      createUser.mutate(undefined, {
        onSuccess: (data) => {
          // After successful createUser mutation, check if new user or returning
          setIsLoadingUserCreation(false); // Clear loading state
          setIsReady(true); // Mark the app as ready once createUser is done
          // Set session flag to indicate active session only after successful login
          setActiveSession(true);
          // Delay navigation to ensure layout is fully mounted
          if (isMounted && !hasNavigated) {
            setTimeout(() => {
              if (data.isNewUser) {
                router.replace('/(app)/post-auth');
              } else {
                router.replace('/(tab)/home');
              }
              setHasNavigated(true); // Mark navigation as done
            }, 100); // Small delay to ensure navigation stack is ready
          }
        },
        onError: async (err) => {
          console.error('❌ Create user failed:', err);

          // Logout user and reset state if backend fails
          await logout();
          resetDelegation();
          setIsLoadingUserCreation(false);
          setIsReady(false); // Prevent children from rendering
          // Clear session flag on logout due to error
          setActiveSession(false);
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

    if (privyReady && !user) {
      resetDelegation(); // Reset delegation when user logs out
      setIsLoadingUserCreation(false); // Ensure loading state is cleared
      setIsReady(true); // Ensure the app is ready after logout (so the UI doesn't block)
      // Clear session flag when user logs out
      setActiveSession(false);
      setHasNavigated(false); // Reset navigation tracking
    }
  }, [privyReady, user, isMounted, hasNavigated]);

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
  }, [privyReady, user, wallets, isDelegated]);

  // Handle logout, reset session and state
  const handleLogout = async () => {
    try {
      // Call Privy logout method (if available)
      await logout();
      resetDelegation(); // Reset delegation and any other state you want to clear
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
    if (privyReady && user && !isReadyState && !isLoadingUserCreation) {
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
  }, [privyReady, user, isReadyState, isLoadingUserCreation, isMounted, hasNavigated]);

  return (
    <UserContext.Provider value={{ isReady: isReadyState, isLoadingUserCreation }}>
      {isReadyState ? children : null}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext); 