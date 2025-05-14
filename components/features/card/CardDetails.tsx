import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useGetCardToken } from '../../../api/hooks/useGetCardToken';
import { useGetUser } from '../../../api/hooks/useGetUser';
import { useIdentityTokenProvider } from '../../../app/(app)/context/identityTokenContexts';

// --- Sudo WebView HTML Helper ---
const sudoElementStyles = (isIOS: boolean) => ({
  base: {
    'font-family': isIOS ? 'System' : 'sans-serif',
    'font-weight': '500',
    'font-size': '16px',
    color: 'blue',
    'line-height': '19px',
  },
  focus: {
    color: '#007AFF',
  },
  error: {
    color: 'red',
  },
  placeholder: {
    color: '#888888',
  },
  copyButton: {
    'background-color': '#ECECEC',
    color: '#121212',
    'font-family': isIOS ? 'System' : 'sans-serif',
    'font-weight': '500',
    'font-size': '14px',
    padding: '6px 10px',
    'border-radius': '100px',
    cursor: 'pointer',
  }
});

const getSudoFieldHtml = (
  type: 'PAN' | 'EXP' | 'CVV',
  cardTokenFromApi: string, 
  cardId: string,
  customStyles: any | null, // Allow customStyles to be null
  enableCopyButton: boolean = false
) => {
  // TODO: Change vaultId to 'vdl2xefo5' for Live environment before deployment
  const vaultId = 'we0dsa28s'; // Sudo Sandbox Vault ID.

  let fieldName: string;
  let apiPath: string;
  let jsonPath: string;
  let includeCopyButton = false;

  switch (type) {
    case 'PAN':
      fieldName = 'pan-text';
      apiPath = `/cards/${cardId}/secure-data/number`; // Matches Sudo example
      jsonPath = 'data.number'; // Matches Sudo example
      includeCopyButton = enableCopyButton;
      break;
    case 'EXP':
      fieldName = 'exp-text';
      // CRITICAL TODO: Verify the correct apiPath and jsonPathSelector for Expiry Date with Sudo documentation/support.
      // The example at https://docs.sudo.africa/docs/displaying-sensitive-card-data does NOT show Expiry for show.request().
      // The previous implementation used sudoShow.EXP.run(), which might be different.
      // Assuming a hypothetical path and selector for now.
      apiPath = `/cards/${cardId}/secure-data/expiryDate`; // HYPOTHETICAL - VERIFY!
      jsonPath = 'data.formattedExpiry'; // HYPOTHETICAL - VERIFY! (e.g., MM/YY)
      includeCopyButton = enableCopyButton;
      break;
    case 'CVV':
      fieldName = 'cvv-text';
      apiPath = `/cards/${cardId}/secure-data/cvv2`; // Matches Sudo example
      jsonPath = 'data.cvv2'; // Matches Sudo example
      includeCopyButton = false; 
      break;
    default:
      console.error('[getSudoFieldHtml] Invalid field type provided:', type);
      return '<html><body>Error: Invalid field type for Sudo SecureProxy.</body></html>';
  }

  // Construct a script that conditionally includes styles if customStyles is provided.
  const scriptContent = `
    try {
      const show = SecureProxy.create('${vaultId}');
      const cardToken = "${cardTokenFromApi}";
      
      const requestOptions = {
        name: '${fieldName}',
        method: 'GET',
        path: '${apiPath}',
        headers: {
          "Authorization": "Bearer " + cardToken
        },
        htmlWrapper: 'text',
        jsonPathSelector: '${jsonPath}',
      };

      if (${customStyles ? 'true' : 'false'}) {
        requestOptions.styles = ${customStyles ? JSON.stringify(customStyles) : '{}'};
      }

      if (${includeCopyButton}) {
        requestOptions.copy_button = true;
      }
      
      const fieldIframe = show.request(requestOptions);
      fieldIframe.render('#sudo-field-container');

    } catch (e) {
      // It's good practice to at least log this to the console if it happens,
      // even if we can't easily send it back to RN without a working postMessage.
      console.error('[Sudo SecureProxy Init Error]', { 
        field: '${type.toLowerCase()}', 
        error: e.message || 'Initialization Error', 
        details: e.stack 
      });
      // Attempt to notify RN, though if postMessage itself is broken, this won't work.
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'initError', field: '${type.toLowerCase()}', error: e.message || 'Initialization Error', details: e.stack }));
      }
    }
  `;

  return `
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script type="text/javascript" src="https://js.securepro.xyz/sudo-show/1.1/ACiWvWF9tYAez4M498DHs.min.js"></script>
  <style>
    body, html { margin: 0; padding: 0; display: flex; align-items: center; justify-content: flex-start; height: 100%; background-color: transparent; }
    #sudo-field-container { width: 100%; }
  </style>
</head>
<body>
  <div id="sudo-field-container"></div>
  <script type="text/javascript">
    ${scriptContent}
  </script>
</body>
</html>`;
};
// --- End Sudo WebView HTML Helper ---

