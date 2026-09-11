# ADR-0009 — Xây tháp thành ba bước, đổi lấy việc thấy tầm bắn trước khi trả tiền

- **Ngày:** 2026-09-11
- **Trạng thái:** accepted
- **Liên quan:** FR-33 · US-01 · `docs/ux-reviews/2026-09-11-persona-run.md` §F-01

## Bối cảnh

Bảy phiên persona mù trên bản deploy đo được **0/3** người chơi mới thắng bản đồ 1 — trong
đó có một người chơi tower defense nhiều năm. `01-product/overview.md` §6.1 đặt đúng điều đó
làm tiêu chí thành công số một.

Nguyên nhân không phải cân bằng số. Điều phối viên đo lại: 4 tháp Cung **không nâng cấp**,
rải ra 4 ô khác nhau, giữ sạch 2 đợt đầu — mạng không giảm điểm nào, vàng tăng đều. Tháp bắn
bình thường; README nói đúng khi hứa *"Every map is winnable with no upgrades at all"*.

Cái hỏng là **thứ tự thông tin**: vòng nét đứt chỉ tầm bắn chỉ hiện **sau khi** tháp đã xây
và tiền đã trừ. Hai người chơi đặt tháp ngoài tầm với của đường đi, thua với 2 và **0** địch
bị diệt, và màn kết chỉ nói "Diệt 0 địch" chứ không nói vì sao. Một trong hai nói thẳng:

> Rê chuột vào tháp Cung chỉ thấy mô tả một dòng "Bắn nhanh, một mục tiêu" — không có bảng
> DPS/tầm bắn/pierce như tôi kỳ vọng trước khi đặt. […] Không có số liệu trước khi mua, phải
> đặt xuống mới biết.

## Quyết định

Tách **chọn loại tháp** khỏi **trả tiền**. Luồng xây trở thành ba bước ở mọi thiết bị:

1. chọn ô → ô sáng lên
2. chọn loại tháp → **vẽ vòng tầm bắn nét đứt tại chính ô đó**, kèm Sát thương · Tầm bắn ·
   Nhịp bắn bằng số
3. bấm `XÂY · <giá>` → đây là thao tác **duy nhất** tiền rời khỏi túi người chơi

Số liệu đọc từ `rules.towers[id].levels[0]`, tức đã áp bậc nâng cấp toàn cục (bất biến #8),
nên là số thật của trận này chứ không phải số gốc trong `data/`.

## Đánh đổi — thêm một thao tác mỗi lần xây

Đây là cái giá, và nó có thật. Một persona xây 2 tháp rất nhanh rồi khen *"Không có hướng dẫn
dài dòng gì, tôi thích vậy"*. Thêm một chạm là lấy đi một phần của cảm giác đó.

Chấp nhận vì ba lý do, theo thứ tự sức nặng:

1. **Cảm ứng không có hover** (`MASTER.md` §5). Mọi phương án "xem trước khi mua" dựa vào
   hover đều chỉ chạy trên chuột, tức là bỏ rơi đúng nhóm người dùng chính — điện thoại
   (`overview.md` §3). Một sản phẩm có hai luồng xây khác nhau cho hai thiết bị thì còn tệ
   hơn một sản phẩm có thêm một chạm.
2. **Cái mất khi thiếu nó lớn hơn nhiều.** Một chạm thừa tốn một giây. Một tháp 60 vàng đặt
   ngoài tầm bắn là hỏng cả ván, và người chơi không bao giờ biết mình sai ở đâu.
3. **Nó biến một lần chạm không thể hoàn tác thành một lần chạm hoàn tác được.** Trước đây
   chạm nhầm thẻ tháp là mất tiền ngay; giờ chạm nhầm chỉ đổi vòng tròn đang xem.

## Các phương án đã cân nhắc và bỏ

- **Hover hiện vòng tầm bắn, giữ bấm-là-xây.** Bỏ vì lý do (1) — không có hover trên cảm ứng.
- **Vẽ sẵn vòng tầm bắn của cả ba loại tháp cùng lúc.** Ba vòng tròn chồng nhau trên một bản
  đồ 400×400 là nhiễu chứ không phải thông tin, và vẫn không nói được vòng nào của tháp nào.
- **Làm nổi các ô nằm sát đường đi.** Giải được ca thua, nhưng nó **chọn hộ người chơi**. Đặt
  tháp ở đâu chính là quyết định mà game này tồn tại để người chơi đưa ra.
- **Giữ nguyên, chỉ sửa màn kết cho nói rõ vì sao thua.** Nói cho người ta biết họ vừa hỏng
  ở đâu sau khi đã hỏng, thay vì để họ không hỏng. Vẫn đáng làm, nhưng là F-06, không phải
  cái này.

## Hệ quả

- `bridge/types.ts` — `buildOptions` mang thêm `damage`, `range`, `cooldownTicks`. Snapshot
  vẫn ≤ 10Hz, không đụng bất biến #7.
- `BattleScene` — thêm `setPreviewTower`. Nó **không** chạm `battle.state`: ý định xây vẫn đi
  qua `applyIntent` ở ranh giới tick (bất biến #5), nên tính tái tạo của trận không đổi.
- Phím tắt `1 2 3` giờ luôn là "chọn ứng viên", không còn đổi nghĩa theo việc đã chọn ô hay
  chưa. Một quy tắc thay vì hai.
- Cần đo lại bằng một lượt persona mới trước khi tin là RR-01 đã xanh. Lượt này nói được cái
  gì hỏng; nó không nói được là bản sửa có đủ hay không.
