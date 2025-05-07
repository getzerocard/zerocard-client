import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import { ParamListBase } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { backIconSvg, cardEditIconSvg } from '../../../constants/icons'; // Import icons

export default function ConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    cardNumber?: string;
    expDate?: string;
    cvv?: string;
  }>();

  const cardNumber = params.cardNumber || '';
  const expDate = params.expDate || '';
  const cvv = params.cvv || '';

  const isDataComplete = cardNumber && expDate && cvv;

  const handleBack = () => {
    router.back();
  };

  const handleEditCard = (field: 'cardNumber' | 'expDate' | 'cvv') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/(app)/card-activation/edit',
      params: {
        field,
        cardNumber,
        expDate,
        cvv,
      },
    });
  };

  const handleSetPin = () => {
    if (isDataComplete) {
      router.push('/(app)/card-activation/set-pin');
    }
  };

  // Format card number for display (e.g., **** **** **** 1234)
  const formatCardNumber = (number: string) => {
    if (!number) return '';

    // For confirmation screen, show full card number in groups of 4
    const digitsOnly = number.replace(/\s/g, '');
    return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <SvgXml xml={backIconSvg} width={24} height={24} />
        </TouchableOpacity>
        <View style={styles.emptySpace} />
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.contentContainer}>
        {/* New Header Section based on CSS */}
        <View style={styles.confirmationHeaderContainer}>
          <SvgXml xml={cardEditIconSvg} width={32} height={32} />
          <View style={styles.confirmationTextContainer}>
            <Text style={styles.confirmationTitle}>Confirm your{'\n'}Zerocard details</Text>
            <Text style={styles.confirmationDescription}>
              Let's get started! Activate your Zerocard and enjoy exclusive rewards
            </Text>
          </View>
        </View>

        {/* Card Info Box */}
        <View style={styles.cardContainer}>
          {/* Card Number Section */}
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Card number</Text>
            <View style={styles.detailValueRow}>
              <Text style={styles.detailValue}>
                {cardNumber ? formatCardNumber(cardNumber) : 'Not available'}
              </Text>
              <TouchableOpacity
                onPress={() => handleEditCard('cardNumber')}
                style={styles.editButton}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Expiration Date Section */}
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Exp date</Text>
            <View style={styles.detailValueRow}>
              <Text style={styles.detailValue}>{expDate || 'Not available'}</Text>
              <TouchableOpacity onPress={() => handleEditCard('expDate')} style={styles.editButton}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* CVV Section */}
          <View style={[styles.detailSection, styles.lastDetailSection]}>
            <Text style={styles.detailLabel}>CVV</Text>
            <View style={styles.detailValueRow}>
              <Text style={styles.detailValue}>{cvv || 'Not available'}</Text>
              <TouchableOpacity onPress={() => handleEditCard('cvv')} style={styles.editButton}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Removed old infoText as it's similar to the new header description */}
        {/* <Text style={styles.infoText}> */}
        {/*   Please verify your card information before setting up your PIN. */}
        {/* </Text> */}
      </ScrollView>

      {/* Bottom button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.setPinButton, !isDataComplete ? styles.disabledButton : {}]}
          onPress={handleSetPin}
          disabled={!isDataComplete}>
          <Text style={styles.setPinButtonText}>Set Card PIN</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F1F', // Updated background
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
    color: '#FFFFFF', // Updated text color
  },
  emptySpace: {
    width: 40, // Keep for spacing
  },
  scrollContent: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16, // Adjusted padding
    gap: 48, // Gap between header and card info based on CSS
  },
  confirmationHeaderContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10,
  },
  confirmationTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  confirmationTitle: {
    fontFamily: 'SF Pro Text', // Ensure this font is loaded
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 29, // 120% of 24px
    color: '#FFFFFF',
  },
  confirmationDescription: {
    fontFamily: 'SF Pro Text', // Ensure this font is loaded
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17, // 120% of 14px
    color: '#919191',
  },
  cardContainer: {
    backgroundColor: '#343434', // Updated background
    borderRadius: 20,
    padding: 18, // Padding from CSS
    gap: 24, // Gap between sections based on CSS
    // Removed shadow styles
  },
  // Removed cardHeader styles as structure changed
  detailSection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 5, // Gap between label and value row
    width: '100%', // Ensure it takes full width within padding
  },
  lastDetailSection: {
    // To remove potential double borders if needed
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    color: '#868686', // Updated text color
    lineHeight: 17,
  },
  detailValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%', // Ensure row takes full width
  },
  detailValue: {
    fontFamily: 'SF Pro Text',
    fontSize: 16,
    color: '#FFFFFF', // Updated text color
    fontWeight: '500',
    lineHeight: 19,
  },
  editButton: {
    backgroundColor: '#424242',
    borderRadius: 100, // Rounded button
    paddingVertical: 4,
    paddingHorizontal: 8,
    // Removed icon, adjust padding as needed
  },
  editText: {
    fontFamily: 'SF Pro Text',
    fontSize: 14,
    color: '#FAFAFA', // Updated text color
    fontWeight: '500',
    lineHeight: 17,
    marginLeft: 0, // Removed left margin
  },
  // Removed infoText styles as element was removed
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24, // Consistent padding
    paddingBottom: 36, // Extra padding at the bottom
    // Removed borderTop styles
  },
  setPinButton: {
    backgroundColor: '#40FF00',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#555555', // Darker disabled color for dark theme
  },
  setPinButtonText: {
    fontFamily: 'SF Pro Text',
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
  },
});
