import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/restaurant/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Local Bites — Restaurant',
        short_name: 'LB Restaurant',
        description: 'Manage your menu and orders on Local Bites',
        theme_color: '#ea580c',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/restaurant/',
        scope: '/restaurant/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        navigateFallback: '/restaurant/index.html',
        runtimeCaching: [
          { urlPattern: ({ request }) => request.destination === 'document', handler: 'NetworkFirst' },
        ],
      },
    }),
  ],
  server: { port: 5175 },
});
