# Thiết lập từng phiên — lượt chạy 2026-09-11

Công cụ: **playwright** (hạng 1). Một browser, **một context dùng chung** ⇒ chạy **tuần tự**,
điều phối viên tự dọn trạng thái giữa các phiên. Persona không biết chuyện này.

Throttle mạng không dùng được (xem `_capability-probe-2026-09-11.md`). Điều kiện mạng
mô phỏng bằng **HTTP cache**: cache lạnh ≈ Slow 4G trên đường nền ~1.4 Mbps / RTT ~450 ms.

## BẮT BUỘC mỗi phiên: kéo rAF về 60fps trước khi dispatch

Cửa sổ Playwright bị che ⇒ Chrome tiết lưu `requestAnimationFrame` xuống **2 fps**, dù
`document.visibilityState` vẫn báo `visible`. Vòng lặp game chạy bằng rAF, nên ở 2 fps trận
đấu nhìn y hệt như **đứng yên** — phiên p01 đầu tiên đã bỏ cuộc vì tưởng game hỏng.

```js
await page.bringToFront();
await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: true });
```

Đo được: nguyên trạng 2 fps → `bringToFront` 59 → thêm focus emulation 61 → sau 3 giây 61
→ sau một lần chụp màn hình rồi chờ 3 giây 58. Ổn định.

**Không làm bước này thì cả phiên là rác**, và là loại rác nguy hiểm vì báo cáo vẫn đọc
rất hợp lý: persona sẽ kể một câu chuyện mạch lạc về một sản phẩm hỏng không có thật.

Key lưu tiến độ: `localStorage['duckdefense.profile']` (`src/storage/profile.ts`, ADR-0005).
Bản đồ: `m01 m02 m03 m04 m05`. Node rẻ nhất trong cây nâng cấp: `startGold` giá 60 lõi.

| # | Persona | Red Route | Viewport | Cache | localStorage trước phiên |
| --- | --- | --- | --- | --- | --- |
| 1 | p01 Trang | RR-01 | 375×720 | **lạnh** | xoá sạch |
| 2 | p02 Khoa | RR-02 | 1440×900 | nóng | **seed A** |
| 3 | p03 Hạnh | RR-05 | 1440×900 | nóng | xoá sạch |
| 4 | p04 An | RR-03 | 1440×900 | nóng | **seed B** |
| 5 | p05 Daniel | RR-04 | 1440×900 | nóng | xoá sạch |
| 6 | p06 Duy | phiên mù | 1440×900 | nóng | xoá sạch |
| 7 | p07 Bà Ngà | phiên mù | 375×720 | **lạnh** | xoá sạch |

## seed A — p02 Khoa "đang mắc ở một bản đồ khó"

Đã qua m01 + m02, đang mắc ở m03, có lõi để mua nâng cấp nhưng **chưa mua gì** (để cây
nâng cấp còn nguyên cho cậu ấy đọc và so sánh).

```json
{"schemaVersion":1,"locale":"vi","cores":260,"upgrades":{},
 "maps":{"m01":{"cleared":true,"bestWave":12,"bestLives":17},
         "m02":{"cleared":true,"bestWave":13,"bestLives":9},
         "m03":{"cleared":false,"bestWave":9,"bestLives":0},
         "m04":{"cleared":false,"bestWave":0,"bestLives":0},
         "m05":{"cleared":false,"bestWave":0,"bestLives":0}},
 "settings":{"music":0.5,"sfx":0.8},"lastMap":"m03"}
```

## seed B — p04 An "bốn ngày mới mở lại"

Đã qua m01 + m02, dở dang m03, đã từng mua một bậc nâng cấp (nên `cores` đã bị trừ).
Khác seed A ở chỗ có `upgrades` — An phải thấy được là mình **đã từng làm gì đó**.

```json
{"schemaVersion":1,"locale":"vi","cores":115,"upgrades":{"startGold":1},
 "maps":{"m01":{"cleared":true,"bestWave":12,"bestLives":20},
         "m02":{"cleared":true,"bestWave":13,"bestLives":11},
         "m03":{"cleared":false,"bestWave":6,"bestLives":0},
         "m04":{"cleared":false,"bestWave":0,"bestLives":0},
         "m05":{"cleared":false,"bestWave":0,"bestLives":0}},
 "settings":{"music":0.5,"sfx":0.8},"lastMap":"m03"}
```

## Vì sao phải seed

RR-02 và RR-03 có `actor` là người **đã chơi rồi**. Cho họ mở trang với profile trắng thì
phiên đo nhầm thứ khác: Khoa sẽ không có lõi nào để mua, An sẽ không có tiến độ nào để tìm.
Seed là cách duy nhất dựng đúng bối cảnh khi chỉ có một browser context.

Ảnh chụp của persona rơi vào `.playwright-mcp/` (gitignored), đặt tên theo tiền tố `pNN-`,
điều phối viên gom về thư mục này sau mỗi phiên.
