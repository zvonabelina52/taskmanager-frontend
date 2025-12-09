import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test.ts'],
    server: {
      deps: {
        inline: [
          '@angular/platform-browser-dynamic'
        ]
      }
    }
  }
});
