import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image, Alert, Clipboard, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useUserWalletAddress } from '../../../common/hooks/useUserWalletAddress';
import { useUserBalance } from '../../../common/hooks/useUserBalance';
import { SkeletonLoader } from '../../ui/feedback/SkeletonLoader';

// Import SVG assets as strings
const cardPictureSvg = `<svg width="355" height="256" viewBox="0 0 355 256" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.5 95C0.5 66.7157 0.5 52.5736 9.2868 43.7868C18.0736 35 32.2157 35 60.5 35H294.5C322.784 35 336.926 35 345.713 43.7868C354.5 52.5736 354.5 66.7157 354.5 95V196C354.5 224.284 354.5 238.426 345.713 247.213C336.926 256 322.784 256 294.5 256H60.5C32.2157 256 18.0736 256 9.2868 247.213C0.5 238.426 0.5 224.284 0.5 196V95Z" fill="#9C9C9C"/>
<path d="M4.5 98C4.5 69.7157 4.5 55.5736 13.2868 46.7868C22.0736 38 36.2157 38 64.5 38H291.5C319.784 38 333.926 38 342.713 46.7868C351.5 55.5736 351.5 69.7157 351.5 98V192C351.5 220.284 351.5 234.426 342.713 243.213C333.926 252 319.784 252 291.5 252H64.5C36.2157 252 22.0736 252 13.2868 243.213C4.5 234.426 4.5 220.284 4.5 192V98Z" stroke="#CFCFCF" stroke-linecap="round" stroke-dasharray="2 2"/>
<g clip-path="url(#clip0_836_2254)">
<rect width="314" height="165" rx="18.1603" transform="matrix(0.970394 -0.241529 -0.241529 -0.970394 48.3523 235.955)" fill="#111111"/>
<g clip-path="url(#clip1_836_2254)">
<path d="M265.888 -39.1129C276.034 -41.6382 296.107 -44.2121 302.528 -18.4152C308.968 7.4603 290.011 14.5172 279.865 17.0425L267.675 20.0767C257.529 22.6019 237.476 25.2545 231.036 -0.621021C224.615 -26.4179 243.552 -33.5535 253.698 -36.0787L265.888 -39.1129ZM280.451 1.94636C288.395 -0.0307756 288.658 -7.36263 286.876 -14.5197C285.115 -21.5981 281.445 -27.9512 273.502 -25.9741L253.132 -20.904C245.188 -18.9268 244.925 -11.595 246.687 -4.51656C248.468 2.6405 252.137 8.99357 260.081 7.01644L280.451 1.94636Z" fill="#40FF00"/>
<path d="M280.57 19.8739C290.716 17.3486 310.788 14.7747 317.209 40.5716C323.65 66.4471 304.693 73.504 294.547 76.0293L282.356 79.0635C272.211 81.5888 252.158 84.2413 245.717 58.3658C239.296 32.5689 258.234 25.4333 268.379 22.9081L280.57 19.8739ZM295.133 60.9332C303.076 58.956 303.339 51.6242 301.558 44.4671C299.796 37.3887 296.127 31.0356 288.183 33.0128L267.813 38.0828C259.87 40.06 259.607 47.3918 261.368 54.4703C263.15 61.6273 266.819 67.9804 274.763 66.0033L295.133 60.9332Z" fill="white"/>
<path d="M231.295 22.5606C234.369 34.9085 228.877 41.7042 221.934 45.6874L242.877 57.012L222.507 62.0821L204.197 51.6055L184.457 56.519L187.98 70.6758L173.037 74.3952L159.06 18.2397L199.249 8.23662C209.395 5.71137 226.46 3.13432 231.295 22.5606ZM177.527 28.6772L180.952 42.4408L207.457 35.8438C215.401 33.8667 216.741 30.8605 215.644 26.4562C214.548 22.0518 211.975 20.1031 204.031 22.0802L177.527 28.6772Z" fill="white"/>
<path d="M90.0884 35.4067L151.199 20.1965L154.664 34.1174L108.418 45.6278L110.356 53.4141L136.746 46.8456L140.015 59.98L113.625 66.5485L115.465 73.9415L161.711 62.431L165.176 76.3519L104.065 91.5622L90.0884 35.4067Z" fill="white"/>
<path d="M82.2398 37.3601L86.0179 52.5394L46.3884 90.9673L92.7127 79.4373L96.2168 93.5155L24.7248 111.31L20.9467 96.1304L60.517 57.8007L15.0579 69.1154L11.5343 54.9585L82.2398 37.3601Z" fill="white"/>
</g>
<rect width="40.3562" height="30.7476" rx="4.70823" transform="matrix(0.970394 -0.241529 -0.241529 -0.970394 65.0845 181.568)" fill="#9F9F9F"/>
<path d="M63.4119 172.237L73.9773 169.607C75.2389 169.293 76.0071 168.016 75.6931 166.754L74.4722 161.849M71.2663 148.968L72.6827 154.659M72.6827 154.659L74.4722 161.849M72.6827 154.659L59.8328 157.857M74.4722 161.849L61.6223 165.047" stroke="url(#paint0_linear_836_2254)" stroke-width="0.588528"/>
<path d="M101.349 162.794L89.1115 165.84M89.1115 165.84L87.322 158.65M89.1115 165.84L91.2437 174.407M84.1161 145.77L85.5325 151.461M85.5325 151.461L87.322 158.65M85.5325 151.461L97.7704 148.415M87.322 158.65L99.56 155.604" stroke="url(#paint1_linear_836_2254)" stroke-width="0.588528"/>
</g>
<g filter="url(#filter0_iii_836_2254)">
<path d="M116.042 118H40.5C21.6438 118 12.2157 118 6.35786 123.858C0.5 129.716 0.5 139.144 0.5 158V216C0.5 234.857 0.5 244.285 6.35786 250.143C12.2157 256 21.6438 256 40.5 256H313.5C332.356 256 341.784 256 347.642 250.143C353.5 244.285 353.5 234.857 353.5 216V158C353.5 139.144 353.5 129.716 347.642 123.858C341.784 118 332.356 118 313.5 118H235.468C226.754 118 222.397 118 218.541 119.702C218.393 119.767 218.247 119.834 218.101 119.902C214.287 121.696 211.428 124.984 205.71 131.559C192.716 146.502 186.219 153.974 177.713 154.399C177.402 154.415 177.09 154.423 176.778 154.424C168.262 154.451 161.377 147.334 147.609 133.102L144.791 130.189L144.791 130.189C138.977 124.179 136.069 121.173 132.327 119.587C128.585 118 124.404 118 116.042 118Z" fill="#D9D9D9"/>
</g>
<g filter="url(#filter1_i_836_2254)">
<path d="M113.148 121.435L43.6587 121.159C24.7342 121.084 15.2719 121.047 9.38595 126.909C3.5 132.772 3.5 142.234 3.5 161.159V213C3.5 231.856 3.5 241.284 9.35786 247.142C15.2157 253 24.6438 253 43.5 253H311.5C330.356 253 339.784 253 345.642 247.142C351.5 241.284 351.5 231.856 351.5 213V162C351.5 143.144 351.5 133.716 345.642 127.858C339.784 122 330.356 122 311.5 122H238.586C230.162 122 225.95 122 222.187 123.608C218.423 125.215 215.511 128.258 209.687 134.344L205.121 139.115C191.884 152.947 185.265 159.863 176.884 159.978C168.502 160.092 161.698 153.359 148.088 139.892L141.124 133.001C135.387 127.325 132.518 124.486 128.886 122.985C125.254 121.483 121.219 121.467 113.148 121.435Z" fill="#B9B9B9"/>
</g>
<path d="M113.148 121.435L43.6587 121.159C24.7342 121.084 15.2719 121.047 9.38595 126.909C3.5 132.772 3.5 142.234 3.5 161.159V213C3.5 231.856 3.5 241.284 9.35786 247.142C15.2157 253 24.6438 253 43.5 253H311.5C330.356 253 339.784 253 345.642 247.142C351.5 241.284 351.5 231.856 351.5 213V162C351.5 143.144 351.5 133.716 345.642 127.858C339.784 122 330.356 122 311.5 122H238.586C230.162 122 225.95 122 222.187 123.608C218.423 125.215 215.511 128.258 209.687 134.344L205.121 139.115C191.884 152.947 185.265 159.863 176.884 159.978C168.502 160.092 161.698 153.359 148.088 139.892L141.124 133.001C135.387 127.325 132.518 124.486 128.886 122.985C125.254 121.483 121.219 121.467 113.148 121.435Z" stroke="#CFCFCF" stroke-linecap="round" stroke-dasharray="2 2"/>
<defs>
<filter id="filter0_iii_836_2254" x="-2.5" y="114" width="358" height="142" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="-4"/>
<feGaussianBlur stdDeviation="9.95"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_836_2254"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dx="-3"/>
<feGaussianBlur stdDeviation="9.95"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="effect1_innerShadow_836_2254" result="effect2_innerShadow_836_2254"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dx="2"/>
<feGaussianBlur stdDeviation="9.95"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="effect2_innerShadow_836_2254" result="effect3_innerShadow_836_2254"/>
</filter>
<filter id="filter1_i_836_2254" x="3" y="120.644" width="349" height="132.856" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_836_2254"/>
</filter>
<linearGradient id="paint0_linear_836_2254" x1="70.1977" y1="149.897" x2="52.3573" y2="161.958" gradientUnits="userSpaceOnUse">
<stop stop-color="#C7CEE0"/>
<stop offset="0.494636" stop-color="#F8FEFF"/>
<stop offset="1" stop-color="#696F7F"/>
</linearGradient>
<linearGradient id="paint1_linear_836_2254" x1="84.3937" y1="146.363" x2="102.273" y2="147.683" gradientUnits="userSpaceOnUse">
<stop stop-color="#C7CEE0"/>
<stop offset="0.653286" stop-color="#F8FEFF"/>
<stop offset="1" stop-color="#696F7F"/>
</linearGradient>
<clipPath id="clip0_836_2254">
<rect width="314" height="165" rx="18.1603" transform="matrix(0.970394 -0.241529 -0.241529 -0.970394 48.3523 235.955)" fill="white"/>
</clipPath>
<clipPath id="clip1_836_2254">
<rect width="300.91" height="57.8687" fill="white" transform="translate(10.7478 55.1543) rotate(-13.9768)"/>
</clipPath>
</defs>
</svg>
`;

