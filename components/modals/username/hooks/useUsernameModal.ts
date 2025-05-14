import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Platform, Keyboard } from 'react-native';
import { useApiService } from '../../../../api/api';
import { useUserContext } from '../../../../providers/UserProvider';
import AndroidUsernameModal from '../AndroidUsernameModal';
import UsernameModal from '../UsernameModal';
import { usePathname } from 'expo-router';
import { useCheckUsername } from './useCheckUsername';
import { useQueryClient } from '@tanstack/react-query';

export type CommonModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (username: string) => Promise<void>;
  currentUsername: string;
  onUsernameInputChange: (text: string) => void;
  usernameStatus: ReturnType<typeof useCheckUsername>['status'];
  isLoadingCheck: boolean;
  checkError: string | null;
  submissionError: string | null;
  isLoadingSubmit: boolean;
};

export const useUsernameModal = () => {
  console.log('[useUsernameModal] Hook initialized/re-rendered.');
  const { isNewUser, updateIsNewUserState, isReady } = useUserContext();
  const [isVisible, setIsVisible] = useState(false);
  const [usernameInputValue, setUsernameInputValue] = useState('');
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const apiService = useApiService();
  const queryClient = useQueryClient();
  const pathname = usePathname();

  const { status: usernameStatus, error: checkUsernameError } = useCheckUsername(usernameInputValue);
  
  const isLoadingCheck = usernameStatus === 'checking';

  useEffect(() => {
    if (!isReady) {
      console.log('[useUsernameModal] UserProvider not ready, delaying visibility check.');
      if (isVisible) setIsVisible(false);
      return;
    }
    const shouldShowModal = isNewUser && pathname !== '/post-auth';
    console.log(`[useUsernameModal] Visibility effect. isReady: ${isReady}, isNewUser: ${isNewUser}, pathname: ${pathname}, shouldShowModal: ${shouldShowModal}, current isVisible: ${isVisible}`);
    if (shouldShowModal) {
      if (!isVisible) {
        console.log('[useUsernameModal] Setting modal to visible.');
        setIsVisible(true);
      }
    } else {
      if (isVisible) {
        console.log('[useUsernameModal] Setting modal to hidden.');
        setIsVisible(false);
      }
    }
  }, [isNewUser, pathname, isVisible, isReady]);

  const handleClose = useCallback(() => {
    console.log('[useUsernameModal] handleClose called.');
    setIsVisible(false);
    setUsernameInputValue('');
    setSubmissionError(null);
    Keyboard.dismiss();
  }, []);

  const handleSubmitUsername = useCallback(async (currentUsernameInput: string) => {
    const usernameToSubmit = currentUsernameInput.trim();
    console.log('[useUsernameModal] handleSubmitUsername called with:', usernameToSubmit);
    setSubmissionError(null);

    if (!usernameToSubmit) {
      setSubmissionError('Username cannot be empty.');
      console.log('[useUsernameModal] Submission attempt with empty username.');
      return;
    }
    
    if (usernameStatus !== 'available') {
      setSubmissionError('Username is not available or invalid. Please choose another.');
      console.log("[useUsernameModal] Submission attempt with non-available username. Status: ", usernameStatus);
      return;
    }

    setIsLoadingSubmit(true);
    try {
      await apiService.patch('/users/me', { username: usernameToSubmit });
      console.log('[useUsernameModal] Username updated successfully via API for:', usernameToSubmit);
      
      await queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      console.log("[useUsernameModal] Invalidated ['user', 'me'] query.");

      if (updateIsNewUserState) {
        updateIsNewUserState(false, 'useUsernameModal.handleSubmitUsername');
        console.log('[useUsernameModal] Called updateIsNewUserState(false).');
      } else {
        console.warn('[useUsernameModal] updateIsNewUserState is not available on UserContext.');
      }
      
      handleClose();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('[useUsernameModal] Username update failed:', errorMessage, error);
      setSubmissionError(errorMessage);
    } finally {
      setIsLoadingSubmit(false);
    }
  }, [apiService, queryClient, updateIsNewUserState, handleClose, usernameStatus]);

  const modalProps: CommonModalProps = useMemo(() => ({
    visible: isVisible,
    onClose: handleClose,
    onSubmit: handleSubmitUsername,
    currentUsername: usernameInputValue,
    onUsernameInputChange: setUsernameInputValue,
    usernameStatus,
    isLoadingCheck,
    checkError: checkUsernameError,
    submissionError,
    isLoadingSubmit,
  }), [
    isVisible,
    handleClose,
    handleSubmitUsername,
    usernameInputValue,
    setUsernameInputValue,
    usernameStatus,
    isLoadingCheck,
    checkUsernameError,
    submissionError,
    isLoadingSubmit
  ]);

  const ModalComponent = useMemo(() => Platform.select({
    ios: UsernameModal as React.FC<CommonModalProps>,
    android: AndroidUsernameModal as React.FC<CommonModalProps>,
    default: UsernameModal as React.FC<CommonModalProps>,
  }), []);

  return useMemo(() => ({
    isVisible,
    usernameInputValue,
    setUsernameInputValue,
    submissionError,
    setSubmissionError,
    isLoadingSubmit,
    usernameStatus,
    isLoadingCheck,
    checkError: checkUsernameError,
    ModalComponent,
    modalProps,
    handleClose,
    handleSubmit: handleSubmitUsername,
  }), [
    isVisible,
    usernameInputValue,
    setUsernameInputValue,
    submissionError,
    setSubmissionError,
    isLoadingSubmit,
    usernameStatus,
    isLoadingCheck,
    checkUsernameError,
    ModalComponent,
    modalProps,
    handleClose,
    handleSubmitUsername
  ]);
};