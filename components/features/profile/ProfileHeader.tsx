import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SvgXml } from 'react-native-svg';
import * as Clipboard from 'expo-clipboard';
import { useUserWalletAddress } from '../../../common/hooks/useUserWalletAddress';
import { SkeletonLoader } from '../../ui/feedback/SkeletonLoader';
import Web3Avatar from '../../ui/Avatar/Web3Avatar';

// Import mockdata for user profile info - only for username now
import mockData from '../../../assets/mockdata.json';

// Import the edit icon SVG - simplified without unsupported filters
const editIconSvg = `<svg width="27" height="26" viewBox="0 0 27 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="1.5" y="0" width="24" height="24" rx="12" fill="white"/>
<path d="M11.4998 11.1667C10.4865 11.1667 9.6665 10.3467 9.6665 9.33333C9.6665 8.32 10.4865 7.5 11.4998 7.5C12.5132 7.5 13.3332 8.32 13.3332 9.33333C13.3332 10.3467 12.5132 11.1667 11.4998 11.1667ZM11.4998 8.5C11.0398 8.5 10.6665 8.87333 10.6665 9.33333C10.6665 9.79333 11.0398 10.1667 11.4998 10.1667C11.9598 10.1667 12.3332 9.79333 12.3332 9.33333C12.3332 8.87333 11.9598 8.5 11.4998 8.5Z" fill="#858585"/>
<path d="M15.5002 19.1667H11.5002C7.88016 19.1667 6.3335 17.62 6.3335 14V10C6.3335 6.38001 7.88016 4.83334 11.5002 4.83334H14.1668C14.4402 4.83334 14.6668 5.06001 14.6668 5.33334C14.6668 5.60668 14.4402 5.83334 14.1668 5.83334H11.5002C8.42683 5.83334 7.3335 6.92668 7.3335 10V14C7.3335 17.0733 8.42683 18.1667 11.5002 18.1667H15.5002C18.5735 18.1667 19.6668 17.0733 19.6668 14V10.6667C19.6668 10.3933 19.8935 10.1667 20.1668 10.1667C20.4402 10.1667 20.6668 10.3933 20.6668 10.6667V14C20.6668 17.62 19.1202 19.1667 15.5002 19.1667Z" fill="#858585"/>
<path d="M15.9466 10.5C15.6866 10.5 15.4466 10.4067 15.2733 10.2267C15.0666 10.02 14.9666 9.71334 15.0133 9.40001L15.1466 8.47334C15.1799 8.24001 15.3199 7.95334 15.4933 7.78668L17.9133 5.36668C18.8799 4.40001 19.7199 4.95334 20.1333 5.36668C20.5266 5.76001 20.7066 6.17334 20.6666 6.60001C20.6333 6.94001 20.4599 7.26668 20.1333 7.58668L17.7133 10.0067C17.5466 10.1733 17.2599 10.3133 17.0266 10.3533L16.0999 10.4867C16.0466 10.5 15.9933 10.5 15.9466 10.5ZM18.6133 6.08001L16.1933 8.50001C16.1733 8.52001 16.1399 8.59334 16.1333 8.62668L16.0066 9.49334L16.8799 9.37334C16.9066 9.36668 16.9799 9.33334 17.0066 9.30668L19.4266 6.88668C19.5733 6.74001 19.6599 6.60668 19.6666 6.50668C19.6799 6.36668 19.5399 6.19334 19.4266 6.08001C19.0799 5.73334 18.9199 5.77334 18.6133 6.08001Z" fill="#858585"/>
<path d="M19.4335 8.08668C19.3868 8.08668 19.3402 8.08001 19.3002 8.06668C18.4068 7.81335 17.6935 7.10001 17.4402 6.20668C17.3668 5.94001 17.5202 5.66668 17.7868 5.59335C18.0535 5.52001 18.3268 5.67335 18.4002 5.94001C18.5602 6.50001 19.0068 6.95335 19.5735 7.11335C19.8402 7.18668 19.9935 7.46668 19.9202 7.72668C19.8468 7.94001 19.6468 8.08668 19.4335 8.08668Z" fill="#858585"/>
<path d="M7.28003 17.1333C7.12003 17.1333 6.96003 17.0533 6.8667 16.9133C6.71337 16.6867 6.77337 16.3733 7.00003 16.22L10.2867 14.0133C11.0067 13.5333 12 13.5867 12.6534 14.14L12.8734 14.3333C13.2067 14.62 13.7734 14.62 14.1 14.3333L16.8734 11.9533C17.58 11.3467 18.6934 11.3467 19.4067 11.9533L20.4934 12.8867C20.7 13.0667 20.7267 13.38 20.5467 13.5933C20.3667 13.8 20.0534 13.8267 19.84 13.6467L18.7534 12.7133C18.42 12.4267 17.8534 12.4267 17.5267 12.7133L14.7534 15.0933C14.0467 15.7 12.9334 15.7 12.22 15.0933L12 14.9C11.6934 14.64 11.1867 14.6133 10.8467 14.8467L7.5667 17.0533C7.47337 17.1067 7.37337 17.1333 7.28003 17.1333Z" fill="#858585"/>
</svg>`;

