// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  output: 'server', // SSR 모드
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
    imageService: true,
    imagesConfig: {
      sizes: [400, 800, 1200], // 소설 표지에 사용할 이미지 크기
    },
  }),
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false, // Shadcn/ui와 호환성을 위해
    }),
  ],
  vite: {
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
    ssr: {
      noExternal: ['framer-motion', 'magic-ui'],
    },
  },
});
