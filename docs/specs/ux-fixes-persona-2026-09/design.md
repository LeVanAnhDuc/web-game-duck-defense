# Sửa bốn phát hiện UX từ lượt chạy persona 2026-09-11

Liên quan: US-01 · US-03 · FR-33 · FR-34 · FR-35 · FR-36 · NFR-A11Y-02 · ADR-0009
Nguồn: `docs/ux-reviews/2026-09-11-persona-run.md` (F-01, F-02, F-03, F-04, F-08)

## Vì sao feature này tồn tại

`01-product/overview.md` §6.1 đặt tiêu chí thành công số một:

> Một người chơi mới thắng được bản đồ 1 trong lần chơi đầu, không đọc hướng dẫn.
> Nếu phải giải thích luật thì UI đã thất bại.

Lượt chạy 2026-09-11 đo được **0/3**. Trong ba người đó có một người chơi tower defense
nhiều năm (p06). Đây không phải góp ý thẩm mỹ — nó là một tiêu chí đã chốt đang đỏ.

## FR-33 · Thấy tầm bắn trước khi trả tiền (F-01, Critical)

**Vấn đề đo được.** Vòng nét đứt chỉ tầm bắn chỉ hiện **sau khi** tháp đã xây và tiền đã
trừ. p01 và p06 đều đặt tháp ngoài tầm với của đường đi và thua bản đồ 1 với 2 và 0 địch
bị diệt. Phép đo của điều phối viên (`ux-reviews/.../logs/_kiem-chung-diet-0-dich.md`)
chứng minh tháp bắn bình thường: 4 tháp Cung rải đúng chỗ giữ sạch 2 đợt đầu.

**Đổi luồng.** Trước đây có hai đường vào lệnh xây, và một trong hai trả tiền ngay:

| | Trước | Sau |
| --- | --- | --- |
| chọn ô → chạm thẻ tháp | **xây ngay, trừ tiền** | chọn ứng viên, **vẽ vòng tầm bắn** |
| chạm thẻ tháp → chạm ô trống | **xây ngay, trừ tiền** | chọn ô, **vẽ vòng tầm bắn** |
| xác nhận | không có | nút **`XÂY · <giá>`** |

Một mô hình duy nhất cho cả cảm ứng, chuột và bàn phím: **chọn ô → chọn loại → xác nhận**.
Đây là chỗ trả giá: thêm một thao tác mỗi lần xây. Chấp nhận vì cảm ứng **không có hover**
(`MASTER.md` §5), nên mọi phương án "xem trước khi mua" dựa vào hover đều bỏ rơi đúng nhóm
người dùng chính (`overview.md` §3: điện thoại). Quyết định này là **ADR-0009**.

**Số liệu trước khi mua.** `buildOptions` trong snapshot mang thêm `damage`, `range`,
`cooldownTicks`, đọc từ `battle.rules.towers[id].levels[0]` — tức là **đã áp bậc nâng cấp
toàn cục** (invariants #8), nên con số hiện ra là con số thật của trận này. Nó trả lời
thẳng p06: *"Không có số liệu trước khi mua, phải đặt xuống mới biết."*

## FR-34 · Nhãn nói đúng thứ nó làm (F-02, High)

`CHƠI TIẾP` + `đợt 9/14` dựng kỳ vọng "vào tiếp đợt 9". Thực tế mọi lối vào đều reset về
đợt 1. p02 và p04 — **2/2 persona có tiến độ sẵn** — đều hiểu sai và đều mất 2 lần quay lui
để tự gỡ.

**Không làm chức năng chơi tiếp giữa trận.** Nó đòi ghi profile giữa trận, phá thẳng
**invariants #11** (*"Ghi profile chỉ xảy ra sau khi trận kết thúc hoặc người chơi đổi cài
đặt — không ghi theo tick"*), và đòi serialize cả enemy, đạn, RNG. Con số là **kỷ lục**, nên
chữ phải gọi nó là kỷ lục.

- Nút chính: luôn là `CHƠI` / `PLAY`. Bỏ nhánh `title.continue`.
- Dòng phụ: `Đầm Sương · kỷ lục đợt 9/14`.
- Thẻ bản đồ: trạng thái `Đang chơi` → `Chưa qua`; `Tốt nhất:` → `Kỷ lục:`.

`Đang chơi` là thì hiện tại tiếp diễn và nó tiếp tay cho chính hiểu lầm này.

## FR-35 · Thẻ bản đồ đọc được ở bề rộng hẹp (F-03, High)

**Nguyên nhân, đã đo bằng DOM ở 375px:** thẻ là grid item mang `!min-h-0` (đè
`min-h-[44px]` của `Press`). Bỏ sàn kích thước tối thiểu đi thì khi thiếu chỗ dọc, grid
**nén mọi hàng xuống vừa khít container**: `grid-template-rows: 99.19px ×5` trong khung
584px. Thumbnail `flex-none` giữ 88px, khối chữ cao 76px chỉ còn ~11px, và
`overflow-hidden` nuốt trọn phần còn lại. Không lỗi console, không chữ bị cắt dở — mất sạch.

Trên desktop có 2–3 cột nên mỗi hàng đủ chỗ, và lỗi không bao giờ lộ. Đây đúng loại "sai
âm thầm" mà `invariants.md` nói tới, nên nó **thành bất biến #13**.

**Cách sửa:** thẻ ở bề rộng hẹp xếp **ngang** (thumbnail trái, chữ phải), và không bao giờ
được phép co dưới kích thước nội dung.

## FR-36 · Focus không bao giờ rơi về `<body>` (F-04, High)

Vi phạm **NFR-A11Y-02** (*"focus luôn thấy được — kể cả đặt tháp"*). p03 mất dấu focus
đúng 2 lần, và cả hai đều là lúc phần tử đang giữ focus biến mất hoặc bị vô hiệu hoá:

1. Chuyển từ màn tiêu đề sang màn trận.
2. Ngay sau khi bấm gọi đợt — nút tự disable.

**Cách sửa:** khi một phần tử giữ focus bị gỡ hoặc disable, chuyển focus chủ động sang
phần tử kế cận còn sống, không để trình duyệt thả về `<body>`.

Và dòng gợi ý phím tắt đang nói sai. `Space` chỉ gọi đợt khi không có nút nào giữ focus;
nếu tay đang trên một nút khác thì Space kích hoạt chính nút đó — hành vi chuẩn của trình
duyệt, không sửa được mà cũng không nên sửa. Sửa **câu chữ** cho đúng điều kiện.

## Không làm trong feature này

- **F-05** (từ vựng tài chính làm Bà Ngà bỏ cuộc) — `overview.md` §3 nói nhóm chính *"đã
  từng chơi tower defense nên không cần dạy lại luật"*, và Bà Ngà là persona
  `supplemental`. Đây là đánh đổi đã chọn, ghi nhận chứ không sửa.
- **F-06** (tương phản ô xây, thứ hạng thị giác của "Diệt N địch") — Medium, chạm vào
  bảng màu art trong canvas, xứng đáng một pass riêng.
- **F-07** (không thấy nâng cấp vĩnh viễn đã áp vào đâu) — Low, và FR-33 đã trả một phần:
  số liệu hiện trước khi mua là số **đã gồm nâng cấp**.
- **F-08** (thiếu favicon) — Low, đi kèm ở đây vì nó là một file và một dòng `<link>`.
