import { useRouter } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

import { AddMoney } from '../../../components/features/add-money/AddMoney';

export default function AddMoneyScreen() {
  const router = useRouter();

  const handleFundedWallet = () => {
    // Navigate to the home tab directly
    router.push('/(tab)/home');
  };

  const handleSkip = () => {
    // Navigate to the home tab directly
    router.push('/(tab)/home');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      <AddMoney onFundedWallet={handleFundedWallet} onSkip={handleSkip} />
    </View>
  );
}
