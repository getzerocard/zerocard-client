import React, { createContext, useContext, useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import { Transaction } from '../types';

interface CryptoDepositContextType {
  isModalVisible: boolean;
  setIsModalVisible: (visible: boolean) => void;
  currentTransaction: Transaction | null;
  setCurrentTransaction: (tx: Transaction | null) => void;
  handleNewDeposit: (tx: Transaction) => void;
}

const CryptoDepositContext = createContext<CryptoDepositContextType | undefined>(undefined);

export const CryptoDepositProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [sound, setSound] = useState<Audio.Sound>();

  async function playSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sound/cashier-quotka-chingquot-sound-effect-129698.mp3')
      );
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  // In a real app, you would use a blockchain listener like this:
  /*
  useEffect(() => {
    // Set up a subscription to your wallet or blockchain events
    const unsubscribe = subscribeToWalletDeposits(walletAddress, (tx) => {
      const newTransaction = {
        amount: tx.amount,
        currency: tx.currency,
        timestamp: {
          date: new Date(tx.timestamp).toLocaleDateString(),
          time: new Date(tx.timestamp).toLocaleTimeString()
        },
        transactionHash: tx.hash,
        chain: tx.chain
      };
      
      setCurrentTransaction(newTransaction);
      setIsModalVisible(true);
      playSound();
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [walletAddress]);
  */

  // Clean up sound resources
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // This function will now be exposed via context
  const handleNewDeposit = (tx: Transaction) => {
    setCurrentTransaction(tx);
    setIsModalVisible(true);
    playSound();
  };

  return (
    <CryptoDepositContext.Provider
      value={{
        isModalVisible,
        setIsModalVisible,
        currentTransaction,
        setCurrentTransaction,
        handleNewDeposit,
      }}
    >
      {children}
    </CryptoDepositContext.Provider>
  );
};

export const useCryptoDepositListener = (): CryptoDepositContextType => {
  const context = useContext(CryptoDepositContext);
  if (context === undefined) {
    throw new Error('useCryptoDepositListener must be used within a CryptoDepositProvider');
  }
  return context;
};

export default useCryptoDepositListener; 