# Design System Master — Tower Defense

> **LOGIC:** Khi dựng một màn hình cụ thể, đọc `pages/<screen>.md` trước.
> File đó có thì luật của nó **đè** file này. Không có thì theo file này.

**Project:** Tower Defense · **Slug:** `tower-defense`
**Bước 1 (ràng buộc, `ui-ux-pro-max`):** 2026-09-08 · **Bước 2 (lựa chọn, `frontend-design`):** 2026-09-08
**Quyết định kèm theo:** [`ADR-0001`](../../decisions/0001-design-system-tokens.md)

Đây là **nguồn đúng duy nhất** cho màu, chữ và khoảng cách. Mockup của mọi feature
đọc file này. Không sinh lại — lý do nằm trong `.claude/skills/design-bootstrap/SKILL.md`.

---

## 0. Hai họ token, đừng trộn

Game này có hai bề mặt vẽ khác nhau, và chúng **không dùng chung bảng màu**:

| Họ | Sống ở | Ai vẽ | Tiền tố |
| --- | --- | --- | --- |
| **Chrome** — menu, HUD, cây nâng cấp, cài đặt | DOM / React / CSS variable | trình duyệt | `--ui-*` |
| **Semantic** — máu, tiền, mạng, tầm bắn, hiệu ứng | Canvas / Phaser | GPU | `--sem-*` |

Lý do tách: màu semantic **mang nghĩa trong luật chơi** — đỏ là mất máu, vàng là
tiền. Nếu nút bấm cũng đỏ thì HUD ngừng truyền tin. Chrome vì thế bị cấm dùng đỏ
và xanh lá làm màu tương tác.

Semantic token khai báo ở CSS `:root` như nhau, và Phaser đọc chúng một lần lúc
khởi động rồi chuyển sang số nguyên — **không hardcode hex trong code Phaser.**

---

## 1. Màu

### 1.1 Chrome (`--ui-*`)

| Vai trò | Hex | Biến | Dùng ở |
| --- | --- | --- | --- |
| Nền trang | `#101E27` | `--ui-void` | nền sau cùng, viền quanh canvas |
| Mặt panel | `#1D3442` | `--ui-panel` | thanh HUD, thẻ map, panel nâng cấp |
| Cạnh cứng | `#0A1219` | `--ui-edge` | **viền + cạnh dưới của mọi thứ bấm được** |
| Chữ chính | `#F4F1E8` | `--ui-ink` | tiêu đề, nhãn, số |
| Chữ phụ | `#93AAB8` | `--ui-dim` | mô tả, trạng thái khoá |
| Tương tác | `#38BDC8` | `--ui-act` | nút chính, ring focus, mục đang chọn |
| Chữ trên nút | `#0A1219` | `--ui-on-act` | chữ nằm trên `--ui-act` |

**Tương phản đã đo** (WCAG 2.1, tính bằng script, không phải ước lượng):

| Cặp | Tỉ lệ | |
| --- | --- | --- |
| `ink` trên `panel` | 11.46:1 | ✅ AA |
| `ink` trên `void` | 15.03:1 | ✅ AA |
| `dim` trên `panel` | 5.35:1 | ✅ AA |
| `dim` trên `void` | 7.02:1 | ✅ AA |
| `act` trên `panel` | 5.72:1 | ✅ AA |
| `act` trên `void` | 7.50:1 | ✅ AA |
| `on-act` trên `act` | 8.34:1 | ✅ AA |

`--ui-dim` là **sàn**, không phải gợi ý: chữ nào nhạt hơn nó là vi phạm NFR-A11Y-01.

### 1.2 Semantic (`--sem-*`)

| Nghĩa trong luật chơi | Hex | Biến | Tương phản trên `panel` |
| --- | --- | --- | --- |
| Tiền trong trận (gold) | `#F0B429` | `--sem-gold` | 6.95:1 ✅ |
| Tiền meta (cores) | `#A78BFA` | `--sem-core` | 4.76:1 ✅ |
| Mất máu · mất mạng · enemy | `#FF7A7A` | `--sem-danger` | 5.13:1 ✅ |
| Thắng · đủ tiền · hồi máu | `#4CC38A` | `--sem-ok` | 5.84:1 ✅ |

