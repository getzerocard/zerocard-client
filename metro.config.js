// Alternative Metro configuration
const { getDefaultConfig } = require('@expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const path = require('path');

// Get the absolute path of the project root
const projectRoot = path.resolve(process.cwd());

// Create a basic config using Sentry's utility, which wraps getDefaultConfig
let config = getSentryExpoConfig(projectRoot);

const sentryProvidedResolver = config.resolver && typeof config.resolver.resolveRequest === 'function' ? config.resolver.resolveRequest : null;

if (!sentryProvidedResolver) {
  console.warn(
    'Sentry SDK did not provide a resolver function on config.resolver.resolveRequest. ' +
    'Falling back to context.resolveRequest for Privy modules. This might bypass Sentry module resolution for those modules.'
  );
}

// Enable package exports for Privy
const modulesToEnableExports = ['@privy-io/expo', '@privy-io/expo/passkey'];

// Store the resolver that was on the config before our modification (ideally Sentry's)
const nextResolverInChain = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Determine the actual resolver to call *after* Privy logic.
  // This should be what Sentry provided, or if not, what Metro would use (available on context).
  const resolverFn = typeof nextResolverInChain === 'function' 
    ? nextResolverInChain 
    : context.resolveRequest; // Default Metro resolver from context

  if (modulesToEnableExports.includes(moduleName)) {
    const privyModifiedContext = {
      ...context,
      unstable_enablePackageExports: true,
      // Ensure the resolver we call from this modified context is the correct one from the chain.
      // This is subtle: context.resolveRequest passed to *us* is the one *before* us.
      // resolverFn is the one *after* us (Sentry/Default).
      // When calling resolverFn, it expects its own context. So we pass privyModifiedContext.
    };
    return resolverFn(privyModifiedContext, moduleName, platform);
  }
  return resolverFn(context, moduleName, platform);
};

// Add asset file extensions - getSentryExpoConfig should already handle defaults,
// but we ensure your custom ones are definitely there.
const defaultAssetExts = require('metro-config/src/defaults/defaults').assetExts;
config.resolver.assetExts = [
  ...new Set([
    ...defaultAssetExts,
    ...(config.resolver.assetExts || []),
    'glb',
    'gltf',
    'png',
    'jpg',
    'jpeg',
    'ttf',
  ]),
];

// Add source file extensions - getSentryExpoConfig should already handle defaults.
const defaultSourceExts = require('metro-config/src/defaults/defaults').sourceExts;
config.resolver.sourceExts = [
  ...new Set([
    ...defaultSourceExts,
    ...(config.resolver.sourceExts || []),
    'js',
    'json',
    'ts',
    'tsx',
    'cjs',
  ]),
];

// Make sure all paths are absolute - getSentryExpoConfig should handle this.
config.projectRoot = projectRoot;

// Export the config, wrapped with NativeWind
module.exports = withNativeWind(config, { input: path.join(projectRoot, 'global.css') });
