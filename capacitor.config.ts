import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.google.gemini.liveconsole',
  appName: 'Gemini Live Console',
  webDir: 'build',
  server: {
    cleartext: true,
    allowNavigation: ['*']
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    allowsLinkPreview: false,
    limitsNavigationsToAppBoundDomains: false
  }
};

export default config;
