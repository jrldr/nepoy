import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import {defineConfig} from 'vite';

function resolveBase() {
  if (process.env.BASE_PATH) {
    const bp = process.env.BASE_PATH;
    return bp.endsWith('/') ? bp : `${bp}/`;
  }
  if (process.env.GITHUB_REPOSITORY) {
    const parts = process.env.GITHUB_REPOSITORY.split('/');
    const repo = parts[1];
    if (repo && !repo.endsWith('.github.io')) {
      return `/${repo}/`;
    }
    return '/';
  }
  return './';
}

export default defineConfig(() => {
  const basePath = resolveBase();

  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'icon.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-192x192.png',
          'pwa-maskable-512x512.png',
        ],
        manifest: {
          id: basePath,
          name: 'Pigeon Speed Calculator',
          short_name: 'PigeonCalc',
          description: 'Pigeon Racing Speed Calculator with live MPM, dead time rule, sunrise/sunset, and target arrivals.',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'portrait',
          categories: ['sports', 'utilities'],
          start_url: basePath,
          scope: basePath,
          icons: [
            {
              src: basePath.startsWith('/') ? `${basePath}pwa-192x192.png` : 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: basePath.startsWith('/') ? `${basePath}pwa-maskable-192x192.png` : 'pwa-maskable-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: basePath.startsWith('/') ? `${basePath}pwa-512x512.png` : 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: basePath.startsWith('/') ? `${basePath}pwa-maskable-512x512.png` : 'pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
