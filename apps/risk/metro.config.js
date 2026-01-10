const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch the whole monorepo
config.watchFolders = [workspaceRoot];

// 2. Force resolution of react to the app's node_modules
// This prevents "Double React" even if packages have their own installs
config.resolver.extraNodeModules = {
    'react': path.resolve(projectRoot, 'node_modules/react'),
    'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
    'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};

// 3. Ensure Metro looks in the right places
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];

config.resolver.unstable_enableSymlinks = true;

module.exports = config;