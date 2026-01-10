const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// 1. Find the project and workspace roots
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 2. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 3. Force resolution to the root node_modules for hoisted packages
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];

// 4. Enable Symlinks for Yarn Workspaces
config.resolver.unstable_enableSymlinks = true;

// 5. BlockList: Prevent Metro from seeing local versions of core packages
// This ensures React from root is always used.
config.resolver.blockList = [
    /.*\/apps\/risk\/node_modules\/react\/.*/,
    /.*\/apps\/risk\/node_modules\/react-native\/.*/,
    /.*\/apps\/risk\/node_modules\/react-dom\/.*/,
];

// 6. Ensure the UI library is treated as source code
config.resolver.disableHierarchicalLookup = true;

module.exports = config;