// Copy icon SVG
const copyIconSvg = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.83366 8.02502V10.475C9.83366 12.5167 9.01699 13.3334 6.97533 13.3334H4.52533C2.48366 13.3334 1.66699 12.5167 1.66699 10.475V8.02502C1.66699 5.98335 2.48366 5.16669 4.52533 5.16669H6.97533C9.01699 5.16669 9.83366 5.98335 9.83366 8.02502Z" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M13.3337 4.52502V6.97502C13.3337 9.01669 12.517 9.83335 10.4753 9.83335H9.83366V8.02502C9.83366 5.98335 9.01699 5.16669 6.97533 5.16669H5.16699V4.52502C5.16699 2.48335 5.98366 1.66669 8.02533 1.66669H10.4753C12.517 1.66669 13.3337 2.48335 13.3337 4.52502Z" stroke="black" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

interface ProfileHeaderProps {
  /**
   * Custom username override
   */
  usernameOverride?: string;
  
  /**
   * Callback when edit profile image is pressed
   */
  onEditProfileImage?: () => void;
  
  /**
   * Callback when wallet address is copied
   */
  onWalletAddressCopy?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  usernameOverride,
  onEditProfileImage,
  onWalletAddressCopy
}) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { username } = mockData.user;
  const displayUsername = usernameOverride || username;
  
  // Use our wallet address hook to get the real wallet address
  const walletAddress = useUserWalletAddress();
  const isLoading = !walletAddress;
  
  // Format wallet address to show first and last characters
  const formattedWalletAddress = React.useMemo(() => {
    if (!walletAddress) return '';
    if (walletAddress.length <= 12) return walletAddress;
    return `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;
  }, [walletAddress]);

  const pickImage = async () => {
    if (onEditProfileImage) {
      onEditProfileImage();
      return;
    }
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const copyToClipboard = async () => {
    if (!walletAddress) return;
    
    await Clipboard.setStringAsync(walletAddress);
    Alert.alert('Copied', 'Wallet address copied to clipboard');
    
    if (onWalletAddressCopy) {
      onWalletAddressCopy();
    }
  };

  // Get initials for placeholder
  const getInitials = () => {
    return displayUsername ? displayUsername.charAt(0).toUpperCase() : 'U';
  };

  // Fallback address for Web3Avatar if wallet isn't loaded yet
  const fallbackAddress = '0x0000000000000000000000000000000000000000';

  return (
    <View style={styles.container}>
      {/* Profile image with edit button */}
      <View style={styles.profileImageContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.profileImageWrapper}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            // Use Web3Avatar instead of the color placeholder with initials
            <Web3Avatar 
              address={walletAddress || fallbackAddress} 
              size={64} 
              style={styles.profileImage}
            />
          )}
          <View style={styles.editIconContainer}>
            <SvgXml xml={editIconSvg} width={24} height={24} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Username */}
      <Text style={styles.username}>{displayUsername}</Text>

      {/* Wallet address with copy button */}
      <TouchableOpacity 
        style={styles.walletContainer} 
        onPress={copyToClipboard}
        disabled={isLoading}
      >
        {isLoading ? (
          <SkeletonLoader 
            width={100} 
            height={17} 
            borderRadius={8}
            backgroundColor="rgba(0, 0, 0, 0.1)"
          />
        ) : (
          <Text style={styles.walletAddress}>{formattedWalletAddress}</Text>
        )}
        <SvgXml xml={copyIconSvg} width={14} height={14} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  profileImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  profileImageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    position: 'relative',
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f0f0',
  },
  profileImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#40FF00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  editIconContainer: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    // Use elevation on Android and shadow props on iOS for the shadow effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  username: {
    fontFamily: 'System',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    textAlign: 'center',
    color: '#121212',
    marginVertical: 2,
  },
  walletContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
    backgroundColor: '#ECECEC',
    borderRadius: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  walletAddress: {
    fontFamily: 'System',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',
    letterSpacing: -0.42,
    color: '#808080',
  },
});

export default ProfileHeader;
