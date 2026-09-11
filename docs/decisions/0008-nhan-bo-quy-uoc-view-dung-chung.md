# ADR-0008 · Nhận bộ quy ước view dùng chung của workspace `web-game`

> **Ngày:** 2026-09-11
> **Trạng thái:** accepted
> **Liên quan:** ADR-0003 · ADR-0006 · [`docs/code-conventions.md`](../code-conventions.md)

## 1. Bối cảnh

Bộ quy ước dùng chung rút từ `quapp-developer-frontend`, đã lọc qua chín lần áp thật
trước khi tới đây.

Repo này có tầng UI tổ chức tốt nhất trong workspace — `ui/screens/`,
`ui/components/`, `ui/hooks/` đã tách vai trò rõ — nhưng vẫn lệch ba chỗ:

- `src/ui/` là **tên cũ** của `src/views/`, và nó gom cả sáu màn hình vào một thư mục
  `screens/` chứ không cho mỗi màn một thư mục riêng.
- **`ui/battle/parts.tsx` xuất 14 component trong một file 353 dòng** — chỗ vi phạm
  R-05 lớn nhất của cả workspace.
- `ui/App.tsx` là tầng điều phối màn hình (một enum, không router — ADR-0006 §4), nhưng
  nó nằm trong `ui/` như thể là một màn hình.

## 2. Quyết định

Theo [`docs/code-conventions.md`](../code-conventions.md):

- Sáu màn hình → `views/Title/` `views/MapSelect/` `views/Battle/` `views/Result/`
  `views/Settings/` `views/Workshop/`, mỗi cái một `index.tsx`.
- `parts.tsx` tách thành **14 thư mục**: 13 mảnh của màn trận vào
  `views/Battle/components/`, `StorageNotice` vào `src/components/` vì `App` dùng nó.
  Hai thứ không render gì ra `src/lib/`: `towerIcon.tsx` (bảng icon) và
  `towerStrings.ts` (ba hàm suy khoá i18n mà ba component cùng dùng).
- `ui/components/` → `src/components/`, `ui/hooks/` → `src/hooks/` + barrel,
  `ui/battle/waveProgress.ts` → `src/lib/`.
- `App.tsx` lên `src/`, cạnh `main.tsx`: nó là tầng routing (R-02), không phải màn hình.
- Alias `@/` (R-13), khai ở **ba** chỗ: `tsconfig.json`, `vite.config.ts` **và**
  `vitest.config.ts`. Repo này có config Vitest riêng, nên thiếu chỗ thứ ba thì test
  đầu tiên import một view sẽ không resolve được — và lỗi chỉ hiện lúc có người viết
  test đó.

**R-04 áp một phần, và phần bị giữ lại là một phát hiện đáng ghi.** Ba trong năm effect
của `views/Battle` là side-effect thuần; hai thành ghost (`SyncAudioVolume`,
`BattleShortcuts`). Effect thứ ba — `handleRef.current?.refreshScale()` khi bố cục đổi —
**giữ nguyên trong view**, vì nó đọc một ref do effect mount engine của **chính view**
đặt. Effect của con chạy **trước** effect của cha, nên một ghost sẽ thấy ref còn `null`
ở lần mount đầu và bỏ qua lần đo lại — đúng cái lỗi canvas giữ kích thước của bố cục cũ
mà effect đó tồn tại để chặn.

**Hai chỗ cố ý lệch khỏi R-05 và R-07:**

- `components/Icon/index.tsx` xuất hơn 10 icon trong một file. Một bộ icon là một module
  gắn kết; 10 thư mục mỗi cái một `index.tsx` 6 dòng là nghi thức, không phải cấu trúc.
- Test nằm ở `tests/` gương theo `src/`, không cạnh source. Đó là quy ước sẵn của repo,
  21 file, và chúng kiểm `core/` — nơi R-03/R-05 không áp. Di chuyển chúng là churn.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Giữ `parts.tsx` nguyên khối | 14 component trong một file thì cây thư mục không nói được gì, và sửa `LivesChip` làm bẩn `git blame` của cả 14 |
| Tách `parts.tsx` thành 3-4 file theo nhóm (HUD, xây tháp, …) | Đó là một tầng phân loại thứ ba không có trong rule, và ranh giới giữa các nhóm sẽ là chuyện tranh luận ở mỗi lần thêm component |
| Tách cả effect `refreshScale` thành ghost cho đủ | Nó sẽ chạy trước effect mount engine và đọc ref rỗng. Đây là loại lỗi im lặng nhất trong cả đợt: canvas sai kích thước, không có gì đỏ |
| Đặt ghost ở ĐẦU danh sách con của lưới | Ghi chú trên `GRID` yêu cầu `board` luôn là con đầu tiên và luôn cùng một node. Ghost render `null` nên đặt cuối là an toàn và không phải cân nhắc gì thêm |
| Cho mỗi icon một thư mục | 10 thư mục cho 10 hàm 6 dòng. R-05 tồn tại để tìm được component; không ai đi tìm `IconCoin` bằng cách nhìn cây thư mục |

## 4. Hệ quả

**Được:**
- Mở `views/Battle/` là thấy cả màn trận: view, 14 mảnh, 2 ghost.
- `src/lib/` giờ giữ đúng thứ không render gì, và `towerStrings.ts` là một chỗ duy nhất
  cho ba hàm mà trước đây nằm ẩn trong một file component.

**Mất / phải chấp nhận:**
- Commit này chạm toàn bộ tầng UI, và tách một file thành 16. `git blame` trên một dòng
  UI sẽ dừng ở đây.
- Alias phải khai ở **ba** chỗ. Sửa hai quên một thì hoặc `tsc`, hoặc build, hoặc test
  sẽ hỏng — và mỗi cái hỏng ở một thời điểm khác nhau.
- **Thứ tự ghost = thứ tự chạy effect**, và ghost phải render vô điều kiện.

## 5. Một việc KHÔNG thuộc quyết định này

`tests/balance/determinism.test.ts` ("chạy trọn bản đồ dài nhất trong dưới 200ms") **đỏ
trên máy dev**: đo được 350-420ms. Nó đỏ cả khi chạy riêng, nên không phải nhiễu do
song song.

Đợt refactor này **không thể** là nguyên nhân: `git status` trên `src/core` `src/data`
`src/bridge` `src/game` không có gì — `runBattle` và toàn bộ thứ nó gọi giống `main`
từng byte. Ngưỡng 200ms hoặc được đặt trên một máy nhanh hơn, hoặc đã lỗi thời từ một
thay đổi trước. Đã ghi vào `04-state/backlog.md`.
