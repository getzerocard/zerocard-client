import { Ionicons } from '@expo/vector-icons';
import { useEmbeddedEthereumWallet, usePrivy } from '@privy-io/expo';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Clipboard,
  ToastAndroid,
  Alert,
  Platform,
  Image,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { SquircleView } from 'react-native-figma-squircle';
import QRCode from 'react-native-qrcode-svg';
import { SvgXml } from 'react-native-svg';

import { SkeletonLoader } from '../../ui/feedback';
import { useUserWalletAddress } from '../../../common/hooks/useUserWalletAddress';

// Import SVG files as strings
const usdcSvg = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.50041 16.4288C12.7978 16.4288 16.2546 12.8942 16.2546 8.50001C16.2546 4.10586 12.7978 0.571198 8.50041 0.571198C4.20303 0.571198 0.746216 4.10586 0.746216 8.50001C0.746216 12.8942 4.20303 16.4288 8.50041 16.4288Z" fill="#2775CA"/>
<path d="M10.6328 9.75514C10.6328 8.59912 9.95434 8.20268 8.59736 8.03697C7.62808 7.90455 7.43423 7.64053 7.43423 7.17828C7.43423 6.71603 7.75758 6.41869 8.4035 6.41869C8.98507 6.41869 9.30842 6.61691 9.4697 7.11247C9.50227 7.21158 9.5992 7.27739 9.69613 7.27739H10.2133C10.3428 7.27739 10.4398 7.17828 10.4398 7.04586V7.01256C10.3103 6.28549 9.72869 5.72413 8.98584 5.65832V4.86544C8.98584 4.73303 8.88892 4.63392 8.72763 4.60141H8.24299C8.1135 4.60141 8.01657 4.70052 7.98478 4.86544V5.62502C7.0155 5.75743 6.40137 6.4179 6.40137 7.24408C6.40137 8.3343 7.04729 8.76404 8.40428 8.92896C9.30919 9.09388 9.59997 9.2921 9.59997 9.82095C9.59997 10.3498 9.14791 10.7129 8.53377 10.7129C7.69399 10.7129 7.40321 10.3498 7.30628 9.85425C7.27372 9.72184 7.17679 9.65603 7.07986 9.65603H6.53087C6.40137 9.65603 6.30444 9.75514 6.30444 9.88755V9.92085C6.43394 10.747 6.95037 11.3417 8.01657 11.5066V12.2995C8.01657 12.4319 8.1135 12.531 8.27478 12.5635H8.75942C8.88892 12.5635 8.98584 12.4644 9.01764 12.2995V11.5066C9.98613 11.3409 10.6328 10.6471 10.6328 9.75514Z" fill="white"/>
<path d="M6.85257 13.224C4.33245 12.2987 3.03983 9.42451 3.97731 6.88095C4.46195 5.49341 5.52815 4.4365 6.85257 3.94094C6.98206 3.87514 7.04642 3.77603 7.04642 3.61031V3.14806C7.04642 3.01565 6.98206 2.91654 6.85257 2.88403C6.82 2.88403 6.75564 2.88403 6.72307 2.91733C3.65396 3.90844 1.97363 7.24488 2.9429 10.3839C3.52447 12.2337 4.91402 13.6545 6.72307 14.2492C6.85257 14.315 6.98129 14.2492 7.01385 14.1168C7.04642 14.0835 7.04642 14.051 7.04642 13.9844V13.5221C7.04642 13.4222 6.94949 13.2906 6.85257 13.224ZM10.2768 2.91654C10.1473 2.85073 10.0186 2.91654 9.98603 3.04895C9.95347 3.08225 9.95347 3.11476 9.95347 3.18136V3.64361C9.95347 3.77602 10.0504 3.90764 10.1473 3.97425C12.6674 4.89954 13.9601 7.77374 13.0226 10.3173C12.5379 11.7048 11.4717 12.7618 10.1473 13.2573C10.0178 13.3231 9.95347 13.4222 9.95347 13.5879V14.0502C9.95347 14.1826 10.0178 14.2817 10.1473 14.3142C10.1799 14.3142 10.2442 14.3142 10.2768 14.2809C13.3459 13.2898 15.0263 9.95337 14.057 6.81435C13.4754 4.93205 12.0541 3.5112 10.2768 2.91654Z" fill="white"/>
</svg>`;

// Simplified Base logo (using a smaller part of the SVG for better performance)
const baseLogoSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="#0052FF" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="12" fill="#0052FF"/>
  <path d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z" fill="white" fill-opacity="0.7"/>
  <path d="M15 9.5C15 11.433 13.433 13 11.5 13H9V16H7V9.5C7 8.12 8.12 7 9.5 7H11.5C13.433 7 15 8.567 15 9.5Z" fill="#0052FF"/>
  <path d="M11.5 11C12.3284 11 13 10.3284 13 9.5C13 8.67157 12.3284 8 11.5 8H9V11H11.5Z" fill="white"/>
</svg>`;

