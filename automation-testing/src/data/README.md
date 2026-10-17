# data/

**Trả lời câu hỏi:** test dùng **giá trị** gì?

| File | Nội dung |
|---|---|
| `copy.ts` | Text UI (`copy`) và message server theo error code (`serverMessage`), chép **nguyên văn** kèm file nguồn |
| `test-data.ts` | Hằng số chép từ app kèm nguồn: khoá storage, số liệu bản đồ / tháp / phần thưởng / cây nâng cấp, viewport |
| `profiles.ts` | Hình dạng profile đã lưu (`Profile`) và hàm dựng profile để gieo vào `localStorage` (`profile()`, `cleared()`) |

## Quy tắc

- Spec không viết chuỗi assert trực tiếp: lấy từ `copy` / `serverMessage`. UI đổi chữ → sửa một chỗ ở đây.
- Chuỗi mới phải chép nguyên văn từ file locale FE / `messages.properties` BE, comment đường dẫn nguồn ngay trên.
- Chỉ giá trị: không đọc `.env`, không gọi mạng, không biết ENV (cần thì → `config/`).
- Dữ liệu sinh ngẫu nhiên phải duy nhất mỗi lần gọi để test song song không đụng nhau.

**Import được:** `utils/` (vd `totp`). Không import gì khác trong `src/`.
