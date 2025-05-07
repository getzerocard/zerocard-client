import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useFonts } from 'expo-font';
import { SquircleView } from 'react-native-figma-squircle';
import QRCode from 'react-native-qrcode-svg';

// Import close icon SVG
const closeIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.0002 22.75C6.07024 22.75 1.25024 17.93 1.25024 12C1.25024 6.07 6.07024 1.25 12.0002 1.25C17.9302 1.25 22.7502 6.07 22.7502 12C22.7502 17.93 17.9302 22.75 12.0002 22.75ZM12.0002 2.75C6.90024 2.75 2.75024 6.9 2.75024 12C2.75024 17.1 6.90024 21.25 12.0002 21.25C17.1002 21.25 21.2502 17.1 21.2502 12C21.2502 6.9 17.1002 2.75 12.0002 2.75Z" fill="#6A6A6A"/>
<path d="M9.16962 15.58C8.97962 15.58 8.78962 15.51 8.63962 15.36C8.34962 15.07 8.34962 14.59 8.63962 14.3L14.2996 8.63999C14.5896 8.34999 15.0696 8.34999 15.3596 8.63999C15.6496 8.92999 15.6496 9.40998 15.3596 9.69998L9.69962 15.36C9.55962 15.51 9.35962 15.58 9.16962 15.58Z" fill="#6A6A6A"/>
<path d="M14.8296 15.58C14.6396 15.58 14.4496 15.51 14.2996 15.36L8.63962 9.69998C8.34962 9.40998 8.34962 8.92999 8.63962 8.63999C8.92962 8.34999 9.40962 8.34999 9.69962 8.63999L15.3596 14.3C15.6496 14.59 15.6496 15.07 15.3596 15.36C15.2096 15.51 15.0196 15.58 14.8296 15.58Z" fill="#6A6A6A"/>
</svg>`;

// Import wallet icon SVG
const walletIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.85 3.95005V7.75005H13.35V3.95005C13.35 3.68005 13.11 3.55005 12.95 3.55005C12.9 3.55005 12.85 3.56005 12.8 3.58005L4.87 6.57005C4.34 6.77005 4 7.27005 4 7.84005V8.51005C3.09 9.19005 2.5 10.28 2.5 11.51V7.84005C2.5 6.65005 3.23 5.59005 4.34 5.17005L12.28 2.17005C12.5 2.09005 12.73 2.05005 12.95 2.05005C13.95 2.05005 14.85 2.86005 14.85 3.95005Z" fill="#919191"/>
<path d="M21.4999 14.5V15.5C21.4999 15.77 21.2899 15.99 21.0099 16H19.5499C19.0199 16 18.5399 15.61 18.4999 15.09C18.4699 14.78 18.5899 14.49 18.7899 14.29C18.9699 14.1 19.2199 14 19.4899 14H20.9999C21.2899 14.01 21.4999 14.23 21.4999 14.5Z" fill="#919191"/>
<path d="M19.48 12.95H20.5C21.05 12.95 21.5 12.5 21.5 11.95V11.51C21.5 9.44 19.81 7.75 17.74 7.75H6.26C5.41 7.75 4.63 8.03 4 8.51C3.09 9.19 2.5 10.28 2.5 11.51V18.24C2.5 20.31 4.19 22 6.26 22H17.74C19.81 22 21.5 20.31 21.5 18.24V18.05C21.5 17.5 21.05 17.05 20.5 17.05H19.63C18.67 17.05 17.75 16.46 17.5 15.53C17.29 14.77 17.54 14.04 18.04 13.55C18.41 13.17 18.92 12.95 19.48 12.95ZM14 12.75H7C6.59 12.75 6.25 12.41 6.25 12C6.25 11.59 6.59 11.25 7 11.25H14C14.41 11.25 14.75 11.59 14.75 12C14.75 12.41 14.41 12.75 14 12.75Z" fill="#919191"/>
</svg>`;

