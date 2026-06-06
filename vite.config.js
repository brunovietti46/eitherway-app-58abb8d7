/* EITHERWAY_CHAINLINK_UI_ALIAS */
import path from 'path'
import { fileURLToPath } from 'url'
const __ewDir = path.dirname(fileURLToPath(import.meta.url))
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  resolve: { alias: { '@eitherway/chainlink-ui': path.resolve(__ewDir, 'src/lib/chainlink-ui') } },
  plugins: [react({ jsxRuntime: 'automatic' })],
  server: {
    watch: {
      usePolling: true,
      interval: 1000,
    },
    cors: true,
    allowedHosts: true,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