`#FF7A7A` sáng hơn màu đỏ "cảnh báo" quen thuộc là **cố ý**: `#E5484D` chỉ đạt
3.31:1 trên panel, trượt chuẩn. Đỏ đậm chỉ được dùng làm **mảng tô** (thanh máu,
sprite tint), không bao giờ làm chữ.

**Không được dùng màu làm kênh thông tin duy nhất:** mỗi trạng thái phải kèm một
dấu hiệu thứ hai — icon, chữ, hoặc hình dạng. Người mù màu đỏ-lục là nhóm lớn nhất,
và game này đặt đỏ cạnh xanh lá suốt.

---

## 2. Chữ

| Vai trò | Font | Vì sao |
| --- | --- | --- |
| Hiển thị — tiêu đề, tên tháp, số HUD | **Baloo 2** (600/700/800) | nét dày, bo tròn, khớp hình khối mềm của sprite Kenney |
| Thân — mô tả, tooltip, cài đặt | **Be Vietnam Pro** (400/500/600) | thiết kế cho tiếng Việt; dấu không đè lên dòng trên |

```css
@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600&display=swap');
```

**Cả hai đều có subset `vietnamese`** — đã kiểm bằng cách gọi Google Fonts API, không
phải giả định. Đây là ràng buộc cứng: game chạy vi + en chuyển được, nên **font nào
không có subset `vietnamese` là bị loại, bất kể đẹp đến đâu.**

Thang chữ (tỉ lệ 1.25, đủ dùng cho UI dày đặc):

| Token | 375px | ≥768px | Vai trò |
| --- | --- | --- | --- |
| `--t-hero` | 32px | 48px | tên game ở màn tiêu đề |
| `--t-xl` | 24px | 28px | tiêu đề màn hình |
| `--t-lg` | 19px | 20px | tên tháp, số HUD |
| `--t-md` | 16px | 16px | thân — **không bao giờ nhỏ hơn 16px trên input**, iOS sẽ tự zoom |
| `--t-sm` | 14px | 14px | mô tả phụ |

**Số trong HUD dùng `font-variant-numeric: tabular-nums`.** Tiền thay đổi liên tục;
chữ số không cùng bề rộng thì cả thanh HUD rung. Font nào không hỗ trợ thì đặt
`min-width` cố định cho ô số.

**Chuỗi tiếng Việt dài hơn tiếng Anh khoảng 30%.** Mọi mockup dựng bằng chuỗi tiếng
Việt, không phải tiếng Anh — vừa ở tiếng Việt thì chắc chắn vừa ở tiếng Anh.

---

## 3. Khoảng cách, bo góc, độ nổi

| Token | Giá trị |
| --- | --- |
| `--space-xs` … `--space-3xl` | 4 · 8 · 16 · 24 · 32 · 48 · 64 px |
| `--r-sm` | 6px — chip, badge |
| `--r-md` | 10px — nút, ô tháp |
| `--r-lg` | 16px — panel, modal |

**Không dùng `box-shadow` mờ để tạo độ nổi.** Bóng `rgba(0,0,0,.1)` trên nền
`#101E27` là vô hình — đó là bóng thiết kế cho nền sáng. Ở đây độ nổi đến từ
**cạnh cứng**, xem mục 4.

Ngoại lệ duy nhất: lớp phủ modal dùng `rgba(4,10,14,.72)`, không blur — blur giết
hiệu năng trên mobile khi canvas vẫn đang vẽ phía sau.

---

## 4. Signature element — cạnh dưới cứng

**Đây là chỗ duy nhất thiết kế này được phép "to tiếng". Mọi thứ khác giữ im lặng.**

Mọi bề mặt bấm được có một **cạnh dưới đặc, dày 4px, màu `--ui-edge`** — không phải
bóng đổ, mà là một khối màu. Bấm xuống thì khối đó co về 0 và bề mặt tụt xuống 4px.
Nút trở thành một vật thể có bề dày, bị ấn xuống.

