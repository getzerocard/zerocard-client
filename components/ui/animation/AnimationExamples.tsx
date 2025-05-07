import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LottieAnimation } from '../feedback/LottieAnimation';
import { LoadingSpinner } from '../feedback/LoadingSpinner';

/**
 * A component that demonstrates different ways to use the animation components.
 * This can be imported and used in any screen for reference.
 */
const AnimationExamples: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Animation Examples</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Lottie Animation</Text>
        <LottieAnimation
          source="https://lottie.host/ba1c24cb-50de-47c1-8781-d609401ac8df/qn48q8KwW9.lottie"
          size={100}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Loading Spinner with Lottie</Text>
        <LoadingSpinner useLottie size="large" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Loading Spinner with ActivityIndicator</Text>
        <LoadingSpinner useLottie={false} color="#FF5722" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Sized Animation</Text>
        <LottieAnimation
          source="https://lottie.host/ba1c24cb-50de-47c1-8781-d609401ac8df/qn48q8KwW9.lottie"
          size={80}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '500',
  },
});

export default AnimationExamples;
