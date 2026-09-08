# Đang làm · Việc tiếp theo · Nợ

> **Trả lời:** Đang làm gì, tiếp theo làm gì, và đang nợ những gì?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-08 · commit —
> **Cập nhật khi:** bắt đầu/kết thúc một việc · brainstorm ra việc mới · cố ý đi đường tắt

<!-- CÁCH ĐIỀN
Mục "Đang làm" là chỗ một phiên làm việc MỚI đọc đầu tiên. Giữ nó ngắn: đang làm
gì, dừng ở bước nào, cái gì đang chặn. Cập nhật nó TRƯỚC KHI DỪNG phiên, không
phải sau.

Mục "Nợ kỹ thuật" chỉ ghi thứ CỐ Ý làm tạm, và ghi NGAY LÚC ĐÓ. Bug thì không
thuộc đây. Việc chưa làm cũng không — đó là mục 2.

KHÔNG chứa: tính năng ngoài phạm vi (-> 01-product/overview.md §Non-Goals).
-->

## Đang làm

**Feature `tower-defense-v1`** — dựng toàn bộ v1 của game.

Đã xong: brainstorm (đầy đủ, có cổng duyệt mockup) · `design-bootstrap` →
`MASTER.md` + ADR-0001 · canvas mockup 16 artboard **đã được duyệt** · tài liệu
tier-1 (`overview` · `journeys` · `glossary` · `scope` · `nfr` · `architecture` ·
`invariants`) · ADR-0002 → 0006.

Đang ở: viết `docs/specs/tower-defense-v1/design.md`, rồi `plan.md`, rồi vào worktree
và build theo TDD.

Không có gì đang chặn.

## Việc tiếp theo

| Việc | Liên quan | Ưu tiên | Vì sao ưu tiên đó |
| --- | --- | --- | --- |
| `core/` + test: path, RNG, một tick đủ năm bước | FR-01…FR-07 · ADR-0003 | cao | Mọi thứ khác đứng trên nó. Và nó là phần duy nhất test được không cần trình duyệt |
| `runBattle` headless + test cân bằng | FR-31 · FR-32 | cao | Chặn sớm cái hỏng nghiêm trọng nhất của thiết kế này (bản đồ bất khả thi). Rẻ khi làm sớm, đắt khi làm muộn |
| `data/`: 3 tháp, 3 enemy, bản đồ 1, lịch đợt | FR-05 · FR-20 · FR-21 | cao | `core/` không chạy được mà không có số |
| `game/`: Phaser scene, nạp atlas Kenney, vẽ + nội suy | ADR-0002 | cao | Lát cắt dọc đầu tiên chơi được bằng tay |
| `bridge/` + HUD React ở 375 | ADR-0004 · FR-08…FR-10 | cao | Chơi được end-to-end trên điện thoại = US-01 đóng |
| `storage/` + profile phòng vệ + test 6 dạng rác | FR-11 · FR-25 · NFR-REL-04 | trung bình | Chưa cần cho lát cắt dọc, nhưng cần trước khi có `cores` |
| Cây nâng cấp + `cores` + mở bản đồ | FR-12 · FR-13 · FR-16 | trung bình | US-02, US-03 |
| 4 bản đồ còn lại + cân bằng | FR-32 | trung bình | Cần `runBattle` xong trước, không thì cân bằng bằng tay |
| i18n vi/en + cài đặt + âm thanh | FR-17…FR-19 | trung bình | US-04 |
| Kiểm trên app đang chạy ở 375/768/1024/1440 × 2 chiều xoay | FR-30 · NFR-A11Y-* | cao khi tới đó | `feature-flow` §5: UI chưa nhìn thì chưa xong |
| Deploy GitHub Pages | ADR-0006 | thấp | Sau khi chơi được |

## Nợ kỹ thuật — cố ý làm tạm

| Chỗ nào | Đã đánh đổi gì | Vì sao chấp nhận | Khi nào buộc phải trả |
| --- | --- | --- | --- |
| `storage/` | **Không lưu state giữa trận.** Đóng tab giữa trận là mất trận đó | Serialize toàn bộ state mô phỏng nghĩa là mỗi lần sửa `core/` lại phải migrate một schema lớn. Xem ADR-0005 §3 | Khi có bản đồ dài quá ~15 phút một lượt, hoặc khi người chơi phàn nàn |
| `docs/specs/tower-defense-v1/` | **Một feature folder cho cả v1** thay vì tách `core-battle` / `meta-progression` / `shell-i18n` thành ba chu trình spec→plan→build | Ba chu trình cho một game 5 bản đồ sinh ra ba lần thủ tục mà không tách được phụ thuộc: `meta-progression` không kiểm được mà không có `core-battle`. Bù lại bằng `plan.md` chia pha, checkbox theo pha | Khi có v2 thêm nhánh chức năng mới — lúc đó nhánh đó là một feature riêng thật |
| `data/` | Số liệu cân bằng là **phỏng đoán đầu tiên**, chưa qua một lượt chơi thật nào | Không có cách nào có số đúng trước khi chơi được. FR-32 chặn được cái sai nghiêm trọng; cái "chưa vui" thì phải chơi mới biết | Ngay sau lát cắt dọc đầu tiên chơi được bằng tay |
| `game/` (sẽ có) | Sprite Kenney thay dần cho hình vector vẽ tạm; `MASTER.md` §1.3 giữ 7 màu tạm | Chơi được quan trọng hơn đẹp, và ranh giới render đã tách nên thay sprite không đụng logic | Khi `MASTER.md` §1.3 còn tồn tại mà game đã chơi được hết 5 bản đồ |
| `.env.example` | Vẫn 🔴 và **rỗng là đúng** — code chưa đọc biến môi trường nào | Vite dùng `import.meta.env` chứ không `process.env`, và game không có secret nào (NFR-SEC-04). Điền file này bằng phỏng đoán là tệ hơn để trống | Khi code đọc biến đầu tiên — khả năng cao là `BASE_URL` lúc deploy GitHub Pages |