// Import USDC icon SVG
const usdcIconSvg = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.50041 16.4288C12.7978 16.4288 16.2546 12.8942 16.2546 8.50001C16.2546 4.10586 12.7978 0.571198 8.50041 0.571198C4.20303 0.571198 0.746216 4.10586 0.746216 8.50001C0.746216 12.8942 4.20303 16.4288 8.50041 16.4288Z" fill="#2775CA"/>
<path d="M10.6328 9.75514C10.6328 8.59912 9.95434 8.20268 8.59736 8.03697C7.62808 7.90455 7.43423 7.64053 7.43423 7.17828C7.43423 6.71603 7.75758 6.41869 8.4035 6.41869C8.98507 6.41869 9.30842 6.61691 9.4697 7.11247C9.50227 7.21158 9.5992 7.27739 9.69613 7.27739H10.2133C10.3428 7.27739 10.4398 7.17828 10.4398 7.04586V7.01256C10.3103 6.28549 9.72869 5.72413 8.98584 5.65832V4.86544C8.98584 4.73303 8.88892 4.63392 8.72763 4.60141H8.24299C8.1135 4.60141 8.01657 4.70052 7.98478 4.86544V5.62502C7.0155 5.75743 6.40137 6.4179 6.40137 7.24408C6.40137 8.3343 7.04729 8.76404 8.40428 8.92896C9.30919 9.09388 9.59997 9.2921 9.59997 9.82095C9.59997 10.3498 9.14791 10.7129 8.53377 10.7129C7.69399 10.7129 7.40321 10.3498 7.30628 9.85425C7.27372 9.72184 7.17679 9.65603 7.07986 9.65603H6.53087C6.40137 9.65603 6.30444 9.75514 6.30444 9.88755V9.92085C6.43394 10.747 6.95037 11.3417 8.01657 11.5066V12.2995C8.01657 12.4319 8.1135 12.531 8.27478 12.5635H8.75942C8.88892 12.5635 8.98584 12.4644 9.01764 12.2995V11.5066C9.98613 11.3409 10.6328 10.6471 10.6328 9.75514Z" fill="white"/>
<path d="M6.85257 13.224C4.33245 12.2987 3.03983 9.42451 3.97731 6.88095C4.46195 5.49341 5.52815 4.4365 6.85257 3.94094C6.98206 3.87514 7.04642 3.77603 7.04642 3.61031V3.14806C7.04642 3.01565 6.98206 2.91654 6.85257 2.88403C6.82 2.88403 6.75564 2.88403 6.72307 2.91733C3.65396 3.90844 1.97363 7.24488 2.9429 10.3839C3.52447 12.2337 4.91402 13.6545 6.72307 14.2492C6.85257 14.315 6.98129 14.2492 7.01385 14.1168C7.04642 14.0835 7.04642 14.051 7.04642 13.9844V13.5221C7.04642 13.4222 6.94949 13.2906 6.85257 13.224ZM10.2768 2.91654C10.1473 2.85073 10.0186 2.91654 9.98603 3.04895C9.95347 3.08225 9.95347 3.11476 9.95347 3.18136V3.64361C9.95347 3.77602 10.0504 3.90764 10.1473 3.97425C12.6674 4.89954 13.9601 7.77374 13.0226 10.3173C12.5379 11.7048 11.4717 12.7618 10.1473 13.2573C10.0178 13.3231 9.95347 13.4222 9.95347 13.5879V14.0502C9.95347 14.1826 10.0178 14.2817 10.1473 14.3142C10.1799 14.3142 10.2442 14.3142 10.2768 14.2809C13.3459 13.2898 15.0263 9.95337 14.057 6.81435C13.4754 4.93205 12.0541 3.5112 10.2768 2.91654Z" fill="white"/>
</svg>`;

// Import add-circle icon SVG
const addCircleIconSvg = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.9998 30.3334C8.09317 30.3334 1.6665 23.9067 1.6665 16.0001C1.6665 8.09342 8.09317 1.66675 15.9998 1.66675C23.9065 1.66675 30.3332 8.09342 30.3332 16.0001C30.3332 23.9067 23.9065 30.3334 15.9998 30.3334ZM15.9998 3.66675C9.19984 3.66675 3.6665 9.20008 3.6665 16.0001C3.6665 22.8001 9.19984 28.3334 15.9998 28.3334C22.7998 28.3334 28.3332 22.8001 28.3332 16.0001C28.3332 9.20008 22.7998 3.66675 15.9998 3.66675Z" fill="#888888"/>
<path d="M21.3332 17H10.6665C10.1198 17 9.6665 16.5467 9.6665 16C9.6665 15.4533 10.1198 15 10.6665 15H21.3332C21.8798 15 22.3332 15.4533 22.3332 16C22.3332 16.5467 21.8798 17 21.3332 17Z" fill="#888888"/>
<path d="M16 22.3334C15.4533 22.3334 15 21.8801 15 21.3334V10.6667C15 10.1201 15.4533 9.66675 16 9.66675C16.5467 9.66675 17 10.1201 17 10.6667V21.3334C17 21.8801 16.5467 22.3334 16 22.3334Z" fill="#888888"/>
</svg>`;

// Import padlock icon SVG
const padlockIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24" id="padlock">
  <path d="M17,9V7c0-2.8-2.2-5-5-5S7,4.2,7,7v2c-1.7,0-3,1.3-3,3v7c0,1.7,1.3,3,3,3h10c1.7,0,3-1.3,3-3v-7C20,10.3,18.7,9,17,9z M9,7
	c0-1.7,1.3-3,3-3s3,1.3,3,3v2H9V7z" fill="#767676"></path>
