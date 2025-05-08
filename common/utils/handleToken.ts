export interface TokenGetters {
  getIdentityToken: () => Promise<string | null>;
  getAccessToken?: () => Promise<string | null>;
  getSessionToken?: () => Promise<string | null>;
}

export async function getAuthTokens(tokenAccessors: TokenGetters): Promise<{
  identityToken: string | null;
  accessToken: string | null;
  sessionToken: string | null;
}> {
  try {
    const identityToken = await tokenAccessors.getIdentityToken();
    const accessToken = tokenAccessors.getAccessToken ? await tokenAccessors.getAccessToken() : null;
    const sessionToken = tokenAccessors.getSessionToken ? await tokenAccessors.getSessionToken() : null;
    
    return { identityToken, accessToken, sessionToken };
  } catch (error) {
    console.error('[handleToken] Error getting auth tokens:', error);
    return { identityToken: null, accessToken: null, sessionToken: null };
  }
}