const usdcIconSvg = `<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.50041 16.4288C12.7978 16.4288 16.2546 12.8942 16.2546 8.50001C16.2546 4.10586 12.7978 0.571198 8.50041 0.571198C4.20303 0.571198 0.746216 4.10586 0.746216 8.50001C0.746216 12.8942 4.20303 16.4288 8.50041 16.4288Z" fill="#2775CA"/>
<path d="M10.6328 9.75514C10.6328 8.59912 9.95434 8.20268 8.59736 8.03697C7.62808 7.90455 7.43423 7.64053 7.43423 7.17828C7.43423 6.71603 7.75758 6.41869 8.4035 6.41869C8.98507 6.41869 9.30842 6.61691 9.4697 7.11247C9.50227 7.21158 9.5992 7.27739 9.69613 7.27739H10.2133C10.3428 7.27739 10.4398 7.17828 10.4398 7.04586V7.01256C10.3103 6.28549 9.72869 5.72413 8.98584 5.65832V4.86544C8.98584 4.73303 8.88892 4.63392 8.72763 4.60141H8.24299C8.1135 4.60141 8.01657 4.70052 7.98478 4.86544V5.62502C7.0155 5.75743 6.40137 6.4179 6.40137 7.24408C6.40137 8.3343 7.04729 8.76404 8.40428 8.92896C9.30919 9.09388 9.59997 9.2921 9.59997 9.82095C9.59997 10.3498 9.14791 10.7129 8.53377 10.7129C7.69399 10.7129 7.40321 10.3498 7.30628 9.85425C7.27372 9.72184 7.17679 9.65603 7.07986 9.65603H6.53087C6.40137 9.65603 6.30444 9.75514 6.30444 9.88755V9.92085C6.43394 10.747 6.95037 11.3417 8.01657 11.5066V12.2995C8.01657 12.4319 8.1135 12.531 8.27478 12.5635H8.75942C8.88892 12.5635 8.98584 12.4644 9.01764 12.2995V11.5066C9.98613 11.3409 10.6328 10.6471 10.6328 9.75514Z" fill="white"/>
<path d="M6.85257 13.224C4.33245 12.2987 3.03983 9.42451 3.97731 6.88095C4.46195 5.49341 5.52815 4.4365 6.85257 3.94094C6.98206 3.87514 7.04642 3.77603 7.04642 3.61031V3.14806C7.04642 3.01565 6.98206 2.91654 6.85257 2.88403C6.82 2.88403 6.75564 2.88403 6.72307 2.91733C3.65396 3.90844 1.97363 7.24488 2.9429 10.3839C3.52447 12.2337 4.91402 13.6545 6.72307 14.2492C6.85257 14.315 6.98129 14.2492 7.01385 14.1168C7.04642 14.0835 7.04642 14.051 7.04642 13.9844V13.5221C7.04642 13.4222 6.94949 13.2906 6.85257 13.224ZM10.2768 2.91654C10.1473 2.85073 10.0186 2.91654 9.98603 3.04895C9.95347 3.08225 9.95347 3.11476 9.95347 3.18136V3.64361C9.95347 3.77602 10.0504 3.90764 10.1473 3.97425C12.6674 4.89954 13.9601 7.77374 13.0226 10.3173C12.5379 11.7048 11.4717 12.7618 10.1473 13.2573C10.0178 13.3231 9.95347 13.4222 9.95347 13.5879V14.0502C9.95347 14.1826 10.0178 14.2817 10.1473 14.3142C10.1799 14.3142 10.2442 14.3142 10.2768 14.2809C13.3459 13.2898 15.0263 9.95337 14.057 6.81435C13.4754 4.93205 12.0541 3.5112 10.2768 2.91654Z" fill="white"/>
</svg>
`;

