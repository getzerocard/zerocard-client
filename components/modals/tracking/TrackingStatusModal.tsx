import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Platform,
  Animated,
  Share,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';

import BlurBackground from '../../ui/layout/BlurBackground';
import { Button } from '../../ui/Button';

// Define tracking status data structure
type TrackingStatus = 'accepted' | 'picked_up' | 'on_delivery' | 'delivered';
type StatusInfo = {
  title: string;
  date: string;
  time?: string;
  completed: boolean;
  inProgress: boolean;
};

interface TrackingStatusModalProps {
  visible: boolean;
  onClose: () => void;
  estimatedDeliveryDate: string;
  currentStatus: TrackingStatus;
}

const BLINK_DURATION = 1000;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TrackingStatusModal: React.FC<TrackingStatusModalProps> = ({
  visible,
  onClose,
  estimatedDeliveryDate,
  currentStatus,
}) => {
  // Animation values
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const blinkAnimation = useRef(new Animated.Value(0)).current;
  const lineAnimations = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  // Start animations when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Slide in animation
      Animated.spring(slideAnimation, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();

      // Blinking animation for current status
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnimation, {
            toValue: 1,
            duration: BLINK_DURATION / 2,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnimation, {
            toValue: 0.4,
            duration: BLINK_DURATION / 2,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Sequential line animations
      Animated.stagger(
        200,
        lineAnimations.map((anim, index) => {
          const statusOrder: TrackingStatus[] = [
            'accepted',
            'picked_up',
            'on_delivery',
            'delivered',
          ];
          const currentStatusIndex = statusOrder.indexOf(currentStatus);
          const shouldAnimate = index < currentStatusIndex;

          if (shouldAnimate) {
            return Animated.timing(anim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: false, // height/opacity needs this
            });
          }
          return Animated.delay(0);
        })
      ).start();

      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      // Reset animations
      slideAnimation.setValue(0);
      blinkAnimation.setValue(0);
      lineAnimations.forEach((anim) => anim.setValue(0));
    }
  }, [visible, currentStatus]);

  const getStatusInfo = (): Record<TrackingStatus, StatusInfo> => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });
    const formattedTime = today.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const statusOrder: TrackingStatus[] = ['accepted', 'picked_up', 'on_delivery', 'delivered'];
    const currentStatusIndex = statusOrder.indexOf(currentStatus);

    return {
      accepted: {
        title: 'Your Zerocard request accepted',
        date: formattedDate,
        time: formattedTime,
        completed: currentStatusIndex >= 0,
        inProgress: currentStatus === 'accepted',
      },
      picked_up: {
        title: 'Your Zerocard has been picked up by the courier',
        date: formattedDate,
        completed: currentStatusIndex >= 1,
        inProgress: currentStatus === 'picked_up',
      },
      on_delivery: {
        title: 'Your Zerocard is on delivery',
        date: formattedDate,
        completed: currentStatusIndex >= 2,
        inProgress: currentStatus === 'on_delivery',
      },
      delivered: {
        title: 'Your Zerocard has been delivered',
        date: formattedDate,
        completed: currentStatusIndex >= 3,
        inProgress: currentStatus === 'delivered',
      },
    };
  };

  const statuses = getStatusInfo();

  const getShareMessage = () => {
    let message = '';
    switch (currentStatus) {
      case 'accepted':
        message = `My Zerocard request is accepted! Estimated delivery: ${estimatedDeliveryDate}.`;
        break;
      case 'picked_up':
        message = `My Zerocard is picked up! Estimated delivery: ${estimatedDeliveryDate}.`;
        break;
      case 'on_delivery':
        message = `My Zerocard is out for delivery! Arriving around ${estimatedDeliveryDate}.`;
        break;
      case 'delivered':
        message = `My Zerocard arrived! Time to spend crypto like cash!`;
        break;
    }
    return `${message}\n\nWanna spend crypto like cash? Get your Zerocard: zerocard.co`;
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: getShareMessage(), url: 'https://zerocard.co' });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderStatusItem = (statusKey: TrackingStatus, index: number) => {
    const status = statuses[statusKey];
    const isLast = index === 3; // Assuming 4 statuses
    const dotColor = status.completed ? '#2775CA' : '#FFC300';

    return (
      <View key={statusKey} style={styles.statusItemContainer}>
        <View style={styles.statusRow}>
          <Animated.View
            style={[
              styles.statusDot,
              { backgroundColor: dotColor },
              status.inProgress && {
                opacity: blinkAnimation,
                shadowColor: dotColor, // Use dynamic color for shadow
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 8,
                elevation: 6, // Elevation for Android shadow (harmless on iOS)
              },
            ]}
          />
          <View style={styles.statusContent}>
            <Text style={[styles.statusTitle, !status.completed && styles.pendingStatusTitle]}>
              {status.title}
            </Text>
            <View style={styles.statusDateTimeContainer}>
              <Text style={styles.statusDateText}>{status.date}</Text>
              {status.time && <Text style={styles.statusTimeText}>{status.time}</Text>}
            </View>
          </View>
        </View>
        {!isLast && (
          <Animated.View
            style={[
              styles.statusLine,
              {
                height: lineAnimations[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 60], // Fixed height from design
                }),
                opacity: lineAnimations[index],
                top: 15, // Position line correctly
                left: 6, // Position line correctly
              },
            ]}
          />
        )}
      </View>
    );
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          {/* Platform-specific background */}
          {Platform.OS === 'ios' ? (
            <BlurBackground visible={visible} intensity={20} tint="dark" />
          ) : (
            <View style={styles.androidBackground} />
          )}

          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  transform: [
                    {
                      translateY: slideAnimation.interpolate({
                        inputRange: [0, 1],
                        // Adjust vertical position based on platform
                        outputRange: [300, Platform.OS === 'android' ? 100 : 130],
                      }),
                    },
                  ],
                  opacity: slideAnimation,
                },
              ]}>
              <Text style={styles.deliveryEstimateText} numberOfLines={2}>
                Your card should arrive by{' '}
                <Text style={styles.deliveryDateText}>{estimatedDeliveryDate}</Text>
              </Text>

              <Text style={styles.deliveryProgressTitle}>Delivery progress</Text>

              <View style={styles.progressListContainer}>
                {renderStatusItem('accepted', 0)}
                {renderStatusItem('picked_up', 1)}
                {renderStatusItem('on_delivery', 2)}
                {renderStatusItem('delivered', 3)}
              </View>

              <View style={styles.buttonWrapper}>
                <Button
                  title="Share Tracking Status"
                  variant="primary"
                  onPress={handleShare}
                  style={styles.shareButton}
                />
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  androidBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 32,
    paddingBottom: 24,
    width: SCREEN_WIDTH - 40,
    backgroundColor: '#F7F7F7',
    borderRadius: 30,
    gap: 24,
  },
  deliveryEstimateText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 24,
    color: '#767676',
    alignSelf: 'stretch',
  },
  deliveryDateText: {
    color: '#000000',
    fontWeight: '500',
  },
  deliveryProgressTitle: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: '#121212',
    alignSelf: 'stretch',
  },
  progressListContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 0,
    gap: 0, // Let statusItemContainer handle gap
    alignSelf: 'stretch',
    position: 'relative',
  },
  statusItemContainer: {
    marginBottom: 16, // Gap between status items
    alignSelf: 'stretch',
    position: 'relative', // Context for line positioning
  },
  statusRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 0,
    gap: 8,
    zIndex: 1,
    alignSelf: 'stretch',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  statusContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 0,
    gap: 8,
    flex: 1,
  },
  statusTitle: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    alignSelf: 'stretch',
  },
  pendingStatusTitle: {
    color: '#979797',
  },
  statusDateTimeContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 0,
    gap: 6,
  },
  statusDateText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500', // Adjusted weight as per original iOS design
    fontSize: 14,
    lineHeight: 17,
    color: '#979797',
  },
  statusTimeText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#979797',
  },
  statusLine: {
    position: 'absolute',
    width: 1,
    borderWidth: 1,
    borderColor: '#979797',
    borderStyle: 'dashed',
    zIndex: 0,
  },
  buttonWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
  },
  shareButton: {
    backgroundColor: '#40FF00',
    borderRadius: 100000,
    width: '100%',
    alignSelf: 'stretch',
  },
});

export default TrackingStatusModal;
