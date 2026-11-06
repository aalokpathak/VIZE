import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { vercelApi } from './dev/vercelApi';

export default defineConfig({
  plugins: [react(), vercelApi()],
  build: { target: 'es2022' },
  ssr: {
    // Native module — load it from node_modules as-is in the dev API server
    external: ['@napi-rs/canvas'],
  },
});
