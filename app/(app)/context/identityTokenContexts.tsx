import { createContext, useContext, useMemo } from 'react';
import { useIdentityToken } from '@privy-io/expo';

const IdentityTokenContext = createContext<{
  getIdentityToken: () => Promise<string | null>;
} | null>(null);

export const IdentityTokenProvider = ({ children }: { children: React.ReactNode }) => {
  const { getIdentityToken } = useIdentityToken();

  const value = useMemo(
    () => ({
      getIdentityToken: async () => {
        try {
          return await getIdentityToken();
        } catch (e) {
          console.error('Error getting identity token:', e);
          return null;
        }
      },
    }),
    [getIdentityToken]
  );

  return (
    <IdentityTokenContext.Provider value={value}>
      {children}
    </IdentityTokenContext.Provider>
  );
};

export const useIdentityTokenProvider = () => {
  const ctx = useContext(IdentityTokenContext);
  if (!ctx) throw new Error('useIdentityTokenProvider must be used within IdentityTokenProvider');
  return ctx;
};
