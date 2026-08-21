---
name: frontend-perf
description: Ngân sách hiệu năng frontend và cách đạt — Core Web Vitals, next/image, next/font, code splitting, kích thước bundle, tránh layout shift và waterfall, và chi phí riêng của SDK blockchain trong bundle. Dùng khi trang chậm, khi thêm thư viện mới, khi thêm ảnh/font, hoặc khi review hiệu năng.
---

# Ngân sách hiệu năng

| Chỉ số | Ngưỡng |
|---|---|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| JS route đầu tiên | < 200KB gzip |

Vượt ngưỡng thì phải sửa hoặc ghi lý do vào PR, không im lặng cho qua.

## Bundle của SDK blockchain — điểm chết của dApp
`@stellar/stellar-sdk` rất nặng. Nếu import thẳng vào layout hoặc page đầu tiên, LCP hỏng ngay.
- Import SDK **chỉ trong** module client cần nó, load qua `next/dynamic` hoặc dynamic `import()` bên trong event handler (vd chỉ nạp khi bấm "Connect").
- Không import SDK vào Server Component chỉ để lấy một hằng số — copy hằng số đó ra.
- Wallet adapter (Freighter, Wallets Kit) chỉ nạp khi người dùng mở modal chọn ví, không nạp lúc trang khởi động.
- Kiểm bằng `ANALYZE=true next build` sau mỗi lần thêm dependency blockchain.

## Ảnh
- `next/image` luôn luôn; có `width`/`height` hoặc `fill` + container có kích thước → tránh CLS.
- `priority` cho đúng **một** ảnh LCP mỗi trang.
- `sizes` chính xác cho ảnh responsive, thiếu thì browser tải bản quá lớn.
- AVIF/WebP cho ảnh; SVG cho icon và logo token.

## Font
- `next/font` (self-host, không request runtime tới Google).
- `display: "swap"`, subset đúng ngôn ngữ cần, tối đa 2 family.
- Font mono cho địa chỉ/hash cũng phải subset — thường chỉ cần chữ và số.

## JavaScript
- `next/dynamic` cho: chart, QR scanner/generator, rich text editor, map, modal nặng.
- Import chọn lọc (`import { x } from "lib/x"`) thay vì import cả package.
- Trước khi thêm dependency: xem bundlephobia, cân nhắc viết 20 dòng thay thế.
- Bỏ polyfill và package trùng chức năng (moment + date-fns cùng lúc, v.v.).

## Data
- Fetch song song, không waterfall. `<Suspense>` để phần nhanh stream ra trước.
- Cache tường minh; không `no-store` mặc định cho mọi thứ.
- Poll trạng thái transaction có **backoff** và có điểm dừng — không `setInterval` 1 giây vô hạn.
- Hủy request khi component unmount (`AbortController`).

## Layout shift
- Chừa chỗ sẵn cho nội dung load sau: skeleton đúng kích thước, `min-h`.
- Số dư / giá chưa có → hiện skeleton đúng độ rộng, không hiện `0` rồi nhảy sang số thật.
- Banner network mismatch: dành chỗ sẵn hoặc overlay, không chèn đẩy nội dung xuống.

## Cấm
- Import cả thư viện chỉ để dùng một hàm nhỏ.
- Animate `width`/`height`/`top`/`left` (dùng `transform`).
- Ảnh gốc > 1MB commit vào repo.
- `useEffect` fetch cho dữ liệu render lần đầu.
