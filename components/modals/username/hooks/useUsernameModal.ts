import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Platform } from 'react-native';
import { useApiService } from '../../../../api/api';
import { useUsernameStore } from '../../../../store/usernameStore';
import { useUserContext } from '../../../../providers/UserProvider';
import AndroidUsernameModal from '../AndroidUsernameModal';
import UsernameModal from '../UsernameModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CommonModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (username: string) => Promise<void>;
  initialUsername?: string;
};

export const useUsernameModal = () => {
  const { isNewUser, refetchCreateUserMutation } = useUserContext();
  const [isVisible, setIsVisible] = useState(isNewUser);
  
  console.log('[useUsernameModal] Hook initialized/re-rendered. isNewUser from context:', isNewUser, 'Initial isVisible state set to:', isNewUser);

  const apiService = useApiService();
  const { setStatus, setError } = useUsernameStore();

  useEffect(() => {
    console.log('[useUsernameModal] Visibility effect. isNewUser:', isNewUser, 'current isVisible:', isVisible);
    if (isNewUser !== isVisible) {
        console.log(`[useUsernameModal] Syncing isVisible to match isNewUser: ${isNewUser}`);
        setIsVisible(isNewUser);
    }
  }, [isNewUser]);

  const handleClose = useCallback(() => {
    console.log('[useUsernameModal] handleClose called - user explicitly closed or action completed');
    setIsVisible(false);
  }, [setIsVisible]);

  const handleSetUsername = useCallback(async (usernameInput: string | undefined) => {
    const currentUsername = typeof usernameInput === 'string' ? usernameInput.trim() : '';
    const logContext = {
      username: currentUsername,
      originalInput: usernameInput,
      timestamp: new Date().toISOString(),
    };

    console.log('[useUsernameModal] Attempting to set username:', logContext);

    if (currentUsername === "") {
      console.warn('[useUsernameModal] Username is effectively empty. Aborting API call.', logContext);
      setError('Username cannot be empty.');
      return;
    }

    try {
      // Optimistically update local state
      setStatus('available');
      setError(null);

      // Start AsyncStorage update in parallel with API call
      const storagePromise = AsyncStorage.setItem('username', currentUsername)
        .then(() => {
          console.log('[useUsernameModal] Username saved to AsyncStorage', { ...logContext });
        })
        .catch((storageError) => {
          console.error('[useUsernameModal] Failed to save username to AsyncStorage:', { ...logContext, storageError });
        });

      // Start API call
      const apiPromise = apiService.patch('/users/me', { username: currentUsername })
        .then(() => {
          console.log('[useUsernameModal] Username updated successfully via API', { ...logContext });
        });

      // Start user creation refetch in parallel if available
      const refetchPromise = refetchCreateUserMutation
        ? Promise.resolve(refetchCreateUserMutation()).catch((error: Error) => {
            console.error('[useUsernameModal] Error in refetchCreateUserMutation:', error);
          })
        : Promise.resolve();

      // Wait for all operations to complete
      await Promise.all([storagePromise, apiPromise, refetchPromise]);

      // Close modal after all operations complete successfully
      handleClose();

    } catch (error) {
      const errorDetails = {
        ...logContext,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        errorObject: error,
      };

      console.error('[useUsernameModal] Username update failed:', errorDetails);
      
      // Revert optimistic update
      setStatus('taken');
      setError(errorDetails.error);
      
      // Clean up AsyncStorage in case of API failure
      try {
        await AsyncStorage.removeItem('username');
      } catch (cleanupError) {
        console.error('[useUsernameModal] Failed to clean up AsyncStorage after error:', cleanupError);
      }
      
      throw error instanceof Error ? error : new Error('An unexpected error occurred during username update');
    }
  }, [apiService, setStatus, setError, refetchCreateUserMutation, handleClose]);

  const modalProps: CommonModalProps = useMemo(() => ({
    visible: isVisible,
    onClose: handleClose,
    onSubmit: handleSetUsername,
    initialUsername: '',
  }), [isVisible, handleClose, handleSetUsername]);

  const ModalComponent = useMemo(() => Platform.select({
    ios: UsernameModal as React.FC<CommonModalProps>,
    android: AndroidUsernameModal as React.FC<CommonModalProps>,
    default: UsernameModal as React.FC<CommonModalProps>,
  }), []);

  return useMemo(() => ({
    isVisible,
    handleClose,
    handleSetUsername,
    ModalComponent,
    modalProps,
  }), [isVisible, handleClose, handleSetUsername, ModalComponent, modalProps]);
};