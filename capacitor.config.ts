import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.datapulse.app',
  appName: 'DATAPULSE SOCIAL',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#0a1a2f',
  },
};

export default config;
