const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = path.resolve(__dirname);
const monorepoRoot = path.resolve(projectRoot, "../..");

// Let getDefaultConfig handle serverRoot (it will use monorepoRoot via getMetroServerRoot)
const config = getDefaultConfig(projectRoot);

// Ensure projectRoot is set to packages/mobile
config.projectRoot = projectRoot;

// Watch monorepo root so shared packages in packages/* resolve
config.watchFolders = [monorepoRoot];

// Resolve node_modules: mobile first, then monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

module.exports = config;
