// It's often better to define an interface for the expected shape 
// of the token provider rather than importing a specific client type directly,
// especially if that type is not easily accessible or meant for internal use by the library.

// New interface for providing token getter functions
export interface TokenGetters {
  getAccessToken: () => Promise<string | null>;
  getIdentityToken: () => Promise<string | null>;
  getSessionToken?: () => Promise<string | null>; // Optional session token getter
}

// Updated AuthTokens interface to reflect raw identity token
interface AuthTokens {
  accessToken: string | null;
  identityToken: string | null; // Raw token, no "Bearer " prefix
  sessionToken: string | null; // Session token for specific authorization
}

/**
 * Retrieves both access and identity tokens using provided getter functions.
 *
 * @param tokenGetters - An object containing getAccessToken and getIdentityToken functions.
 * @returns A promise that resolves to an object containing the accessToken and raw identityToken.
 */
export async function getAuthTokens(tokenGetters: TokenGetters): Promise<AuthTokens> {
  let accessToken: string | null = null;
  let identityToken: string | null = null;
  let sessionToken: string | null = null;

  console.log('[getAuthTokens] Attempting to retrieve tokens...');

  if (typeof tokenGetters.getAccessToken === 'function') {
    try {
      console.log('[getAuthTokens] Calling getAccessToken()...');
      accessToken = await tokenGetters.getAccessToken();
      console.log('[getAuthTokens] Access Token retrieved:', accessToken ? `Present (Starts with: ${accessToken.substring(0,10)}...)` : 'null');
    } catch (error) {
      console.error('[getAuthTokens] Error retrieving access token:', error);
    }
  } else {
    console.warn('[getAuthTokens] getAccessToken function not provided or not a function.');
  }

  if (typeof tokenGetters.getIdentityToken === 'function') {
    try {
      console.log('[getAuthTokens] Calling getIdentityToken()...');
      identityToken = await tokenGetters.getIdentityToken(); // Use the passed function
      console.log('[getAuthTokens] Identity Token retrieved:', identityToken ? `Present (Starts with: ${identityToken.substring(0,10)}...)` : 'null');
    } catch (error) {
      console.error('[getAuthTokens] Error retrieving identity token:', error);
    }
  } else {
    console.warn('[getAuthTokens] getIdentityToken function not provided or not a function.');
  }
  
  // Try to get session token if available
  if (typeof tokenGetters.getSessionToken === 'function') {
    try {
      console.log('[getAuthTokens] Calling getSessionToken()...');
      sessionToken = await tokenGetters.getSessionToken();
      console.log('[getAuthTokens] Session Token retrieved:', sessionToken ? `Present (Starts with: ${sessionToken.substring(0,10)}...)` : 'null');
    } catch (error) {
      console.error('[getAuthTokens] Error retrieving session token:', error);
    }
  } else {
    console.log('[getAuthTokens] No getSessionToken function provided - will use identity token for authorization.');
  }
  
  console.log('[getAuthTokens] Token retrieval process complete.');
  return {
    accessToken,
    identityToken, // Return raw token
    sessionToken,
  };
}
