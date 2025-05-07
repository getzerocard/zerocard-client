// Load environment variables from .env file
require('dotenv').config();

module.exports = function (api) {
  api.cache(true);

  const plugins = [
    // 'expo-router/babel', // This is now included in babel-preset-expo (removed due to deprecation warning)
    'react-native-reanimated/plugin',
  ];

  // Standard check: Remove console logs ONLY in production builds
  if (process.env.NODE_ENV === 'production') {
    plugins.push('transform-remove-console');
  }

  return {
    presets: ['babel-preset-expo'],
    plugins: plugins,
  };
};
