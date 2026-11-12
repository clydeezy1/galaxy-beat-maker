import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'FREESOUND_');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/freesound': {
          target: 'https://freesound.org',
          changeOrigin: true,
          headers: {
            Authorization: `Token ${env.FREESOUND_API_KEY}`,
          },
          rewrite: path =>
            path.replace('/api/freesound', '/apiv2'),
        },
      },
    },
  };
});