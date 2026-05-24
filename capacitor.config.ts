import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.togetherwalk.app',
  appName: '함께걸어요',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      layoutName: "splash_layout",
    },
  },
};

export default config;
