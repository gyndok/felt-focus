import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f12cf44ec68e4e13b2c5f2d2586bc88a',
  appName: 'felt-focus',
  webDir: 'dist',
  server: {
    url: 'https://f12cf44e-c68e-4e13-b2c5-f2d2586bc88a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    }
  }
};

export default config;