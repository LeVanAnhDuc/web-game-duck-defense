# Bất biến chịu lực

> **Trả lời:** Sửa gì thì hệ thống sai **âm thầm** — test vẫn xanh mà kết quả vẫn sai?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-08 · commit —
> **Cập nhật khi:** phát hiện một bất biến mới — thường là ngay sau khi ai đó vừa phá nó

<!-- CÁCH ĐIỀN
ĐỌC FILE NÀY TRƯỚC KHI SỬA BẤT KỲ DÒNG CODE NÀO.

Bất biến ở đây KHÁC quy ước code. Quy ước format/naming thì ESLint bắt được; bất
biến thì không có công cụ nào bắt, và vi phạm nó thì code vẫn chạy, test vẫn xanh,
chỉ có kết quả là sai.

VIỆC CỦA BẠN: xoá dòng không áp dụng, thêm bất biến riêng của dự án, đổi sang 🟢.

GIỮ FILE NÀY < 40 DÒNG NỘI DUNG. Nó được đọc mỗi lần sửa code; dài ra là không ai
đọc nữa. Thứ gì không thuộc loại "sai âm thầm" thì bỏ ra khỏi đây.

KHÔNG chứa: quy ước format/naming (-> lint config), kiến trúc (-> architecture.md).
-->

Chín bất biến mặc định đều nói về server, quyền và migration — dự án này không có
cái nào (`01-product/overview.md` §4). Đã thay bằng bất biến thật của một vòng chơi.

| # | Bất biến | Vi phạm thì sao |
| --- | --- | --- |
| 1 | **Thứ tự năm bước trong một tick:** sinh enemy → enemy tiến → tháp ngắm và bắn → đạn bay và trúng → dọn xác và xét thắng/thua | Đảo bước 2 và 3 thì đạn nhắm vị trí của frame trước. Mọi phát bắn lệch một chút, không ai giải thích được, test vẫn xanh |
| 2 | Enemy lưu **`s` — quãng đường đã đi**, không lưu `{x, y}`. Toạ độ luôn là `path.at(s)` | Lưu toạ độ thì enemy trôi khỏi đường sau vài trăm tick, và "enemy nào đi xa nhất" phải đoán thay vì `max(s)` |
| 3 | `core/` **không gọi `Math.random`**. Mọi ngẫu nhiên đi qua RNG có seed trong state | Cùng seed cho ra kết quả khác nhau. Test cân bằng thành ngẫu nhiên đỏ-xanh, và không tái tạo được lỗi nào |
| 4 | Mô phỏng chạy **`FIXED_DT = 1/60` giây**, không bao giờ nhận `delta` thật của frame. Tốc độ x2/x3 là **chạy nhiều tick hơn**, không phải nhân `dt` | Nhân `dt` thì máy yếu ra kết quả khác máy mạnh. Cùng một bố cục tháp thắng trên máy này, thua trên máy kia |
| 5 | Ý định của người chơi được áp ở **ranh giới tick**, không phải ngay lúc chạm | Áp giữa tick thì tháp vừa xây bắn trong cùng tick nó xuất hiện, và thứ tự thao tác đổi kết quả |
| 6 | `core/` **chỉ đọc** `data/`, không bao giờ ghi. Số liệu cân bằng là hằng | Một trận sửa số liệu thì trận sau kế thừa, và bug chỉ hiện ở trận thứ hai |
| 7 | React đọc snapshot ở **≤ 10Hz**, không bao giờ theo frame | Re-render 60 lần/giây làm game giật trên điện thoại. Triệu chứng là "game lag", không ai nghĩ tới React |
| 8 | Bậc nâng cấp toàn cục áp vào **lúc khởi tạo trận**, không áp lại giữa trận | Áp lại giữa trận thì mua nâng cấp trong lúc đang chơi sẽ đổi tháp đã xây, và số liệu trận không còn tái tạo được |
| 9 | `--sem-*` chỉ mang nghĩa luật chơi; chrome không dùng đỏ hay xanh lá làm màu tương tác | HUD ngừng truyền tin: người chơi không phân biệt "nút" với "đang mất mạng" |
| 10 | `storage/` đọc profile **không bao giờ throw**, và **không bao giờ xoá** bản không đọc được | Một profile hỏng làm game trắng màn hình, hoặc âm thầm xoá tiến trình của người chơi |
| 11 | Ghi profile chỉ xảy ra sau khi trận **kết thúc** hoặc người chơi đổi cài đặt — không ghi theo tick | Ghi theo tick làm đầy quota và làm giật; và nếu ghi giữa trận thì đóng tab giữa trận sẽ lưu một state nửa vời |
| 12 | Đo lại tỉ lệ canvas là **`getParentBounds()` rồi `refresh()`**, không bao giờ chỉ `refresh()` | `refresh()` tính từ `parentSize` Phaser đã cache, không đọc lại DOM. Chỉ gọi nó thì canvas giữ số đo của bố cục TRƯỚC: ở 1280×720 nó ra 720×720 trong khung cao 580, và `overflow-hidden` cắt mất hàng ô trên với hàng ô dưới. Không có lỗi console, resize cửa sổ một lần là tự đúng lại — nên nó sống sót qua mọi test tự resize trước khi đo |
| 13 | Một grid/flex item **không bao giờ được bỏ sàn `min-height`** (`!min-h-0`, `min-h-0`) khi chính nó có `overflow-hidden` | Bỏ sàn đi là bỏ "automatic minimum size", nên khi thiếu chỗ dọc lưới **nén item cho vừa** thay vì đẩy container ra cuộn. Thẻ bản đồ ở 375px bị ép còn 99px, thumbnail `flex-none` giữ 88px, khối chữ 76px chỉ còn ~11px và `overflow-hidden` nuốt trọn. Chữ vẫn nằm trong DOM, `visibility` vẫn `visible`, screen reader vẫn đọc đủ — nên mọi assertion `toBeVisible()`/`toHaveText()` đều XANH trong khi màn hình không có một pixel chữ nào. Chỉ lộ ở bề rộng hẹp, vì desktop có 2-3 cột nên mỗi hàng đủ chỗ |