// Info wallet icon
const infoWalletSvg = `<svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.50675 15.16C8.08675 15.16 7.67341 15.02 7.34675 14.74L6.29341 13.84C6.18674 13.7467 5.92008 13.6533 5.78008 13.6533H4.61341C3.62674 13.6533 2.82674 12.8533 2.82674 11.8667V10.7267C2.82674 10.5867 2.73341 10.32 2.64674 10.22L1.74008 9.15332C1.19341 8.50665 1.19341 7.49332 1.74008 6.83999L2.64674 5.77332C2.73341 5.67332 2.82674 5.40665 2.82674 5.26665V4.13332C2.82674 3.14665 3.62674 2.34665 4.61341 2.34665H5.76675C5.90675 2.34665 6.16675 2.24665 6.28008 2.15332L7.33341 1.25332C7.98675 0.699985 9.00674 0.699985 9.66008 1.25332L10.7134 2.15332C10.8201 2.24665 11.0934 2.33998 11.2334 2.33998H12.3667C13.3534 2.33998 14.1534 3.13998 14.1534 4.12665V5.25998C14.1534 5.39998 14.2534 5.65998 14.3467 5.77332L15.2467 6.82665C15.8067 7.48665 15.8001 8.50665 15.2467 9.15332L14.3467 10.2067C14.2534 10.32 14.1601 10.58 14.1601 10.72V11.8533C14.1601 12.84 13.3601 13.64 12.3734 13.64H11.2401C11.1001 13.64 10.8401 13.74 10.7201 13.8333L9.66675 14.7333C9.34008 15.02 8.92008 15.16 8.50675 15.16ZM4.61341 3.34665C4.18008 3.34665 3.82674 3.69998 3.82674 4.13332V5.26665C3.82674 5.64665 3.65341 6.12665 3.40674 6.41998L2.50008 7.48665C2.27341 7.75998 2.27341 8.23999 2.50008 8.50665L3.40008 9.56665C3.64008 9.83999 3.82008 10.34 3.82008 10.72V11.86C3.82008 12.2933 4.17341 12.6467 4.60674 12.6467H5.76675C6.14008 12.6467 6.63341 12.8267 6.92675 13.0733L7.98674 13.98C8.26008 14.2133 8.74008 14.2133 9.01341 13.98L10.0667 13.08C10.3667 12.8267 10.8534 12.6533 11.2267 12.6533H12.3601C12.7934 12.6533 13.1467 12.3 13.1467 11.8667V10.7333C13.1467 10.36 13.3267 9.87332 13.5734 9.57332L14.4801 8.51332C14.7134 8.23999 14.7134 7.75998 14.4801 7.48665L13.5801 6.43332C13.3267 6.13332 13.1534 5.64665 13.1534 5.27332V4.13332C13.1534 3.69998 12.8001 3.34665 12.3667 3.34665H11.2334C10.8534 3.34665 10.3601 3.16665 10.0667 2.91998L9.00675 2.01332C8.73341 1.77998 8.26008 1.77998 7.98008 2.01332L6.93341 2.91998C6.63341 3.16665 6.14675 3.34665 5.76675 3.34665H4.61341Z" fill="#292D32"/>
<path d="M8.50016 11.2467C8.1335 11.2467 7.8335 10.9467 7.8335 10.58C7.8335 10.2133 8.12683 9.91333 8.50016 9.91333C8.86683 9.91333 9.16683 10.2133 9.16683 10.58C9.16683 10.9467 8.8735 11.2467 8.50016 11.2467Z" fill="#292D32"/>
<path d="M8.5 9.14665C8.22667 9.14665 8 8.91998 8 8.64665V5.41998C8 5.14665 8.22667 4.91998 8.5 4.91998C8.77333 4.91998 9 5.14665 9 5.41998V8.63998C9 8.91998 8.78 9.14665 8.5 9.14665Z" fill="#292D32"/>
</svg>`;

