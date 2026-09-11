# Kiểm chứng: "Diệt 0 địch" là lỗi sản phẩm hay lỗi người chơi?

Điều phối viên tự đo, sau khi cả 7 phiên đã xong. Lý do phải đo: **hai persona độc lập**
thua bản đồ 1 với gần như không giết được con nào.

- p01 Trang: thua đợt 3/12, "chỉ diệt được 2 con địch"
- p06 Duy: thua đợt 3/12, màn kết ghi thẳng **"Diệt 0 địch"**, vàng đứng im ở 200 suốt 3 đợt

Duy tự đoán hai khả năng: "một là tôi chọn ô đặt tháp toàn nằm ngoài tầm với của đường đi,
hai là có bug tháp không bắn". Không đo thì không được phép chọn cái nào.

## Cách đo

Bản đồ 1 "Đồng Cỏ", profile trắng, 1440×900, rAF 62fps. Lấy toạ độ tâm của cả 10 ô xây
được từ DOM (chúng là `button` thật, không phải hình vẽ trên canvas), rồi xây **4 tháp Cung**
ở 4 ô **rải ra** — ô 1, 9, 4, 7 — hết sạch 240/260 vàng. Bật x3, gọi liên tiếp 4 lượt đợt,
đọc HUD sau mỗi 12 giây.

Toạ độ 10 ô, tính theo gốc canvas 760×760:

| Ô | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| x | 323 | 410 | 49 | 323 | 570 | 209 | 410 | 49 | 323 | 570 |
| y | 76 | 76 | 456 | 456 | 114 | 703 | 703 | 266 | 266 | 403 |

## Kết quả

| Mốc | Mạng | Vàng |
| --- | --- | --- |
| xây xong 4 tháp | 20 | 20 |
| sau đợt 1 | **20** | 42 |
| sau đợt 2 | **20** | 75 |
| tiếp | **20** | 97 |
| tiếp | **20** | 141 |

**Mạng không giảm một điểm nào qua hai đợt, và vàng tăng đều** — tiền thưởng chỉ có khi
giết được địch. Tháp bắn bình thường.

## Kết luận

**Không có bug.** "Diệt 0 địch" là hậu quả của việc đặt tháp ngoài tầm bắn.

Nhưng đây **không phải lỗi của người chơi** — nó là một phát hiện UX thật, và mạnh hơn một
cái bug vì nó lặp ở 2/2 persona tự chọn chỗ đặt tháp:

> Không có cách nào thấy **tầm bắn của tháp trước khi trả tiền**.

Chính giao diện nói ra điều đó, ở dòng chữ chỉ xuất hiện **sau khi** đã xây:

> "Vòng nét đứt trên bản đồ là tầm bắn của tháp đang chọn."

Và đúng chỗ này Duy đã nói trước khi thua, nguyên văn:

> "Rê chuột vào tháp Cung chỉ thấy mô tả một dòng 'Bắn nhanh, một mục tiêu' — không có bảng
> DPS/tầm bắn/pierce như tôi kỳ vọng trước khi đặt. [...] Không có số liệu trước khi mua,
> phải đặt xuống mới biết."

Vòng tròn tầm bắn tồn tại, chỉ là nó tới **sau** quyết định chi tiền chứ không phải trước.
Với người mới, 60 vàng đặt sai chỗ là một tháp vĩnh viễn không bắn được phát nào, và màn
kết chỉ nói "Diệt 0 địch" chứ không nói vì sao.

## Hệ quả cho cách đọc lời hứa trong README

README nói *"Every map is winnable with no upgrades at all, and a test enforces it"*. Phép đo
này cho thấy câu đó **đúng về mặt cân bằng số** — 4 tháp Cung không nâng cấp giữ sạch 2 đợt
đầu. Nhưng cái test đó đo một người chơi mô phỏng **đã biết đặt tháp ở đâu**. Hai người thật
đầu tiên trong lượt chạy này đều không biết, và cả hai đều thua.
