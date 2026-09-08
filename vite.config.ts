import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  /**
   * `'./'` — đường dẫn TƯƠNG ĐỐI, không phải một base tuyệt đối theo tên repo.
   *
   * Bản đầu dùng `process.env.GITHUB_PAGES` để đặt `base` thành
   * `/web-game-tower-defense/`. Hai vấn đề, và cả hai đã xảy ra:
   *
   *  1. Tên repo là `web-game-duck-defense`, KHÁC tên thư mục local. Một base
   *     tuyệt đối viết cứng theo tên nào đó là một hằng số phải nhớ cập nhật, và
   *     sai nó thì local vẫn chạy còn production ra trang trắng.
   *  2. `vite preview` phục vụ `dist/` ở gốc, nên nó KHÔNG kiểm được một build
   *     có base là đường dẫn con — phải viết thêm một static server riêng chỉ để
   *     kiểm một thứ mà `'./'` làm biến mất.
   *
   * Với `'./'`, cùng một bản build chạy đúng ở gốc tên miền, dưới đường dẫn con
   * của Pages, và trong `vite preview`. Base là cấu hình build, không phải biến
   * môi trường — nên `.env.example` thật sự không có biến nào. Xem ADR-0007.
   */
  base: './',
  plugins: [react(), tailwindcss()],
  build: { target: 'es2022' },
});
