# Ducker ID sign-in — plan (Duck Defense)

> **Plan dùng chung:** `web-game/docs/superpowers/plans/2026-10-04-ducker-id-sign-in.md` (mã tham chiếu R1–R10). Ở đây chỉ phần của repo này.
> **Design:** [design.md](design.md) · **ADR:** [ADR-0010](../../decisions/0010-dang-nhap-ducker-id-tuy-chon-sau-co-tinh-nang.md)

- [x] **Task 0** — worktree `.worktrees/ducker-id-sign-in` từ `origin/main`, cài pnpm, đo nền (lint · typecheck · build xanh; `tests/balance/determinism.test.ts` đỏ sẵn do ngưỡng 200ms — xem `backlog.md`).
- [x] **Task 1** — `readDuckerConfig` + `VITE_BASE_PATH` (test đỏ → xanh), `.env.example`, `deploy.yml`, kiểm base tuyệt đối khớp asset Phaser. Commit `feat(auth): read Ducker ID config and base path from env`.
- [x] **Task 2** — `pkce`, `flow` (startLogin / consumeCallback / captureCallback), `requests`, `session`, `initialOf`. Commit `feat(auth): add Ducker ID PKCE flow and session store`.
- [x] **Task 3** — hooks, `AccountButton`, icon, chuỗi vi + en, gắn vào thanh trên màn tiêu đề; xem ảnh ở 375 / 768 / 1440, hai locale. Commit `feat(auth): add Ducker ID account button to title`.
- [x] **Task 4** — e2e hai project (cờ bật với issuer giả, cờ tắt). Commit `test(auth): cover the Ducker ID round trip end to end`.
- [x] **Task 5** — docs: Non-Goal, ADR-0010, NFR, FR-37 / US-05, bất biến #14, README, `.env.example`, spec này. Commit `docs(auth): record the Ducker ID sign-in decision`.
- [ ] **Task 6** — gate đầy đủ, push, mở PR (không merge; người điều phối merge sau khi chạy thật với Ducker ID cục bộ).
