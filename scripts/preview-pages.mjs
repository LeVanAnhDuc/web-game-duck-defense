/**
 * Phục vụ bản build cho GitHub Pages ĐÚNG như Pages phục vụ nó.
 *
 * Vì sao không dùng `vite preview`: nó phục vụ `dist/` ở gốc, nên yêu cầu tới
 * `/web-game-tower-defense/assets/index-*.js` rơi vào SPA fallback và trả về
 * index.html. Trang không boot, và người kiểm sẽ kết luận sai rằng `base` đặt
 * sai — rồi "sửa" nó, và làm hỏng đúng cái mà production cần (ADR-0006 §4).
 *
 * Script này soi `dist/` vào `<base>/` rồi phục vụ từ gốc, nên mọi đường dẫn
 * tuyệt đối trong HTML build ra khớp chính xác.
 *
 *   GITHUB_PAGES=true npm run build && node scripts/preview-pages.mjs
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const BASE = '/web-game-tower-defense';
const DIST = resolve('dist');
const PORT = Number(process.env.PORT ?? 5275);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

if (!existsSync(DIST)) {
  console.error('Chưa có dist/. Chạy: GITHUB_PAGES=true npm run build');
  process.exit(1);
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');

  // Ngoài base thì 404 — Pages cũng vậy, và đó là điểm của script này.
  if (!url.pathname.startsWith(BASE)) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(`404 — ngoài base ${BASE}\nThử: http://localhost:${PORT}${BASE}/\n`);
    return;
  }

  const rel = url.pathname.slice(BASE.length) || '/';
  // `normalize` + kiểm tiền tố: chặn `..` đi ra khỏi dist.
  const target = resolve(join(DIST, normalize(rel)));
  if (!target.startsWith(DIST)) {
    res.writeHead(403).end('403');
    return;
  }

  let file = target;
  if (!existsSync(file) || statSync(file).isDirectory()) {
    const index = join(file, 'index.html');
    file = existsSync(index) ? index : join(DIST, 'index.html');
  }

  // Không có SPA fallback cho ASSET: một asset thiếu phải ra 404 thật, không
  // được trả index.html — đó chính là cách `vite preview` che mất lỗi base.
  if (extname(target) !== '' && extname(target) !== '.html' && !existsSync(target)) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(`404 ${url.pathname}`);
    return;
  }

  res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Pages preview: http://localhost:${PORT}${BASE}/`);
});
