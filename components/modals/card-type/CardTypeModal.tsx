import { router } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { SquircleView } from 'react-native-figma-squircle';
import { SvgXml } from 'react-native-svg';
import BlurBackground from '../../ui/layout/BlurBackground';
import { Button } from '../../ui/Button';

// SVG icons as strings
const physicalCardSvg = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="36" height="36" rx="18" fill="#E5E5E5"/>
<path d="M12 25H24C26.2 25 28 23.2 28 21V15C28 12.8 26.2 11 24 11L12 11C9.8 11 8 12.8 8 15L8 21C8 23.2 9.8 25 12 25ZM12 13L24 13C25.1 13 26 13.9 26 15L10 15C10 13.9 10.9 13 12 13ZM10 17L26 17V21C26 22.1 25.1 23 24 23H12C10.9 23 10 22.1 10 21L10 17Z" fill="#9C9C9C"/>
<path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" fill="#9C9C9C"/>
<path d="M23 22C23.5523 22 24 21.5523 24 21C24 20.4477 23.5523 20 23 20C22.4477 20 22 20.4477 22 21C22 21.5523 22.4477 22 23 22Z" fill="#9C9C9C"/>
</svg>`;

const contactlessIconSvg = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_305_1170)">
<rect width="36" height="36" rx="18" fill="#D4D4D4"/>
<path d="M12.1666 27.3333C12.1666 26.0465 13.2131 25 14.4999 25H21.4999C22.7868 25 23.8333 26.0465 23.8333 27.3333V36.6666H26.1666V27.3333C26.1666 24.7601 24.0731 22.6666 21.4999 22.6666H14.4999C11.9267 22.6666 9.83325 24.7601 9.83325 27.3333V36.6666H12.1666V27.3333Z" fill="#9C9C9C"/>
<path d="M16.8333 26.1667C16.1891 26.1667 15.6666 26.6892 15.6666 27.3334C15.6666 27.9776 16.1891 28.5001 16.8333 28.5001H19.1666C19.8109 28.5001 20.3333 27.9776 20.3333 27.3334C20.3333 26.6892 19.8109 26.1667 19.1666 26.1667H16.8333ZM13.0479 18.899C12.5973 19.3598 12.6053 20.0981 13.0656 20.5493C13.2928 20.7715 13.5874 20.8821 13.8819 20.8821C14.1844 20.8821 14.4869 20.7647 14.7158 20.5317C15.6278 19.5992 16.9067 19.1058 18.2391 19.1765C19.4024 19.2403 20.4853 19.7229 21.288 20.5352C21.7415 20.9944 22.4797 20.9978 22.9378 20.5455C23.3964 20.0926 23.4009 19.3537 22.948 18.8957C21.7375 17.6698 20.1106 16.9424 18.3657 16.8467C16.3588 16.7371 14.4304 17.4879 13.0479 18.899Z" fill="#9C9C9C"/>
<path d="M11.4084 18.4085C11.7097 18.4085 12.0105 18.2928 12.2389 18.0609C13.8505 16.4283 16.1098 15.56 18.4157 15.6764C20.4438 15.7852 22.343 16.6328 23.7637 18.0638C24.2172 18.5207 24.9567 18.5241 25.4135 18.0695C25.871 17.6155 25.8732 16.8772 25.4192 16.4198C23.5906 14.5775 21.1474 13.4861 18.5378 13.3464C15.5596 13.196 12.6566 14.3165 10.5778 16.4226C10.1255 16.8812 10.1301 17.6194 10.5892 18.0723C10.8165 18.2968 11.1122 18.4085 11.4084 18.4085Z" fill="#9C9C9C"/>
</g>
<defs>
<clipPath id="clip0_305_1170">
<rect width="36" height="36" rx="18" fill="white"/>
</clipPath>
</defs>
</svg>`;

const colorWheelIconSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.0453 11.652C11.489 12.1809 11.4239 12.9831 10.8147 13.3079C10.3173 13.5731 9.78494 13.7668 9.23344 13.8835C8.55806 14.0263 7.99244 13.4536 7.99237 12.7633L7.99219 10.4416C7.99219 10.0946 8.28169 9.82337 8.60775 9.70474C8.93375 9.58605 9.32987 9.60762 9.55288 9.87343L11.0453 11.652Z" fill="#662D91"/>
<path d="M7.99186 12.7632C7.99186 13.4535 7.4263 14.0263 6.75086 13.8835C6.19936 13.7669 5.66704 13.5731 5.16961 13.308C4.56036 12.9833 4.49524 12.181 4.93892 11.6522L6.43117 9.87349C6.65417 9.60767 7.05024 9.58605 7.3763 9.70467C7.70236 9.8233 7.99186 10.0945 7.99186 10.4415V12.7632Z" fill="#C1272D"/>
<path d="M3.31422 8.83802C2.63435 8.9579 1.97216 8.50034 1.99547 7.8104C2.01452 7.24702 2.11286 6.68914 2.2876 6.15321C2.5016 5.4969 3.28041 5.29334 3.87822 5.63846L5.88903 6.79921C6.18953 6.97271 6.27966 7.35902 6.21941 7.70071C6.15916 8.0424 5.94241 8.37459 5.60066 8.43484L3.31422 8.83802Z" fill="#E86110"/>
<path d="M3.87827 5.63827C3.28039 5.29308 3.0672 4.51689 3.52858 4.00339C3.9053 3.58407 4.33923 3.21993 4.81758 2.9217C5.40339 2.55645 6.13077 2.90108 6.36695 3.54983L7.1612 5.73152C7.27989 6.05752 7.10058 6.41139 6.83477 6.63439C6.56902 6.85745 6.18939 6.97264 5.88895 6.79914L3.87827 5.63827Z" fill="#F5921E"/>
<path d="M9.61655 3.54966C9.85267 2.90091 10.58 2.55622 11.1659 2.92141C11.6443 3.21962 12.0782 3.58376 12.455 4.0031C12.9164 4.5166 12.7032 5.29278 12.1054 5.63797L10.0948 6.79897C9.7943 6.97253 9.41474 6.85735 9.14892 6.63435C8.88311 6.41135 8.7038 6.05747 8.82249 5.73147L9.61655 3.54966Z" fill="#39B54A"/>
<path d="M12.1057 5.63829C12.7035 5.2931 13.4824 5.49654 13.6964 6.15291C13.8712 6.68882 13.9696 7.24668 13.9887 7.81004C14.012 8.50004 13.3499 8.9576 12.67 8.83779L10.3835 8.43479C10.0417 8.37454 9.82498 8.04235 9.76473 7.70066C9.70448 7.35898 9.79448 6.97266 10.095 6.79916L12.1057 5.63829Z" fill="#00A99D"/>
<path d="M12.6697 8.83811C13.3496 8.95799 13.8153 9.61442 13.5574 10.2548C13.3469 10.7777 13.0636 11.2683 12.7161 11.7121C12.2905 12.2557 11.4891 12.1806 11.0453 11.6518L9.55282 9.8733C9.32976 9.60755 9.37726 9.21373 9.5507 8.91323C9.72413 8.61273 10.0415 8.37467 10.3832 8.43492L12.6697 8.83811Z" fill="#0071BC"/>
<path d="M4.93886 11.6519C4.49511 12.1808 3.69367 12.2559 3.26804 11.7124C2.92052 11.2686 2.63728 10.778 2.42667 10.2551C2.16867 9.6148 2.63442 8.9583 3.31429 8.83836L5.60073 8.43505C5.94242 8.3748 6.25973 8.6128 6.43323 8.9133C6.60673 9.2138 6.65423 9.60755 6.43123 9.87336L4.93886 11.6519Z" fill="#FF421D"/>
<path d="M6.36748 3.54975C6.13135 2.901 6.46698 2.16943 7.15048 2.07262C7.7086 1.99355 8.27509 1.99353 8.83323 2.07256C9.51679 2.16931 9.85241 2.90093 9.61635 3.54962L8.82241 5.73144C8.70379 6.0575 8.33898 6.21331 7.99198 6.21331C7.64504 6.21331 7.28023 6.05756 7.16154 5.73144L6.36748 3.54975Z" fill="#FDB62F"/>
</svg>`;

interface CardTypeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCardType: (cardType: 'physical' | 'contactless') => void;
}

const CardTypeModal: React.FC<CardTypeModalProps> = ({ visible, onClose, onSelectCardType }) => {
  // Animation values
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(100)).current;
  const { width } = Dimensions.get('window');

  // Handle animations when visibility changes
  React.useEffect(() => {
    if (visible) {
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
  }, [visible, opacity, translateY]);

  const handleSelectPhysicalCard = () => {
    onSelectCardType('physical');
    onClose();
    // Navigate to the correct card ordering page
    router.push('/card-ordering');
  };

  // Return null on Android
  if (Platform.OS === 'android') {
    return null;
  }

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <BlurBackground visible={visible} intensity={40} tint="dark" />

      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <Animated.View
          style={[
            styles.modalAnimatedContainer,
            {
              left: (width - 354) / 2, // Center horizontally
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
              <View style={styles.headerContainer}>
                <Text style={styles.title}>Select card type</Text>
                <Text style={styles.subtitle}>Choose the type of card you'd like to own</Text>
              </View>

              <View style={styles.cardOptionsContainer}>
                {/* Physical Card Option */}
                <TouchableOpacity style={styles.cardOption} onPress={handleSelectPhysicalCard}>
                  <SquircleView
                    style={styles.cardOptionInner}
                    squircleParams={{
                      cornerSmoothing: 1,
                      cornerRadius: 20,
                      fillColor: '#FFFFFF',
                    }}>
                    <SvgXml xml={physicalCardSvg} width={36} height={36} />

                    <View style={styles.cardOptionContent}>
                      <Text style={styles.cardOptionTitle}>Physical card</Text>
                      <Text style={styles.cardOptionDescription}>
                        Only supports usage in Nigeria, supports ATM, Web, POS transactions
                      </Text>
                    </View>
                  </SquircleView>
                </TouchableOpacity>

                {/* Contactless Card Option (Disabled) */}
                <TouchableOpacity style={styles.cardOptionDisabled} disabled>
                  <SquircleView
                    style={styles.cardOptionInner}
                    squircleParams={{
                      cornerSmoothing: 1,
                      cornerRadius: 20,
                      fillColor: '#E5E5E5',
                    }}>
                    <SvgXml xml={contactlessIconSvg} width={36} height={36} />

                    <View style={styles.cardOptionContent}>
                      <View style={styles.contactlessHeaderRow}>
                        <Text style={styles.cardOptionTitleDisabled}>Contactless</Text>

                        <View style={styles.comingSoonBadge}>
                          <Text style={styles.comingSoonText}>Coming soon</Text>
                        </View>
                      </View>

                      <Text style={styles.cardOptionDescriptionDisabled}>
                        Supports worldwide usage and transactions. Add your card to digital wallets
                      </Text>

                      <View style={styles.customizableBadge}>
                        <SvgXml xml={colorWheelIconSvg} width={16} height={16} />
                        <Text style={styles.customizableText}>Customizable</Text>
                      </View>
                    </View>
                  </SquircleView>
                </TouchableOpacity>
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
    zIndex: 1000, // Ensure overlay is below modal content
  },
  modalAnimatedContainer: {
    position: 'absolute',
    top: 422, // Positioning as specified in design
    width: 354,
    zIndex: 1500, // Ensure modal content is above the overlay
  },
  modalContainer: {
    width: '100%',
  },
  modalTouchable: {
    padding: 32,
    paddingHorizontal: 24,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 24,
  },
  headerContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    alignSelf: 'stretch',
  },
  title: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 24,
    color: '#000000',
  },
  subtitle: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#767676',
  },
  cardOptionsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
    alignSelf: 'stretch',
  },
  cardOption: {
    alignSelf: 'stretch',
  },
  cardOptionDisabled: {
    alignSelf: 'stretch',
    opacity: 1, // We're using specific disabled colors instead
  },
  cardOptionInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 8,
    width: '100%',
  },
  cardOptionContent: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
  },
  contactlessHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  cardOptionTitle: {
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 19,
    color: '#252525',
  },
  cardOptionTitleDisabled: {
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 19,
    color: '#8A8A8A',
  },
  cardOptionDescription: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#767676',
  },
  cardOptionDescriptionDisabled: {
    fontFamily: 'SF Pro Text',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 17,
    color: '#8A8A8A',
  },
  comingSoonBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#8A8A8A',
    borderRadius: 10000,
  },
  comingSoonText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 23,
    textAlign: 'center',
    color: '#8A8A8A',
  },
  customizableBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
    backgroundColor: '#DADADA',
    borderRadius: 100000,
  },
  customizableText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 14,
    color: '#8A8A8A',
  },
});

export default CardTypeModal;
