# Duck Defense — UX persona review · 2026-09-11

> 7 phiên · 7 persona · 5 Red Route
> Công cụ trình duyệt: playwright (hạng 1) — **suy giảm**: 1 browser / 1 context dùng chung, không throttle được mạng, phải ép rAF về 60fps bằng `bringToFront` + focus emulation ở mọi phiên
> Red route chốt ngày: 2026-09-11
> Đo trên **bản deploy** `https://levananhduc.github.io/web-game-duck-defense/`, không phải code trong thư mục làm việc.

---

## Ấn tượng đầu

Tính trên toàn bộ persona — ấn tượng đầu chỉ xảy ra một lần.

| Thước | Kết quả |
| --- | --- |
| Đoán đúng đây là trang gì | **6/7** — chỉ p07 Bà Ngà trượt: *"Không biết. Thấy hai chữ 'Duck Defense' to to, dưới có câu 'Giữ đường. Đừng để chúng đi qua.' — đọc xong cũng không hiểu giữ đường nào, chặn cái gì."* |
| Dám nhập email | **0/7 từng được hỏi** — sản phẩm không có form nào, không ai phải quyết định |
| Lý do người nói sẽ ngại nếu bị hỏi (3/7) | p01: *"đây chỉ là link đồng nghiệp gửi, không rõ web của ai"* · p05: *"it looks like a hobby/indie project, not a company site"* · p07: *"không biết trang của ai làm ra"* |

4/7 còn lại coi việc **không bị hỏi gì** là điểm cộng, và nói ra thành lời: p02 *"không cần nhập gì cả nên không có gì phải cân nhắc — nhẹ cả người"*, p03 *"khỏi phải nghĩ, nhẹ cả người"*, p04 *"khỏi phải lo"*, p06 *"Cảm giác an toàn kiểu 'chơi xong đóng tab'"*.

**Ba từ trước khi dùng:**
đơn giản · dễ hiểu · tò mò (p01) — quen thuộc · gọn · tò mò (p02) — tò mò · hơi ngờ vực · chờ xem (p03) — tò mò · hơi ngờ vực (sợ mất tiến độ) · chờ xem (p04) — *confused · curious · cautious* (p05) — đơn giản · tò mò · hoài nghi (p06) — lạ · rối mắt · ngại (p07)

**Ba từ sau khi dùng:**
hụt hẫng · tiếc · muốn-thử-lại (p01) — hơi hụt · thực tế · vẫn ổn (p02) — nhẹ nhõm · hơi mệt · tin thêm một chút (p03) — an tâm · hơi hụt hẫng · vẫn-chơi-được (p04) — *relieved · satisfied · mildly impressed* (p05) — tò mò · hụt hẫng · muốn-thử-lại (p06) — rối · mệt · dè chừng (p07)

**Đổi theo hướng:**

- **"tò mò / curious" lặp 6/7 trước khi dùng** — thông điệp trang chủ khơi được tò mò gần như tuyệt đối.
- **"ngờ vực / hoài nghi / cautious / ngại" lặp 5/7 trước khi dùng, và giảm thật ở 3 người sau khi dùng.** p04: *"phần 'ngờ vực' đã giảm hẳn — vì đúng là tiến độ được giữ lại thật"*. p03: *"cảm giác ngờ vực đã giảm — việc quan trọng nhất làm được thật bằng bàn phím"*. p05: *"the confusion is completely gone"*.
- **Nhưng "hụt hẫng / hơi hụt" lặp 4/7 sau khi dùng** (p01, p02, p04, p06) — từ tiêu cực lặp ở 4 người là một phát hiện, không phải cảm tính. Nguồn gây hụt hẫng khác nhau ở từng người nhưng **cùng một hình dạng**: chữ trên màn hình dựng lên một kỳ vọng, rồi cái xảy ra không khớp. p02 + p04 hụt vì "CHƠI TIẾP" (F-02); p01 + p06 hụt vì thua sạch mà không hiểu vì sao (F-01).
- **"mệt / rối" lặp 2/7** (p03, p07) — hai người ở hai đầu phổ kỹ năng, cùng kết luận là phải tự đoán quá nhiều.
- Duy nhất p07 đi lùi hoàn toàn: *"lúc đầu chỉ là thấy lạ vì chưa biết, giờ dùng xong lại thấy mệt vì cái gì cũng phải đoán"* và là người duy nhất nói **không quay lại**.

