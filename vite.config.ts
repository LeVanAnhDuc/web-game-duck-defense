import { fileURLToPath } from 'node:url';

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Alias @/ -> src/ (R-13). Phai khai o CA HAI cho: tsconfig cho tsc, cho nay cho
    // Vite va Vitest — thieu mot ben thi mot trong hai im lang khong hieu duong dan.
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    /**
     * `base` đến từ `VITE_BASE_PATH` — KHÔNG có giá trị dự phòng trong code.
     * Bỏ trống = gốc tên miền (`/`), đúng cho local, e2e và `vite preview`.
     * `deploy.yml` đặt nó thành `/<tên repo>/` cho GitHub Pages.
     *
     * ADR-0007 từng chọn `'./'` để không phải biết tên repo. ADR-0010 thay nó vì
     * `redirect_uri` của OAuth phải là một URL TUYỆT ĐỐI khớp từng ký tự với URI
     * đã đăng ký ở Ducker ID, và `'./'` không cho ra URL nào như thế. Asset của
     * Phaser nạp qua `import.meta.env.BASE_URL` nên vẫn đúng với base tuyệt đối.
     */
    base: env.VITE_BASE_PATH || undefined,
    plugins: [react(), tailwindcss()],
    build: { target: 'es2022' },
  };
});
