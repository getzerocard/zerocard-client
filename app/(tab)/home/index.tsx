import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePrivy } from '@privy-io/expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GreetingHeader } from '../../../components/layout/GreetingHeader';
import CardModule from '../../../components/features/card/CardModule';
import CardStatusComponent from '../../../components/features/card/CardStatus';
import CardControls from '../../../components/features/card/CardControls';
import { useUsernameModal } from '../../../components/modals/username/hooks/useUsernameModal';
import { TransactionItem } from '../../../components/features/transactions/TransactionItem';
import CardTypeModal from '../../../components/modals/card-type/CardTypeModal';
import SpendingLimitDialog from '../../../components/modals/spending-limit/SpendingLimitDialog';
import SpendingLimitToast from '../../../components/toasts/SpendingLimitToast';
import WithdrawalToast from '../../../components/toasts/WithdrawalToast';
// Import both Tracking Modals
import TrackingStatusModal from '../../../components/modals/tracking/TrackingStatusModal'; 
import CryptoDepositModal from '../../../components/modals/crypto-deposit/CryptoDepositModal';
// Import the hook for CryptoDepositModal
import { useCryptoDepositListener } from '../../../components/context/CryptoDepositContext'; 
// Define TrackingStatus type locally as it's defined within modals
type TrackingStatus = 'accepted' | 'picked_up' | 'on_delivery' | 'delivered';

// Import mockdata
import mockData from '../../../assets/mockdata.json';

// Import the profile icon
const profileIcon = require('../../../assets/prrofile-icon.png');

// User onboarding stages
type UserStage = 'new_user' | 'ordered_card' | 'activated_card' | 'has_transactions';

import { useIdentityTokenProvider } from '../../(app)/context/identityTokenContexts';
import { useAccessTokenProvider } from '../../(app)/context/accessTokenContext';
import { useGetUser } from '../../../api/hooks/useGetUser';
import { useUserContext } from '../../../providers/UserProvider'; // Import useUserContext

