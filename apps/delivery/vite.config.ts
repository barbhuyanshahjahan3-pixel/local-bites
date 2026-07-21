import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/delivery/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Local Bites — Delivery Partner',
        short_name: 'LB Delivery',
        description: 'Accept and complete deliveries for Local Bites',
        theme_color: '#16a34a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/delivery/',
        scope: '/delivery/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        navigateFallback: '/delivery/index.html',
        runtimeCaching: [
          { urlPattern: ({ request }) => request.destination === 'document', handler: 'NetworkFirst' },
        ],
      },
    }),
  ],
  server: { port: 5176 },
});
