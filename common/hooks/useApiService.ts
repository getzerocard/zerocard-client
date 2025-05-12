import { useIdentityTokenProvider } from '../../app/(app)/context/identityTokenContexts';
import { useAccessTokenProvider } from '../../app/(app)/context/accessTokenContext';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://[::1]:3000/api/v1';

export function useApiService() {
  const { getIdentityToken } = useIdentityTokenProvider();
  const { getAccessToken } = useAccessTokenProvider();

  const fetchWithTokens = async (
    endpoint: string,
    options: RequestInit = {},
    useIdentityToken: boolean = true,
    useAccessTokenFlag: boolean = true
  ): Promise<Response> => {
    const headers = new Headers(options.headers as HeadersInit || {});
    headers.set('Accept', 'application/json');

    if (useIdentityToken) {
      const idToken = await getIdentityToken?.();
      if (idToken) headers.set('x-identity-token', idToken);
    }

    if (useAccessTokenFlag) {
      const accessToken = await getAccessToken?.();
      if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const requestOptions: RequestInit = {
      ...options,
      headers,
    };

    console.log('Request URL:', url);
    console.log('Request Options:', JSON.stringify(requestOptions, null, 2));

    const response = await fetch(url, requestOptions);
    return response;
  };

  return {
    get: (endpoint: string, options: RequestInit = {}) =>
      fetchWithTokens(endpoint, { ...options, method: 'GET' }),

    post: (endpoint: string, body: any, options: RequestInit = {}) => {
      const headers = new Headers(options.headers as HeadersInit || {});
      headers.set('Content-Type', 'application/json');
      return fetchWithTokens(endpoint, {
        ...options,
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
    },

    put: (endpoint: string, body: any, options: RequestInit = {}) => {
      const headers = new Headers(options.headers as HeadersInit || {});
      headers.set('Content-Type', 'application/json');
      return fetchWithTokens(endpoint, {
        ...options,
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });
    },

    delete: (endpoint: string, options: RequestInit = {}) =>
      fetchWithTokens(endpoint, { ...options, method: 'DELETE' }),
  };
} 