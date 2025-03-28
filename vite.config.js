import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dotenv from 'dotenv';

dotenv.config();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/Auth": {
        target: "https://staging.bhutanndi.com",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/Auth/, ''),
      },
    // Remove the `/api` prefix from the request path

      '/api': {
        target: 'https://demo-client.bhutanndi.com', // Your backend server URL
        changeOrigin: true, // Change the origin of the request to the target URL
        secure: false, // Allow self-signed certificates (useful for development)
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove the `/api` prefix from the request path
      },
      'org': {
        target: 'https://staging.bhutanndi.com', // Your backend server URL
        changeOrigin: true, // Change the origin of the request to the target URL
        secure: false, // Allow self-signed certificates (useful for development)
        rewrite: (path) => path.replace(/^\/org/, ''), 
        // Remove the `/api` prefix from the request path
      },
      '/-inv': {
        target: 'https://staging.bhutanndi.com', // Your backend server URL
        changeOrigin: true, // Change the origin of the request to the target URL
        secure: false, // Allow self-signed certificates (useful for development)
        rewrite: (path) => path.replace(/^\/-inv/, ''), 
        // Remove the `/api` prefix from the request path
      }
    },
  },
});
