const path = require('path');
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

// frontend is in the client folder, and the build output goes to the dist folder
module.exports = defineConfig({
  root: path.resolve(__dirname, 'client'),
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
