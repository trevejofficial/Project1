import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // escucha en 0.0.0.0 (accesible desde fuera del contenedor)
    port: 5173,
    allowedHosts: true, // acepta el Host header de dominios de previsualización
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    allowedHosts: true,
  },
});
