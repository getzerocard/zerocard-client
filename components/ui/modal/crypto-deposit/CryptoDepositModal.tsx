import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { SquircleView } from 'react-native-figma-squircle';
import { SvgXml } from 'react-native-svg';

import useCryptoDepositListener from '../../../../components/context/CryptoDepositContext';
import BlurBackground from '../../../../components/ui/layout/BlurBackground';

interface CryptoDepositModalProps {
  position?: { top: number; left: number };
}

const CryptoDepositModal: React.FC<CryptoDepositModalProps> = ({ position }) => {
  const { isModalVisible, currentTransaction, setIsModalVisible } = useCryptoDepositListener();
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(100)).current;
  const { width } = Dimensions.get('window');

  React.useEffect(() => {
    if (isModalVisible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
        Animated.timing(translateY, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
      ]).start();
    }
  }, [isModalVisible, opacity, translateY]);

  // USDC SVG
  const usdcSvg = `<svg width="48" height="48" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.50041 16.4288C12.7978 16.4288 16.2546 12.8942 16.2546 8.50001C16.2546 4.10586 12.7978 0.571198 8.50041 0.571198C4.20303 0.571198 0.746216 4.10586 0.746216 8.50001C0.746216 12.8942 4.20303 16.4288 8.50041 16.4288Z" fill="#2775CA"/>
<path d="M10.6328 9.75514C10.6328 8.59912 9.95434 8.20268 8.59736 8.03697C7.62808 7.90455 7.43423 7.64053 7.43423 7.17828C7.43423 6.71603 7.75758 6.41869 8.4035 6.41869C8.98507 6.41869 9.30842 6.61691 9.4697 7.11247C9.50227 7.21158 9.5992 7.27739 9.69613 7.27739H10.2133C10.3428 7.27739 10.4398 7.17828 10.4398 7.04586V7.01256C10.3103 6.28549 9.72869 5.72413 8.98584 5.65832V4.86544C8.98584 4.73303 8.88892 4.63392 8.72763 4.60141H8.24299C8.1135 4.60141 8.01657 4.70052 7.98478 4.86544V5.62502C7.0155 5.75743 6.40137 6.4179 6.40137 7.24408C6.40137 8.3343 7.04729 8.76404 8.40428 8.92896C9.30919 9.09388 9.59997 9.2921 9.59997 9.82095C9.59997 10.3498 9.14791 10.7129 8.53377 10.7129C7.69399 10.7129 7.40321 10.3498 7.30628 9.85425C7.27372 9.72184 7.17679 9.65603 7.07986 9.65603H6.53087C6.40137 9.65603 6.30444 9.75514 6.30444 9.88755V9.92085C6.43394 10.747 6.95037 11.3417 8.01657 11.5066V12.2995C8.01657 12.4319 8.1135 12.531 8.27478 12.5635H8.75942C8.88892 12.5635 8.98584 12.4644 9.01764 12.2995V11.5066C9.98613 11.3409 10.6328 10.6471 10.6328 9.75514Z" fill="white"/>
<path d="M6.85257 13.224C4.33245 12.2987 3.03983 9.42451 3.97731 6.88095C4.46195 5.49341 5.52815 4.4365 6.85257 3.94094C6.98206 3.87514 7.04642 3.77603 7.04642 3.61031V3.14806C7.04642 3.01565 6.98206 2.91654 6.85257 2.88403C6.82 2.88403 6.75564 2.88403 6.72307 2.91733C3.65396 3.90844 1.97363 7.24488 2.9429 10.3839C3.52447 12.2337 4.91402 13.6545 6.72307 14.2492C6.85257 14.315 6.98129 14.2492 7.01385 14.1168C7.04642 14.0835 7.04642 14.051 7.04642 13.9844V13.5221C7.04642 13.4222 6.94949 13.2906 6.85257 13.224ZM10.2768 2.91654C10.1473 2.85073 10.0186 2.91654 9.98603 3.04895C9.95347 3.08225 9.95347 3.11476 9.95347 3.18136V3.64361C9.95347 3.77602 10.0504 3.90764 10.1473 3.97425C12.6674 4.89954 13.9601 7.77374 13.0226 10.3173C12.5379 11.7048 11.4717 12.7618 10.1473 13.2573C10.0178 13.3231 9.95347 13.4222 9.95347 13.5879V14.0502C9.95347 14.1826 10.0178 14.2817 10.1473 14.3142C10.1799 14.3142 10.2442 14.3142 10.2768 14.2809C13.3459 13.2898 15.0263 9.95337 14.057 6.81435C13.4754 4.93205 12.0541 3.5112 10.2768 2.91654Z" fill="white"/>
</svg>`;

  // Use position prop if provided, otherwise center horizontally
  const positionStyle = position || {
    left: (width - 354) / 2, // Center horizontally (354 is modal width)
    top: 437, // Default top position
  };

  if (!currentTransaction) return null;

  return (
    <Modal
      transparent
      visible={isModalVisible}
      animationType="none"
      onRequestClose={() => setIsModalVisible(false)}>
      <BlurBackground visible={isModalVisible} intensity={40} tint="dark" />

      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setIsModalVisible(false)}>
        <Animated.View
          style={[
            styles.modalAnimatedContainer,
            {
              left: positionStyle.left,
              top: positionStyle.top,
            },
            {
              opacity,
              transform: [{ translateY }],
            },
          ]}>
          <SquircleView
            style={styles.modalContainer}
            squircleParams={{
              cornerSmoothing: 1,
              cornerRadius: 30,
              fillColor: '#F7F7F7',
            }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={styles.modalTouchable}>
              <View style={styles.contentWrapper}>
                {/* Header with icon */}
                <View style={styles.headerIconContainer}>
                  <View style={styles.usdcIconContainer}>
                    {/* USDC icon */}
                    <SvgXml xml={usdcSvg} width={48} height={48} />
                    <View style={styles.usdcIcon}>
                      <Image
                        source={require('../../../../assets/icons/received-icon.png')}
                        style={styles.receivedIcon}
                      />
                    </View>
                  </View>

                  <Text style={styles.headerText}>
                    You just received{' '}
                    <Text style={styles.highlightText}>
                      {currentTransaction.amount} {currentTransaction.currency}
                    </Text>{' '}
                    on <Text style={styles.addressText}>Oxbaed..4g62f</Text>
                  </Text>

                  <View style={styles.timestampContainer}>
                    <Text style={styles.timestampText}>{currentTransaction.timestamp.date}</Text>
                    <Text style={styles.timestampText}>{currentTransaction.timestamp.time}</Text>
                  </View>
                </View>

                {/* Transaction details */}
                <SquircleView
                  style={styles.detailsContainer}
                  squircleParams={{
                    cornerSmoothing: 1,
                    cornerRadius: 20,
                    fillColor: '#FFFFFF',
                  }}>
                  {/* Chain & Network details */}
                  <View style={styles.detailRow}>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Chain</Text>
                      <View style={styles.chainValue}>
                        <Image
                          source={require('../../../../assets/images/base-logo-in-blue.png')}
                          style={styles.chainLogo}
                        />
                        <Text style={styles.detailValue}>{currentTransaction.chain}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.separator} />

                  {/* Amount details */}
                  <View style={styles.detailRow}>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Amount</Text>
                      <Text style={styles.detailValue}>${currentTransaction.amount}</Text>
                    </View>
                  </View>
                </SquircleView>

                {/* Transaction hash button */}
                {currentTransaction.transactionHash && (
                  <SquircleView
                    style={styles.transactionHashButton}
                    squircleParams={{
                      cornerSmoothing: 1,
                      cornerRadius: 1000,
                      fillColor: '#FFFFFF',
                    }}>
                    <View style={styles.hashButtonContent}>
                      <Text style={styles.hashLabel}>Txn Hash</Text>
                      <View style={styles.viewHashContainer}>
                        <Text style={styles.viewHashText}>View basescan</Text>
                        <Ionicons name="open-outline" size={16} color="#7177F9" />
                      </View>
                    </View>
                  </SquircleView>
                )}
              </View>
            </TouchableOpacity>
          </SquircleView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAnimatedContainer: {
    position: 'absolute',
    width: 354,
  },
  modalContainer: {
    width: '100%',
    padding: 0,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  modalTouchable: {
    width: '100%',
  },
  contentWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 24,
    width: '100%',
  },
  headerIconContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    alignSelf: 'stretch',
    width: 306,
  },
  usdcIconContainer: {
    position: 'relative',
    width: 48,
    height: 48,
  },
  usdcIcon: {
    position: 'absolute',
    width: 14,
    height: 14,
    left: 32,
    top: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receivedIcon: {
    width: 16,
    height: 16,
  },
  headerText: {
    fontFamily: 'SF Pro Display',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 24,
    color: '#838383',
    width: 306,
  },
  highlightText: {
    color: '#121212',
  },
  addressText: {
    color: '#121212',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  timestampText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#838383',
    textAlign: 'center',
  },
  detailsContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    height: 'auto',
    width: '100%',
  },
  detailContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    width: '100%',
  },
  detailLabel: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 23,
    color: '#121212',
  },
  chainValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chainLogo: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  detailValue: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 23,
    color: '#121212',
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#E7E7E7',
  },
  transactionHashButton: {
    width: '100%',
  },
  hashButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 16,
    width: '100%',
  },
  hashLabel: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 23,
    color: '#121212',
  },
  viewHashContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewHashText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 23,
    color: '#7177F9',
  },
});

export default CryptoDepositModal;
