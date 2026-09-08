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

_(trống)_ — feature `tower-defense-v1` đã đóng. Cả 32 FR ở `scope.md` là `xong`,
trong đó FR-18 **xong ở phạm vi đã thu hẹp** (không có nhạc nền — xem §Nợ kỹ thuật).

Trạng thái kiểm chứng lúc đóng: **231 test đơn vị** (Vitest, không cần trình
duyệt) và **22 test e2e** (Playwright, Chromium) đều xanh; `tsc --noEmit` và
`eslint` sạch; `vite build` ra ~399 KB gzip, dưới trần 900 KB của NFR-PERF-08.

Sau khi đóng feature còn hai đợt nữa: **code review** tìm ra 8 lỗi (mỗi lỗi giờ
có một test hồi quy đã kiểm đỏ-xanh), và **tích hợp GitHub** — đổi tên sản phẩm
thành *Duck Defense*, chuyển `base` sang `'./'` (ADR-0007), thêm ba workflow
CI/deploy/release theo đúng khuôn các game khác trong `web-game/`, và viết lại
README theo hợp đồng 13 mục của skill `readme-game`.

## Việc tiếp theo

| Việc | Liên quan | Ưu tiên | Vì sao ưu tiên đó |
| --- | --- | --- | --- |
| **Chơi thật cả 5 bản đồ bằng tay** rồi tinh chỉnh `data/` | FR-32 · overview.md §6 | cao | Cân bằng hiện tại được đo bằng một người chơi MÔ PHỎNG hoàn hảo (`tests/balance/affordablePlayer.ts`). Nó chặn được cái bất khả thi, nhưng không nói được cái "chưa vui". Một lượt hoàn hảo hết 29,9 phút, còn `overview.md` §6 nhắm 60-90 phút — khoảng chênh đó chỉ người thật đo được |
| Bật Pages cho repo (Settings → Pages → Source: GitHub Actions) rồi mở thử trên điện thoại thật | ADR-0006 · ADR-0007 | cao | `GITHUB_TOKEN` không tạo được Pages site, nên đây là bước tay bắt buộc một lần. Cảm giác chạm cũng chỉ đo được trên ngón tay thật |
| Đo fps trên điện thoại tầm trung ở đợt cuối bản đồ 5 | NFR-PERF-05 | trung bình | Ngưỡng 30 fps chưa từng được đo trên thiết bị thật, chỉ suy ra từ kiến trúc |
| Kiểm bằng screen reader thật | NFR-A11Y-07 | trung bình | Vùng `aria-live` đã có và e2e kiểm được focus, nhưng chưa ai nghe nó đọc |
| Thêm ô 1024 vào canvas mockup | MASTER.md §6 | thấp | Mốc 1024 đã có bố cục thật trong code và có e2e, chỉ thiếu artboard |

## Nợ kỹ thuật — cố ý làm tạm

| Chỗ nào | Đã đánh đổi gì | Vì sao chấp nhận | Khi nào buộc phải trả |
| --- | --- | --- | --- |
| `src/game/sprites.ts` | **Đường đi vẫn vẽ bằng vector**, không dùng tile đường của Kenney. Cỏ, bệ tháp, nòng, địch đã là sprite | Ràng buộc phát hiện lúc dựng: đường của pack là **tile 64px trên lưới**, còn `data/maps/` là **polyline tự do** ở toạ độ bất kỳ. Dùng tile đường ⇒ vẽ lại cả 5 bản đồ trên lưới 64 ⇒ mọi chiều dài đường đổi ⇒ cân bằng lại từ đầu và chạy lại cổng FR-32 cho cả 5 bản đồ. Màu đường được **lấy mẫu từ chính pack** nên không lệch tông | Khi thêm bản đồ mới — lúc đó vẽ nó trên lưới ngay từ đầu, và chuyển dần |
| `src/game/audio.ts` · `SettingsScreen` | **Không có nhạc nền.** FR-18 thu hẹp còn một thanh trượt "âm thanh" | Hiệu ứng âm thanh tổng hợp được bằng WebAudio, không tốn byte bundle nào. Nhạc nền thì cần một file thật, và một bản nhạc tổng hợp mà người viết không nghe được là một canh bạc. Một thanh trượt điều khiển thứ không tồn tại còn tệ hơn không có nó. Trường `settings.music` vẫn nằm trong profile để không phải migrate schema chỉ vì bỏ một thanh trượt | Khi có một bản nhạc thật, hoặc khi người chơi hỏi vì sao game im |
| `storage/` | **Không lưu state giữa trận.** Đóng tab giữa trận là mất trận đó | Serialize toàn bộ state mô phỏng nghĩa là mỗi lần sửa `core/` lại phải migrate một schema lớn. Xem ADR-0005 §3 | Khi có bản đồ dài quá ~15 phút một lượt, hoặc khi người chơi phàn nàn |
| `docs/specs/tower-defense-v1/` | **Một feature folder cho cả v1** thay vì ba chu trình spec→plan→build | Ba chu trình cho một game 5 bản đồ sinh ra ba lần thủ tục mà không tách được phụ thuộc: `meta-progression` không kiểm được mà không có `core-battle`. Bù lại bằng `plan.md` chia pha | Khi có v2 thêm nhánh chức năng mới — nhánh đó là một feature riêng thật |
| `data/` | Cân bằng đã qua **bốn vòng** nhưng vẫn chỉ đo bằng người chơi mô phỏng | Không có cách nào có số đúng trước khi chơi được. FR-32 chặn cái bất khả thi; cái "chưa vui" thì phải chơi mới biết. Bản đồ 2 và 4 hiện mất **0 mạng** với bố cục tham chiếu — hơi phẳng, nhưng siết thêm để làm khó một người chơi hoàn hảo là cách làm game không ai qua được | Ngay sau lượt chơi tay đầu tiên |
| `tests/core/i18n.test.ts` | Chỉ chặn **tỉ lệ độ dài** giữa hai locale, không chặn độ rộng thật khi render | Độ rộng thật phụ thuộc font và phải đo trong trình duyệt — và e2e đã làm đúng việc đó ở 375 cho cả hai locale | Khi thêm locale thứ ba |
| ~~`.env.example` rỗng~~ **(đã trả, rồi thành đúng)** | — | Tôi từng ghi ở đây rằng không dòng nào đọc biến môi trường. **Sai** — `docs-regen.sh` bắt được `GITHUB_PAGES` trong `vite.config.ts` và `PORT` trong `scripts/preview-pages.mjs`. Đã khai cả hai. Rồi ADR-0007 chuyển `base` sang `'./'`, làm **cả hai biến biến mất** cùng với chính script đó, nên file lại rỗng — nhưng lần này rỗng vì đã kiểm, không vì phỏng đoán | — |