---

## Bảng điểm theo Red Route

| Red Route | Hiệu quả | Hiệu suất (bước thực / min_steps) | Hài lòng |
| --- | --- | --- | --- |
| RR-01 Thắng bản đồ đầu tiên mà không đọc hướng dẫn | **0/3** (p01, p06 thua ở đợt 3/12; p07 bỏ cuộc trước khi thua) | ≈14 / 6 ≈ **2,3×** | **Hụt hẫng nhưng chưa mất** — p01 *"hụt hẫng, tiếc, muốn-thử-lại"*; p06 *"tò mò, hụt hẫng, muốn-thử-lại"*; p07 *"rối, mệt, dè chừng"* và không quay lại |
| RR-02 Thua, mua một bậc nâng cấp, rồi thắng lại | **1/1** | 8 / 5 = **1,6×** | **Hài lòng ở phần mua, hụt ở phần sau** — p02 *"rõ ràng, hài lòng, dễ đoán"* → sau lượt hai: *"hơi hụt, thực tế, vẫn ổn"* |
| RR-03 Quay lại sau vài ngày và chơi tiếp | **1/1** (trên laptop 1440×900) | ≈10 / 2 = **5×** | **An tâm, kèm một chỗ hiểu lầm tự gỡ được** — p04 *"an tâm, hơi hụt hẫng, vẫn-chơi-được"* |
| RR-04 Tắt tiếng và đổi sang tiếng Anh giữa chừng | **1/1** | 4 / 4 = **1,0×** (thêm ~18 thao tác p05 tự bỏ ra để soi sót chuỗi) | **Cao nhất lượt chạy** — p05 *"Relieved, satisfied, mildly impressed"*, *"That's not the story I expected to write."* |
| RR-05 Đánh một trận chỉ bằng bàn phím | **0/1** — làm được việc (xây tháp + gọi đợt, không chạm chuột) nhưng **trượt vế "vòng focus luôn nhìn thấy được ở mọi bước"** | ≈30 phím / 5 = **6×** | **Nhẹ nhõm pha mệt** — p03 *"Nhẹ nhõm · hơi mệt · tin thêm một chút"* |

Ghi chú cách đếm hiệu suất: con số "bước thực" là **thao tác trên sản phẩm**, đếm lại từ tường thuật của persona, **không** tính chụp màn hình / đọc snapshot. Con số tool-call thô mà các log tự báo (p01 37-38, p06 38-40, p02 ~32, p05 ~22) cao hơn nhiều và không so được với `min_steps`.

---

## Phát hiện

Xếp theo mức nghiêm trọng giảm dần.

### F-01 · Critical · ISO 9241-11 · Interaction Design · Visual hierarchy

**Ở đâu:** RR-01 — màn trận, bảng "Xây tháp" ở rìa phải (desktop) / bảng bật lên dưới bản đồ (điện thoại), tại thời điểm **trước khi** trả 60 vàng.

**Chuyện gì xảy ra:** Không có cách nào thấy **tầm bắn của tháp trước khi trả tiền**. Rê chuột vào tháp Cung chỉ ra một dòng mô tả chữ. Vòng nét đứt chỉ tầm bắn — và cả câu giải thích nó là gì — chỉ xuất hiện **sau khi** tháp đã được đặt và tiền đã bị trừ. Với người mới, 60 vàng đặt sai chỗ là một tháp vĩnh viễn không bắn được phát nào, và màn kết chỉ nói "Diệt 0 địch" chứ không nói vì sao.

