import { useRouter } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

import { AddMoney } from '../../../components/features/add-money/AddMoney';
import UsernameModal from '../../../components/modals/username/UsernameModal';
import { Button } from '../../../components/ui/Button';

export default function AddMoneyScreen() {
  const router = useRouter();
  const [showUsernameModal, setShowUsernameModal] = React.useState(false);

  const handleFundedWallet = () => {
    // Show username modal after 3 seconds
    setTimeout(() => {
      setShowUsernameModal(true);
    }, 3000);
  };

  const handleSkip = () => {
    // Show username modal after 3 seconds
    setTimeout(() => {
      setShowUsernameModal(true);
    }, 3000);
  };

  const handleCloseUsernameModal = () => {
    setShowUsernameModal(false);
  };

  const handleSetUsername = (username: string) => {
    // Save username (implementation needed)
    console.log(`Username set to: ${username}`);
    setShowUsernameModal(false);
    // Navigate to the home tab
    router.push('/(tab)/home');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      <AddMoney onFundedWallet={handleFundedWallet} onSkip={handleSkip} />

      <UsernameModal
        visible={showUsernameModal}
        onClose={handleCloseUsernameModal}
        onSetUsername={handleSetUsername}
      />
    </View>
  );
}
