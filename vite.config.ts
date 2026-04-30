import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        musicMonday: resolve(import.meta.dirname, 'music-monday.html'),
      },
    },
  },
  server: {
    port: 3040,
  },
});