</svg>`;

// Import arrow-right icon SVG
const arrowRightIconSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M13.6668 8.00008H2.3335" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M10.6665 5L13.6665 8L10.6665 11" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Import copy icon SVG
const copyIconSvg = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.83366 8.02502V10.475C9.83366 12.5167 9.01699 13.3334 6.97533 13.3334H4.52533C2.48366 13.3334 1.66699 12.5167 1.66699 10.475V8.02502C1.66699 5.98335 2.48366 5.16669 4.52533 5.16669H6.97533C9.01699 5.16669 9.83366 5.98335 9.83366 8.02502Z" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M13.3337 4.52502V6.97502C13.3337 9.01669 12.517 9.83335 10.4753 9.83335H9.83366V8.02502C9.83366 5.98335 9.01699 5.16669 6.97533 5.16669H5.16699V4.52502C5.16699 2.48335 5.98366 1.66669 8.02533 1.66669H10.4753C12.517 1.66669 13.3337 2.48335 13.3337 4.52502Z" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

interface OrderCardFlowProps {
  onClose: () => void;
  onGetStarted?: () => void;
}

const OrderCardFlow: React.FC<OrderCardFlowProps> = ({ onClose, onGetStarted }) => {
  const [isWalletPopupVisible, setIsWalletPopupVisible] = useState(false);
  const popupAnimation = useRef(new Animated.Value(0)).current;
  const [fontsLoaded, fontError] = useFonts({
    'RockSalt-Regular': require('../../../assets/fonts/RockSalt-Regular.ttf'),
  });

  useEffect(() => {
    if (fontError) {
      console.error("Font loading error:", fontError);
    }
  }, [fontError]);

  const toggleWalletPopup = () => {
    if (isWalletPopupVisible) {
      // Hide popup with quick fade out
      Animated.parallel([
        Animated.timing(popupAnimation, {
          toValue: 0,
          duration: 150, // Faster close animation
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsWalletPopupVisible(false);
      });
    } else {
      // Show popup with spring animation
      setIsWalletPopupVisible(true);
      Animated.spring(popupAnimation, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  };

  const walletAddress = 'Oxf235..6h92F'; // This would come from your wallet API

  const popupTranslateY = popupAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [200, 0],
  });

  const popupOpacity = popupAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Get your</Text>
            <Text style={styles.zerocardText}>Zerocard</Text>
          </View>
          <Text style={styles.descriptionText}>
            Experience seamless payments and exclusive rewards with your Zerocard
          </Text>
        </View>

        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <SvgXml xml={closeIconSvg} width={24} height={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.orderFlowContainer}>
        {/* What we need from you section */}
        <SquircleView
          style={styles.requirementsContainer}
          squircleParams={{
            cornerRadius: 20,
            cornerSmoothing: 1.0,
            fillColor: '#ECECEC',
          }}>
          <View style={styles.requirementsContent}>
            <Text style={styles.requirementsTitle}>What we need from you</Text>

            <View style={styles.requirementItem}>
                <View style={styles.requirementDot} />
                <Text style={styles.requirementText}>Shipping address</Text>
            </View>

            <View style={styles.requirementItem}>
                <View style={styles.requirementDot} />
                <Text style={styles.requirementText}>Identity Verification</Text>
            </View>
          </View>
        </SquircleView>

        {/* Wallet balance section */}
        <SquircleView
          style={styles.walletContainer}
          squircleParams={{
            cornerRadius: 20,
            cornerSmoothing: 1.0,
            fillColor: '#ECECEC',
          }}>
          <View style={styles.walletContent}>
            <View style={styles.walletInfoContainer}>
              <View style={styles.walletHeaderRow}>
                <View style={styles.walletTitleContainer}>
                  <View style={styles.walletIconContainer}>
                    <SvgXml xml={walletIconSvg} width={24} height={24} />
                  </View>
                  <Text style={styles.walletTitle}>Wallet balance</Text>
                </View>

                <View style={styles.walletBalanceContainer}>
                  <SvgXml xml={usdcIconSvg} width={16} height={16} />
                  <Text style={styles.walletBalanceText}>0 USDC</Text>
                </View>
              </View>

              <Text style={styles.walletMessage}>
                You need to have at least 7 USDC in your wallet to create your card
              </Text>
            </View>

            <TouchableOpacity style={styles.loadWalletButton} onPress={toggleWalletPopup}>
              {isWalletPopupVisible ? (
                <>
                  <SvgXml xml={closeIconSvg} width={16} height={16} />
                  <Text style={styles.loadWalletText}>Close</Text>
                </>
              ) : (
                <>
                  <SvgXml xml={addCircleIconSvg} width={16} height={16} />
                  <Text style={styles.loadWalletText}>Load wallet</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SquircleView>

        {/* Get Zero Button and Encryption text */}
        <View style={styles.getZeroContainer}>
          <TouchableOpacity style={styles.getZeroButton} onPress={onGetStarted}>
            <Text style={styles.getZeroText}>Get Zero</Text>
            <SvgXml xml={arrowRightIconSvg} width={16} height={16} />
          </TouchableOpacity>

          <View style={styles.encryptionContainer}>
            <SvgXml xml={padlockIconSvg} width={14} height={14} />
            <Text style={styles.encryptionText}>Protected by end-to-end encryption</Text>
          </View>
        </View>

        {/* Wallet Address Popup */}
        {isWalletPopupVisible && (
          <Animated.View
            style={[
              styles.walletPopupContainer,
              {
                transform: [{ translateY: popupTranslateY }, { rotate: '3.34deg' }],
                opacity: popupOpacity,
              },
            ]}>
            <View style={styles.walletImageContainer}>
              <QRCode value={walletAddress} size={130} backgroundColor="#ECECEC" color="#000000" />
            </View>

            <View style={styles.walletAddressContainer}>
              <Text style={styles.walletAddressText}>{walletAddress}</Text>
              <View style={styles.walletAddressDivider} />
              <TouchableOpacity style={styles.copyButton}>
                <SvgXml xml={copyIconSvg} width={16} height={16} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  contentContainer: {
    paddingTop: 36,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 0,
    gap: 34,
  },
  headerContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  titleText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 29,
    color: '#000000',
  },
  zerocardText: {
    fontFamily: 'RockSalt-Regular',
    fontWeight: '400',
    fontSize: 24,
    lineHeight: 42,
    color: '#000000',
  },
  descriptionText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 17,
    color: '#767676',
  },
  closeButton: {
    width: 24,
    height: 24,
  },
  orderFlowContainer: {
    marginTop: 24,
    flexDirection: 'column',
    gap: 12,
  },
  requirementsContainer: {
    width: '100%',
  },
  requirementsContent: {
    padding: 24,
    gap: 16,
  },
  requirementsTitle: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#767676',
  },
  requirementsList: {
    flexDirection: 'column',
    gap: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#C2C2C2',
  },
  requirementText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: '#000000',
  },
  walletContainer: {
    width: '100%',
  },
  walletContent: {
    padding: 16,
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 12,
  },
  walletInfoContainer: {
    flexDirection: 'column',
    gap: 10,
    alignSelf: 'stretch',
  },
  walletHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  walletTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletIconContainer: {
    width: 24,
    height: 24,
  },
  walletTitle: {
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 19,
    color: '#121212',
  },
  walletBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  walletBalanceText: {
    fontFamily: 'SF Pro Display',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 19,
    color: '#C9252D',
  },
  walletMessage: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 17,
    color: '#767676',
    alignSelf: 'stretch',
    marginTop: 2,
  },
  loadWalletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    paddingHorizontal: 12,
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    alignSelf: 'flex-end',
  },
  loadWalletText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 17,
    color: '#6A6A6A',
  },
  getZeroContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 86,
    gap: 16,
    alignSelf: 'center',
  },
  getZeroButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
    backgroundColor: '#40FF00',
    borderRadius: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 11,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  getZeroText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 17,
    textAlign: 'center',
    color: '#000000',
  },
  encryptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  encryptionText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 14,
    textAlign: 'center',
    color: '#767676',
  },
  walletPopupContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 8,
    gap: 5,
    width: 167,
    position: 'absolute',
    right: 12,
    bottom: 235,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderRadius: 12,
    elevation: 2,
    zIndex: 100,
  },
  walletImageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    width: '100%',
    height: 151,
    backgroundColor: '#ECECEC',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0.5,
    },
    shadowOpacity: 0.05,
    shadowRadius: 0.5,
    borderRadius: 9,
  },
  walletImage: {
    width: 134,
    height: 135,
    backgroundColor: '#D9D9D9',
    borderRadius: 9,
  },
  walletAddressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    paddingVertical: 7,
    gap: 4,
    width: '100%',
    height: 32,
    backgroundColor: '#ECECEC',
    borderRadius: 9,
  },
  walletAddressText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 17,
    textAlign: 'center',
    letterSpacing: 0,
    color: '#696969',
  },
  copyButton: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletAddressDivider: {
    width: 1,
    height: 17,
    borderWidth: 0.5,
    borderColor: '#A0A0A0',
  },
});

export default OrderCardFlow;