**Dẫn chứng:**
- p06 Duy, bước 5 mục 2 — *"Rê chuột vào tháp Cung chỉ thấy mô tả một dòng 'Bắn nhanh, một mục tiêu' — không có bảng DPS/tầm bắn/pierce như tôi kỳ vọng trước khi đặt. [...] Không có số liệu trước khi mua, phải đặt xuống mới biết."* → `anh/p06-05-hover-cung.png`: bảng phải chỉ có đúng hai dòng "Cung / Bắn nhanh, một mục tiêu".
- p06 Duy, bước 6 → `anh/p06-06-thap-da-dat.png`: vòng nét đứt **mới hiện ra sau khi đặt**, và chỉ lúc này ô gợi ý dưới cùng mới đổi thành *"Vòng nét đứt trên bản đồ là tầm bắn của tháp đang chọn."* Vòng tròn đó gần như **không chạm đường đi**.
- p06 Duy, bước 7 — *"mạng giảm 20→15 (mất 5 mạng), nhưng vàng vẫn y nguyên 200 — tức tháp của tôi không giết được con nào."* → `anh/p06-10-dot-2.png`.
- p06 Duy, bước 9 — *"hai khả năng: một là tôi chọn ô đặt tháp toàn nằm ngoài tầm với của đường đi [...], hai là có bug tháp không bắn."* → `anh/p06-11-thua-cuoc.png`: **"Diệt 0 địch"**.
- p01 Trang, bước 6 — *"trong đầu tôi nghĩ 'ơ mất máu vậy à, chắc tháp mình yếu quá'"* → `anh/p01-05-dot1-xong.png`, `anh/p01-06-thua.png`: **"Diệt 2 địch"**.
- Kiểm chứng của điều phối viên (`logs/_kiem-chung-diet-0-dich.md`): 4 tháp Cung không nâng cấp, rải ra 4 ô khác nhau → **mạng không giảm điểm nào qua hai đợt, vàng tăng đều 20 → 42 → 75 → 97 → 141**. Tháp bắn bình thường. **Không có bug.** Cái hỏng là thứ tự: thông tin cần để quyết định tới sau quyết định.

**Bao nhiêu người vấp:** 2/3 persona tự chọn chỗ đặt tháp trên bản đồ 1 đều thua sạch ở đợt 3/12 (p01, p06). Người thứ ba (p07) cũng đặt tháp mù nhưng bỏ cuộc trước khi kịp thua. Persona duy nhất đặt trúng đường (p02) là người có kinh nghiệm thể loại và đã chơi qua 2 bản đồ.

**Hệ quả cho lời hứa trong README:** *"Every map is winnable with no upgrades at all, and a test enforces it"* — phép đo cho thấy câu này **đúng về mặt cân bằng số**. Nhưng cái test đó đo một người chơi mô phỏng **đã biết đặt tháp ở đâu**. Hai người thật đầu tiên trong lượt chạy này đều không biết, và cả hai đều thua. "Winnable" và "learnable" không phải một thứ. Đối chiếu `01-product/overview.md` §6.1: *"Nếu phải giải thích luật thì UI đã thất bại."*

**Hướng xử lý:** đưa thông tin tầm bắn về **trước** thời điểm chi tiền. Và màn kết cần nói được **vì sao** "Diệt 0 địch" (xem F-06).

---

### F-02 · High · Trigger words · Interaction Design · LATCH

**Ở đâu:** RR-02 và RR-03 — nút chính màn tiêu đề ("CHƠI TIẾP" + dòng phụ "Đầm Sương · đợt 9/14") và thẻ bản đồ trên màn Chọn bản đồ ("Đang chơi — Tốt nhất: đợt 9/14").

**Chuyện gì xảy ra:** Chữ "CHƠI TIẾP" cộng với một số đợt cụ thể dựng lên đúng một kỳ vọng: bấm vào sẽ vào tiếp chỗ đang dở. Thực tế mọi lối vào đều reset về Đợt 1. Con số đó là **kỷ lục**, nhãn lại nói bằng từ vựng của **tiến trình**.

