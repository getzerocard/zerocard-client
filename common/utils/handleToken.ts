// It's often better to define an interface for the expected shape 
// of the token provider rather than importing a specific client type directly,
// especially if that type is not easily accessible or meant for internal use by the library.

interface TokenProvider {
  getAccessToken: () => Promise<string | null>;
  getIdentityToken: () => Promise<string | null>;
  // Add any other methods from PrivyClient you might need here if you expand this function
}

interface AuthTokens {
  accessToken: string | null;
  identityToken: string | null; // This will now include "Bearer " if the token exists
}

/**
 * Retrieves both access and identity tokens from a given token provider.
 *
 * @param tokenProvider - An object that conforms to the TokenProvider interface.
 *                        This would typically be an instance of PrivyClient from '@privy-io/expo'.
 * @returns A promise that resolves to an object containing the accessToken and identityToken.
 *          The identityToken will be prefixed with "Bearer " if present.
 */
export async function getAuthTokens(tokenProvider: TokenProvider): Promise<AuthTokens> {
  let accessToken: string | null = null;
  let rawIdentityToken: string | null = null;

  try {
    accessToken = await tokenProvider.getAccessToken();
  } catch (error) {
    console.error('Error retrieving access token:', error);
    // accessToken remains null, error is logged
  }

  try {
    rawIdentityToken = await tokenProvider.getIdentityToken();
  } catch (error) {
    console.error('Error retrieving identity token:', error);
    // rawIdentityToken remains null, error is logged
  }

  return {
    accessToken,
    identityToken: rawIdentityToken ? `Bearer ${rawIdentityToken}` : null,
  };
}
