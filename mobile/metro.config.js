const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// for sqlite with drizzle
config.resolver.sourceExts.push('sql');

module.exports = config;
