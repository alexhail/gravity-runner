import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    assetsInlineLimit: 0 // Ensure audio files are processed as assets
  },
  assetsInclude: ['**/*.mp3'] // Explicitly include MP3 files as assets
}); 