```css
.press {
  border: 2px solid var(--ui-edge);
  border-radius: var(--r-md);
  box-shadow: 0 4px 0 0 var(--ui-edge);
  transform: translateY(0);
  transition: transform 60ms ease-out, box-shadow 60ms ease-out;
}
.press:active { transform: translateY(4px); box-shadow: 0 0 0 0 var(--ui-edge); }
.press:focus-visible { outline: 3px solid var(--ui-act); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { .press { transition: none; } }
```

Ba lý do nó là lựa chọn đúng cho **chính** brief này, chứ không phải một hiệu ứng đẹp:

1. **Touch và chuột được đối xử như nhau.** Trên cảm ứng không có `hover`, nên thiết
   kế nào đặt affordance vào hover là bỏ rơi một nửa người chơi. Trạng thái *bị ấn*
   thì cả hai đều có.
2. **Nó là ngôn ngữ của chính bộ sprite.** Kenney vẽ nút UI đúng kiểu này — khối dày,
   bo góc, cạnh dưới đậm. Chrome và canvas nói cùng một thứ tiếng.
3. **Nó gần như miễn phí dưới `prefers-reduced-motion`** — bỏ transition là xong,
   trạng thái vẫn đọc được vì nó là vị trí, không phải chuyển động.

`hover` vẫn có (sáng bề mặt lên 6%), nhưng chỉ là **phần thưởng thêm cho chuột**,
không bao giờ là nơi chứa thông tin.

---

## 5. Touch và chuột — quy tắc ngang hàng

- **Vùng bấm ≥ 44×44px** kể cả khi icon nhỏ hơn (NFR-A11Y-03). Dùng padding hoặc
  pseudo-element mở rộng, đừng phóng to icon.
- **Không có chức năng nào chỉ đạt được bằng hover.** Tầm bắn của tháp hiện khi
  *chọn*, không phải khi *rê chuột*.
- **Không có chức năng nào chỉ đạt được bằng chuột phải hay bàn phím.** Phím tắt là
  đường tắt cho người quen, không phải đường duy nhất.
- **Mọi hành động thao tác được bằng bàn phím, focus luôn thấy được** (NFR-A11Y-02),
  kể cả đặt tháp: Tab tới ô, Enter mở bảng chọn tháp.
- **Bảng chọn tháp trượt lên từ đáy trên mobile**, đặt cạnh ô trên desktop. Không bao
  giờ là menu chuột phải.

---

## 6. Responsive và canvas

Bốn mốc bắt buộc kiểm: **375 · 768 · 1024 · 1440**, ở **cả hai chiều xoay**.

Canvas giữ tỉ lệ cố định và scale bằng `Phaser.Scale.FIT` + `CENTER_BOTH`. Chrome
**không** scale theo canvas — nó là DOM và co giãn theo CSS. Hệ quả bắt buộc nhớ:
**một sprite 16px trong game và một nút 16px trong HUD không cùng kích thước trên
màn hình.** Đừng cố khớp chúng.

| Mốc | Bố cục chiến trường |
| --- | --- |
| 375 dọc | canvas trên, HUD thành thanh dính đáy, panel tháp trượt lên |
| 375 ngang | canvas full, HUD nổi ở hai mép, panel tháp ép sát cạnh |
| 768 | canvas + HUD cạnh dưới, panel tháp thành cột phải thu gọn |
| ≥1024 | canvas giữa, cột phải cố định cho tháp + nâng cấp |

**Không cuộn ngang ở bất kỳ mốc nào.**

---

## 7. Chuyển động

Tầng thấp, cố ý. Game đã có chuyển động thật ở canvas rồi — chrome mà cũng động nữa
thì thành nhiễu.

| Cho phép | Cấm |
| --- | --- |
| phản hồi bấm 60ms | fade-and-slide-up cho từng khối nội dung |
| panel trượt vào/ra 180ms | hiệu ứng hover trên mọi thẻ |
| số đếm lên khi nhận thưởng (một lần) | chuyển động lặp không do người dùng kích |

`prefers-reduced-motion: reduce` **tắt toàn bộ chuyển động của chrome**, và giảm hiệu
ứng hạt trong canvas — không tắt animation sprite, vì đó là nội dung game chứ không
phải trang trí.