**Dẫn chứng:**
- p02 Khoa — *"trong đầu tôi nghĩ: 'vào đây chắc nó cho mình bắt đầu lại gần chỗ mình hay chết, đợt 9' [...] Nhưng vào thì thấy đề 'Đợt 1/14 · Mạng 16 · Vàng 320' [...] Hơi hẫng."* → `anh/p02-01-moi-mo.png` vs `anh/p02-05-dam-suong-chi-tiet.png`.
- p02 Khoa — *"Vậy dòng chữ 'Đầm Sương · đợt 9/14' trên nút chỉ là cái mốc kỷ lục hiển thị, không phải điểm để tiếp tục từ đó. Đây đúng là điều tôi ngại nhất."* → `anh/p02-09-choi-tiep-vao-tran.png`.
- p04 An — *"Tôi hơi khựng lại: 'ủa, sao lại về đợt 1, tưởng đang ở đợt 6 rồi chứ?'"* → `anh/p04-01-moi-mo.png` vs `anh/p04-04-dam-suong.png`, `anh/p04-05-choi-tiep.png`.
- Thẻ bản đồ khuếch đại hiểu lầm: `anh/p02-04-chon-ban-do.png` ghi trạng thái là **"Đang chơi"** — thì hiện tại tiếp diễn.
- Chi phí đo được: cả hai người mất 2 lần quay lui chỉ để kiểm chứng. p04: *"Số lần quay lui: 2 lần (chỉ để tự kiểm tra xem 'CHƠI TIẾP' có khác 'bấm vào bản đồ' không)"* — đó là toàn bộ khoảng cách giữa hiệu suất 5× và 1× của RR-03.

**Bao nhiêu người vấp:** 2/2 persona có tiến độ sẵn — 100% của đúng nhóm người mà hai Red Route này nhắm tới.

**Hướng xử lý:** nhãn phải nói đúng thứ nó làm. **Đã chốt:** giữ nguyên hành vi, đổi chữ để con số đọc ra là kỷ lục — hành vi hiện tại được bảo vệ bởi bất biến #11 (`03-design/invariants.md`), ghi profile chỉ xảy ra khi trận kết thúc.

---

### F-03 · High · Visual craft · LATCH · Visual hierarchy

**Ở đâu:** RR-03 — màn "Chọn bản đồ" ở viewport 375×720.

**Chuyện gì xảy ra:** Trên điện thoại, thẻ bản đồ **mất toàn bộ phần chữ**. Chỉ còn 5 hình thu nhỏ xếp dọc: 3 thẻ có hình bản đồ màu, 2 thẻ xám kèm ổ khoá — không tên bản đồ, không "Đã qua / Đang chơi / Chưa mở", không lý do khoá.

**Dẫn chứng:**
- p07 Bà Ngà, bước 8 — *"bị đưa qua một màn hình khác ghi 'Chọn bản đồ' [...] Tôi nghĩ: 'ủa mình đang chơi mà sao lại nhảy ra đây, cái mình chơi nãy giờ có còn không?'"* → `anh/p07-10-sau-quay-lai.png`.
- **Kiểm chứng lại của điều phối viên sau báo cáo** (`anh/verify-f03-375.png`): chữ **có** trong DOM — `button` 343×99 với `innerText` = `"1. Đồng Cỏ Đã qua 12 / 12 đợt · còn 20 mạng"`, `visibility: visible` — nhưng `overflow: hidden` và không một chữ nào được vẽ ra. Cả 5 thẻ đều vậy, gồm `"4. Đèo Gió Chưa mở Cần qua Đầm Sương để mở"`.
- Đối chiếu cùng màn ở 1440×900: `anh/p02-04-chon-ban-do.png` có đủ chữ.

