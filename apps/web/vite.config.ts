import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tamaguiPlugin } from '@tamagui/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    tamaguiPlugin({
      config: '../../packages/ui/src/tamagui.config.ts',
      components: ['tamagui'],
    }),
  ],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
  },
  server: { port: 5173 },
  optimizeDeps: {
    include: ['react-native-web'],
  },
});
