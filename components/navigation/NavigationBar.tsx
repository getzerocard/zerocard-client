import * as React from 'react';
import { View, StyleSheet, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import * as NavigationBarExpo from 'expo-navigation-bar';
import Web3Avatar from '../ui/Avatar/Web3Avatar';
import { useUserWalletAddress } from '../../common/hooks/useUserWalletAddress';

interface NavigationBarProps {
  onHomePress?: () => void;
  onCardPress?: () => void;
  onAddPress?: () => void;
  onProfilePress?: () => void;
}

// SVG strings for icons - outline versions
const homeIconSvg = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 25C15.4533 25 15 24.5467 15 24V20C15 19.4533 15.4533 19 16 19C16.5467 19 17 19.4533 17 20V24C17 24.5467 16.5467 25 16 25Z" fill="currentColor"/>
<path d="M23.4666 30.0799H8.53328C6.10661 30.0799 3.89328 28.2133 3.49328 25.8266L1.71995 15.1999C1.42661 13.5466 2.23995 11.4266 3.55995 10.3733L12.7999 2.97326C14.5866 1.53326 17.3999 1.54659 19.1999 2.98659L28.4399 10.3733C29.7466 11.4266 30.5466 13.5466 30.2799 15.1999L28.5066 25.8133C28.1066 28.1733 25.8399 30.0799 23.4666 30.0799ZM15.9866 3.90659C15.2799 3.90659 14.5733 4.11993 14.0533 4.53326L4.81328 11.9466C4.06661 12.5466 3.53328 13.9333 3.69328 14.8799L5.46661 25.4933C5.70661 26.8933 7.10661 28.0799 8.53328 28.0799H23.4666C24.8933 28.0799 26.2933 26.8933 26.5333 25.4799L28.3066 14.8666C28.4533 13.9333 27.9199 12.5199 27.1866 11.9333L17.9466 4.54659C17.4133 4.11993 16.6933 3.90659 15.9866 3.90659Z" fill="currentColor"/>
</svg>`;

const cardIconSvg = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29.3332 12.3333H2.6665C2.11984 12.3333 1.6665 11.8799 1.6665 11.3333C1.6665 10.7866 2.11984 10.3333 2.6665 10.3333H29.3332C29.8798 10.3333 30.3332 10.7866 30.3332 11.3333C30.3332 11.8799 29.8798 12.3333 29.3332 12.3333Z" fill="currentColor"/>
<path d="M10.6667 23H8C7.45333 23 7 22.5467 7 22C7 21.4533 7.45333 21 8 21H10.6667C11.2133 21 11.6667 21.4533 11.6667 22C11.6667 22.5467 11.2133 23 10.6667 23Z" fill="currentColor"/>
<path d="M19.3333 23H14C13.4533 23 13 22.5467 13 22C13 21.4533 13.4533 21 14 21H19.3333C19.88 21 20.3333 21.4533 20.3333 22C20.3333 22.5467 19.88 23 19.3333 23Z" fill="currentColor"/>
<path d="M23.4132 28.3334H8.5865C3.27984 28.3334 1.6665 26.7334 1.6665 21.4801V10.5201C1.6665 5.26675 3.27984 3.66675 8.5865 3.66675H23.3998C28.7065 3.66675 30.3198 5.26675 30.3198 10.5201V21.4667C30.3332 26.7334 28.7198 28.3334 23.4132 28.3334ZM8.5865 5.66675C4.39984 5.66675 3.6665 6.38675 3.6665 10.5201V21.4667C3.6665 25.6001 4.39984 26.3201 8.5865 26.3201H23.3998C27.5865 26.3201 28.3198 25.6001 28.3198 21.4667V10.5201C28.3198 6.38675 27.5865 5.66675 23.3998 5.66675H8.5865Z" fill="currentColor"/>
</svg>`;

const addCircleIconSvg = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.9998 30.3334C8.09317 30.3334 1.6665 23.9067 1.6665 16.0001C1.6665 8.09342 8.09317 1.66675 15.9998 1.66675C23.9065 1.66675 30.3332 8.09342 30.3332 16.0001C30.3332 23.9067 23.9065 30.3334 15.9998 30.3334ZM15.9998 3.66675C9.19984 3.66675 3.6665 9.20008 3.6665 16.0001C3.6665 22.8001 9.19984 28.3334 15.9998 28.3334C22.7998 28.3334 28.3332 22.8001 28.3332 16.0001C28.3332 9.20008 22.7998 3.66675 15.9998 3.66675Z" fill="currentColor"/>
<path d="M21.3332 17H10.6665C10.1198 17 9.6665 16.5467 9.6665 16C9.6665 15.4533 10.1198 15 10.6665 15H21.3332C21.8798 15 22.3332 15.4533 22.3332 16C22.3332 16.5467 21.8798 17 21.3332 17Z" fill="currentColor"/>
<path d="M16 22.3334C15.4533 22.3334 15 21.8801 15 21.3334V10.6667C15 10.1201 15.4533 9.66675 16 9.66675C16.5467 9.66675 17 10.1201 17 10.6667V21.3334C17 21.8801 16.5467 22.3334 16 22.3334Z" fill="currentColor"/>
</svg>`;

// SVG strings for filled icons
const homeFilledIconSvg = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M24.3018 9.34494L16.6601 3.23161C15.1668 2.04161 12.8335 2.02994 11.3518 3.21994L3.71012 9.34494C2.61345 10.2199 1.94845 11.9699 2.18179 13.3466L3.65179 22.1433C3.99012 24.1149 5.82179 25.6666 7.81679 25.6666H20.1835C22.1551 25.6666 24.0218 24.0799 24.3601 22.1316L25.8301 13.3349C26.0401 11.9699 25.3751 10.2199 24.3018 9.34494ZM14.8751 20.9999C14.8751 21.4783 14.4785 21.8749 14.0001 21.8749C13.5218 21.8749 13.1251 21.4783 13.1251 20.9999V17.4999C13.1251 17.0216 13.5218 16.6249 14.0001 16.6249C14.4785 16.6249 14.8751 17.0216 14.8751 17.4999V20.9999Z" fill="#40FF00"/>
</svg>`;

const cardFilledIconSvg = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M25.6668 8.80822C25.6668 9.57822 25.0368 10.2082 24.2668 10.2082H3.7335C2.9635 10.2082 2.3335 9.57822 2.3335 8.80822V8.79655C2.3335 6.12489 4.49183 3.96655 7.1635 3.96655H20.8252C23.4968 3.96655 25.6668 6.13655 25.6668 8.80822Z" fill="#40FF00"/>
<path d="M2.3335 13.3583V19.2033C2.3335 21.8749 4.49183 24.0333 7.1635 24.0333H20.8252C23.4968 24.0333 25.6668 21.8633 25.6668 19.1916V13.3583C25.6668 12.5883 25.0368 11.9583 24.2668 11.9583H3.7335C2.9635 11.9583 2.3335 12.5883 2.3335 13.3583ZM9.3335 20.1249H7.00016C6.52183 20.1249 6.12516 19.7283 6.12516 19.2499C6.12516 18.7716 6.52183 18.3749 7.00016 18.3749H9.3335C9.81183 18.3749 10.2085 18.7716 10.2085 19.2499C10.2085 19.7283 9.81183 20.1249 9.3335 20.1249ZM16.9168 20.1249H12.2502C11.7718 20.1249 11.3752 19.7283 11.3752 19.2499C11.3752 18.7716 11.7718 18.3749 12.2502 18.3749H16.9168C17.3952 18.3749 17.7918 18.7716 17.7918 19.2499C17.7918 19.7283 17.3952 20.1249 16.9168 20.1249Z" fill="#40FF00"/>
</svg>`;

const addCircleFilledIconSvg = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.0002 2.33325C7.57183 2.33325 2.3335 7.57158 2.3335 13.9999C2.3335 20.4283 7.57183 25.6666 14.0002 25.6666C20.4285 25.6666 25.6668 20.4283 25.6668 13.9999C25.6668 7.57158 20.4285 2.33325 14.0002 2.33325ZM18.6668 14.8749H14.8752V18.6666C14.8752 19.1449 14.4785 19.5416 14.0002 19.5416C13.5218 19.5416 13.1252 19.1449 13.1252 18.6666V14.8749H9.3335C8.85516 14.8749 8.4585 14.4783 8.4585 13.9999C8.4585 13.5216 8.85516 13.1249 9.3335 13.1249H13.1252V9.33325C13.1252 8.85492 13.5218 8.45825 14.0002 8.45825C14.4785 8.45825 14.8752 8.85492 14.8752 9.33325V13.1249H18.6668C19.1452 13.1249 19.5418 13.5216 19.5418 13.9999C19.5418 14.4783 19.1452 14.8749 18.6668 14.8749Z" fill="#40FF00"/>
</svg>`;

// Navigation bar background SVG
const navbarBgSvg = `<svg width="402" height="143" viewBox="0 0 402 143" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 0V143H402V0C402 18.6924 402 28.0386 397.981 35C395.348 39.5605 391.561 43.3477 387 45.9807C380.039 50 370.692 50 352 50H50C31.3076 50 21.9614 50 15 45.9807C10.4395 43.3477 6.65234 39.5605 4.01904 35C0 28.0386 0 18.6924 0 0Z" fill="#1F1F1F"/>
</svg>`;

export function NavigationBar({
  onHomePress,
  onCardPress,
  onAddPress,
  onProfilePress,
}: NavigationBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Set Android navigation bar color on mount
  React.useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBarExpo.setBackgroundColorAsync('#1F1F1F');
      NavigationBarExpo.setButtonStyleAsync('light');
    }
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const triggerHaptic = async () => {
    try {
      // Use selectionAsync for a soft, subtle feedback - best for UI interactions
      await Haptics.selectionAsync();

      // Fallback to light impact if needed
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptic feedback error:', error);
    }
  };

  const handleHomePress = async () => {
    await triggerHaptic();
    if (onHomePress) {
      onHomePress();
    } else {
      router.push('/(tab)/home');
    }
  };

  const handleCardPress = async () => {
    await triggerHaptic();
    if (onCardPress) {
      onCardPress();
    } else {
      router.push('/(tab)/card');
    }
  };

  const handleAddPress = async () => {
    await triggerHaptic();
    if (onAddPress) {
      onAddPress();
    } else {
      router.push('/(tab)/load-wallet');
    }
  };

  const handleProfilePress = async () => {
    await triggerHaptic();
    if (onProfilePress) {
      onProfilePress();
    } else {
      router.push('/(tab)/profile');
    }
  };

  const [activeTab, setActiveTab] = React.useState(() => {
    if (pathname.includes('/(tab)/home')) return 'home';
    if (pathname.includes('/(tab)/card')) return 'card';
    if (pathname.includes('/(tab)/load-wallet')) return 'add';
    if (pathname.includes('/(tab)/profile')) return 'profile';
    return 'home'; // Default
  });

  React.useEffect(() => {
    if (pathname.includes('/(tab)/home')) {
      setActiveTab('home');
    } else if (pathname.includes('/(tab)/card')) {
      setActiveTab('card');
    } else if (pathname.includes('/(tab)/load-wallet')) {
      setActiveTab('add');
    } else if (pathname.includes('/(tab)/profile')) {
      setActiveTab('profile');
    }
  }, [pathname]);

  // Hide the navigation bar for the order-card and order-confirmation routes on Android
  if (
    Platform.OS === 'android' &&
    (pathname.includes('order-card') || pathname.includes('order-confirmation'))
  ) {
    return null;
  }

  return (
    <View style={[styles.container, { width: width }]}>
      <View style={styles.bgContainer}>
        <SvgXml
          xml={navbarBgSvg}
          width={width}
          height={123 + insets.bottom}
          preserveAspectRatio={Platform.OS === 'android' ? 'none' : 'xMidYMax meet'}
        />
      </View>
      <View style={[styles.content, { paddingBottom: insets.bottom }]}>
        <View style={styles.iconsContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={async () => {
              setActiveTab('home');
              await handleHomePress();
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
            <HomeIcon active={activeTab === 'home'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={async () => {
              setActiveTab('card');
              await handleCardPress();
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
            <CardIcon active={activeTab === 'card'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={async () => {
              setActiveTab('add');
              await handleAddPress();
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
            <AddCircleIcon active={activeTab === 'add'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={async () => {
              setActiveTab('profile');
              await handleProfilePress();
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
            <ProfileIcon active={activeTab === 'profile'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Icon components
function HomeIcon({ active = false }: { active?: boolean }) {
  return (
    <View style={styles.iconWrapper}>
      {active ? (
        <SvgXml xml={homeFilledIconSvg} width={26} height={26} />
      ) : (
        <SvgXml xml={homeIconSvg} width={26} height={26} color="#888888" />
      )}
    </View>
  );
}

function CardIcon({ active = false }: { active?: boolean }) {
  return (
    <View style={styles.iconWrapper}>
      {active ? (
        <SvgXml xml={cardFilledIconSvg} width={26} height={26} />
      ) : (
        <SvgXml xml={cardIconSvg} width={26} height={26} color="#888888" />
      )}
    </View>
  );
}

function AddCircleIcon({ active = false }: { active?: boolean }) {
  return (
    <View style={styles.iconWrapper}>
      {active ? (
        <SvgXml xml={addCircleFilledIconSvg} width={26} height={26} />
      ) : (
        <SvgXml xml={addCircleIconSvg} width={26} height={26} color="#888888" />
      )}
    </View>
  );
}

function ProfileIcon({ active = false }: { active?: boolean }) {
  // Get user's wallet address
  const walletAddress = useUserWalletAddress();
  
  // Fallback address in case wallet isn't loaded yet
  const fallbackAddress = '0x0000000000000000000000000000000000000000';

  return (
    <View style={[styles.iconWrapper, styles.profileIcon]}>
      {/* Replace static profile circle with Web3Avatar */}
      <View style={active ? styles.profileCircleActive : undefined}>
        <Web3Avatar 
          address={walletAddress || fallbackAddress} 
          size={26} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    height: 143,
    zIndex: 100,
  },
  bgContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  content: {
    position: 'absolute',
    width: '100%',
    height: '92%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 46,
    marginTop: 70,
  },
  iconButton: {
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    overflow: 'hidden',
    borderRadius: 13,
  },
  profileCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#CFCFD0',
  },
  profileCircleActive: {
    borderWidth: 2,
    borderColor: '#40FF00',
    borderRadius: 15, // Slightly larger to account for the border
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NavigationBar;
