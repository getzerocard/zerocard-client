import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';
import { usePrivy, useLogin, useHeadlessDelegatedActions, useIdentityToken } from '@privy-io/expo';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import useWalletDelegation from './useWalletDelegation';

// Import the Zerocard logo as a string
const zerocardLogo = `<svg width="37" height="28" viewBox="0 0 37 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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

export default function SplashScreen() {
  const privyContext = usePrivy() as any;
  const { user } = privyContext;
  const ready = privyContext.isReady === true;
  const { login } = useLogin();
  const { getIdentityToken } = useIdentityToken();

  // Once Privy is ready and a user is present, fetch and log the raw identity token
  useEffect(() => {
    if (ready && user) {
      console.log('[SplashScreen] → Privy ready, user detected. Fetching identity token…');
      getIdentityToken()
        .then((token) => {
          if (token) {
            console.log('[SplashScreen] ✅ Identity Token:', token);
          } else {
            console.warn('[SplashScreen] ⚠️ No identity token (user not logged in?)');
          }
        })
        .catch((err) => {
          console.error('[SplashScreen] ❌ Error fetching identity token:', err);
        });
    }
  }, [ready, user]);

  // Show loading state while Privy initializes
  if (!ready) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#40ff00" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If user is authenticated, redirect to the post-auth onboarding screen within the (app) group
  if (user) {
    return <Redirect href="/(app)/post-auth" />;
  }

  const handleStartSpending = async () => {
    try {
      await login({ loginMethods: ['email'] });
      console.log('Login initiated successfully');
    } catch (error: any) {
      // Log all errors to terminal for debugging
      console.log('=== Login Error Details ===');
      console.log('Error type:', error?.name);
      console.log('Error message:', error?.message);
      console.log('Error stack:', error?.stack);
      console.log('=== End Error Details ===');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.mainContent}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/plashscreen-card.png')}
            style={styles.cardImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <SvgXml xml={zerocardLogo} width={37} height={28} />
          </View>

          <View style={styles.textAndButtonContainer}>
            <Text style={styles.title}>
              Spend crypto{`\n`}
              like cash 💸
            </Text>

            <View style={styles.actionContainer}>
              <TouchableOpacity style={styles.getStartedButton} onPress={handleStartSpending}>
                <Text style={styles.buttonText}>Start spending</Text>
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrow}>→</Text>
                </View>
              </TouchableOpacity>

              <Text style={styles.termsText}>
                By using Zerocard, you agree to accept our{' '}
                <Text style={styles.termsLink}>Terms of Use</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.betaButton}>
          <Ionicons name="flask-outline" size={16} color="#ABABAB" />
          <Text style={styles.betaText}>We are in Beta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    paddingTop: 0,
    gap: 24,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  cardImage: {
    width: '100%',
    height: 406,
  },
  contentContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 38,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textAndButtonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 46,
  },
  title: {
    fontFamily: 'SF Pro Text',
    fontWeight: '700',
    fontSize: 36,
    lineHeight: 43,
    textAlign: 'center',
    color: '#000000',
  },
  actionContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 35,
  },
  getStartedButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
    width: 172,
    height: 49,
    backgroundColor: '#40FF00',
    borderRadius: 100000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 11,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: {
    textAlign: 'center',
    color: 'black',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 16.8,
    fontFamily: 'System',
  },
  arrowContainer: {
    transform: [{ scaleX: -1 }],
  },
  arrow: {
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',
    color: '#ABABAB',
    maxWidth: 260,
  },
  termsLink: {
    color: '#000000',
  },
  betaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  betaText: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    color: '#ABABAB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
});
