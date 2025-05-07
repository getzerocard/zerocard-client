import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Button } from '../../Button';
import * as Haptics from 'expo-haptics';
import { LoadingSpinner } from '../../feedback/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';

type ValidationStatus = 'idle' | 'checking' | 'error' | 'success';

interface AndroidUsernameModalProps {
  visible: boolean;
  onClose: () => void;
  onSetUsername: (username: string) => void;
  initialUsername?: string;
}

const AndroidUsernameModal: React.FC<AndroidUsernameModalProps> = ({
  visible,
  onClose,
  onSetUsername,
  initialUsername = '',
}) => {
  const [username, setUsername] = useState(initialUsername);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle');
  const { height } = Dimensions.get('window');

  // Animation values
  const translateY = useSharedValue(height);
  const opacity = useSharedValue(0);

  // Handle animation when visibility changes
  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
      });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withSpring(height, {
        damping: 15,
        stiffness: 100,
      });
    }
  }, [visible, height]);

  // Animated styles
  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const modalStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // Simulate username validation
  useEffect(() => {
    if (username.trim().length > 0) {
      setValidationStatus('checking');

      // Simulate an API call to check username availability
      const timeoutId = setTimeout(() => {
        // Randomly determine if the username is available
        const isAvailable = Math.random() > 0.3; // 70% chance of success

        if (isAvailable) {
          setValidationStatus('success');
          // Play success haptic feedback
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          setValidationStatus('error');
          // Play error haptic feedback
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    } else {
      setValidationStatus('idle');
    }
  }, [username]);

  const handleSubmit = () => {
    if (username.trim().length > 0 && validationStatus === 'success') {
      onSetUsername(username);
      onClose();
    } else if (validationStatus === 'error') {
      // Trigger error haptic to indicate an invalid submission
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const renderValidationStatus = () => {
    if (validationStatus === 'idle' || username.trim().length === 0) {
      return null;
    }

    if (validationStatus === 'checking') {
      return (
        <View style={styles.validationContainer}>
          <LoadingSpinner size="small" color="#2D2D2D" />
          <Text style={styles.validationText}>Checking</Text>
        </View>
      );
    }

    if (validationStatus === 'error') {
      return (
        <View style={styles.validationContainer}>
          <Ionicons name="close-circle" size={16} color="#C9252D" />
          <Text style={styles.validationText}>Your unique name is taken 😏</Text>
        </View>
      );
    }

    if (validationStatus === 'success') {
      return (
        <View style={styles.validationContainer}>
          <Ionicons name="checkmark-circle" size={16} color="#33CD00" />
          <Text style={styles.validationText}>Your display name is available 🫡</Text>
        </View>
      );
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Backdrop */}
          <Animated.View style={[styles.backdrop, backdropStyle]} />

          {/* Modal Content */}
          <Animated.View style={[styles.modalAnimatedContainer, modalStyle]}>
            <View style={styles.modalContainer}>
              <View style={styles.contentContainer}>
                <View style={styles.titleContainer}>
                  <Text style={styles.heyText}>Hey,</Text>
                  <Text style={[styles.nameText, username ? styles.filledNameText : null]}>
                    {username ? username : 'pick a name'}
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter a unique name"
                    placeholderTextColor="#787878"
                    value={username}
                    onChangeText={setUsername}
                  />
                  {renderValidationStatus()}
                </View>

                <View style={styles.buttonWrapper}>
                  <Button
                    title="Set username"
                    variant="primary"
                    onPress={handleSubmit}
                    style={styles.button}
                    disabled={validationStatus !== 'success'}
                  />
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalAnimatedContainer: {
    width: '92%',
    marginBottom: 40, // Increased from 84 to 120 to move modal down
  },
  modalContainer: {
    width: '100%',
    padding: 32,
    paddingBottom: 32,
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 30, // Re-added standard borderRadius
  },
  contentContainer: {
    width: '100%',
    gap: 20,
  },
  titleContainer: {
    alignSelf: 'flex-start',
  },
  heyText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 29,
    letterSpacing: -0.42,
    color: '#000000',
  },
  nameText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 29,
    letterSpacing: -0.42,
    color: '#D4D4D4',
  },
  filledNameText: {
    color: '#000000',
  },
  inputContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  textInput: {
    height: 51,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    fontFamily: 'SF Pro Text',
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 1,
    width: '100%',
  },
  validationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 5,
  },
  validationText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#787878',
  },
  buttonWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 44, // Creates 64px gap (20px from container gap + 44px)
  },
  button: {
    width: '100%',
    height: 49,
  },
});

export default AndroidUsernameModal;
