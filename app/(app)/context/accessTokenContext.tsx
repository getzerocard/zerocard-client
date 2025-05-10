import { createContext, useContext, useMemo } from 'react';
import { usePrivy } from '@privy-io/expo';

const AccessTokenContext = createContext<{
  getAccessToken: () => Promise<string | null>;
} | null>(null);

export const AccessTokenProvider = ({ children }: { children: React.ReactNode }) => {
  const privy = usePrivy();

  const value = useMemo(
    () => ({
      getAccessToken: async () => {
        try {
          const token = await privy.getAccessToken();
          return token;
        } catch (e) {
          console.error('Error fetching Privy access token:', e);
          return null;
        }
      },
    }),
    [privy]
  );

  return (
    <AccessTokenContext.Provider value={value}>
      {children}
    </AccessTokenContext.Provider>
  );
};

export const useAccessTokenProvider = () => {
  const ctx = useContext(AccessTokenContext);
  if (!ctx) throw new Error('useAccessTokenProvider must be used within AccessTokenProvider');
  return ctx;
};
