import React, { createContext, useContext, useState } from 'react';

interface DepositModalContextType {
  isVisible: boolean;
  walletId: string;
  showModal: () => void;
  hideModal: () => void;
}

const DepositModalContext = createContext<DepositModalContextType | undefined>(undefined);

export function useDepositModal() {
  const context = useContext(DepositModalContext);
  if (!context) {
    throw new Error('useDepositModal must be used within a DepositModalProvider');
  }
  return context;
}

interface DepositModalProviderProps {
  children: React.ReactNode;
  walletId: string;
}

export function DepositModalProvider({ children, walletId }: DepositModalProviderProps) {
  const [isVisible, setIsVisible] = useState(false);

  const showModal = () => setIsVisible(true);
  const hideModal = () => setIsVisible(false);

  const value = {
    isVisible,
    walletId,
    showModal,
    hideModal,
  };

  return (
    <DepositModalContext.Provider value={value}>
      {children}
    </DepositModalContext.Provider>
  );
} 