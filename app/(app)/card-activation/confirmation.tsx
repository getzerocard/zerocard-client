import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, /* ActivityIndicator, */ Alert } from 'react-native'; // Commented out ActivityIndicator
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import { ParamListBase } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { backIconSvg, cardEditIconSvg } from '../../../constants/icons'; // Import icons
import { useMapCard } from '../../../api/hooks/useMapCard'; // Import the hook
import { MapCardRequestParams, MappedCardData } from '../../../types/card'; // Import request params type and MappedCardData
import { useGetUser, UserProfile, UserApiResponse } from '../../../api/hooks/useGetUser'; // Import useGetUser and its types
import { LoadingSpinner } from '../../../components/ui/feedback/LoadingSpinner'; // Import LoadingSpinner

// Helper function to convert MM/YY to MMM-YYYY
const formatExpiryDateForApi = (mmYY: string): string => {
  if (!mmYY || !mmYY.includes('/')) return ''; // Basic validation
  const [month, yearSuffix] = mmYY.split('/');
  if (!month || !yearSuffix || month.length !== 2 || yearSuffix.length !== 2) return '';

  const monthNumber = parseInt(month, 10);
  if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) return '';

  const year = parseInt(`20${yearSuffix}`, 10); 

  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthAbbreviation = monthNames[monthNumber - 1];

  return `${monthAbbreviation}-${year}`;
};

export default function ConfirmationScreen() {
  console.log('[ConfirmationScreen] Component rendered.');

  const router = useRouter();
  const params = useLocalSearchParams<{
    cardNumber?: string;
    expDate?: string;
    cvv?: string;
  }>();

  const { 
    data: getUserData, 
    isLoading: isLoadingUser, 
    isError: isGetUserError, 
    error: getUserError,
    refetch: refetchUser
  } = useGetUser();

  const { mutate: mapCardMutateFn, reset: resetMapCardMutation, isPending: isMappingCard } = useMapCard();

  useEffect(() => {
    console.log('[ConfirmationScreen] useGetUser state update: isLoadingUser:', isLoadingUser, 'isGetUserError:', isGetUserError);
    if (!isLoadingUser && !isGetUserError && getUserData) {
      console.log('[ConfirmationScreen] User data fetched successfully. User ID:', getUserData.data?.id, 'Full data:', JSON.stringify(getUserData.data));
    } else if (isGetUserError) {
      console.error('[ConfirmationScreen] Error fetching user data:', getUserError);
    }
  }, [getUserData, isLoadingUser, isGetUserError, getUserError]);

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    console.log('[ConfirmationScreen] handleSetPin called. isLoadingUser:', isLoadingUser);

    if (isLoadingUser) {
      Alert.alert(
        'Loading User Data',
        'User information is still loading. Please wait a moment and try again.'
      );
      return;
    }

    if (isGetUserError || !getUserData || !getUserData.data || !getUserData.data.userId) {
      console.error('[ConfirmationScreen] Privy User DID (userId field) missing or error fetching user. getUserData:', JSON.stringify(getUserData), 'Error:', getUserError);
      Alert.alert(
        'Error',
        'Critical user identifier is not available. Please try again or contact support.'
      );
      resetMapCardMutation();
      return;
    }
    
    const privyUserDID = getUserData.data.userId;

    const formattedExpiry = formatExpiryDateForApi(expDate);
    if (!formattedExpiry) {
      Alert.alert('Invalid Expiry Date', 'The expiry date format is incorrect. Please use MM/YY.');
      resetMapCardMutation();
      return;
    }

    const variables: MapCardRequestParams = {
      userId: privyUserDID,
      status: 'active',
      expirationDate: formattedExpiry,
      number: cardNumber.replace(/\s+/g, ''),
    };

    console.log('[ConfirmationScreen] Variables for mapCard API call:', JSON.stringify(variables));

    mapCardMutateFn(
      variables,
      {
        onSuccess: (data: MappedCardData) => {
          console.log('Card mapped successfully:', data);
          router.push({
            pathname: '/(app)/card-activation/set-pin',
            params: { cardNumber: `**** **** **** ${cardNumber.slice(-4)}`, expDate, cvv },
          });
        },
        onError: (error: any) => {
          console.error('Error mapping card:', error);
          let friendlyMessage = 'There was an issue activating your card. Please check your details and try again.';
          if (error && typeof error.message === 'string') {
            if (error.message.includes('You are not authorized')) {
              friendlyMessage = 'Authorization failed. We couldn\'t verify permissions to map this card. Please try logging out and back in.';
            } else if (error.message.includes('Customer ID missing')) {
              friendlyMessage = 'We couldn\'t link the card to your account. Please try again or ensure you are properly logged in.';
            } else if (error.message.includes('already mapped')) {
              friendlyMessage = 'This card appears to be already linked to an account.';
            }
          }
          Alert.alert('Card Activation Failed', friendlyMessage + ' If the problem continues, please contact support.');
        },
      }
    );
  };

  // Format card number for display (e.g., **** **** **** 1234)
  const formatCardNumber = (number: string) => {
    if (!number) return '';
    const digitsOnly = number.replace(/\s/g, '');
    return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
  };
  
  const overallLoading = isLoadingUser || isMappingCard;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} disabled={overallLoading}>
          <SvgXml xml={backIconSvg} width={24} height={24} />
        </TouchableOpacity>
        <View style={styles.emptySpace} />
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.contentContainer}>
        <View style={styles.confirmationHeaderContainer}>
          <SvgXml xml={cardEditIconSvg} width={32} height={32} />
          <View style={styles.confirmationTextContainer}>
            <Text style={styles.confirmationTitle}>Confirm your\nZerocard details</Text>
            <Text style={styles.confirmationDescription}>
              Let's get started! Activate your Zerocard and enjoy exclusive rewards
            </Text>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Card number</Text>
            <View style={styles.detailValueRow}>
              <Text style={styles.detailValue}>
                {cardNumber ? formatCardNumber(cardNumber) : 'Not available'}
              </Text>
              <TouchableOpacity
                onPress={() => handleEditCard('cardNumber')}
                style={styles.editButton}
                disabled={overallLoading}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Exp date</Text>
            <View style={styles.detailValueRow}>
              <Text style={styles.detailValue}>{expDate || 'Not available'}</Text>
              <TouchableOpacity 
                onPress={() => handleEditCard('expDate')} 
                style={styles.editButton}
                disabled={overallLoading}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.detailSection, styles.lastDetailSection]}>
            <Text style={styles.detailLabel}>CVV</Text>
            <View style={styles.detailValueRow}>
              <Text style={styles.detailValue}>{cvv || 'Not available'}</Text>
              <TouchableOpacity 
                onPress={() => handleEditCard('cvv')} 
                style={styles.editButton}
                disabled={overallLoading}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.setPinButton,
            (!isDataComplete || overallLoading) ? styles.disabledButton : {},
          ]}
          onPress={handleSetPin}
          disabled={!isDataComplete || overallLoading}>
          {overallLoading ? (
            <LoadingSpinner size="small" color="#1F1F1F" />
          ) : (
            <Text style={styles.setPinButtonText}>Activate Card</Text>
          )}
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
    justifyContent: 'center', // Ensure spinner is centered
    minHeight: 50, // Ensure button has a minimum height for spinner
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
