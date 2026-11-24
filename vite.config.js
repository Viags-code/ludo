import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En développement, l'API PHP tourne à côté avec « npm run api ».
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      '/uploads': 'http://localhost:8000',
    },
  },
});
