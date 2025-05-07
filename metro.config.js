// Alternative Metro configuration
const { getDefaultConfig } = require('@expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');
const fs = require('fs');

// Get the absolute path of the project root
const projectRoot = path.resolve(process.cwd());

// Create a basic config
const config = getDefaultConfig(projectRoot);

// Enable package exports for Privy
const modulesToEnableExports = ['@privy-io/expo', '@privy-io/expo/passkey'];
const resolveRequestWithPackageExports = (context, moduleName, platform) => {
  if (modulesToEnableExports.includes(moduleName)) {
    const ctx = {
      ...context,
      unstable_enablePackageExports: true,
    };
    return ctx.resolveRequest(ctx, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

config.resolver.resolveRequest = resolveRequestWithPackageExports;

// Add asset file extensions
config.resolver.assetExts.push('glb', 'gltf', 'png', 'jpg', 'jpeg', 'ttf');
config.resolver.sourceExts.push('js', 'json', 'ts', 'tsx', 'cjs');

// Make sure all paths are absolute
config.projectRoot = projectRoot;

// Export the config through NativeWind
module.exports = withNativeWind(config, { input: path.join(projectRoot, 'global.css') }); 