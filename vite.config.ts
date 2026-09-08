import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages phục vụ dưới đường dẫn con. Đặt sai `base` thì local chạy mà
// production trắng màn hình — xem ADR-0006 §4.
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/web-game-tower-defense/' : '/',
  plugins: [react(), tailwindcss()],
  build: { target: 'es2022' },
});
