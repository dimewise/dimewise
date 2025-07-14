import type { ConfigContext, ExpoConfig } from 'expo/config';

const IS_DEV = process.env.APP_ENV === 'development';
const IS_PREVIEW = process.env.APP_ENV === 'preview';

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return 'com.dimewise.app.dev';
  }

  if (IS_PREVIEW) {
    return 'com.dimewise.app.preview';
  }

  return 'com.dimewise.app';
};

const getAppName = () => {
  if (IS_DEV) {
    return 'Dimewise (Dev)';
  }

  if (IS_PREVIEW) {
    return 'Dimewise (Preview)';
  }

  return 'Dimewise';
};

const getIOSAppIcon = () => {
  if (IS_DEV) {
    return {
      light: './assets/icons/dev-ios-light.png',
      dark: './assets/icons/dev-ios-dark.png',
      tinted: './assets/icons/dev-ios-tinted.png',
    };
  }

  if (IS_PREVIEW) {
    return {
      light: './assets/icons/preview-ios-light.png',
      dark: './assets/icons/preview-ios-dark.png',
      tinted: './assets/icons/preview-ios-tinted.png',
    };
  }

  return {
    light: './assets/icons/ios-light.png',
    dark: './assets/icons/ios-dark.png',
    tinted: './assets/icons/ios-tinted.png',
  };
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: 'dimewise',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icons/splash-icon-dark.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/icons/splash-icon-dark.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: false,
    bundleIdentifier: getUniqueIdentifier(),
    icon: getIOSAppIcon(),
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/icons/adaptive-icon.png',
      monochromeImage: './assets/icons/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: getUniqueIdentifier(),
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  scheme: 'dimewise',
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/icons/splash-icon-dark.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          image: './assets/icons/splash-icon-light.png',
          backgroundColor: '#000000',
        },
      },
    ],
    'expo-sqlite',
  ],
  extra: {
    router: {},
    eas: {
      projectId: '97ed9f04-5400-4bfd-b84e-6ea1a824079d',
    },
  },
});
