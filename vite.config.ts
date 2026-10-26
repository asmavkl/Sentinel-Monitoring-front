/// <reference types="vitest/config" />
import path from 'node:path';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const rootDir = import.meta.dirname;
const appBasePath = '/Sentinel-Monitoring/';

export default defineConfig({
  base: appBasePath,
  plugins: [
    react(),
    basicSsl({
      name: 'test.gio24.ir',
      domains: ['test.gio24.ir'],
    }),
  ],
  server: {
    host: 'test.gio24.ir',
    port: 5174,
    strictPort: true,
    allowedHosts: ['test.gio24.ir'],
    watch: {
      usePolling: true,
    },
  },
  preview: {
    host: 'test.gio24.ir',
    port: 5174,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
