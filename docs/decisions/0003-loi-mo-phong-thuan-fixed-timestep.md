# ADR-0003 · Lõi mô phỏng là TypeScript thuần, chạy fixed timestep 60Hz với RNG có seed

> **Ngày:** 2026-09-08
> **Trạng thái:** accepted
> **Liên quan:** FR-01 · FR-02 · FR-03 · FR-04 · FR-31 · FR-32 · NFR-PERF-06 · NFR-PERF-10

## 1. Bối cảnh

Dự án chọn meta-progression toàn cục (`overview.md` §6 chỉ số 3): **mỗi bản đồ phải
thắng được ở mức nâng cấp thấp nhất mà người chơi có thể có lúc nó vừa mở.** Không
có cách nào kiểm điều đó bằng tay — 5 bản đồ × nhiều mức nâng cấp, kiểm lại sau mỗi
lần sửa một con số cân bằng, là việc sẽ không ai làm.

Song song, TDD là mặc định của dự án. Test một vòng chơi mà phải khởi động Phaser,
tạo `<canvas>` và chờ `requestAnimationFrame` thì chậm và giòn.

## 2. Quyết định

Toàn bộ mô phỏng nằm trong `core/` như **hàm thuần**: `step(state, dt) -> state`.
`core/` không `import` Phaser, không `import` React, không đọc `window`, `document`,
`localStorage`, và **không gọi `Math.random`** — mọi ngẫu nhiên đi qua một RNG có
seed nằm trong chính state.

Mô phỏng chạy **`FIXED_DT = 1/60` giây** với accumulator, tách khỏi tốc độ vẽ. Tốc
độ x2/x3 là **chạy nhiều tick hơn mỗi frame**, không phải nhân `dt`.

Từ đó `runBattle(mapId, layout, upgrades, seed)` chạy trọn một trận trong Node,
không cần trình duyệt.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Dùng `delta` thật của frame, nhân vào tốc độ | Máy yếu ra kết quả khác máy mạnh: cùng một bố cục tháp thắng ở 60 fps, thua ở 25 fps. Người chơi không hiểu vì sao, và không tái tạo được để sửa |
| Tốc độ x2/x3 bằng cách nhân `dt` lên 2-3 lần | Bước mô phỏng lớn hơn làm đạn "nhảy qua" mục tiêu và enemy nhảy qua điểm rẽ. Sai nhiều hơn ở tốc độ cao — đúng lúc người chơi ít để ý nhất |
| Logic mô phỏng nằm trong Phaser Scene / GameObject | Test phải dựng cả runtime Phaser. Và cân bằng chỉ kiểm được bằng cách ngồi chơi tay |
| `Math.random` trực tiếp, không seed | Test cân bằng thành ngẫu nhiên đỏ-xanh. Một lỗi chỉ xuất hiện với một chuỗi ngẫu nhiên cụ thể thì không bao giờ tái tạo được |
| ECS đầy đủ (bitecs, miniplex) | Quy mô của game này — vài chục enemy, vài chục tháp — không cần. Thêm một lớp khái niệm mà không giải quyết vấn đề nào đang có |

## 4. Hệ quả

**Được:**
- Test lõi chạy trong milli-giây, không cần trình duyệt (NFR-PERF-10).
- Cân bằng kiểm được bằng test tự động (FR-32), đỏ ngay khi ai sửa một con số làm
  bản đồ thành bất khả thi.
- Kết quả trận không phụ thuộc phần cứng (NFR-PERF-06).
- Đổi renderer về sau không đụng vào một dòng logic nào.

**Mất / phải chấp nhận:**
- Phải tự viết RNG có seed thay vì dùng `Math.random`.
- Có một lớp đồng bộ state → sprite trong `game/`, và vị trí sprite phải **nội suy**
  giữa hai tick, nếu không sẽ thấy giật ở màn hình tần số cao.
- Thứ tự năm bước trong một tick trở thành bất biến chịu lực (`invariants.md` #1) —
  không công cụ nào bắt được vi phạm.

**Điều kiện xem lại quyết định này:** số thực thể tăng tới mức hàm thuần copy state
mỗi tick trở thành điểm nghẽn thật (đã **đo**, không phỏng đoán) · hoặc cần chơi
mạng, lúc đó rollback netcode sẽ đòi thêm ràng buộc chứ không bỏ ràng buộc nào.
