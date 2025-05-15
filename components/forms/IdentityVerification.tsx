import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { LoadingSpinner } from '../ui/feedback/LoadingSpinner';
import { router } from 'expo-router';
import { OtpInfoDialog } from '../ui/info/OtpInfoDialog';
import { useInitiateKycVerification } from '../../api/hooks/useInitiateKycVerification';
import { useOrderCardStore } from '../../store/orderCardStore';
import { useValidateKycOtp } from '../../api/hooks/useValidateKycOtp';
import { usePrivy } from '@privy-io/expo';
import { useUpdateUser } from '../../api/hooks/useUpdateUser';
import { useOrderCard } from '../../api/hooks/useOrderCard';
import { useUserContext } from '../../providers/UserProvider';

// Define the source of truth for identity types
const IDENTITY_TYPES = [
  { id: 'NIN', label: 'National Identity Number (NIN)' },
  { id: 'BVN', label: 'Bank Verification Number (BVN)' },
];

// Import close icon SVG
const closeIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.0002 22.75C6.07024 22.75 1.25024 17.93 1.25024 12C1.25024 6.07 6.07024 1.25 12.0002 1.25C17.9302 1.25 22.7502 6.07 22.7502 12C22.7502 17.93 17.9302 22.75 12.0002 22.75ZM12.0002 2.75C6.90024 2.75 2.75024 6.9 2.75024 12C2.75024 17.1 6.90024 21.25 12.0002 21.25C17.1002 21.25 21.2502 17.1 21.2502 12C21.2502 6.9 17.1002 2.75 12.0002 2.75Z" fill="#A4A4A4"/>
<path d="M9.16962 15.58C8.97962 15.58 8.78962 15.51 8.63962 15.36C8.34962 15.07 8.34962 14.59 8.63962 14.3L14.2996 8.63999C14.5896 8.34999 15.0696 8.34999 15.3596 8.63999C15.6496 8.92999 15.6496 9.40998 15.3596 9.69998L9.69962 15.36C9.55962 15.51 9.35962 15.58 9.16962 15.58Z" fill="#A4A4A4"/>
<path d="M14.8296 15.58C14.6396 15.58 14.4496 15.51 14.2996 15.36L8.63962 9.69998C8.34962 9.40998 8.34962 8.92999 8.63962 8.63999C8.92962 8.34999 9.40962 8.34999 9.69962 8.63999L15.3596 14.3C15.6496 14.59 15.6496 15.07 15.3596 15.36C15.2096 15.51 15.0196 15.58 14.8296 15.58Z" fill="#A4A4A4"/>
</svg>`;

// Import arrow down SVG
const arrowDownSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.22222 5.55556L8 11.3333L13.7778 5.55556" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Import padlock icon SVG
const padlockIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24" id="padlock">
  <path d="M17,9V7c0-2.8-2.2-5-5-5S7,4.2,7,7v2c-1.7,0-3,1.3-3,3v7c0,1.7,1.3,3,3,3h10c1.7,0,3-1.3,3-3v-7C20,10.3,18.7,9,17,9z M9,7
	c0-1.7,1.3-3,3-3s3,1.3,3,3v2H9V7z"></path>
</svg>`;