export default function HomeScreen() {
  console.log('[HomeScreen] Rendering');
  const { user, logout } = usePrivy() as any;
  const insets = useSafeAreaInsets();
  // State for username - REMOVED
  // const [username, setUsername] = useState<string>('');
  const {
    showLimitToast,
    showWithdrawalToast,
    amount: toastAmount,
    address: toastAddress,
  } = useLocalSearchParams<{
    showLimitToast?: string;
    showWithdrawalToast?: string;
    amount?: string;
    address?: string;
  }>();

  // Use the crypto deposit listener hook
  const { handleNewDeposit } = useCryptoDepositListener();

  // ---- For Token Logging ----
  const { getIdentityToken } = useIdentityTokenProvider();
  const { getAccessToken } = useAccessTokenProvider();

  useEffect(() => {
    const logTokens = async () => {
      try {
        const identityToken = await getIdentityToken();
        console.log('DEBUG: Full Identity Token:', identityToken);
        if (identityToken && identityToken.split('.').length === 3) {
          try {
            const base64Url = identityToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            // In React Native, direct atob might not be universally available or safe without a polyfill.
            // For quick debugging, this might work in some environments, but prefer a library for robustness.
            // const decodedPayload = atob(base64);
            // console.log('DEBUG: Decoded Identity Token Payload (raw):', decodedPayload);
            // const jsonPayload = JSON.parse(decodedPayload);
            // console.log('DEBUG: Decoded Identity Token Payload (JSON):', jsonPayload);
            console.log('DEBUG: Identity Token Payload (base64 part):', base64Url); // Log the part to decode manually if needed
          } catch (e) {
            console.warn('DEBUG: Could not decode Identity Token payload in app:', e);
          }
        }

        const accessToken = await getAccessToken();
        console.log('DEBUG: Full Access Token:', accessToken);
        if (accessToken && accessToken.split('.').length === 3) {
          try {
            const base64Url = accessToken.split('.')[1];
            // const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            // const decodedPayload = atob(base64);
            // console.log('DEBUG: Decoded Access Token Payload (raw):', decodedPayload);
            // const jsonPayload = JSON.parse(decodedPayload);
            // console.log('DEBUG: Decoded Access Token Payload (JSON):', jsonPayload);
            console.log('DEBUG: Access Token Payload (base64 part):', base64Url); // Log the part to decode manually if needed
          } catch (e) {
            console.warn('DEBUG: Could not decode Access Token payload in app:', e);
          }
        }
      } catch (error) {
        console.error('DEBUG: Error fetching tokens for logging:', error);
      }
    };
    // Only run once on mount for debugging purposes
    logTokens();
  }, [getIdentityToken, getAccessToken]); // Dependencies are stable
  // ---- End Token Logging ----

  // State for user's stage in the onboarding process - REMOVED
  // const [userStage, setUserStage] = useState<UserStage>('new_user');

  // Use the username modal hook without explicit show option
  const { 
    ModalComponent,
    modalProps
  } = useUsernameModal(); // Call without options

  // State for card type modal
  const [cardTypeModalVisible, setCardTypeModalVisible] = useState(false);
  
  // State for tracking status modal visibility
  const [trackingStatusModalVisible, setTrackingStatusModalVisible] = useState(false);

  // State for toast
  const [toastVisible, setToastVisible] = useState(false);
  const [withdrawalToastVisible, setWithdrawalToastVisible] = useState(false);

  // Show toast notification if the showLimitToast param is present
  useEffect(() => {
    if (showLimitToast === 'true') {
      setToastVisible(true);
    }
  }, [showLimitToast]);

  // Show withdrawal toast if param present
  useEffect(() => {
    if (showWithdrawalToast === 'true') {
      setWithdrawalToastVisible(true);
    }
  }, [showWithdrawalToast]);

  // Load saved state from AsyncStorage - REMOVED (userStage now from context)
  // useEffect(() => {
  //   const loadCardOrderState = async () => {
  //     try {
  //       const cardOrdered = await AsyncStorage.getItem('card_ordered');
  //       if (cardOrdered === 'true') {
  //         setUserStage('ordered_card');
  //       }
  //     } catch (error) {
  //       console.error('Error loading card_ordered state:', error);
  //     }
  //   };
  //   loadCardOrderState();
  // }, []);

  // Get user data, including username from useGetUser, and cardStage from useUserContext
  const { data: userResponse, isLoading: isLoadingUser, error: userError } = useGetUser();
  const { cardStage, refetchCreateUserMutation } = useUserContext(); // Get cardStage and refetch function

  // Get username from state or email as fallback
  
  const displayName = React.useMemo(() => {
    if (isLoadingUser) {
      return 'User...'; // Or some other loading indicator
    }
    if (userError || !userResponse?.data?.username) {
      // Fallback to privy user email if available, otherwise a generic default
      return user?.email ? user.email.split('@')[0] : 'User';
    }
    return userResponse.data.username;
  }, [userResponse, isLoadingUser, userError, user?.email]);

  const userInitial = displayName && displayName.length > 0 ? displayName[0].toUpperCase() : 'U';

  // Update userStage based on card_ordered from AsyncStorage (can remain for now, or be moved to useGetUser if cardOrderStatus is reliable) - REMOVED
  // useEffect(() => {
  //   const loadCardOrderState = async () => {
  //     try {
  //       const cardOrdered = await AsyncStorage.getItem('card_ordered');
  //       if (cardOrdered === 'true') {
  //         setUserStage('ordered_card');
  //       }
  //     } catch (error) {
  //       console.error('Error loading card_ordered state:', error);
  //     }
  //   };
  //   loadCardOrderState();
  // }, []);

  // Handle profile press - on Android, show username modal
  const handleProfilePress = () => {
    if (Platform.OS === 'android') {
      // To re-show the modal on Android (e.g., to change username):
      // 1. The useUsernameModal hook needs to expose a function like `showModal()`
      // 2. Or, this component needs to manage a local state to pass `visible={true}` to ModalComponent.
      // For now, removing the direct call to handleSetUsername.
      // If the modal should be re-shown, that logic needs to be added to useUsernameModal
      // and a function to trigger it exposed from there.
      console.log('[HomeScreen] Profile pressed on Android. Modal re-show logic TBD if needed.');
      // Example: if (showUsernameChangeModal) showUsernameChangeModal();
    } else {
      // On iOS, profile press logs out
      handleLogout();
    }
  };

  // If no user, redirect to root
  if (!user) {
    return <Redirect href="/" />;
  }

  const handleLogout = async () => {
    try {
      // Clear any saved state on logout
      await AsyncStorage.multiRemove([
        'username',
        'user_verified',
        'card_ordered',
        'identity_type',
      ]);
      await logout();
      // No need for navigation here - the Redirect will handle it
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handlers for card status actions
  const handleOrderCard = () => {
    // Show the card type selection modal
    setCardTypeModalVisible(true);
  };

  const handleSelectCardType = async (cardType: 'physical' | 'contactless') => {
    // In a real app, this would call an API to order the selected card type
    console.log(`${cardType} card ordered - simulation.`);
    // setUserStage('ordered_card'); // REMOVED - Handled by UserProvider via refetch

    // Save ordered state - REMOVED (no longer needed, API is source of truth)
    // try {
    //   await AsyncStorage.setItem('card_ordered', 'true');
    // } catch (error) {
    //   console.error('Error saving card ordered state:', error);
    // }

    // After simulating card order, refetch user data to update cardStage in context
    console.log('[HomeScreen] Simulating card order, calling refetchCreateUserMutation.');
    refetchCreateUserMutation(); 
    setCardTypeModalVisible(false); // Close the modal
  };

  const handleLoadWallet = () => {
    console.log('Load wallet pressed');
  };

  const handleCheckStatus = () => {
    console.log('Check status pressed');
    // Only open the modal on iOS
    if (Platform.OS === 'ios') {
      setTrackingStatusModalVisible(true);
    } else {
      // Optionally, add Android-specific behavior here if needed later
      console.log('Check status does nothing on Android for now.');
    }
  };

  // Card number based on state
  const getCardNumber = () => {
    // This mock data access might need to change based on how cardStage maps to these stages
    const currentDisplayStage = cardStage === 'activated' ? 'activated_card' : cardStage === 'pending_activation' ? 'ordered_card' : 'new_user';
    return mockData.userStages[currentDisplayStage]?.cardNumber || 'No card found';
  };

  // Get expiry date based on state
  const getExpiryDate = () => {
    const currentDisplayStage = cardStage === 'activated' ? 'activated_card' : cardStage === 'pending_activation' ? 'ordered_card' : 'new_user';
    return mockData.userStages[currentDisplayStage]?.expiryDate || '··/··';
  };

  // Get wallet address based on state
  const getWalletAddress = () => {
    const currentDisplayStage = cardStage === 'activated' ? 'activated_card' : cardStage === 'pending_activation' ? 'ordered_card' : 'new_user';
    return mockData.userStages[currentDisplayStage]?.walletAddress || '········';
  };

  // Render empty transactions state
  const renderEmptyTransactions = () => (
    <View style={styles.emptyTransactionsContainer}>
      <Text style={styles.emptyTransactionsText}>You have no transactions</Text>
    </View>
  );

  // Handle spending limit dialog press
  const handleSpendingLimitPress = () => {
    console.log('Navigating to spending limit screen');
    router.push('/(app)/spending-limit');
  };

  // Get current tracking status based on user stage (for modal)
  const getCurrentTrackingStatus = (): TrackingStatus => {
    // This logic might need refinement based on actual app states
    if (cardStage === 'pending_activation') { // Changed from userStage === 'ordered_card'
      return 'picked_up'; // Or 'on_delivery' based on more detailed status
    }
    if (cardStage === 'activated') { // Changed from userStage === 'activated_card' || userStage === 'has_transactions'
      return 'delivered'; // Assuming delivered if activated
    }
    return 'accepted'; // Default if not_ordered or unknown
  };

  // Generate estimated delivery date (example: 5 days from now)
  const getEstimatedDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  // Add a new function to handle direct order card flow navigation
  const handleSimulateOrderCard = () => {
    router.push('/card-ordering');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Toast notification */}
        <SpendingLimitToast visible={toastVisible} onDismiss={() => setToastVisible(false)} />

        {/* Card Type Modal (Common) */}
        <CardTypeModal
          visible={cardTypeModalVisible}
          onClose={() => setCardTypeModalVisible(false)}
          onSelectCardType={handleSelectCardType}
        />
        
        {/* Tracking Status Modal (Now common) */}
        <TrackingStatusModal
          visible={trackingStatusModalVisible}
          onClose={() => setTrackingStatusModalVisible(false)}
          estimatedDeliveryDate={getEstimatedDeliveryDate()}
          currentStatus={getCurrentTrackingStatus()}
        />

        {/* Crypto Deposit Modal */}
        <CryptoDepositModal />

        {/* Fixed Header */}
        <View style={[styles.fixedHeader, { paddingTop: Platform.OS === 'ios' ? insets.top - 30 : StatusBar.currentHeight ? StatusBar.currentHeight - 24 : insets.top - 24 }]}>
          <GreetingHeader
            username={displayName}
            profileImage={profileIcon}
            onProfilePress={handleProfilePress}
          />
        </View>

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Card Module */}
          <View style={styles.cardModuleContainer}>
            <CardModule />
          </View>

          {/* Card Status - Only show for new users and users who ordered a card */}
          {(cardStage === 'not_ordered' || cardStage === 'pending_activation') && (
            <View style={styles.cardStatusContainer}>
              <CardStatusComponent
                status={cardStage === 'not_ordered' ? 'not_found' : 'ordered'}
                onPrimaryButtonPress={
                  cardStage === 'not_ordered'
                    ? handleOrderCard
                    : () => router.push('/(app)/card-activation/qr-scanner')
                }
                onSecondaryButtonPress={
                  cardStage === 'not_ordered' ? handleLoadWallet : handleCheckStatus
                }
              />
            </View>
          )}

          {/* Card Controls - Only show for users with activated cards */}
          {(cardStage === 'activated') && (
            <View style={styles.cardControlsContainer}>
              <CardControls
                onLoadCard={() => {
                  console.log('Load card pressed');
                }}
                onFreezeCard={() => {
                  console.log('Freeze card pressed');
                }}
              />
            </View>
          )}

          {/* Spending Limit Dialog - Only show for users with activated cards */}
          {(cardStage === 'activated') && (
            <View style={styles.spendingLimitContainer}>
              <SpendingLimitDialog onPress={handleSpendingLimitPress} />
            </View>
          )}

          {/* Transactions Section - Only show for users with activated cards */}
          {(cardStage === 'activated') && (
            <View style={styles.transactionsContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                <Text style={styles.sectionAction}>View All</Text>
              </View>

              {/* Show transactions or empty state based on user stage */}
              {cardStage === 'activated' // Assuming 'activated' means they can have transactions
                ? mockData.transactions.map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      id={transaction.id}
                      type={transaction.amount > 0 ? 'deposit' : 'spend'}
                      name={transaction.name}
                      amount={Math.abs(transaction.amount)}
                      date={transaction.date}
                      time={transaction.timestamp.split('T')[1].substring(0, 5)}
                      currency="USDC"
                      category={transaction.category}
                    />
                  ))
                : renderEmptyTransactions()}
            </View>
          )}

          {/* Simulation Button - For testing the order card flow */}
          <View style={styles.simulationContainer}>
            <TouchableOpacity
              style={styles.simulationButton}
              onPress={handleSimulateOrderCard}
            >
              <Ionicons name="card-outline" size={20} color="#FFFFFF" />
              <Text style={styles.simulationButtonText}>Simulate Order Card Flow</Text>
            </TouchableOpacity>
            
            {/* Spending Limit Simulation Button */}
            <TouchableOpacity
              style={[styles.simulationButton, { marginTop: 12, backgroundColor: '#33CD00' }]}
              onPress={handleSpendingLimitPress}
            >
              <Ionicons name="cash-outline" size={20} color="#FFFFFF" />
              <Text style={styles.simulationButtonText}>Simulate Spending Limit</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Withdrawal success toast overlay */}
        {withdrawalToastVisible && toastAmount && toastAddress && (
          <WithdrawalToast
            amount={toastAmount as string}
            address={toastAddress as string}
            onHide={() => setWithdrawalToastVisible(false)}
          />
        )}

        {/* Username Modal */}
        {ModalComponent && <ModalComponent {...modalProps} />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  fixedHeader: {
    backgroundColor: '#f7f7f7',
    zIndex: 10,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  cardModuleContainer: {
    // marginTop: 16, // Remove this line
  },
  transactionsContainer: {
    marginTop: 24, // Increased from 16px to 24px from card controls
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'SF Pro Text',
    fontSize: 18,
    fontWeight: '500', // Changed from 600 to 500
  },
  sectionAction: {
    fontFamily: 'SF Pro Text',
    fontSize: 14, // Changed from default to 14px
    color: '#838383', // Changed from #40ff00 to #838383
    fontWeight: '500',
  },
  cardStatusContainer: {
    marginTop: Platform.select({
      android: 8,
      ios: 8,
      default: 8,
    }),
    marginBottom: 8,
  },
  emptyTransactionsContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTransactionsText: {
    fontFamily: 'SF Pro Text',
    fontSize: 16,
    color: '#787878',
    textAlign: 'center',
  },
  cardControlsContainer: {
    marginTop: Platform.select({
      android: 32,
      ios: 16,
      default: 8,
    }),
    marginBottom: Platform.select({
      android: 12,
      ios: 16,
      default: 8,
    }),
    alignItems: 'center',
  },
  spendingLimitContainer: {
    marginTop: 0, // 16px gap from CardControls
    marginBottom: 16,
  },
  simulationContainer: {
    marginTop: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  simulationButton: {
    backgroundColor: '#2E86FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  simulationButtonText: {
    color: '#FFFFFF',
    fontFamily: 'SF Pro Text',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});