---

## 8. Anti-pattern

Từ bước 1, giữ nguyên (không được đè):

- ❌ Emoji làm icon — dùng SVG (Lucide)
- ❌ Thiếu `cursor: pointer` trên thứ bấm được
- ❌ Hover làm xê dịch bố cục
- ❌ Chữ tương phản dưới 4.5:1
- ❌ Đổi trạng thái tức thì không transition (trừ khi reduced-motion)
- ❌ Focus không nhìn thấy

Thêm cho dự án này:

- ❌ **Vẽ chữ UI trong canvas.** Không focus, không screen reader, không co theo CSS,
  và tràn khi đổi sang tiếng Việt mà không ai biết.
- ❌ **Dùng đỏ hoặc xanh lá làm màu tương tác của chrome** — chúng đã có nghĩa trong luật chơi.
- ❌ **Hardcode hex trong code Phaser** — đọc từ CSS variable lúc khởi động.
- ❌ **React re-render mỗi frame** — HUD đọc snapshot ~10Hz.
- ❌ **Mockup dựng bằng chuỗi tiếng Anh** — luôn dựng bằng tiếng Việt, chuỗi dài hơn.

---

## 9. Checklist trước khi giao bất kỳ UI nào

- [ ] Không emoji làm icon; icon cùng một bộ (Lucide)
- [ ] `cursor: pointer` trên mọi thứ bấm được
- [ ] Vùng bấm ≥ 44×44px
- [ ] Tương phản chữ ≥ 4.5:1 — đo, không ước lượng
- [ ] Focus thấy được ở mọi phần tử tương tác
- [ ] Đi hết được một lượt chỉ bằng bàn phím
- [ ] `prefers-reduced-motion` được tôn trọng
- [ ] Dựng ở 375 · 768 · 1024 · 1440, cả hai chiều xoay
- [ ] Không cuộn ngang
- [ ] **Chuỗi tiếng Việt không tràn, không cắt** — kiểm ở 375 trước
- [ ] Không trạng thái nào chỉ phân biệt được bằng màu

---

## 10. Bước 1 đề xuất gì và vì sao bị đè

Ghi lại để lần sau không ai "sửa ngược" về mặc định:

| Bước 1 đề xuất | Quyết định cuối | Lý do |
| --- | --- | --- |
| `Press Start 2P` + `VT323` | `Baloo 2` + `Be Vietnam Pro` | **`Press Start 2P` không có subset `vietnamese`** — đã kiểm qua Google Fonts API. Lỗi chức năng, không phải khẩu vị. |
| Style *Pixel Art*, 8-bit | *Flat chunky*, khối dày bo tròn | Sprite Kenney **không phải pixel art** — nó là hình phẳng bo tròn. UI 8-bit đặt cạnh nó là lệch pha. Bước 1 suy ra từ chữ "pixel" trong câu truy vấn của tôi, không phải từ asset thật. |
| `#DC2626` primary **và** `#DC2626` destructive | `#38BDC8` tương tác, đỏ chỉ dành cho semantic | Cùng một màu cho "nút chính" và "đang mất mạng" làm HUD ngừng truyền tin. |
| `#0F172A` nền + `#22C55E` accent | `#101E27` + `#38BDC8` | Cặp near-black + acid-green là mặc định của mọi trang tối. Xanh lá còn đang mang nghĩa "đủ tiền". |
| `--shadow-*` `rgba(0,0,0,.1)` | Cạnh cứng 4px | Bóng mờ trên nền tối là vô hình. |
| CSS component nền trắng (`.modal`, `.input`) | Viết lại cho nền tối | Bước 1 sinh CSS light-mode trong một hệ dark-mode — tự mâu thuẫn. |
| *Hero-Centric*, 4 khối landing page | Chỉ áp cho **màn tiêu đề** | Đây là game, không có landing page. Màn tiêu đề đúng là hero-dominant + một CTA "Chơi", nên pattern giữ được ở đó. |

Ràng buộc a11y/UX của bước 1 **không bị đè dòng nào** — chúng chỉ được siết chặt thêm.
