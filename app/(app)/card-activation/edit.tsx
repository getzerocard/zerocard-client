import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { backIconSvg, cardActivateIconSvg, padlockIconSvg } from '../../../constants/icons'; // Import icons

export default function EditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    cardNumber: string;
    expDate: string;
    cvv: string;
  }>();

  // Initialize state for all three fields
  const [cardNumber, setCardNumber] = useState(params.cardNumber || '');
  const [expDate, setExpDate] = useState(params.expDate || '');
  const [cvv, setCvv] = useState(params.cvv || '');

  // Error states for each field
  const [cardNumberError, setCardNumberError] = useState('');
  const [expDateError, setExpDateError] = useState('');
  const [cvvError, setCvvError] = useState('');

  // Format card number (e.g., XXXX XXXX XXXX XXXX)
  const formatCardNumber = (text: string) => {
    // Remove any non-digits first
    const digitsOnly = text.replace(/\D/g, '');
    // Format as XXXX XXXX XXXX XXXX
    return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  // Format expiration date (MM/YY)
  const formatExpDate = (text: string) => {
    // Remove any non-digits first
    const digitsOnly = text.replace(/\D/g, '');

    // Format as MM/YY
    if (digitsOnly.length > 0) {
      let month = digitsOnly.substring(0, 2);
      const year = digitsOnly.substring(2, 4);

      // Validate month
      if (month.length === 2) {
        const monthNum = parseInt(month, 10);
        if (monthNum > 12) {
          month = '12';
        } else if (monthNum < 1) {
          month = '01';
        }
      }

      if (digitsOnly.length <= 2) {
        return month;
      } else {
        return `${month}/${year}`;
      }
    }
    return '';
  };

  // Format CVV (remove non-digits)
  const formatCvv = (text: string) => {
    return text.replace(/\D/g, '');
  };

  // Validate all fields
  const validateFields = () => {
    let isValid = true;

    // Validate card number
    const cardDigitsOnly = cardNumber.replace(/\D/g, '');
    if (cardDigitsOnly.length !== 16) {
      setCardNumberError('Card number must be 16 digits');
      isValid = false;
    } else {
      setCardNumberError('');
    }

    // Validate expiration date
    if (expDate.length < 5) {
      setExpDateError('Please enter a valid expiration date (MM/YY)');
      isValid = false;
    } else {
      const [month, year] = expDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
      const currentMonth = currentDate.getMonth() + 1; // 1-12

      const expMonth = parseInt(month, 10);
      const expYear = parseInt(year, 10);

      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        setExpDateError('Card has expired');
        isValid = false;
      } else {
        setExpDateError('');
      }
    }

    // Validate CVV
    const cvvDigitsOnly = cvv.replace(/\D/g, '');
    if (cvvDigitsOnly.length !== 3) {
      setCvvError('CVV must be 3 digits');
      isValid = false;
    } else {
      setCvvError('');
    }

    return isValid;
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
    setCardNumberError('');
  };

  const handleExpDateChange = (text: string) => {
    const formatted = formatExpDate(text);
    setExpDate(formatted);
    setExpDateError('');
  };

  const handleCvvChange = (text: string) => {
    const formatted = formatCvv(text);
    setCvv(formatted);
    setCvvError('');
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (validateFields()) {
      // All fields are valid, navigate back to confirmation
      router.push({
        pathname: '/(app)/card-activation/confirmation',
        params: {
          cardNumber,
          expDate,
          cvv,
        },
      });
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1F1F1F" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <Stack.Screen options={{ headerShown: false }} />
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <SvgXml xml={backIconSvg} width={24} height={24} />
            </TouchableOpacity>
            <View style={styles.emptySpace} />
          </View>

          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.mainContent}>
              {/* Header Section */}
              <View style={styles.headerContainer}>
                <SvgXml xml={cardActivateIconSvg} width={32} height={32} />
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitleText}>
                    Enter your card details{'\n'}to activate it
                  </Text>
                  <Text style={styles.headerSubtitleText}>Trust me our eyes are shut 🫣</Text>
                </View>
              </View>

              {/* Input Fields */}
              <View style={styles.inputsContainer}>
                {/* Card Number Input */}
                <TextInput
                  style={[styles.input, cardNumberError ? styles.inputError : null]}
                  value={cardNumber}
                  onChangeText={handleCardNumberChange}
                  placeholder="XXXX XXXX XXXX XXXX"
                  keyboardType="number-pad"
                  maxLength={19} // 16 digits + 3 spaces
                  placeholderTextColor="#9A9A9A"
                />
                {cardNumberError ? <Text style={styles.errorText}>{cardNumberError}</Text> : null}

                {/* Expiration Date Input */}
                <TextInput
                  style={[styles.input, expDateError ? styles.inputError : null]}
                  value={expDate}
                  onChangeText={handleExpDateChange}
                  placeholder="MM/YY"
                  keyboardType="number-pad"
                  maxLength={5}
                  placeholderTextColor="#9A9A9A"
                />
                {expDateError ? <Text style={styles.errorText}>{expDateError}</Text> : null}

                {/* CVV Input */}
                <TextInput
                  style={[styles.input, cvvError ? styles.inputError : null]}
                  value={cvv}
                  onChangeText={handleCvvChange}
                  placeholder="CVV"
                  keyboardType="number-pad"
                  maxLength={3}
                  placeholderTextColor="#9A9A9A"
                />
                {cvvError ? <Text style={styles.errorText}>{cvvError}</Text> : null}

                {/* Security Message */}
                <View style={styles.securityContainer}>
                  <SvgXml xml={padlockIconSvg} width={14} height={14} />
                  <Text style={styles.securityText}>Protected by end-to-end encryption</Text>
                </View>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#1F1F1F',
  },
  container: {
    flex: 1,
    backgroundColor: '#1F1F1F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptySpace: {
    width: 40,
  },
  scrollContainer: {
    // Style for the ScrollView itself
    flex: 1,
  },
  contentContainer: {
    // Style for the content inside ScrollView
    flexGrow: 1, // Allow content to grow and push button down
    justifyContent: 'space-between', // Push button to bottom
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36, // Keep bottom padding for the button
  },
  mainContent: {
    // Wrapper for the content above the button
    gap: 48,
  },
  headerContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  headerTitleText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 29,
    color: '#FFFFFF',
  },
  headerSubtitleText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#A4A4A4',
  },
  inputsContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  input: {
    height: 51,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#3C3C3C',
    borderRadius: 16,
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 4,
    fontFamily: 'SF Pro Text',
  },
  securityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  securityText: {
    fontFamily: 'SF Pro Text',
    fontSize: 12,
    fontWeight: '500',
    color: '#767676',
  },
  buttonContainer: {
    // No absolute positioning needed, padding handled by contentContainerStyle
    // padding: 24, // Removed padding from here
    // paddingBottom: 36, // Removed padding from here
  },
  saveButton: {
    backgroundColor: '#40FF00',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'SF Pro Text',
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
  },
});
