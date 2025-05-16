import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { backIconQrSvg } from '../../../constants/icons';

const { width, height } = Dimensions.get('window');
const scannerSize = 312; // Width of the scanning window
const scannerTop = 168; // Top position of the scanning window

export default function QrScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isInitialToggle, setIsInitialToggle] = useState(true);
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    async function getPermissions() {
      const { status } = await requestPermission();
      if (status === 'granted') {
        setTimeout(() => setCameraReady(true), 500);
      }
    }
    getPermissions();
  }, [requestPermission]);

  // Start scan line animation
  useEffect(() => {
    if (permission?.granted && !scanned) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanLineAnim.setValue(0);
    }

    return () => {
      scanLineAnim.setValue(0);
    };
  }, [permission?.granted, scanned, scanLineAnim]);

  const handleBack = () => {
    router.back();
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    setIsTorchOn(false);
    console.log(`QR Code scanned! Type: ${type}, Data: ${data}`);

    try {
      // Assuming the QR code data is in JSON format or can be parsed
      // This is a placeholder implementation - adjust based on your actual QR code data format
      // Example QR code data format: {"cardNumber":"1234567890123456","expDate":"12/25","cvv":"123"}

      let cardData;
      try {
        // Try to parse as JSON first
        cardData = JSON.parse(data);
      } catch (e) {
        // If not JSON, try to parse as a formatted string (e.g., "1234567890123456|12/25|123")
        const dataParts = data.split('|');
        if (dataParts.length >= 3) {
          cardData = {
            cardNumber: dataParts[0],
            expDate: dataParts[1],
            cvv: dataParts[2],
          };
        } else {
          throw new Error('Invalid data format');
        }
      }

      // Validate card data
      const validateCardNumber = (num: string) => /^\d{16}$/.test(num.replace(/\s/g, ''));
      const validateExpDate = (date: string) => /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(date);
      const validateCVV = (cvv: string) => /^\d{3}$/.test(cvv);

      // Clean up the data
      const cleanCardNumber = cardData.cardNumber?.replace(/\s/g, '') || '';
      const cleanExpDate = cardData.expDate || '';
      const cleanCVV = cardData.cvv || '';

      const isValidCardNumber = validateCardNumber(cleanCardNumber);
      const isValidExpDate = validateExpDate(cleanExpDate);
      const isValidCVV = validateCVV(cleanCVV);

      if (isValidCardNumber && isValidExpDate && isValidCVV) {
        // Format card number with spaces for display
        const formattedCardNumber = cleanCardNumber.replace(/(\d{4})/g, '$1 ').trim();

        // Navigate to confirmation screen with the scanned data
        router.push({
          pathname: '/(app)/card-activation/confirmation',
          params: {
            cardNumber: formattedCardNumber,
            expDate: cleanExpDate,
            cvv: cleanCVV,
          },
        });
      } else {
        // If some data is invalid, let the user edit it
        let targetField = 'cardNumber';
        let targetValue = '';

        if (!isValidCardNumber) {
          targetField = 'cardNumber';
          targetValue = cleanCardNumber;
        } else if (!isValidExpDate) {
          targetField = 'expDate';
          targetValue = cleanExpDate;
        } else if (!isValidCVV) {
          targetField = 'cvv';
          targetValue = cleanCVV;
        }

        router.push({
          pathname: '/(app)/card-activation/edit',
          params: {
            field: targetField,
            value: targetValue,
            cardNumber: isValidCardNumber ? cleanCardNumber : '',
            expDate: isValidExpDate ? cleanExpDate : '',
            cvv: isValidCVV ? cleanCVV : '',
          },
        });
      }
    } catch (error) {
      console.error('Error parsing QR code data:', error);
      Alert.alert(
        'Invalid QR Code',
        'The scanned QR code does not contain valid card information. Please try again or enter your card details manually.',
        [
          { text: 'Try Again', onPress: () => setScanned(false) },
          { text: 'Enter Manually', onPress: handleManualEntry },
        ]
      );
    }
  };

  const handleToggleTorch = () => {
    if (isInitialToggle) {
      setIsInitialToggle(false);
      setIsTorchOn(true);
    } else {
      setIsTorchOn((prev) => !prev);
    }
  };

  useEffect(() => {
    return () => {
      if (isTorchOn) setIsTorchOn(false);
    };
  }, [isTorchOn]);

  const handleManualEntry = () => {
    console.log('Navigate to manual entry screen');
    // Navigate to edit screen to input card number
    router.push({
      pathname: '/(app)/card-activation/edit',
      params: {
        field: 'cardNumber',
        value: '',
        cardNumber: '',
        expDate: '',
        cvv: '',
      },
    });
  };

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBack} style={styles.backButtonAbsolute}>
          <SvgXml xml={backIconQrSvg} width={24} height={24} />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Only enable torch toggle when camera is ready
  const canToggleTorch = permission?.granted && cameraReady;

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing={'back'}
        enableTorch={isTorchOn}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay */}
      <View style={styles.overlayTop} />
      <View style={styles.overlayLeft} />
      <View style={styles.overlayRight} />
      <View style={styles.overlayBottom} />

      {/* Scanning Window Borders */}
      <View style={[styles.corner, styles.topLeftCorner]} />
      <View style={[styles.corner, styles.topRightCorner]} />
      <View style={[styles.corner, styles.bottomLeftCorner]} />
      <View style={[styles.corner, styles.bottomRightCorner]} />

      {/* Scanning Animation Line */}
      {permission?.granted && cameraReady && !scanned && (
        <Animated.View
          style={[
            styles.scanLine,
            {
              transform: [
                {
                  translateY: scanLineAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, scannerSize - 2],
                  }),
                },
              ],
            },
          ]}
        />
      )}

      {/* UI Elements */}
      <SafeAreaView style={styles.uiContainer} edges={['top', 'bottom']}>
        <View style={styles.topIconsContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
            <SvgXml xml={backIconQrSvg} width={24} height={24} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleToggleTorch}
            style={styles.iconButton}
            disabled={!canToggleTorch}>
            <Ionicons
              name={isTorchOn ? 'flashlight' : 'flashlight-outline'}
              size={24}
              color={canToggleTorch ? '#FFFFFF' : '#888888'}
            />
          </TouchableOpacity>
        </View>

        {/* Text below scanner */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{`Scan\nQR Code`}</Text>
          <Text style={styles.description}>
            {`Let's get started! Activate your Zerocard and\nenjoy exclusive rewards`}
          </Text>
        </View>

        {/* Manual Entry Button at bottom */}
        <TouchableOpacity style={styles.manualButtonContainer} onPress={handleManualEntry}>
          <Text style={styles.manualButtonText}>Type in card details manually</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black', // Fallback background
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#1f1f1f',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#40FF00',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
  },
  backButtonAbsolute: {
    position: 'absolute',
    top: 60, // Adjust as needed for safe area
    left: 16,
    padding: 8,
    zIndex: 10,
  },
  // --- Overlay Styles ---
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: scannerTop,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayLeft: {
    position: 'absolute',
    top: scannerTop,
    bottom: height - (scannerTop + scannerSize),
    left: 0,
    width: (width - scannerSize) / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayRight: {
    position: 'absolute',
    top: scannerTop,
    bottom: height - (scannerTop + scannerSize),
    right: 0,
    width: (width - scannerSize) / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height - (scannerTop + scannerSize),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  // --- Corner Styles ---
  corner: {
    position: 'absolute',
    width: 51,
    height: 49,
    borderWidth: 8,
    borderColor: '#40FF00',
  },
  topLeftCorner: {
    top: scannerTop - 8,
    left: (width - scannerSize) / 2 - 8,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 24,
  },
  topRightCorner: {
    top: scannerTop - 8,
    right: (width - scannerSize) / 2 - 8,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 24,
  },
  bottomLeftCorner: {
    bottom: height - (scannerTop + scannerSize) - 8,
    left: (width - scannerSize) / 2 - 8,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 24,
  },
  bottomRightCorner: {
    bottom: height - (scannerTop + scannerSize) - 8,
    right: (width - scannerSize) / 2 - 8,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 24,
  },
  // --- UI Element Styles ---
  uiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingBottom: 42,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topIconsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  iconButton: {
    padding: 8,
  },
  textContainer: {
    alignItems: 'flex-start',
    position: 'absolute',
    top: Platform.select({
      ios: scannerTop + scannerSize + 62, // 62px gap on iOS
      android: scannerTop + scannerSize + 92, // 72px gap on Android
      default: scannerTop + scannerSize + 62, // Default fallback
    }),
    left: Platform.select({
      ios: 24,
      android: 32,
      default: 24,
    }),
    right: 24,
    gap: 8,
  },
  title: {
    fontFamily: 'SF Pro Text',
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 38,
    color: '#FFFFFF',
    textAlign: 'left',
  },
  description: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: '#919191',
    textAlign: 'left',
  },
  manualButtonContainer: {
    position: 'absolute',
    bottom: Platform.select({
      ios: 52,
      android: 42,
      default: 42,
    }),
    height: 42,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  manualButtonText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: '#FFFFFF',
  },
  scanLine: {
    position: 'absolute',
    top: scannerTop,
    left: (width - scannerSize) / 2,
    width: scannerSize,
    height: 2,
    backgroundColor: '#40FF00',
    zIndex: 2,
  },
});
