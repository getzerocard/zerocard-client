import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { router } from 'expo-router';
import { SquircleView } from 'react-native-figma-squircle';
import * as Haptics from 'expo-haptics';
import { Button } from '../../ui/Button';
import { useBasenameResolver } from '../../../common/hooks/useBasenameResolver';
import * as Clipboard from 'expo-clipboard';
import { isValidAddress, isBasenameWithSuffix } from '../../../common/utils/basenameResolver';

// Import SVG icons as strings
const usdcIconSvg = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.50041 16.4288C12.7978 16.4288 16.2546 12.8942 16.2546 8.50001C16.2546 4.10586 12.7978 0.571198 8.50041 0.571198C4.20303 0.571198 0.746216 4.10586 0.746216 8.50001C0.746216 12.8942 4.20303 16.4288 8.50041 16.4288Z" fill="#2775CA"/>
<path d="M10.6328 9.75514C10.6328 8.59912 9.95434 8.20268 8.59736 8.03697C7.62808 7.90455 7.43423 7.64053 7.43423 7.17828C7.43423 6.71603 7.75758 6.41869 8.4035 6.41869C8.98507 6.41869 9.30842 6.61691 9.4697 7.11247C9.50227 7.21158 9.5992 7.27739 9.69613 7.27739H10.2133C10.3428 7.27739 10.4398 7.17828 10.4398 7.04586V7.01256C10.3103 6.28549 9.72869 5.72413 8.98584 5.65832V4.86544C8.98584 4.73303 8.88892 4.63392 8.72763 4.60141H8.24299C8.1135 4.60141 8.01657 4.70052 7.98478 4.86544V5.62502C7.0155 5.75743 6.40137 6.4179 6.40137 7.24408C6.40137 8.3343 7.04729 8.76404 8.40428 8.92896C9.30919 9.09388 9.59997 9.2921 9.59997 9.82095C9.59997 10.3498 9.14791 10.7129 8.53377 10.7129C7.69399 10.7129 7.40321 10.3498 7.30628 9.85425C7.27372 9.72184 7.17679 9.65603 7.07986 9.65603H6.53087C6.40137 9.65603 6.30444 9.75514 6.30444 9.88755V9.92085C6.43394 10.747 6.95037 11.3417 8.01657 11.5066V12.2995C8.01657 12.4319 8.1135 12.531 8.27478 12.5635H8.75942C8.88892 12.5635 8.98584 12.4644 9.01764 12.2995V11.5066C9.98613 11.3409 10.6328 10.6471 10.6328 9.75514Z" fill="white"/>
<path d="M6.85257 13.224C4.33245 12.2987 3.03983 9.42451 3.97731 6.88095C4.46195 5.49341 5.52815 4.4365 6.85257 3.94094C6.98206 3.87514 7.04642 3.77603 7.04642 3.61031V3.14806C7.04642 3.01565 6.98206 2.91654 6.85257 2.88403C6.82 2.88403 6.75564 2.88403 6.72307 2.91733C3.65396 3.90844 1.97363 7.24488 2.9429 10.3839C3.52447 12.2337 4.91402 13.6545 6.72307 14.2492C6.85257 14.315 6.98129 14.2492 7.01385 14.1168C7.04642 14.0835 7.04642 14.051 7.04642 13.9844V13.5221C7.04642 13.4222 6.94949 13.2906 6.85257 13.224ZM10.2768 2.91654C10.1473 2.85073 10.0186 2.91654 9.98603 3.04895C9.95347 3.08225 9.95347 3.11476 9.95347 3.18136V3.64361C9.95347 3.77602 10.0504 3.90764 10.1473 3.97425C12.6674 4.89954 13.9601 7.77374 13.0226 10.3173C12.5379 11.7048 11.4717 12.7618 10.1473 13.2573C10.0178 13.3231 9.95347 13.4222 9.95347 13.5879V14.0502C9.95347 14.1826 10.0178 14.2817 10.1473 14.3142C10.1799 14.3142 10.2442 14.3142 10.2768 14.2809C13.3459 13.2898 15.0263 9.95337 14.057 6.81435C13.4754 4.93205 12.0541 3.5112 10.2768 2.91654Z" fill="white"/>
</svg>
`;

const closeIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.0002 22.75C6.07024 22.75 1.25024 17.93 1.25024 12C1.25024 6.07 6.07024 1.25 12.0002 1.25C17.9302 1.25 22.7502 6.07 22.7502 12C22.7502 17.93 17.9302 22.75 12.0002 22.75ZM12.0002 2.75C6.90024 2.75 2.75024 6.9 2.75024 12C2.75024 17.1 6.90024 21.25 12.0002 21.25C17.1002 21.25 21.2502 17.1 21.2502 12C21.2502 6.9 17.1002 2.75 12.0002 2.75Z" fill="#A4A4A4"/>
<path d="M9.16962 15.58C8.97962 15.58 8.78962 15.51 8.63962 15.36C8.34962 15.07 8.34962 14.59 8.63962 14.3L14.2996 8.63999C14.5896 8.34999 15.0696 8.34999 15.3596 8.63999C15.6496 8.92999 15.6496 9.40998 15.3596 9.69998L9.69962 15.36C9.55962 15.51 9.35962 15.58 9.16962 15.58Z" fill="#A4A4A4"/>
<path d="M14.8296 15.58C14.6396 15.58 14.4496 15.51 14.2996 15.36L8.63962 9.69998C8.34962 9.40998 8.34962 8.92999 8.63962 8.63999C8.92962 8.34999 9.40962 8.34999 9.69962 8.63999L15.3596 14.3C15.6496 14.59 15.6496 15.07 15.3596 15.36C15.2096 15.51 15.0196 15.58 14.8296 15.58Z" fill="#A4A4A4"/>
</svg>
`;

const padlockSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.3333 6V4.66667C11.3333 2.82667 9.84 1.33333 8 1.33333C6.16 1.33333 4.66667 2.82667 4.66667 4.66667V6C3.53333 6 2.66667 6.86667 2.66667 8V12.6667C2.66667 13.7333 3.53333 14.6667 4.66667 14.6667H11.3333C12.4667 14.6667 13.3333 13.7333 13.3333 12.6667V8C13.3333 6.86667 12.4667 6 11.3333 6ZM6 4.66667C6 3.57333 6.89333 2.66667 8 2.66667C9.10667 2.66667 10 3.57333 10 4.66667V6H6V4.66667Z" fill="black"/></svg>`;

type AddressStatus = 'idle' | 'checking' | 'found' | 'not_found' | 'direct_address';

// Helper function to format the amount with commas for display
const formatDisplayAmount = (value: string): string => {
  if (!value) return '';

  const parts = value.split('.');
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

  // Add commas to the integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return formattedInteger + decimalPart;
};

const WithdrawForm = () => {
  const [addressInput, setAddressInput] = useState('');
  const [amountInput, setAmountInput] = useState(''); // Stores the raw numeric value
  const [isAmountError, setIsAmountError] = useState(false); // State for amount error

  // Use the basename resolver hook
  const {
    status: addressStatus,
    resolvedAddress,
    checkInput: checkBasename,
    reset: resetBasenameResolver,
  } = useBasenameResolver({ debounceMs: 500 });

  // When resolution fails, trigger error haptic and log the failure
  useEffect(() => {
    if (addressStatus === 'not_found') {
      // Error feedback for not found
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.log('Basename resolution failed:', { basename: addressInput, resolvedAddress });
    } else if (addressStatus === 'found') {
      // Success feedback for found
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log('Basename resolved successfully:', { basename: addressInput, resolvedAddress });
    }
  }, [addressStatus, addressInput, resolvedAddress]);

  const availableWithdrawalAmount = 20; // Hardcoded for now

  const handleAddressChange = (text: string) => {
    setAddressInput(text);
    // Only trigger check when text is a valid wallet address or full basename
    if (isValidAddress(text) || isBasenameWithSuffix(text)) {
      checkBasename(text);
    } else {
      resetBasenameResolver();
    }
  };

  // Updated handler for amount input
  const handleAmountChange = (text: string) => {
    let cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts[1];
    }

    setAmountInput(cleaned);

    // Check if amount exceeds available balance
    const numericAmount = parseFloat(cleaned);
    if (!isNaN(numericAmount) && numericAmount > availableWithdrawalAmount) {
      // Trigger haptic feedback every time the invalid condition is met
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsAmountError(true);
    } else {
      setIsAmountError(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      handleAddressChange(text);
      console.log('Paste pressed', text);
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
    }
  };

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tab)/home');
    }
  };

  const truncateAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.substring(0, 6)}..${address.substring(address.length - 4)}`;
  };

  const renderAddressStatus = () => {
    switch (addressStatus) {
      case 'checking':
        return (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color="#D9D9D9" />
            <Text style={styles.checkingText}>Checking</Text>
          </View>
        );
      case 'found':
        return (
          <View style={styles.statusContainerSpaced}>
            <Text style={styles.foundText}>Address found</Text>
            <Text style={styles.resolvedAddressText}>{truncateAddress(resolvedAddress)}</Text>
          </View>
        );
      case 'not_found':
        return (
           <View style={styles.statusContainer}>
             <Text style={styles.notFoundText}>No address found</Text>
           </View>
        );
      default:
        return null; // Don't show anything for idle or direct_address
    }
  };

  // --- Navigation Handler ---
  const handleProceedToConfirmation = () => {
    // Determine the address to use (either resolved or direct)
    const finalAddress = resolvedAddress || '';

    // Basic validation
    if (!finalAddress) {
      alert('Please enter a valid address or basename.'); // Or show inline error
      return;
    }
    const numericAmount = parseFloat(amountInput);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Please enter a valid withdrawal amount.');
      return;
    }
    if (isAmountError) {
        alert('Withdrawal amount cannot exceed available balance.');
        return;
    }

    // Navigate to confirmation screen
    router.push({
      pathname: '/withdraw-funds/confirm-withdrawal',
      params: { 
        amount: amountInput, // Send raw amount
        address: finalAddress 
      },
    });
  };
  // --- ---

  return (
    <View style={styles.outerContainer}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Withdraw funds</Text>
        <TouchableOpacity onPress={handleClose}>
          <SvgXml xml={closeIconSvg} width={24} height={24} />
        </TouchableOpacity>
      </View>

      {/* Input Fields Container */}
      <View style={styles.inputFieldsContainer}>
        {/* Address Input Field */}
        <View style={styles.addressFieldContainer}>
          <SquircleView
            style={styles.textFieldContainer as ViewStyle}
            squircleParams={{
              cornerRadius: 16,
              cornerSmoothing: 1,
              fillColor: '#333333',
            }}
          >
            <TextInput
              placeholder="Address or basename"
              placeholderTextColor="#9A9A9A"
              style={styles.input}
              value={addressInput}
              onChangeText={handleAddressChange}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.innerButton} onPress={handlePaste}>
              <Text style={styles.innerButtonText}>Paste</Text>
            </TouchableOpacity>
          </SquircleView>
          {renderAddressStatus()}
        </View>

        {/* Amount Input Field */}
        <View style={[styles.inputWrapper, isAmountError && styles.inputWrapperError]}>
          <SquircleView
            style={styles.textFieldContainer as ViewStyle}
            squircleParams={{
               cornerRadius: 16,
               cornerSmoothing: 1,
               fillColor: '#333333',
            }}
          >
            <TouchableOpacity style={styles.innerButton}>
               <SvgXml xml={usdcIconSvg} width={16} height={16} />
               <Text style={styles.innerButtonText}>USDC</Text>
            </TouchableOpacity>
            <TextInput
              placeholder="Enter amount"
              placeholderTextColor="#9A9A9A"
              style={styles.input}
              keyboardType="decimal-pad"
              value={formatDisplayAmount(amountInput)}
              onChangeText={handleAmountChange}
            />
          </SquircleView>
        </View>

        {/* Available Amount Row */}
        <View style={styles.availableAmountRow}>
          <Text style={styles.availableAmountText}>Amount you can withdraw</Text>
          <Text style={styles.availableAmountText}>{availableWithdrawalAmount} USDC</Text> 
        </View>
      </View>
      
      {/* Withdraw Button - Integrated here */}
       <Button
            title="Withdraw" // Title is overridden by children, but good for accessibility
            variant="primary" // Assuming primary style from Button.tsx
            onPress={handleProceedToConfirmation} // Navigate on press
            style={styles.withdrawButton} // Apply specific styles
            disabled={isAmountError || !amountInput || (addressStatus !== 'found' && addressStatus !== 'direct_address')} // Example disable logic
       >
            {/* Custom content for the button with padlock */}
            <View style={styles.buttonContent}>
                <SvgXml xml={padlockSvg} width={16} height={16} />
                <Text style={styles.withdrawButtonText}>Withdraw</Text>
            </View>
       </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 32,
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 29,
    color: '#FFFFFF',
  },
  inputFieldsContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
  },
  addressFieldContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  textFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    backgroundColor: 'transparent',
  },
  innerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
    backgroundColor: '#525252',
    borderRadius: 1000,
    elevation: 1,
  },
  innerButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',
    color: '#EDEDED',
  },
  availableAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  availableAmountText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#919191',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 5,
    width: '100%',
  },
  statusContainerSpaced: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 10,
    width: '100%',
  },
  checkingText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#9D9D9D',
  },
  foundText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#69FF4E',
  },
  resolvedAddressText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 17,
    color: '#9D9D9D',
    textAlign: 'right',
  },
  notFoundText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#FF4E57',
  },
  inputWrapper: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  inputWrapperError: {
    borderColor: '#FF4E57',
  },
  withdrawButton: {
    width: '100%',
    height: 49,
    marginTop: 'auto',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  buttonContent: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  withdrawButtonText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',
    color: '#000000',
  },
});

export default WithdrawForm; 