Đây chính là vế mà `done_when` của RR-03 đòi: *"màn chọn bản đồ hiện đúng cái nào đã qua, cái nào còn khoá, khoá vì thiếu gì"*. RR-03 đạt là vì nó được chạy trên laptop. **Điện thoại là thiết bị chính** theo `01-product/overview.md` §3.

**Bao nhiêu người vấp:** 1/2 persona dùng điện thoại (p07); p01 không mở màn này nên không có dữ liệu thứ hai. Không nâng bậc, nhưng đã được **xác nhận bằng phép đo DOM**, không còn là suy đoán từ ảnh.

**Hướng xử lý:** thẻ bản đồ ở bề rộng hẹp phải hiện được tên, trạng thái và lý do khoá.

---

### F-04 · High · Interaction Design · Trigger words

**Ở đâu:** RR-05 — chuyển cảnh vào màn trận, và nút "GỌI ĐỢT TIẾP THEO" ngay sau khi bấm. Cộng dòng gợi ý "Phím tắt: 1 2 3 chọn tháp · Space gọi đợt · Esc bỏ chọn".

**Chuyện gì xảy ra:** Hai chuyện, cùng một nạn nhân là người chỉ có bàn phím.

1. **Vòng focus biến mất 2 lần**, đúng hai lần chuyển trạng thái quan trọng nhất: khi vào màn trận, và khi nút vừa bấm bị vô hiệu hoá.
2. **Gợi ý phím tắt nói sai.** "Space gọi đợt" chỉ đúng khi không có nút nào đang giữ focus.

**Dẫn chứng:**
- p03 Hạnh — *"Vào màn chơi thì mất dấu focus — focus rơi về `<body>`, không còn thấy viền nào trên màn hình. Đây đúng là điều tôi sợ nhất. Trong đầu tôi nghĩ: 'vừa xong hứa bàn phím chơi được mà giờ mất tiêu, chắc hỏng rồi.'"* → `anh/p03-04-vao-game-mat-focus.png`.
- p03 Hạnh — *"tôi bấm Space như hint bảo — nhưng không có gì xảy ra ngoài việc nó bật/tắt lại trạng thái chọn của cái nút tháp đang có focus."*
- p03 Hạnh — *"mất 21 lần Tab tổng cộng từ đầu trang để tới được đó."*
- p03 Hạnh — *"mất dấu focus lần thứ hai — vì nút vừa bấm bị vô hiệu hoá, focus rớt về `<body>`"* → `anh/p03-08-goi-dot-thanh-cong.png`.
- Mặt còn tốt: khi focus **có** ở đúng chỗ thì viền rất rõ — `anh/p03-05-tab-sau-vao-game.png`, `anh/p03-07-focus-goi-dot.png`. Vấn đề không phải kiểu dáng vòng focus, mà là nó bị rơi mất.

**Bao nhiêu người vấp:** 1/1 persona chỉ dùng bàn phím. Mức High vì đây là **vi phạm NFR-A11Y-02** (`02-requirements/nfr.md`): *"Mọi hành động thao tác được bằng bàn phím, và focus luôn thấy được — kể cả đặt tháp"*, và vì README hứa thẳng *"every battle action is reachable by keyboard"*. Lời hứa đó **đúng về chức năng** và **thiếu về khả năng đi lại**.

**Hướng xử lý:** quyết định focus đi đâu khi phần tử giữ focus biến mất hoặc bị disable. Dòng gợi ý thì hoặc phím tắt thành toàn cục thật, hoặc nói rõ điều kiện.

---

### F-05 · Medium · Trigger words · Trust & desirability · LATCH

**Ở đâu:** Phiên mù p07 — màn "Xưởng nâng cấp", và bước trừ vàng đầu tiên trong trận.

**Chuyện gì xảy ra:** Từ vựng hệ kinh tế mượn thẳng từ vựng tài chính đời thật: "Tiền khởi đầu", "Tiền rơi", "Lãi cuối đợt", "Đã đầu tư 0 / 5.545 lõi". Với người trình độ số thấp, cụm đó đọc ra là tiền thật, và phản xạ đúng của họ là **không đụng vào**. Đây là **điểm bỏ cuộc duy nhất của cả lượt chạy**.

