import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE_PATH || '/';

  return {
    plugins: [react()],
    base,
    server: {
      port: 5510,
      strictPort: true,
      host: true,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3011',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://localhost:3011',
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 5510,
      strictPort: true,
      host: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: true,
      chunkSizeWarningLimit: 1000,
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@services': resolve(__dirname, 'src/services'),
        '@styles': resolve(__dirname, 'src/styles'),
      },
    },
  };
});