// Import back arrow icon SVG
const backArrowSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15 19.9201L8.47997 13.4001C7.70997 12.6301 7.70997 11.3701 8.47997 10.6001L15 4.08008" stroke="#A4A4A4" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Import retry icon SVG
const retryIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM6.6 11.23C6.77 10.04 7.3 8.97 8.13 8.13C10.13 6.14 13.28 6.03 15.42 7.77V6.82C15.42 6.41 15.76 6.07 16.17 6.07C16.58 6.07 16.92 6.41 16.92 6.82V9.49C16.92 9.9 16.58 10.24 16.17 10.24H13.5C13.09 10.24 12.75 9.9 12.75 9.49C12.75 9.08 13.09 8.74 13.5 8.74H14.25C12.7 7.66 10.56 7.81 9.18 9.19C8.58 9.79 8.2 10.57 8.07 11.44C8.02 11.81 7.7 12.08 7.33 12.08C7.29 12.08 7.26 12.08 7.22 12.07C6.83 12.02 6.54 11.64 6.6 11.23ZM15.87 15.87C14.8 16.94 13.4 17.47 12 17.47C10.78 17.47 9.57 17.04 8.57 16.23V17.17C8.57 17.58 8.23 17.92 7.82 17.92C7.41 17.92 7.07 17.58 7.07 17.17V14.5C7.07 14.09 7.41 13.75 7.82 13.75H10.49C10.9 13.75 11.24 14.09 11.24 14.5C11.24 14.91 10.9 15.25 10.49 15.25H9.74C11.29 16.33 13.43 16.18 14.81 14.8C15.41 14.2 15.79 13.42 15.92 12.55C15.98 12.14 16.35 11.85 16.77 11.91C17.18 11.97 17.46 12.35 17.41 12.76C17.23 13.97 16.7 15.04 15.87 15.87Z" fill="#FF4E57"/>
</svg>`;

// Import tick circle icon SVG
const tickCircleIconSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 1.33334C4.32 1.33334 1.33333 4.32001 1.33333 8.00001C1.33333 11.68 4.32 14.6667 8 14.6667C11.68 14.6667 14.6667 11.68 14.6667 8.00001C14.6667 4.32001 11.68 1.33334 8 1.33334ZM11.4267 6.41334L7.66667 10.1733C7.54 10.3 7.37333 10.3667 7.2 10.3667C7.02667 10.3667 6.86 10.3 6.73333 10.1733L4.57333 8.01334C4.32 7.76001 4.32 7.36001 4.57333 7.10668C4.82667 6.85334 5.22667 6.85334 5.48 7.10668L7.2 8.82668L10.52 5.50668C10.7733 5.25334 11.1733 5.25334 11.4267 5.50668C11.68 5.76001 11.68 6.16001 11.4267 6.41334Z" fill="#38E100"/>
</svg>`;

