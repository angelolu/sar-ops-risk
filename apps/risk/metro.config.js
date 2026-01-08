const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// 1. Resolve the absolute paths for the app and the monorepo root
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 2. Tell Metro to watch the entire monorepo for file changes
config.watchFolders = [workspaceRoot];

// 3. Ensure Metro looks in BOTH the local and root node_modules
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];

// 4. Force Metro to follow symlinks (common in monorepos)
config.resolver.unstable_enableSymlinks = true;

module.exports = config;