**Dẫn chứng:**
- p07 Bà Ngà — *"mấy chữ 'lãi', 'đầu tư', 'vàng' làm tôi nhớ tới tiền bạc thiệt, tự nhiên thấy hơi ngán [...] 'cái này nói tới tiền tới lãi nhiều quá, thôi mình dừng ở đây, không rành thì đừng có đụng.'"* → `anh/p07-12-xuong-nang-cap.png`.
- Bắt đầu sớm hơn, ngay trong trận — *"tự nhiên số 'Vàng' từ 260 tụt xuống còn 200 [...] 'ủa sao tiền mình tự động bị trừ vậy, mình có bấm mua gì đâu mà mất tiền?'"*
- Ba từ cuối của bà: *"Rối, mệt, dè chừng"* — **dè chừng là từ mới, sinh ra ở đúng màn Xưởng**.

**Bao nhiêu người vấp:** 1/7. Giữ Medium vì một điểm dữ liệu — nhưng đây là persona duy nhất **không quay lại**.

**Hướng xử lý:** không hiển nhiên là phải sửa. Bà Ngà là persona `supplemental`, và `01-product/overview.md` §3 nói thẳng nhóm chính *"đã từng chơi tower defense nên không cần dạy lại luật"*. Nếu giữ nguyên định vị đó thì đây là **đánh đổi đã được chấp nhận**, nên ghi nhận chứ không sửa.

---

### F-06 · Medium · Visual hierarchy · Visual craft · Interaction Design

**Ở đâu:** RR-01 — màn trận lúc mới vào, cả hai bề rộng; và màn kết quả "Thua".

**Chuyện gì xảy ra:** Bốn thứ nhỏ cùng thuộc về thứ tự nhìn:

1. **10 ô xây gần như vô hình** — ô bo góc xanh lá đậm trên nền cỏ xanh lá, tương phản rất thấp.
2. **Ô xây không có số trên màn hình.** Sản phẩm gọi chúng là "Ô số 1"…"Ô số 10", cả sáu persona đều nhắc tới các số đó, nhưng **không ảnh nào trong 67 ảnh cho thấy một con số nào vẽ trên ô** — chúng chỉ sống trong cây accessibility.
3. **Dòng dạy luật duy nhất là dòng nhỏ nhất** — *"Chạm ô trống để xây"* là chữ xám nhỏ cạnh ba nút tốc độ.
4. **Trên màn kết quả, dòng quan trọng nhất được vẽ mờ nhất.** "Diệt 0 địch" cùng màu xám nhạt với phần còn lại, trong khi "+24 Lõi" là chữ tím sáng nhất khối. Con số duy nhất chẩn đoán được vì sao thua đang có thứ hạng thị giác thấp hơn phần thưởng an ủi.

**Dẫn chứng:**
- p07 Bà Ngà — *"Tôi không hiểu 'Đợt' là cái gì, 'Mạng' với 'Vàng' nghĩa là sao [...] 'Chạm ô trống để xây' — tôi cũng không hiểu 'xây' là xây cái gì"*.
- p07 Bà Ngà — *"Bấm xong thì nút đó mờ đi [...] tôi không biết mình vừa làm gì, màn hình cũng không nói cho biết chuyện gì đang xảy ra."* → `anh/p07-06-goi-dot-tiep-theo.png`.
- p07 Bà Ngà — *"Tôi bắt đầu thấy rối, không biết bấm ô nào là đúng, ô nào không nên bấm."*
- Mặt còn tốt: p01 thấy sự tối giản này là điểm cộng — *"Không có hướng dẫn dài dòng gì, tôi thích vậy."* Đây là đánh đổi thật, không phải lỗi hiển nhiên.

