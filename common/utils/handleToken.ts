export interface TokenGetters {
  getIdentityToken: () => Promise<string | null>;
  getAccessToken?: () => Promise<string | null>;
}

export async function getAuthTokens(tokenAccessors: TokenGetters): Promise<{
  identityToken: string | null;
  accessToken: string | null;
}> {
  try {
    const identityToken = await tokenAccessors.getIdentityToken();
    const accessToken = tokenAccessors.getAccessToken ? await tokenAccessors.getAccessToken() : null;
    
    return { identityToken, accessToken };
  } catch (error) {
    console.error('[handleToken] Error getting auth tokens:', error);
    return { identityToken: null, accessToken: null };
  }
}