const copyIconSvg = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.83366 8.02502V10.475C9.83366 12.5167 9.01699 13.3334 6.97533 13.3334H4.52533C2.48366 13.3334 1.66699 12.5167 1.66699 10.475V8.02502C1.66699 5.98335 2.48366 5.16669 4.52533 5.16669H6.97533C9.01699 5.16669 9.83366 5.98335 9.83366 8.02502Z" stroke="#545454" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M13.3337 4.52502V6.97502C13.3337 9.01669 12.517 9.83335 10.4753 9.83335H9.83366V8.02502C9.83366 5.98335 9.01699 5.16669 6.97533 5.16669H5.16699V4.52502C5.16699 2.48335 5.98366 1.66669 8.02533 1.66669H10.4753C12.517 1.66669 13.3337 2.48335 13.3337 4.52502Z" stroke="#545454" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

interface CardModuleProps {
  /**
   * Custom style for the card container
   */
  style?: ViewStyle;
  
  /**
   * Callback when the card is pressed
   */
  onCardPress?: () => void;
}

const CardModule: React.FC<CardModuleProps> = ({ 
  style,
  onCardPress
}) => {
  // Get wallet address from hook
  const walletAddress = useUserWalletAddress();
  const isAddressLoading = !walletAddress;

  // Use the balance hook
  const blockchainNetwork = process.env.EXPO_PUBLIC_BLOCKCHAIN_NETWORK || 'Base';
  console.log('[CardModule] Using blockchain network:', blockchainNetwork);

  const {
    balances,
    isLoading: isLoadingBalance,
    error: balanceError
  } = useUserBalance({
    symbols: 'USDC',
    chainType: 'ethereum',
    blockchainNetwork
  });

  // Get USDC balance from balances object
  const balance = Number(balances?.USDC?.[blockchainNetwork] ?? 0);
  
  // Format address for display (truncated)
  const displayedWalletAddress = React.useMemo(() => {
    if (!walletAddress) return '';
    if (walletAddress.length <= 12) return walletAddress;
    return `0x${walletAddress.substring(2, 6)}...${walletAddress.substring(walletAddress.length - 4)}`;
  }, [walletAddress]);

  const handleCopyAddress = () => {
    if (!walletAddress) return;
    
    Clipboard.setString(walletAddress); // Copy the full address
    Alert.alert('Address Copied', 'Full address copied to clipboard.');
    console.log('Copy address pressed');
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={onCardPress}
      activeOpacity={onCardPress ? 0.8 : 1}
      disabled={!onCardPress}
    >
      {/* Card Picture Background using Image */}
      <Image 
        source={require('../../../assets/card-wallet/card-picture.png')} 
        style={styles.cardBackground} 
        resizeMode="cover"
      />

      {/* Overlay Content */}
      <View style={styles.overlayContainer}>
        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Your card balance is</Text>
          <View style={styles.amountRow}>
            <SvgXml xml={usdcIconSvg} width={20} height={20} />
            {isLoadingBalance ? (
              <SkeletonLoader 
                width={80} 
                height={24} 
                borderRadius={8}
                backgroundColor="rgba(255, 255, 255, 0.2)"
              />
            ) : (
              <Text style={styles.amountText}>{balance} USDC</Text>
            )}
          </View>
        </View>

        {/* Address Section (Pill Button) */}
        <View style={styles.addressOuterPill}>
          <View style={styles.addressInnerPill}>
            <TouchableOpacity 
              onPress={handleCopyAddress} 
              style={styles.addressContentRow}
              disabled={isAddressLoading}
            >
              {isAddressLoading ? (
                <SkeletonLoader 
                  width={80} 
                  height={16} 
                  borderRadius={8}
                  backgroundColor="rgba(255, 255, 255, 0.2)"
                />
              ) : (
                <Text style={styles.addressText}>{displayedWalletAddress}</Text>
              )}
              <SvgXml xml={copyIconSvg} width={16} height={16} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%', // Use percentage width
    aspectRatio: 354 / 256, // Maintain aspect ratio based on original dimensions
    position: 'relative',
  },
  cardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%', // Ensure image takes full container width
    height: '100%', // Ensure image takes full container height
  },
  overlayContainer: {
    position: 'absolute',
    bottom: '10.15%', // Calculate percentage based on original height (26 / 256)
    left: '5.35%', // Calculate percentage based on original width (19 / 354)
    right: '5.35%', // Calculate percentage based on original width (19 / 354)
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  balanceSection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  balanceLabel: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', // Use SF Pro Display if available
    fontSize: 14,
    fontWeight: '400',
    color: '#575757',
    lineHeight: 17,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amountText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', // Use SF Pro Display if available
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 24, // 120%
  },
  addressOuterPill: {
    backgroundColor: '#C1C1C1',
    borderRadius: 1000, // Large value for pill shape
    padding: 2, // Creates the inset border/shadow illusion
    height: 31, // Height from design Frame 1707480119
  },
  addressInnerPill: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2, 
    paddingHorizontal: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#F4F4F4',
    borderStyle: 'dashed',
    borderRadius: 1000, // Match outer pill
    height: 27, // Height from design Frame 1707479935
    backgroundColor: '#C1C1C1', // Match outer pill bg for seamless inset look
  },
  addressContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.56, // Precise gap from design
  },
  addressText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', // Use SF Pro Text if available
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 23, // 162%
    letterSpacing: -0.420554, // Precise letter spacing
  },
});

export default CardModule;