**Bao nhiêu người vấp:** 1/7 trực diện (p07), nhưng nó là nền của F-01 mà 2 người nữa vấp.

**Hướng xử lý:** chỗ rẻ nhất để bắt đầu là tương phản của ô xây và thứ hạng thị giác của dòng "Diệt N địch" trên màn kết.

---

### F-07 · Low · Interaction Design · Trust & desirability

**Ở đâu:** RR-02 — bảng thông tin tháp trong trận, sau khi đã mua nâng cấp vĩnh viễn.

**Chuyện gì xảy ra:** Nâng cấp vĩnh viễn **có** được áp dụng, nhưng trận đấu không có chỗ nào nói ra, nên người vừa trả 70 Lõi không xác nhận được mình đã mua cái gì.

**Dẫn chứng:**
- p02 Khoa — *"tôi không thấy chỗ nào ghi rõ cái +4% sát thương tôi vừa mua ở Xưởng nâng cấp có được cộng vào con số 12 này hay chưa — không có ký hiệu buff nào cả, nên tôi không chắc."*
- Đối chiếu chéo hai phiên — thứ không persona đơn lẻ nào tự thấy được: `anh/p06-06-thap-da-dat.png` (chưa mua gì) ghi Cung Bậc 1 **"Sát thương 12 → 18"**; `anh/p02-07-dat-thap-thu.png` (vừa mua "Cung sắc bén") ghi cùng tháp là **"12 → 19"**. Nâng cấp có ăn — dấu vết duy nhất là một chữ số cuối.
- Cặp thứ hai: vàng đầu trận Đầm Sương là **320** với p02 (chưa mua `startGold`) và **370** với p04 (đã mua). Chênh đúng +50, không có gì trên HUD nói vì sao.

**Bao nhiêu người vấp:** 1/7 nói ra thành lời. Low vì không ai bị chặn — nhưng nó đánh vào vòng lặp mà RR-02 tồn tại để bảo vệ.

**Hướng xử lý:** một dấu hiệu trong trận cho biết chỉ số hiện tại đã gồm nâng cấp nào.

---

### F-08 · Low · Trust & desirability

**Ở đâu:** Mọi màn, mọi phiên — `404 https://levananhduc.github.io/favicon.ico`.

**Chuyện gì xảy ra:** Thiếu favicon. Xuất hiện trong console log của **7/7 phiên**.

**Dẫn chứng:** log console dán nguyên trạng ở mục 5 của cả bảy file. p05 Daniel là người duy nhất bình luận: *"it repeated the same missing-icon complaint four times and nothing else, so I didn't worry about it."*

**Bao nhiêu người vấp:** 0/7 bị ảnh hưởng tới việc đang làm. **Không nâng bậc** dù xuất hiện ở 7 phiên — luật nâng bậc tính số người *vấp*, không tính số lần *xuất hiện*.

---

## Không phát hiện được gì ở

**RR-04 · Tắt tiếng và đổi sang tiếng Anh — sạch, và sạch một cách bất thường.**
Đây là Red Route dựng ra để bắt đúng loại lỗi "sót một chuỗi", và persona được giao đã đi soi có chủ đích. p05 — *"Every label, every description, every 'Needs X level Y' lock message — all English. [...] I read every single line here on purpose because this is exactly where I'd expect one string to have been missed, and I found nothing."* Anh kiểm cả 5 màn gồm một trận thật (tên quái "8× Grunt", dòng phím tắt), rồi tải lại trang nguội. Kết luận: *"Leftover Vietnamese found across home, settings, map select, workshop, and an actual battle: none."* Công tắc VI/EN nằm đúng chỗ anh theo phản xạ đi tìm: *"I didn't even have to hunt for it, it's the very first thing in the layout."*

**Form design — ⚪ không áp dụng.** Không đăng ký, không email, không một trường nhập nào. 0/7 persona gặp form.