// Import small tick circle icon SVG
const smallTickCircleIconSvg = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7 1.16667C3.78 1.16667 1.16667 3.78001 1.16667 7.00001C1.16667 10.22 3.78 12.8333 7 12.8333C10.22 12.8333 12.8333 10.22 12.8333 7.00001C12.8333 3.78001 10.22 1.16667 7 1.16667ZM9.99833 5.61167L6.70833 8.90167C6.5975 9.0125 6.45167 9.07084 6.3 9.07084C6.14833 9.07084 6.0025 9.0125 5.89167 8.90167L4.00167 7.01167C3.78 6.79001 3.78 6.44001 4.00167 6.21834C4.22333 5.99667 4.57333 5.99667 4.795 6.21834L6.3 7.72334L9.205 4.81834C9.42667 4.59667 9.77667 4.59667 9.99833 4.81834C10.22 5.04001 10.22 5.39001 9.99833 5.61167Z" fill="#767676"/>
</svg>`;

interface IdentityVerificationProps {
  onClose: () => void;
}

const IdentityVerification: React.FC<Omit<IdentityVerificationProps, 'onVerify'>> = ({ onClose }) => {
  const [selectedIdentity, setSelectedIdentity] = useState<string>('');
  const [identityNumber, setIdentityNumber] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [identityInputError, setIdentityInputError] = useState<string | null>(null);
  const [identityVerified, setIdentityVerified] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');
  const [otpInputError, setOtpInputError] = useState<string | null>(null);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [verifiedFullName, setVerifiedFullName] = useState<string>('');
  const [isBiometricLoading, setIsBiometricLoading] = useState<boolean>(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  const dropdownAnimation = useRef(new Animated.Value(0)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const otpShakeAnimation = useRef(new Animated.Value(0)).current;

  const initiateKycMutation = useInitiateKycVerification();
  const validateOtpMutation = useValidateKycOtp();
  const { kycDetails, setKycVerificationDetails, shippingAddress } = useOrderCardStore();
  const { user: privyUser } = usePrivy();
  const updateUserMutation = useUpdateUser();
  const orderCardMutation = useOrderCard();
  const { refetchCreateUserMutation } = useUserContext();

  // Helper function to get display label from ID
  const getDisplayLabel = (id: string): string => {
    return IDENTITY_TYPES.find(type => type.id === id)?.label || 'Select identity';
  };

  // API call for initiating KYC when identity number is complete
  useEffect(() => {
    if (selectedIdentity && identityNumber.length === 11 && !identityVerified) {
      // Determine the short identity type for the API call
      const apiIdentityType = selectedIdentity === 'NIN' ? 'NIN' : 'BVN';
      
      // Log the data being sent
      // console.log('Initiating KYC verification with:', { identityType: apiIdentityType, number: identityNumber }); 
      initiateKycMutation.mutate(
        { identityType: apiIdentityType, number: identityNumber },
        {
          onSuccess: (data) => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setKycVerificationDetails({ 
              verificationId: data.verificationId,
              verificationNumber: data.verificationNumber 
            });
            setIdentityVerified(true);
            setIdentityInputError(null);
          },
          onError: (error) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            // Always show "Service unavailable" on any initiation error
            setIdentityInputError("Service unavailable");
            
          shakeField(shakeAnimation);
            setIdentityVerified(false);
          },
        }
      );
    }
  }, [selectedIdentity, identityNumber, identityVerified]);

  // API call for validating OTP when OTP code is complete
  useEffect(() => {
    if (identityVerified && otpCode.length === 6 && kycDetails?.verificationId && kycDetails?.verificationNumber) {
      // Clear previous OTP error
      if (otpInputError) setOtpInputError(null);
      if (validateOtpMutation.isError) validateOtpMutation.reset();

      // Determine the short identity type for the API call
      const apiIdentityType = selectedIdentity === 'NIN' ? 'NIN' : 'BVN';

      validateOtpMutation.mutate(
        {
          identityType: apiIdentityType, // Use the short form
          otp: otpCode,
          storedVerificationId: kycDetails.verificationId, 
          storedIdentityNumber: kycDetails.verificationNumber, 
        },
        {
          onSuccess: (data) => {
            if (data.verified && data.status === 'SUCCESS') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setOtpVerified(true);
              setVerifiedFullName(`${data.firstName} ${data.lastName}`);
              setOtpInputError(null);
            } else {
              // Handle cases where API indicates success: true, but data indicates verification failed logically.
              // The hook handles success: false cases by throwing, landing in onError.
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              // Use a specific client-side message for this edge case.
              setOtpInputError('OTP validation failed. Please check the code and try again.');
          shakeField(otpShakeAnimation);
              setOtpVerified(false);
            }
          },
          onError: (error) => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            // Log the actual error object
            console.log('Validate OTP Error:', error); 
            // Handle specific known error messages from backend
            if (error.message === "OTP has expired.") {
              setOtpInputError(error.message);
            } else if (error.message === "Record not found") {
              setOtpInputError(error.message);
        } else {
              // Default to "Service unavailable" for all other errors (including 5xx or unknown)
              setOtpInputError("Service unavailable");
            }

            shakeField(otpShakeAnimation);
            setOtpVerified(false);
          },
        }
      );
    }
  }, [identityVerified, otpCode, kycDetails]);

  // Reset verification state when identity type changes
  useEffect(() => {
    if (selectedIdentity) {
      resetVerificationState();
      initiateKycMutation.reset();
    }
  }, [selectedIdentity]);

  const resetVerificationState = () => {
    setIdentityNumber('');
    setIdentityInputError(null);
    setIdentityVerified(false);
    setOtpCode('');
    setOtpInputError(null);
    setOtpVerified(false);
    setVerifiedFullName('');
    setIsBiometricLoading(false);
    setIsSubmittingOrder(false);
    initiateKycMutation.reset();
    validateOtpMutation.reset();
  };

  const shakeField = (animation: Animated.Value) => {
    animation.setValue(0);
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleDropdown = () => {
    if (showDropdown) {
      // Hide dropdown
      Animated.timing(dropdownAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.elastic(1)),
      }).start(() => setShowDropdown(false));
    } else {
      // Show dropdown
      setShowDropdown(true);
      Animated.spring(dropdownAnimation, {
        toValue: 1,
        speed: 12,
        bounciness: 8,
        useNativeDriver: true,
      }).start();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const selectIdentityType = (typeId: string) => {
    setSelectedIdentity(typeId);
    toggleDropdown();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Clear the specific selection error if it was showing
    if (identityInputError === 'Select identity type first') {
      setIdentityInputError(null);
    }
  };

  const handleIdentityNumberChange = (text: string) => {
    // Prevent input if no identity type is selected
    if (!selectedIdentity) {
      setIdentityInputError('Select identity type first');
      shakeField(shakeAnimation); // Shake the number field to draw attention
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return; // Stop processing
    }
    
    if (identityInputError) {
      setIdentityInputError(null);
    }
    if (initiateKycMutation.isError) {
      initiateKycMutation.reset();
    }
    // Only accept numbers
    const numericText = text.replace(/[^0-9]/g, '');

    // Check if trying to enter more than 11 digits
    if (numericText.length > 11) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIdentityNumber(numericText);
  };

  const handleOtpChange = (text: string) => {
    if (otpInputError) {
      setOtpInputError(null);
    }
    if (validateOtpMutation.isError) {
        validateOtpMutation.reset();
    }
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length > 6) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setOtpCode(numericText);
  };

  const retryIdentityVerification = () => {
    setIdentityInputError(null);
    setIdentityNumber('');
    initiateKycMutation.reset();
  };

  const retryOtpVerification = () => {
    setOtpInputError(null);
    setOtpCode('');
    validateOtpMutation.reset();
  };

  // TEMPORARY CHANGE FOR TESTING: Enable button even if OTP is not verified
  // Original: const isFormValid = selectedIdentity && otpVerified;
  const isFormValid = selectedIdentity && otpVerified;

  const handleVerify = async () => {
    // Check existing conditions plus new submitting state
    if (!isFormValid || isBiometricLoading || isSubmittingOrder || initiateKycMutation.isPending || validateOtpMutation.isPending) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // Start biometric check first
    setIsBiometricLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let biometricSuccess = false;

    try {
      // Skip biometric auth on Android
      if (Platform.OS === 'android') {
        biometricSuccess = true; // Assume success on Android for now
      } else {
      // Only run biometric auth on iOS
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          'Biometric Error',
          'Biometric authentication is not available or not enrolled on this device.'
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setIsBiometricLoading(false);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Verify your identity to order card', // Updated prompt
        fallbackLabel: 'Enter Passcode',
      });

      if (result.success) {
          biometricSuccess = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert(
          'Authentication Failed',
          result.error === 'user_cancel'
            ? 'Authentication cancelled.'
            : 'Biometric authentication failed.'
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert('Error', 'An unexpected error occurred during biometric authentication.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsBiometricLoading(false); // Biometric check finished
    }

    // Proceed only if biometric check was successful
    if (!biometricSuccess) {
      return;
    }

    // Start the concurrent API calls
    setIsSubmittingOrder(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      // 1. Prepare UpdateUser payload
      // Add a check for shippingAddress existence
      if (!shippingAddress) {
        throw new Error("Shipping address not found in store.");
      }
       // Construct payload, assuming country is 'USA' if not present
      const updateUserPayload = {
          shippingAddress: {
            street: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country, // Use the country from the store
          }
        };


      // 2. Prepare OrderCard variables
      const orderCardVariables = {
        symbol: 'USDC',
        chainType: 'ethereum',
        // blockchainNetwork is handled by the hook using env var
      };
      //TODO: this is where update update user address and order card
      // 3. Execute mutations sequentially: update user first, then order card
      console.log('Initiating user update...');
      await updateUserMutation.mutateAsync({ payload: updateUserPayload });
      
      console.log('User update successful. Initiating card order...');
      await orderCardMutation.mutateAsync(orderCardVariables);

      console.log('User update and card order successful!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      console.log('[IdentityVerification] Triggering refetchCreateUserMutation after card order.');
      refetchCreateUserMutation();

      // Navigate on success of BOTH calls
      router.push('/(app)/card-ordering/order-confirmation');

    } catch (error: any) {
      console.error('Error during card order process:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Provide more specific feedback if possible
      let errorMessage = 'Failed to complete card order.';
      if (error.message) {
          // Check for specific errors from either mutation if needed
          errorMessage += ` Error: ${error.message}`;
      }
      // Consider showing specific errors based on which mutation failed
      // e.g., check updateUserMutation.isError, orderCardMutation.isError after Promise.all settles
      Alert.alert('Order Error', errorMessage);
      
      // Reset mutation states if necessary (optional, depends on hook implementation)
      // updateUserMutation.reset();
      // orderCardMutation.reset();
    } finally {
      setIsSubmittingOrder(false); // API calls finished
    }
  };

  // Format phone number for display
  const formatPhoneNumber = (number: string) => {
    if (!number || number.length < 11) return '';
    const lastThreeDigits = number.substring(number.length - 3);
    return `xxx xxx xxx ${lastThreeDigits}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      style={[styles.container, { backgroundColor: '#1F1F1F' }]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled">
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={onClose} activeOpacity={0.7}>
          <SvgXml xml={backArrowSvg} width={24} height={24} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <View style={styles.titleContent}>
            <Text style={styles.title}>Can we verify your{'\n'}identity? 🔎</Text>
            <Text style={styles.description}>Trust me our eyes are shut 🫣</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <SvgXml xml={closeIconSvg} width={24} height={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          {/* Identity Type Selector */}
          <TouchableOpacity
            style={styles.textField}
            onPress={otpVerified ? undefined : toggleDropdown}
            activeOpacity={otpVerified ? 1 : 0.8}>
            <View style={styles.textFieldContent}>
              <Text style={[styles.placeholderText, selectedIdentity ? styles.selectedText : null]}>
                {getDisplayLabel(selectedIdentity)}
              </Text>
              {!otpVerified && <SvgXml xml={arrowDownSvg} width={16} height={16} />}
            </View>
          </TouchableOpacity>

          {/* Identity Number Input - Wrapped for tap handling when disabled */}
          <TouchableOpacity
            activeOpacity={1} // No visual feedback on tap
            disabled={!!selectedIdentity} // Disable wrapper when input should be editable
            onPress={() => {
              if (!selectedIdentity) {
                setIdentityInputError('Select identity type first');
                shakeField(shakeAnimation);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              }
            }}>
          <Animated.View
            style={[styles.textField, { transform: [{ translateX: shakeAnimation }] }]}>
            <View style={styles.textFieldContent}>
                {identityVerified && !initiateKycMutation.isPending ? (
                <Text style={styles.selectedText}>{formatPhoneNumber(identityNumber)}</Text>
              ) : (
                <TextInput
                    style={[styles.input, (identityInputError || initiateKycMutation.isError) && styles.errorText]}
                  placeholder="Enter identity number"
                  placeholderTextColor="#9A9A9A"
                  value={identityNumber}
                  onChangeText={handleIdentityNumberChange}
                  keyboardType="numeric"
                  maxLength={11}
                    editable={!!selectedIdentity && !initiateKycMutation.isPending && !identityVerified}
                />
              )}
                {initiateKycMutation.isPending && <LoadingSpinner size="small" color="#ffffff" />}
                {identityVerified && !initiateKycMutation.isPending && <SvgXml xml={tickCircleIconSvg} width={16} height={16} />}
            </View>
          </Animated.View>
          </TouchableOpacity>

          {/* OTP Input Field - Only show after identity is verified and before OTP is verified */}
          {identityVerified && !otpVerified && (
            <Animated.View
              style={[styles.textField, { transform: [{ translateX: otpShakeAnimation }] }]}>
              <View style={styles.textFieldContent}>
                <TextInput
                  style={[
                    styles.input,
                    (otpInputError || validateOtpMutation.isError) && styles.errorText,
                    otpCode && styles.selectedText,
                  ]}
                  placeholder="Enter OTP"
                  placeholderTextColor="#9A9A9A"
                  value={otpCode}
                  onChangeText={handleOtpChange}
                  keyboardType="numeric"
                  maxLength={6}
                  editable={!validateOtpMutation.isPending}
                />
                {validateOtpMutation.isPending && <LoadingSpinner size="small" color="#ffffff" />}
              </View>
            </Animated.View>
          )}

          {/* Error or Info Messages */}
          {identityInputError ? (
            <TouchableOpacity style={styles.errorContainer} onPress={retryIdentityVerification}>
              <SvgXml xml={retryIconSvg} width={14} height={14} />
              <Text style={styles.errorText}>{identityInputError}</Text>
            </TouchableOpacity>
          ) : otpInputError ? (
            <TouchableOpacity style={styles.errorContainer} onPress={retryOtpVerification}>
              <SvgXml xml={retryIconSvg} width={14} height={14} />
              <Text style={styles.errorText}>{otpInputError}</Text>
            </TouchableOpacity>
          ) : identityVerified && !otpVerified ? (
            <>
              <View style={styles.infoContainer}>
                <SvgXml xml={smallTickCircleIconSvg} width={14} height={14} />
                <Text style={styles.infoText}>Code sent to {formatPhoneNumber(identityNumber)}</Text>
              </View>
              
              {/* OTP Info Dialog for NIN - Condition uses the state ID */}
              {selectedIdentity === 'NIN' && (
                <View style={{ marginTop: 16, width: '100%' }}>
                  <OtpInfoDialog />
                </View>
              )}
            </>
          ) : otpVerified ? (
            <View style={styles.infoContainer}>
              <Text style={styles.nameText}>{verifiedFullName}</Text>
            </View>
          ) : (
            <View style={styles.securityContainer}>
              <SvgXml xml={padlockIconSvg} width={14} height={14} color="#767676" />
              <Text style={styles.securityText}>Protected by end-to-end encryption</Text>
            </View>
          )}
        </View>

        {/* Dropdown Menu Modal */}
        <Modal
          visible={showDropdown}
          transparent={true}
          animationType="none"
          onRequestClose={toggleDropdown}>
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdownOverlay}
              activeOpacity={1}
              onPress={toggleDropdown}>
              <Animated.View
                style={[
                  styles.dropdownMenu,
                  {
                    opacity: dropdownAnimation,
                    transform: [
                      {
                        translateY: dropdownAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-10, 0],
                        }),
                      },
                    ],
                  },
                ]}>
                {IDENTITY_TYPES.map((identityType) => (
                <TouchableOpacity
                    key={identityType.id}
                  style={styles.dropdownItem}
                    onPress={() => selectIdentityType(identityType.id)}>
                    <Text style={styles.dropdownItemText}>{identityType.label}</Text>
                </TouchableOpacity>
                ))}
              </Animated.View>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Verify Button - Update disabled condition and loading state */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (!isFormValid || initiateKycMutation.isPending || validateOtpMutation.isPending || isBiometricLoading || isSubmittingOrder) && // Add isSubmittingOrder
                styles.verifyButtonDisabled,
            ]}
            onPress={handleVerify}
            activeOpacity={0.8}
            disabled={!isFormValid || initiateKycMutation.isPending || validateOtpMutation.isPending || isBiometricLoading || isSubmittingOrder} // Add isSubmittingOrder
            >
            {/* Show spinner if either biometric or API calls are loading */}
            {isBiometricLoading || isSubmittingOrder ? ( 
              <LoadingSpinner size="small" color="#000000" />
            ) : (
              <>
                <SvgXml
                  xml={padlockIconSvg}
                  width={16}
                  height={16}
                  color="#000000"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Create card</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F1F',
  },
  scrollContainer: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 0,
    gap: 34,
    marginTop: 120,
    marginHorizontal: 24,
  },
  titleContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 0,
    gap: 12,
    flex: 1,
  },
  title: {
    fontFamily: 'SF Pro Text',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 29,
    color: '#FFFFFF',
    alignSelf: 'stretch',
  },
  description: {
    fontFamily: 'SF Pro Text',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: '#A4A4A4',
    alignSelf: 'stretch',
  },
  closeButton: {
    width: 24,
    height: 24,
  },
  formContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 0,
    gap: 8,
    marginTop: 40,
    marginHorizontal: 24,
  },
  textField: {
    boxSizing: 'border-box',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
    width: '100%',
    height: 51,
    backgroundColor: '#3C3C3C',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 1,
    borderRadius: 16,
    marginBottom: 8,
  },
  textFieldContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    gap: 2,
    flex: 1,
    justifyContent: 'space-between',
  },
  placeholderText: {
    fontFamily: 'SF Pro Text',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: '#9A9A9A',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#FF4E57',
  },
  input: {
    flex: 1,
    fontFamily: 'SF Pro Text',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: '#FFFFFF',
    paddingVertical: Platform.select({ android: 0 }),
  },
  dropdownContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  dropdownOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 310, // This value positions the dropdown right below the select field
    width: 354,
    marginHorizontal: 24,
    backgroundColor: '#3C3C3C',
    borderRadius: 16,
    padding: 16,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 12,
  },
  dropdownItemText: {
    fontFamily: 'SF Pro Text',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: '#FAFAFA',
  },
  buttonContainer: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: 'center',
    marginHorizontal: 24,
  },
  verifyButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    width: '100%',
    height: 49,
    backgroundColor: '#40FF00',
    borderRadius: 100000,
  },
  verifyButtonDisabled: {
    backgroundColor: '#3C3C3C',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontFamily: 'SF Pro Text',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',
    color: '#000000',
  },
  securityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    gap: 4,
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  securityText: {
    fontFamily: 'SF Pro Text',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 14,
    color: '#767676',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    gap: 4,
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    gap: 4,
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  infoText: {
    fontFamily: 'SF Pro Text',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 14,
    color: '#767676',
  },
  nameText: {
    fontFamily: 'SF Pro Text',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#767676',
  },
});

export default IdentityVerification;
