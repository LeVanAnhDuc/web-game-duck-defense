# PROFILE — Quyết định

Đi cặp với `docs/requirements/profile.md`.

## Nguồn

Đọc ngày 2026-10-17 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-11, FR-25), `docs/02-requirements/nfr.md` (NFR-REL-04 "6 dạng dữ liệu
  rác", NFR-REL-05, NFR-SEC-07, NFR-DATA-05), `docs/01-product/journeys.md` (US-01 "tab riêng tư … phải nói cho người chơi
  biết", US-03 "không được xoá lặng lẽ … giữ bản hỏng dưới một tên khác"), `docs/decisions/0005-profile-trong-localstorage-co-schemaversion.md`,
  `docs/03-design/invariants.md` #10, `README.md` §Features ("kept aside, never deleted").
- **Code:** `client/src/storage/profile.ts` (`loadProfile`, `parseProfile`, `repairs`, `probeWritable`, khoá `.corrupt.<ts>`),
  `client/src/hooks/useProfile.ts` (`dismissStorageNotice`), `client/src/App.tsx` (thông báo `recovered || repaired` →
  `storage.recovered`, `!writable` → `storage.notWritable`), `client/src/components/StorageNotice`.
- **Test đã gom (gợi ý):** không có e2e cũ; unit test `client/tests/storage/profile.test.ts` phủ sáu dạng dữ liệu rác ở tầng hàm.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Profile "được sửa" (một trường sai) dùng CÙNG câu thông báo với profile hỏng hẳn ("Dữ liệu lưu cũ không đọc được
  nên đã bắt đầu tiến trình mới…"), dù phần lớn tiến trình còn nguyên. Có phải bug? → không coi là bug: comment trong
  `App.tsx` nói đây là quyết định cố ý ("người chơi không cần biết khác biệt kỹ thuật"); requirement chỉ đòi "vẫn thông
  báo" (REQ-PROFILE-04). Ghi ở Tech debt vì câu chữ nói "bắt đầu tiến trình mới" trong khi tiến trình không mới.
- **Q2** Chặn lưu trữ giả lập thế nào? → getter `window.localStorage` ném `SecurityError` — đúng hình dạng tab riêng tư /
  chặn dữ liệu trang. "Chơi được" kiểm bằng vào trận và xây một tháp.
- **Q3** NFR-SEC-07 "không bao giờ dựng DOM từ nó" kiểm ở e2e? → gieo chuỗi HTML/script vào các trường chuỗi (`locale`,
  `lastMap`), rồi kiểm không có mã nào chạy (cờ `window.__pwned`), không có ảnh lạ, không có `dialog`, và trường đó về mặc định.

## Tài khoản test

Không có. Profile gieo thẳng (`TitlePage.seedProfile` nhận cả chuỗi thô cho JSON vỡ).

## Ngoài phạm vi

- Hết quota khi GHI (khác với chặn hẳn lúc đọc): cùng đường code `saveProfile` → `false`; unit test đã phủ.
- Không lưu giữa trận: module `result` (TC-RESULT-008).

## Tech debt liên quan

- Câu `storage.recovered` dùng chung cho bản hỏng và bản được sửa (xem Q1).