**Phản hồi thao tác — sạch ở 6/7 phiên.** Mọi lần "bấm vào chỗ không phản hồi" đều được chính persona quy cho công cụ chứ không cho trang: p02 *"không phải lỗi của trang"*; p06 *"do tool của tôi, không phải lỗi trang"*. p01 và p04 ghi thẳng **0 lần**. Ngoại lệ duy nhất là p07, và ba lần của bà là "phản hồi mà không hiểu" — đã tính vào F-06.

**Số học của hệ kinh tế — không lệch ở bất kỳ đâu.** p02 kiểm chủ động: *"Lõi giảm còn 190, bậc lên 1/4, giá nâng tiếp theo nhảy lên 120 — logic rõ ràng"*, rồi *"không bị lỗi lệch số"*. Không persona nào bắt được một con số sai.

**Bố cục và mỹ thuật ở 1440×900 — chỉn chu, nhất quán.** Một bảng màu duy nhất, một họ chữ bo tròn duy nhất, bán kính bo góc và chiều cao nút nhất quán giữa 5 màn. Project không có `.claude/uiux/` nên nhận xét này dựa trên tính nhất quán nội tại của chính sản phẩm.

---

## Ghi chú về chính lần chạy này

1. **Không throttle được mạng.** CDP `Network.emulateNetworkConditions` đo ra là không có tác dụng (8915 ms có throttle vs 8727 ms không, cùng file 1436 KB). Điều kiện mạng mô phỏng bằng **HTTP cache**: p01 và p07 chạy cache lạnh trên đường nền ~1,4 Mbps / RTT ~450 ms (≈ Slow 4G), 5 phiên còn lại cache nóng. Mọi nhận định về tốc độ tải đều gián tiếp — không persona nào phàn nàn về tốc độ tải, nhưng đó không phải bằng chứng mạnh.

2. **Một browser context dùng chung cho cả 7 phiên** ⇒ chạy tuần tự, điều phối viên tự dọn localStorage giữa các phiên. p02 và p04 được **seed sẵn tiến độ**, nên hai người đó **chưa từng tự tay thắng một bản đồ nào**. Với RR-03, thứ đo được là "màn hình có nói đúng không", không phải "người ta có tin sau khi tự mình xây nên nó không".

3. **Phải ép rAF về 60fps ở mọi phiên.** Cửa sổ Playwright bị che khiến Chrome tiết lưu `requestAnimationFrame` xuống 2 fps dù `visibilityState` báo `visible`, và ở 2 fps trận đấu nhìn y hệt đứng yên. Một lượt chạy p01 đã sa vào đúng bẫy này và bị loại; **không dòng nào trong báo cáo này trích từ `p01-lan2-2fps-khong-dung/`**.

4. **p03 bị cắt `browser_click` khỏi bộ tool** — "không chạm chuột lần nào" của RR-05 là ràng buộc vật lý, không phải lời tự hứa.

5. **Con số bước trong log lẫn thao tác của công cụ.** Bảng hiệu suất dùng số thao tác **trên sản phẩm** đếm lại từ tường thuật.

6. **Hai phiên mù (p06, p07) không có `done_when`** nhưng được gộp vào bảng RR-01 vì cả hai đều vào bản đồ 1, xây tháp và gọi đợt. p07 chưa bao giờ đặt mục tiêu thắng.

7. **Kiểm chứng "Diệt 0 địch" là phép đo của điều phối viên**, không phải dữ liệu persona. Nó **lật ngược cách đọc hiển nhiên** của p01 và p06: ngây thơ là "tháp không bắn, có bug"; đúng là "tháp bắn bình thường, nhưng không thấy được tầm bắn trước khi trả tiền". Hai kết luận dẫn tới hai việc phải làm hoàn toàn khác nhau.

8. **Không có screen reader thật, không có thiết bị thật, không có mạng thật.** F-03 ban đầu rút chủ yếu từ ảnh, sau đó đã được xác nhận lại bằng phép đo DOM ở 375px.

9. **Project không có `.claude/uiux/`.** Không có token thiết kế để đối chiếu.
