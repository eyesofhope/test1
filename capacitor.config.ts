import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.doceditor.app',
  appName: 'Document Editor',
  webDir: 'build',
  ios: {
    contentInset: 'always',
    keyboard: { resize: 'native' }
  },
  android: {
    backgroundColor: '#ffffff',
    keyboard: { resize: 'native' }
  }
};

export default config;