interface CardDetailsProps {}

export default function CardDetails({}: CardDetailsProps) {
  const { getIdentityToken: getPrivyIdentityToken } = useIdentityTokenProvider();
  const [fetchedPrivyIdentityToken, setFetchedPrivyIdentityToken] = useState<string | null>(null);
  const [isFetchingPrivyIdentityToken, setIsFetchingPrivyIdentityToken] = useState(false);

  const { 
    data: userApiResponse, 
    isLoading: isUserLoading, 
    error: userError 
  } = useGetUser();

  const cardId = userApiResponse?.data?.cardId; 

  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  const sudoFieldBaseStyles = sudoElementStyles(Platform.OS === 'ios');

  const {
    data: cardTokenResponse,
    isFetching: isSudoTokenFetching,
    error: cardTokenError,
    isSuccess: isSudoTokenSuccess,
  } = useGetCardToken({
    identityToken: fetchedPrivyIdentityToken,
    enabled: !!fetchedPrivyIdentityToken,
  });
  
  const cardToken = cardTokenResponse?.token;

  useEffect(() => {
    const logStyle = "font-weight: bold; font-size: 1.1em; color: teal;";
    const detailStyle = "color: navy;";
    const tokenStyle = "color: darkgreen; font-style: italic;";

    console.log(`%c[CardDetails State Update]`, logStyle);
    console.log(`%c  User Data Loading:`, detailStyle, isUserLoading);
    console.log(`%c  User Data Error:`, detailStyle, userError ? userError.message : 'null');
    console.log(`%c  Derived cardId:`, detailStyle, cardId);
    console.log(`%c  Fetching Privy ID Token:`, detailStyle, isFetchingPrivyIdentityToken);
    console.log(`%c  Fetched Privy ID Token:`, tokenStyle, fetchedPrivyIdentityToken);
    console.log(`%c  Sudo Token Fetching:`, detailStyle, isSudoTokenFetching);
    console.log(`%c  Sudo Token Error:`, detailStyle, cardTokenError ? cardTokenError.message : 'null');
    console.log(`%c  Raw cardTokenResponse:`, detailStyle, cardTokenResponse);
    console.log(`%c  Fetched Sudo Token: %c${cardToken}`, detailStyle, tokenStyle);
    console.log(`%c------------------------------------`, logStyle);
  }, [
    isUserLoading, userError, cardId, 
    isFetchingPrivyIdentityToken, fetchedPrivyIdentityToken,
    isSudoTokenFetching, cardTokenError, cardTokenResponse, cardToken
  ]);

  const fetchTokensAndRevealDetails = async () => {
    const flowLogStyle = "font-weight: bold; color: green;";
    console.log(`%c[RevealFlow] Starting token fetch process.`, flowLogStyle);
    setIsDetailsVisible(true); // Optimistically show loading/masked states

    try {
      console.log(`%c[RevealFlow] Fetching Privy Identity Token...`, flowLogStyle);
      setIsFetchingPrivyIdentityToken(true);
      const privyToken = await getPrivyIdentityToken();
      setFetchedPrivyIdentityToken(privyToken);
      setIsFetchingPrivyIdentityToken(false);

      if (privyToken) {
        console.log(`%c[RevealFlow] Privy Identity Token fetched successfully. Sudo token fetch will be triggered by useGetCardToken automatically.`, flowLogStyle);
        if (!cardId) {
          console.error(`%c[RevealFlow] ERROR: Card ID (from user data) is missing. This might affect UI but Sudo token fetch is independent.`, flowLogStyle);
        }
      } else {
        console.error(`%c[RevealFlow] ERROR: Failed to fetch Privy Identity Token.`, flowLogStyle);
        Alert.alert('Authentication Error', 'Could not retrieve necessary identity information. Please try again.');
        setIsDetailsVisible(false); // Hide details if Privy token fails
      }
    } catch (error) {
      console.error('%c[RevealFlow] Error during token fetching process:', flowLogStyle, error);
      setIsFetchingPrivyIdentityToken(false); 
      Alert.alert('Error', 'An error occurred while trying to reveal details. Please try again.');
      setIsDetailsVisible(false);
    }
  };

  const handleRevealPress = () => {
    if (isDetailsVisible) { // If details are visible or in process of being shown
      setIsDetailsVisible(false);
      setFetchedPrivyIdentityToken(null); // Clear Privy token when hiding
      // Sudo token is managed by React Query, invalidation might be needed if we want to force clear
    } else { // If details are hidden
      fetchTokensAndRevealDetails();
    }
  };

  const maskedValue = "••••";

  const renderSensitiveField = (
    type: 'PAN' | 'EXP' | 'CVV',
    label: string,
    enableSudoCopy: boolean = false
  ) => {
    if (!cardId) {
      return <Text style={[styles.detailValue, styles.maskedText]}>No available card</Text>;
    }
    if (isDetailsVisible) {
      if (isFetchingPrivyIdentityToken) {
        return <Text style={styles.detailValue}>Fetching identity...</Text>;
      }
      if (!fetchedPrivyIdentityToken && !isSudoTokenFetching) {
        return <Text style={[styles.detailValue, styles.errorText]}>Identity token missing</Text>;
      }
      if (isSudoTokenFetching) {
        return <Text style={styles.detailValue}>Loading secure details...</Text>;
      }
      if (cardTokenError) {
        return <Text style={[styles.detailValue, styles.errorText]}>Error loading secure details</Text>;
      }
      if (cardToken && fetchedPrivyIdentityToken) { 
        const fieldHtml = getSudoFieldHtml(type, cardToken, cardId, sudoFieldBaseStyles, enableSudoCopy);
        return (
          <View style={styles.webViewContainer}>
            <WebView
              originWhitelist={['*']}
              source={{ html: fieldHtml }}
              style={styles.webView}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              onMessage={(event) => {
                try {
                  const messageData = JSON.parse(event.nativeEvent.data);
                  console.log(`[WebView Message - ${type}] Parsed Data:`, messageData);
                } catch (e) {
                  console.error(`[WebView Message - ${type}] Error parsing message:`, e);
                  console.log(`[WebView Message - ${type}] Raw Data:`, event.nativeEvent.data);
                }
              }}
              onError={(syntheticEvent) => {
                const {nativeEvent} = syntheticEvent;
                console.warn(`[WebView LoadError - ${type}] Code: ${nativeEvent.code}, Description: ${nativeEvent.description}`);
              }}
              onHttpError={(syntheticEvent) => {
                const {nativeEvent} = syntheticEvent;
                console.warn(
                  `[WebView HttpError - ${type}] URL: ${nativeEvent.url}, StatusCode: ${nativeEvent.statusCode}, Description: ${nativeEvent.description}`
                );
              }}
              containerStyle={{ backgroundColor: 'transparent' }}
            />
          </View>
        );
      }
      if (fetchedPrivyIdentityToken && !cardToken && !isSudoTokenFetching && !cardTokenError) {
        return <Text style={[styles.detailValue, styles.errorText]}>Could not load secure details</Text>;
      }
    }
    return <Text style={[styles.detailValue, styles.maskedText]}>{type === 'PAN' ? 'XXXX XXXX XXXX XXXX' : maskedValue}</Text>;
  };

  if (isUserLoading) {
    return (
      <View style={[styles.cardDetailsWrapper, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading user details...</Text> 
      </View>
    );
  }

  if (userError) {
    return (
      <View style={[styles.cardDetailsWrapper, styles.centerContent]}>
        <Text style={styles.errorText}>Error loading user data: {userError.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.cardDetailsWrapper}>
      <View style={styles.cardDetailsHeader}>
        <Text style={styles.cardDetailsTitle}>Card details</Text>
        <TouchableOpacity 
          style={styles.revealButton}
          onPress={handleRevealPress}
          disabled={(!cardId || isFetchingPrivyIdentityToken || (isDetailsVisible && isSudoTokenFetching))} 
        >
          <Ionicons 
            name={(isDetailsVisible && cardToken && !cardTokenError && fetchedPrivyIdentityToken) ? "eye-off-outline" : "eye-outline"} 
            size={16} 
            color={!cardId ? '#D3D3D3' : '#7F7F7F'} // Grey out icon if no cardId
          />
          <Text style={[styles.revealText, !cardId && styles.disabledText]}> 
            {(isDetailsVisible && cardToken && !cardTokenError && fetchedPrivyIdentityToken) ? 'Hide' : 'Reveal'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardDetailsContainer}>
        <View style={styles.detailSection}>
          <Text style={styles.detailLabel}>Card number</Text>
          {renderSensitiveField('PAN', 'Card number', true)}
        </View>
        <View style={styles.divider} />
        
        <View style={styles.detailSection}>
          <Text style={styles.detailLabel}>Valid until</Text>
          {renderSensitiveField('EXP', 'Expiry date', true)}
        </View>
        <View style={styles.divider} />
        
        <View style={styles.detailSection}>
          <Text style={styles.detailLabel}>CVV</Text>
          {renderSensitiveField('CVV', 'CVV')}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardDetailsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 0, 
    marginBottom: 24,
    alignSelf: 'stretch',
  },
  centerContent: { 
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1, 
    padding: 20,
  },
  cardDetailsHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'stretch',
  },
  cardDetailsTitle: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: '#121212',
  },
  revealButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    paddingHorizontal: 8,
    gap: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1,
    elevation: 1,
    borderRadius: 100,
  },
  revealText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#7F7F7F',
  },
  disabledText: {
    color: '#D3D3D3',
  },
  cardDetailsContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1,
    elevation: 1,
    borderRadius: 20,
    alignSelf: 'stretch',
  },
  detailSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
    alignSelf: 'stretch',
  },
  detailLabel: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#888888',
  },
  detailValue: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: '#121212',
  },
  divider: {
    height: 0.5,
    backgroundColor: '#E8E8E8',
    alignSelf: 'stretch',
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
  },
  copyButton: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 12,
    gap: 4,
    backgroundColor: '#ECECEC',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1,
    elevation: 1,
    borderRadius: 100,
  },
  copyButtonActive: {
    backgroundColor: '#E0F7E0',
  },
  copyText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#121212',
  },
  maskedText: {
    color: '#888888',
  },
  errorText: {
    color: 'red',
  },
  webViewContainer: {
    height: 40, 
    width: '100%',
    justifyContent: 'center',
  },
  webView: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
}); 