export interface AddMoneyProps {
  onFundedWallet?: () => void;
  onSkip?: () => void;
}

export const AddMoney: React.FC<AddMoneyProps> = ({ onFundedWallet, onSkip }) => {
  const [copyPressed, setCopyPressed] = React.useState(false);
  const { width } = useWindowDimensions();

  // Get raw wallet data for debugging - check actual API properties
  const { wallets } = useEmbeddedEthereumWallet();
  const privy = usePrivy();
  const authenticated = !!privy.user; // User exists when authenticated

  // For debugging - log wallet state
  React.useEffect(() => {
    console.log('[AddMoney] User exists:', !!privy.user);
    console.log('[AddMoney] User ID:', privy.user?.id);
    console.log('[AddMoney] Wallets count:', wallets?.length || 0);
    if (wallets?.length > 0) {
      console.log('[AddMoney] First wallet address:', wallets[0].address);
    }
  }, [privy.user, wallets]);

  // Get wallet address from hook
  const walletAddress = useUserWalletAddress();

  // No fallback address, just use the real wallet address
  const effectiveAddress = walletAddress;
  const isLoading = authenticated && wallets?.length > 0 && !walletAddress;
  const noWalletFound = !authenticated || wallets?.length === 0 || !walletAddress;

  // Calculate QR code size based on container width
  const qrSize = React.useMemo(() => {
    // Calculate available width after accounting for horizontal padding (48px total)
    const containerWidth = width - 48; // 24px padding on each side of the container
    const availableWidth = containerWidth - 48; // 24px padding on each side of QR container
    return Math.floor(availableWidth);
  }, [width]);

  // Display a formatted truncated wallet address
  const displayAddress = React.useMemo(() => {
    if (!effectiveAddress) return '';
    if (effectiveAddress.length <= 12) return effectiveAddress;
    return `${effectiveAddress.substring(0, 6)}...${effectiveAddress.substring(effectiveAddress.length - 4)}`;
  }, [effectiveAddress]);

  // Handle copying wallet address to clipboard
  const copyToClipboard = () => {
    if (!effectiveAddress) return;

    Clipboard.setString(effectiveAddress);

    // Trigger light haptic feedback when copying
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (Platform.OS === 'android') {
      ToastAndroid.show('Address copied to clipboard', ToastAndroid.SHORT);
    } else {
      Alert.alert('Copied', 'Address copied to clipboard');
    }
  };

  // Auth status indicator for debugging
  const renderAuthStatus = () => {
    if (!privy.user)
      return <Text style={styles.debugText}>Not authenticated. Please login first.</Text>;
    if (!walletAddress && wallets?.length > 0)
      return <Text style={styles.debugText}>Wallet found but address not available.</Text>;
    return null;
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          {/* <Image
            source={require('../../../assets/images/base-logo-in-blue.png')}
            style={styles.logo}
          /> */}
          <Text style={styles.title}>Add Money</Text>
        </View>

        {/* Debug section - only visible in development */}
        {process.env.NODE_ENV === 'development' && renderAuthStatus()}

        <View style={styles.contentContainer}>
          {/* Token selector */}
          <View style={styles.tokenRow}>
            <View style={styles.tokenSelector}>
              <Text style={styles.tokenSelectorText}>Supported tokens</Text>
              <View style={styles.tokenBadge}>
                <SvgXml xml={usdcSvg} width={24} height={18} />
                <Text style={styles.tokenText}>USDC</Text>
              </View>
            </View>
          </View>

          {/* QR Code container without gradient border */}
          <View style={styles.qrWrapper}>
            <SquircleView
              style={styles.qrContainer}
              squircleParams={{
                cornerSmoothing: 1,
                cornerRadius: 20,
                fillColor: '#FFFFFF',
              }}>
              {isLoading ? (
                <SkeletonLoader width={qrSize} height={qrSize} borderRadius={10} />
              ) : noWalletFound ? (
                <View style={styles.noWalletContainer}>
                  <Text style={styles.noWalletText}>No wallet found</Text>
                </View>
              ) : (
                <QRCode
                  value={effectiveAddress}
                  size={qrSize}
                  color="#000000"
                  backgroundColor="#ffffff"
                  logoBackgroundColor="white"
                />
              )}
            </SquircleView>
          </View>

          {/* Wallet address row with gradient border */}
          <View style={styles.addressRow}>
            <LinearGradient
              colors={['#40FF00', '#7177F9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.addressGradientBorder}>
              <View style={styles.addressContainer}>
                <Image
                  source={require('../../../assets/images/base-logo-in-blue.png')}
                  style={{ width: 16, height: 16 }}
                />
                {isLoading ? (
                  <SkeletonLoader width={100} height={17} borderRadius={4} />
                ) : noWalletFound ? (
                  <Text style={styles.addressText}>No wallet found</Text>
                ) : (
                  <Text style={styles.addressText}>{displayAddress}</Text>
                )}
              </View>
            </LinearGradient>

            <Pressable
              style={({ pressed }) => [styles.copyButton, pressed && styles.copyButtonPressed]}
              onPress={copyToClipboard}
              disabled={noWalletFound}>
              <Text style={styles.copyText}>Copy</Text>
              <Ionicons name="copy-outline" size={16} color="#121212" />
            </Pressable>
          </View>

          {/* Info message */}
          <SquircleView
            style={styles.infoContainer}
            squircleParams={{
              cornerSmoothing: 1,
              cornerRadius: 20,
              fillColor: '#ECECEC',
            }}>
            <SvgXml xml={infoWalletSvg} width={16} height={16} />
            <Text style={styles.infoText}>
              Only send USDC on Base to this address, it is only enabled to hold ERC20 tokens on
              Base
            </Text>
          </SquircleView>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 32,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    gap: 12,
    width: '100%',
  },
  logo: {
    width: 24,
    height: 24,
  },
  title: {
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 26,
    letterSpacing: 0,
    color: '#121212',
  },
  contentContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 0,
    gap: 12,
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 0,
    gap: 24,
    width: '100%',
  },
  tokenSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 16,
    gap: 10,
    width: '100%',
    height: 39,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1,
    borderRadius: 1000,
    flex: 1,
  },
  tokenSelectorText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',
    letterSpacing: 0,
    color: '#121212',
  },
  tokenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    gap: 4,
    width: 67,
    height: 23,
  },
  tokenText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',
    letterSpacing: 0,
    color: '#121212',
  },
  qrWrapper: {
    width: '100%',
    aspectRatio: 1,
    alignSelf: 'stretch',
  },
  qrContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1,
    borderRadius: 20,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 0,
    gap: 24,
    alignSelf: 'stretch',
  },
  addressGradientBorder: {
    borderRadius: 1000,
    padding: 2,
  },
  addressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
    gap: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1,
    borderRadius: 1000,
  },
  addressText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',
    letterSpacing: 0,
    color: '#121212',
  },
  copyButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
    gap: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1,
    borderRadius: 1000,
  },
  copyButtonPressed: {
    opacity: 0.7,
  },
  copyText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 23,
    textAlign: 'center',
    letterSpacing: -0.42,
    color: '#121212',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 8,
    backgroundColor: '#ECECEC',
    borderRadius: 20,
    alignSelf: 'stretch',
  },
  infoText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#484848',
    flex: 1,
  },
  debugText: {
    fontSize: 12,
    color: '#FF3B30',
    marginBottom: 10,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 4,
    borderRadius: 4,
  },
  noWalletContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  noWalletText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    color: '#808080',
    textAlign: 'center',
  },
});
