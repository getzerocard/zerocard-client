# Zerocard App

This is a React Native application built with Expo.

## Environment Setup

This app requires environment variables to be set for proper configuration. Create a `.env` file in the root directory with the following variables:

```bash
# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://api.zerocard.com/v1

# Privy Configuration
EXPO_PUBLIC_PRIVY_APP_ID=your_privy_app_id
EXPO_PUBLIC_PRIVY_CLIENT_ID=your_privy_client_id
```

Note: All environment variables used in Expo must be prefixed with `EXPO_PUBLIC_` to be accessible in the app.

## API Service

The app uses Axios for API requests with:
- Automatic authentication token handling via Privy
- Error interceptors
- Type-safe responses
- Base URL configuration from environment variables

To use the API service in your components:

```typescript
import { apiService } from '../api';
import UserApi from '../api/userApi';

// Example usage in a component
const fetchUserProfile = async () => {
  try {
    // Direct API call using the service
    const userData = await apiService.get('/users/me');
    
    // Or using a specific API module
    const user = await UserApi.getCurrentUser();
    
    console.log('User data:', user);
  } catch (error) {
    console.error('Error fetching user:', error);
  }
};
```

## Running the App

### Development

To start the app in development mode with live reloading:

```bash
yarn start
```

This will start the Metro bundler and provide options to open the app in the Expo Go app or a simulator/emulator.

### Production Build

To create a production-ready build of the app (e.g., for submitting to app stores):

```bash
eas build --profile production
```

This command uses Expo Application Services (EAS) to build an optimized standalone app package.
