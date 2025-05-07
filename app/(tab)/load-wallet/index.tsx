import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  PixelRatio,
  Image,
  Modal,
  Dimensions,
  Share,
  Platform,
  LogBox,
  AppState,
  AppStateStatus,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddMoney } from '../../../components/features/add-money/AddMoney';
import BetaToast from '../../../components/toasts/BetaToast';
import { useRouter, useFocusEffect } from 'expo-router';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { SvgXml } from 'react-native-svg';
import * as FileSystem from 'expo-file-system';
import QRCode from 'react-native-qrcode-svg';
import * as ScreenCapture from 'expo-screen-capture';
import * as MediaLibrary from 'expo-media-library';
import { useUserWalletAddress } from '../../../hooks/useUserWalletAddress';

// Disable yellow box warnings for dev
LogBox.ignoreLogs(['ViewShot']);

// SVG assets
const usdcSvg = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.50041 16.4288C12.7978 16.4288 16.2546 12.8942 16.2546 8.50001C16.2546 4.10586 12.7978 0.571198 8.50041 0.571198C4.20303 0.571198 0.746216 4.10586 0.746216 8.50001C0.746216 12.8942 4.20303 16.4288 8.50041 16.4288Z" fill="#2775CA"/>
<path d="M10.6328 9.75514C10.6328 8.59912 9.95434 8.20268 8.59736 8.03697C7.62808 7.90455 7.43423 7.64053 7.43423 7.17828C7.43423 6.71603 7.75758 6.41869 8.4035 6.41869C8.98507 6.41869 9.30842 6.61691 9.4697 7.11247C9.50227 7.21158 9.5992 7.27739 9.69613 7.27739H10.2133C10.3428 7.27739 10.4398 7.17828 10.4398 7.04586V7.01256C10.3103 6.28549 9.72869 5.72413 8.98584 5.65832V4.86544C8.98584 4.73303 8.88892 4.63392 8.72763 4.60141H8.24299C8.1135 4.60141 8.01657 4.70052 7.98478 4.86544V5.62502C7.0155 5.75743 6.40137 6.4179 6.40137 7.24408C6.40137 8.3343 7.04729 8.76404 8.40428 8.92896C9.30919 9.09388 9.59997 9.2921 9.59997 9.82095C9.59997 10.3498 9.14791 10.7129 8.53377 10.7129C7.69399 10.7129 7.40321 10.3498 7.30628 9.85425C7.27372 9.72184 7.17679 9.65603 7.07986 9.65603H6.53087C6.40137 9.65603 6.30444 9.75514 6.30444 9.88755V9.92085C6.43394 10.747 6.95037 11.3417 8.01657 11.5066V12.2995C8.01657 12.4319 8.1135 12.531 8.27478 12.5635H8.75942C8.88892 12.5635 8.98584 12.4644 9.01764 12.2995V11.5066C9.98613 11.3409 10.6328 10.6471 10.6328 9.75514Z" fill="white"/>
<path d="M6.85257 13.224C4.33245 12.2987 3.03983 9.42451 3.97731 6.88095C4.46195 5.49341 5.52815 4.4365 6.85257 3.94094C6.98206 3.87514 7.04642 3.77603 7.04642 3.61031V3.14806C7.04642 3.01565 6.98206 2.91654 6.85257 2.88403C6.82 2.88403 6.75564 2.88403 6.72307 2.91733C3.65396 3.90844 1.97363 7.24488 2.9429 10.3839C3.52447 12.2337 4.91402 13.6545 6.72307 14.2492C6.85257 14.315 6.98129 14.2492 7.01385 14.1168C7.04642 14.0835 7.04642 14.051 7.04642 13.9844V13.5221C7.04642 13.4222 6.94949 13.2906 6.85257 13.224ZM10.2768 2.91654C10.1473 2.85073 10.0186 2.91654 9.98603 3.04895C9.95347 3.08225 9.95347 3.11476 9.95347 3.18136V3.64361C9.95347 3.77602 10.0504 3.90764 10.1473 3.97425C12.6674 4.89954 13.9601 7.77374 13.0226 10.3173C12.5379 11.7048 11.4717 12.7618 10.1473 13.2573C10.0178 13.3231 9.95347 13.4222 9.95347 13.5879V14.0502C9.95347 14.1826 10.0178 14.2817 10.1473 14.3142C10.1799 14.3142 10.2442 14.3142 10.2768 14.2809C13.3459 13.2898 15.0263 9.95337 14.057 6.81435C13.4754 4.93205 12.0541 3.5112 10.2768 2.91654Z" fill="white"/>
</svg>`;

// Info wallet icon
const infoWalletSvg = `<svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.50675 15.16C8.08675 15.16 7.67341 15.02 7.34675 14.74L6.29341 13.84C6.18674 13.7467 5.92008 13.6533 5.78008 13.6533H4.61341C3.62674 13.6533 2.82674 12.8533 2.82674 11.8667V10.7267C2.82674 10.5867 2.73341 10.32 2.64674 10.22L1.74008 9.15332C1.19341 8.50665 1.19341 7.49332 1.74008 6.83999L2.64674 5.77332C2.73341 5.67332 2.82674 5.40665 2.82674 5.26665V4.13332C2.82674 3.14665 3.62674 2.34665 4.61341 2.34665H5.76675C5.90675 2.34665 6.16675 2.24665 6.28008 2.15332L7.33341 1.25332C7.98675 0.699985 9.00674 0.699985 9.66008 1.25332L10.7134 2.15332C10.8201 2.24665 11.0934 2.33998 11.2334 2.33998H12.3667C13.3534 2.33998 14.1534 3.13998 14.1534 4.12665V5.25998C14.1534 5.39998 14.2534 5.65998 14.3467 5.77332L15.2467 6.82665C15.8067 7.48665 15.8001 8.50665 15.2467 9.15332L14.3467 10.2067C14.2534 10.32 14.1601 10.58 14.1601 10.72V11.8533C14.1601 12.84 13.3601 13.64 12.3734 13.64H11.2401C11.1001 13.64 10.8401 13.74 10.7201 13.8333L9.66675 14.7333C9.34008 15.02 8.92008 15.16 8.50675 15.16ZM4.61341 3.34665C4.18008 3.34665 3.82674 3.69998 3.82674 4.13332V5.26665C3.82674 5.64665 3.65341 6.12665 3.40674 6.41998L2.50008 7.48665C2.27341 7.75998 2.27341 8.23999 2.50008 8.50665L3.40008 9.56665C3.64008 9.83999 3.82008 10.34 3.82008 10.72V11.86C3.82008 12.2933 4.17341 12.6467 4.60674 12.6467H5.76675C6.14008 12.6467 6.63341 12.8267 6.92675 13.0733L7.98674 13.98C8.26008 14.2133 8.74008 14.2133 9.01341 13.98L10.0667 13.08C10.3667 12.8267 10.8534 12.6533 11.2267 12.6533H12.3601C12.7934 12.6533 13.1467 12.3 13.1467 11.8667V10.7333C13.1467 10.36 13.3267 9.87332 13.5734 9.57332L14.4801 8.51332C14.7134 8.23999 14.7134 7.75998 14.4801 7.48665L13.5801 6.43332C13.3267 6.13332 13.1534 5.64665 13.1534 5.27332V4.13332C13.1534 3.69998 12.8001 3.34665 12.3667 3.34665H11.2334C10.8534 3.34665 10.3601 3.16665 10.0667 2.91998L9.00675 2.01332C8.73341 1.77998 8.26008 1.77998 7.98008 2.01332L6.93341 2.91998C6.63341 3.16665 6.14675 3.34665 5.76675 3.34665H4.61341Z" fill="#292D32"/>
<path d="M8.50016 11.2467C8.1335 11.2467 7.8335 10.9467 7.8335 10.58C7.8335 10.2133 8.12683 9.91333 8.50016 9.91333C8.86683 9.91333 9.16683 10.2133 9.16683 10.58C9.16683 10.9467 8.8735 11.2467 8.50016 11.2467Z" fill="#292D32"/>
<path d="M8.5 9.14665C8.22667 9.14665 8 8.91998 8 8.64665V5.41998C8 5.14665 8.22667 4.91998 8.5 4.91998C8.77333 4.91998 9 5.14665 9 5.41998V8.63998C9 8.91998 8.78 9.14665 8.5 9.14665Z" fill="#292D32"/>
</svg>`;

// ZeroCard Logo from assets
const zeroCardLogoSvg = `<svg width="37" height="28" viewBox="0 0 37 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_11_69)">
<path d="M21.8123 -14.4443C26.8711 -14.4443 36.5966 -13.3071 36.5966 -0.444336C36.5966 12.4576 26.8711 13.5557 21.8123 13.5557H15.7338C10.675 13.5557 0.949524 12.4576 0.949524 -0.444336C0.949524 -13.3071 10.675 -14.4443 15.7338 -14.4443H21.8123ZM23.8515 6.53606C27.8123 6.53606 28.7927 3.12429 28.7927 -0.444336C28.7927 -3.97375 27.8123 -7.38551 23.8515 -7.38551H13.6946C9.73384 -7.38551 8.75345 -3.97375 8.75345 -0.444336C8.75345 3.12429 9.73384 6.53606 13.6946 6.53606H23.8515Z" fill="black"/>
<path d="M21.8123 14.9674C26.8711 14.9674 36.5966 16.1047 36.5966 28.9674C36.5966 41.8694 26.8711 42.9674 21.8123 42.9674H15.7338C10.675 42.9674 0.949524 41.8694 0.949524 28.9674C0.949524 16.1047 10.675 14.9674 15.7338 14.9674H21.8123ZM23.8515 35.9478C27.8123 35.9478 28.7927 32.536 28.7927 28.9674C28.7927 25.438 27.8123 22.0262 23.8515 22.0262H13.6946C9.73384 22.0262 8.75345 25.438 8.75345 28.9674C8.75345 32.536 9.73384 35.9478 13.6946 35.9478H23.8515Z" fill="black"/>
<path d="M21.8122 -14.4443C26.871 -14.4443 36.5965 -13.3071 36.5965 -0.444336C36.5965 12.4576 26.871 13.5557 21.8122 13.5557H15.7338C10.675 13.5557 0.949463 12.4576 0.949463 -0.444336C0.949463 -13.3071 10.675 -14.4443 15.7338 -14.4443H21.8122ZM23.8514 6.53606C27.8122 6.53606 28.7926 3.12429 28.7926 -0.444336C28.7926 -3.97375 27.8122 -7.38551 23.8514 -7.38551H13.6946C9.73378 -7.38551 8.75339 -3.97375 8.75339 -0.444336C8.75339 3.12429 9.73378 6.53606 13.6946 6.53606H23.8514Z" fill="black"/>
<path d="M21.8122 14.9673C26.871 14.9673 36.5965 16.1045 36.5965 28.9673C36.5965 41.8692 26.871 42.9673 21.8122 42.9673H15.7338C10.675 42.9673 0.949463 41.8692 0.949463 28.9673C0.949463 16.1045 10.675 14.9673 15.7338 14.9673H21.8122ZM23.8514 35.9477C27.8122 35.9477 28.7926 32.5359 28.7926 28.9673C28.7926 25.4379 27.8122 22.0261 23.8514 22.0261H13.6946C9.73378 22.0261 8.75339 25.4379 8.75339 28.9673C8.75339 32.5359 9.73378 35.9477 13.6946 35.9477H23.8514Z" fill="black"/>
</g>
<defs>
<clipPath id="clip0_11_69">
<rect width="37" height="28" fill="white"/>
</clipPath>
</defs>
</svg>`;

export default function LoadWalletScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const viewShotRef = useRef<View>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [viewShotOpacity, setViewShotOpacity] = useState(0);
  const pixelRatio = PixelRatio.get();
  const [lastScreenshotTime, setLastScreenshotTime] = useState(0);
  const appState = useRef(AppState.currentState);
  
  // Get the actual wallet address
  const walletAddress = useUserWalletAddress();

  const handleFundedWallet = () => {
    router.push('/(tab)/home');
  };

  const handleSkip = () => {
    router.push('/(tab)/home');
  };

  const captureScreenshot = useCallback(async () => {
    if (isCapturing) return;

    setIsCapturing(true);

    try {
      // Temporarily make ViewShot visible for capture
      setViewShotOpacity(1);

      // Wait for the opacity change to take effect
      await new Promise((resolve) => setTimeout(resolve, 50));

      if (viewShotRef.current) {
        try {
          const cssWidth = 402;
          const cssHeight = 599;

          const captureOptions = {
            format: 'jpg' as 'jpg',
            quality: 0.9,
            result: 'data-uri' as 'data-uri',
            width: cssWidth * pixelRatio,
            height: cssHeight * pixelRatio,
          };

          const uri = await captureRef(viewShotRef, captureOptions);
          setCapturedImage(uri);
          setShowModal(true);
        } catch (error) {
          console.error('Failed to capture screenshot:', error);
        }
      }
    } finally {
      // Hide ViewShot again
      setViewShotOpacity(0);
      setIsCapturing(false);
    }
  }, [pixelRatio, isCapturing]);

  const handleShare = async () => {
    try {
      if (capturedImage) {
        // Create a temporary file path
        const fileUri = FileSystem.documentDirectory + 'zerocard-wallet.jpg';

        // Extract base64 data from data URI
        const base64Data = capturedImage.split(',')[1];

        if (!base64Data) {
          console.error('Failed to extract base64 data from image URI');
          return;
        }

        // Write to filesystem
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Share the image with updated message about Zerocard's functionality
        const result = await Share.share({
          url: Platform.OS === 'ios' ? fileUri : `file://${fileUri}`,
          title: '💳 ZeroCard - Spend Crypto Like Cash!',
          message:
            '💰 My wallet is loaded and ready! With ZeroCard I can spend crypto like cash with my physical card. The future of payments is here!',
        });

        if (result.action === Share.sharedAction) {
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error('Error during share process:', error);
    }
  };

  const handleSave = async () => {
    try {
      // Request permissions only when saving
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'ZeroCard needs permission to save images to your gallery',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => {} },
          ]
        );
        return;
      }

      if (!capturedImage) return;

      // Create a file from the data URI
      const fileUri = FileSystem.documentDirectory + 'zerocard-wallet.jpg';
      const base64Data = capturedImage.split(',')[1];

      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Save the image to the media library
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync('ZeroCard', asset, false);

      Alert.alert('Success', 'Wallet address saved to your gallery');
      setShowModal(false);
    } catch (error) {
      console.error('Error saving image to gallery:', error);
      Alert.alert('Error', 'Failed to save image to gallery');
    }
  };

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, []);

  // Setup to detect system screenshot events
  useEffect(() => {
    const subscription = ScreenCapture.addScreenshotListener(() => {
      const now = Date.now();
      if (now - lastScreenshotTime < 1000) return;

      setLastScreenshotTime(now);
      captureScreenshot();
    });

    return () => subscription.remove();
  }, [captureScreenshot, lastScreenshotTime]);

  // When component focuses
  useFocusEffect(useCallback(() => {}, []));

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Beta Toast Notification */}
      <BetaToast visible={true} onDismiss={() => {}} />

      {/* ViewShot Component - This is what will be captured */}
      <ViewShot
        ref={viewShotRef}
        options={{
          format: 'jpg',
          quality: 0.9,
        }}
        style={[styles.viewShotContainer, { opacity: viewShotOpacity }]}>
        {/* Content to be captured in screenshot */}
        <View style={styles.screenshotContent}>
          {/* Main content container to match CSS spec */}
          <View style={styles.mainContentContainer}>
            <View style={styles.contentFrame}>
              {/* Supported tokens */}
              <View style={styles.tokenSelector}>
                <Text style={styles.tokenSelectorText}>Supported tokens</Text>
                <View style={styles.tokenBadge}>
                  <SvgXml xml={usdcSvg} width={24} height={18} />
                  <Text style={styles.usdcText}>USDC</Text>
                </View>
              </View>

              {/* QR Code Container */}
              <View style={styles.qrCodeContainer}>
                <QRCode
                  value={walletAddress || ''}
                  size={250}
                  color="#000000"
                  backgroundColor="#ffffff"
                />
              </View>

              {/* Caution info container */}
              <View style={styles.cautionContainer}>
                <SvgXml xml={infoWalletSvg} width={16} height={16} />
                <Text style={styles.cautionText}>
                  Only send USDC on Base to this address, it is only enabled to hold ERC20 tokens on
                  Base
                </Text>
              </View>
            </View>
          </View>

          {/* Branding container at bottom */}
          <View style={styles.brandingContainer}>
            <SvgXml xml={zeroCardLogoSvg} width={37} height={28} />
            <View style={styles.divider} />
            <Text style={styles.brandingText}>This wallet is provided by{'\n'}Zerocard</Text>
          </View>
        </View>
      </ViewShot>

      {/* The actual AddMoney component - not in the screenshot */}
      <View style={styles.addMoneyWrapper}>
        <AddMoney onFundedWallet={handleFundedWallet} onSkip={handleSkip} />
      </View>

      {/* Modal for displaying captured screenshot */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Your Wallet Screenshot</Text>

            {capturedImage && (
              <Image
                source={{ uri: capturedImage }}
                style={styles.screenshotImage}
                resizeMode="contain"
              />
            )}

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.shareButton]}
                onPress={handleShare}>
                <Text style={styles.modalButtonText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  addMoneyWrapper: {
    flex: 1,
    width: '100%',
  },
  viewShotContainer: {
    position: 'absolute',
    width: 402,
    height: 599,
    backgroundColor: '#F7F7F7',
    borderRadius: 20,
    zIndex: 1,
    opacity: 0,
    left: '50%',
    top: '50%',
    marginLeft: -201,
    marginTop: -300,
  },
  screenshotContent: {
    position: 'relative',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContentContainer: {
    position: 'absolute',
    width: 354,
    left: '50%',
    top: '50%',
    transform: [{ translateX: -177 }, { translateY: -266.5 }],
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    gap: 32,
  },
  contentFrame: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 0,
    gap: 8,
    width: 329,
  },
  tokenSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 16,
    gap: 10,
    width: '100%',
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1,
    borderRadius: 1000,
    overflow: 'hidden',
  },
  tokenSelectorText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 23,
    textAlign: 'center',
    letterSpacing: -0.42,
    color: '#121212',
  },
  tokenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    gap: 4,
  },
  usdcText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 23,
    textAlign: 'center',
    letterSpacing: -0.42,
    color: '#121212',
  },
  qrCodeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 8,
    gap: 10,
    width: '100%',
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 1,
    marginVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cautionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 8,
    width: '100%',
    backgroundColor: '#ECECEC',
    borderRadius: 20,
    overflow: 'hidden',
  },
  cautionText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 16.8,
    color: '#484848',
    flex: 1,
  },
  brandingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    gap: 24,
    position: 'absolute',
    bottom: 40,
  },
  divider: {
    height: 24,
    borderWidth: 1,
    borderColor: '#B2B2B2',
  },
  brandingText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 16.8,
    color: '#121212',
    textAlign: 'left',
    maxWidth: 190,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#f7f7f7',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#121212',
  },
  screenshotImage: {
    width: '100%',
    height: 400,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    minWidth: '28%',
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: '#007AFF',
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#121212',
    fontWeight: '600',
  },
});
