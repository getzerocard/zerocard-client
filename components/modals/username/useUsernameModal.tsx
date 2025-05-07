import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

import UsernameModal from './UsernameModal';

// Storage key for checking if user has set username
const USERNAME_SET_KEY = 'username_set';

// Context interface
interface UsernameModalContextType {
  showUsernameModal: () => void;
  hideUsernameModal: () => void;
  setUsername: (username: string) => Promise<void>;
  hasSetUsername: boolean;
  isVisible: boolean;
}

// Create context with default values
const UsernameModalContext = createContext<UsernameModalContextType>({
  showUsernameModal: () => {},
  hideUsernameModal: () => {},
  setUsername: async () => {},
  hasSetUsername: false,
  isVisible: false,
});

// Define props for the provider component
interface UsernameModalProviderProps {
  children: React.ReactNode;
  initialUsername?: string;
}

// Get the screen dimensions
const { width, height } = Dimensions.get('window');

export const UsernameModalProvider: React.FC<UsernameModalProviderProps> = ({
  children,
  initialUsername = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasSetUsername, setHasSetUsername] = useState(false);

  // Check if user has already set a username on first load
  useEffect(() => {
    const checkUsernameSet = async () => {
      try {
        const usernameSet = await AsyncStorage.getItem(USERNAME_SET_KEY);

        if (usernameSet !== 'true') {
          // For new users, show the modal automatically
          // We can add a slight delay to allow the app to load first
          setTimeout(() => {
            setIsVisible(true);
          }, 1000);
        } else {
          setHasSetUsername(true);
        }
      } catch (error) {
        console.error('Error checking username status:', error);
      }
    };

    checkUsernameSet();
  }, []);

  // Function to show the username modal
  const showUsernameModal = () => {
    setIsVisible(true);
  };

  // Function to hide the username modal
  const hideUsernameModal = () => {
    setIsVisible(false);
  };

  // Function to set username and mark the user as no longer new
  const setUsername = async (username: string) => {
    try {
      // Save the username (this would typically connect to your backend)
      console.log(`Setting username to: ${username}`);

      // Mark that the user has set their username
      await AsyncStorage.getItem(USERNAME_SET_KEY);
      await AsyncStorage.setItem(USERNAME_SET_KEY, 'true');

      setHasSetUsername(true);
      hideUsernameModal();
    } catch (error) {
      console.error('Error setting username:', error);
    }
  };

  return (
    <UsernameModalContext.Provider
      value={{
        showUsernameModal,
        hideUsernameModal,
        setUsername,
        hasSetUsername,
        isVisible,
      }}>
      {children}

      <UsernameModal
        visible={isVisible}
        onClose={hideUsernameModal}
        onSetUsername={setUsername}
        initialUsername={initialUsername}
      />
    </UsernameModalContext.Provider>
  );
};

// Custom hook for using the username modal
export const useUsernameModal = () => {
  const context = useContext(UsernameModalContext);

  if (context === undefined) {
    throw new Error('useUsernameModal must be used within a UsernameModalProvider');
  }

  return context;
};

// Example usage in a component:
/*
import { useUsernameModal } from '../hooks/useUsernameModal';
import { Button } from '../components/Button';

const OnboardingScreen = () => {
  const { showUsernameModal, hasSetUsername } = useUsernameModal();
  
  return (
    <View>
      <Text>Welcome to the app!</Text>
      {hasSetUsername ? (
        <Text>You've already set your username!</Text>
      ) : (
        <Button 
          title="Set your username" 
          variant="primary" 
          onPress={showUsernameModal} 
        />
      )}
    </View>
  );
};
*/
