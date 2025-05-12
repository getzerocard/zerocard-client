import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OrderAddressDetails {
  street: string | undefined;
  city: string | undefined;
  state: string | undefined;
  postalCode: string | undefined;
}

interface KycVerificationDetails {
  verificationId: string | null;
  verificationNumber: string | null;
}

interface OrderCardState {
  shippingAddress: OrderAddressDetails | null;
  kycDetails: KycVerificationDetails | null;
  setShippingAddress: (address: OrderAddressDetails) => void;
  setKycVerificationDetails: (details: KycVerificationDetails) => void;
  clearShippingAddress: () => void;
  clearKycVerificationDetails: () => void;
}

export const useOrderCardStore = create<OrderCardState>()(
  persist(
    (set) => ({
      shippingAddress: null,
      kycDetails: null,
      setShippingAddress: (address) => set({ shippingAddress: address }),
      setKycVerificationDetails: (details) => set({ kycDetails: details }),
      clearShippingAddress: () => set({ shippingAddress: null }),
      clearKycVerificationDetails: () => set({ kycDetails: null }),
    }),
    {
      name: 'order-card-shipping-address-storage', // Name for AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
