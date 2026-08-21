---
name: nextjs-app-router
description: Quy ước Next.js App Router của project — Server vs Client Component, data fetching & caching, server action, route handler, loading/error boundary, metadata, env var. Dùng khi tạo hoặc sửa file trong app/, middleware, next.config, hoặc khi bàn về fetch/cache/revalidate.
paths:
  - app/**
  - src/app/**
  - middleware.ts
  - src/middleware.ts
  - next.config.*
---

# Next.js App Router — quy ước project

Stack: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui. Phần SDK Stellar, wallet, transaction → xem skill `dapp`. File này chỉ nói về khung Next.js.

## Server vs Client Component
- Mặc định **Server Component**. Chỉ `"use client"` khi cần state, effect, event handler, browser API, hoặc hook client-only.
- Đẩy `"use client"` xuống **lá**. Ví dụ: `page.tsx` là server, chỉ `<ConnectButton />` là client. Không đặt `"use client"` ở `layout.tsx`.
- **Quan trọng với dApp**: `@stellar/freighter-api`, Stellar Wallets Kit, và mọi thứ đụng `window` chỉ chạy ở client. Bọc chúng trong component `"use client"` riêng, hoặc `next/dynamic` với `ssr: false`. Không import ở Server Component.
- Không import server-only code (secret key, RPC admin, `fs`) vào file `"use client"`. Đánh dấu module server bằng `import "server-only"`.
- Chỉ truyền dữ liệu serialize được từ Server sang Client. `BigInt`, `Buffer`, `xdr` object phải convert sang string trước.

## Data fetching
- Fetch trong Server Component; tránh `useEffect` + fetch cho dữ liệu khởi tạo.
- Khai báo caching **tường minh** ở mọi `fetch`: `{ next: { revalidate: N } }`, `{ cache: "force-cache" }`, hoặc `{ cache: "no-store" }`. Không dựa vào default.
- Dữ liệu on-chain (balance, contract state) gần như luôn `no-store` hoặc `revalidate` rất ngắn — nhưng phải viết ra, kèm lý do nếu khác thường.
- Fetch song song bằng `Promise.all` khi các request độc lập. Không await tuần tự tạo waterfall.
- Bọc phần chậm trong `<Suspense>` + skeleton để phần còn lại stream ra trước.

## Mutation
- Ưu tiên **Server Action** cho form/mutation phía server. Route Handler (`app/api/**/route.ts`) chỉ cho webhook, endpoint public, hoặc client bên thứ ba.
- Lưu ý dApp: transaction ký bằng ví **phải** xảy ra ở client. Pattern đúng là server build XDR → client ký → submit. Không bao giờ đưa secret key vào server action.
- Mọi Server Action: validate input bằng zod, kiểm tra auth **bên trong** action (không tin UI), rồi `revalidatePath`/`revalidateTag`.
- Trả `{ ok: true, data }` | `{ ok: false, message, fieldErrors? }` thay vì throw, để UI hiển thị lỗi được.

## File bắt buộc cho mỗi route có dữ liệu
- `loading.tsx` — skeleton khớp layout thật, không phải spinner giữa màn hình trắng.
- `error.tsx` — `"use client"`, có nút retry gọi `reset()`.
- `not-found.tsx` khi route có thể 404.
- `generateMetadata` cho mọi page public (title, description, openGraph).

## Env
- Biến dùng ở client phải có prefix `NEXT_PUBLIC_` (vd `NEXT_PUBLIC_STELLAR_NETWORK`, `NEXT_PUBLIC_RPC_URL`).
- Secret **không bao giờ** có prefix đó. Validate toàn bộ env bằng zod ở một file `env.ts` duy nhất, import từ đó thay vì đọc `process.env` rải rác.
- Có `.env.example` cập nhật mỗi khi thêm biến.

## Cấm
- `useEffect` để fetch dữ liệu đã lấy được ở server.
- `router.refresh()` thay cho `revalidatePath`/`revalidateTag`.
- `export const dynamic = "force-dynamic"` rải khắp nơi "cho chắc" — phải có comment nêu lý do.
- Import package Node-only vào client bundle.

## Checklist trước khi xong
- [ ] `"use client"` chỉ ở nơi thực sự cần, và ở mức lá?
- [ ] Mọi fetch đã khai báo caching?
- [ ] Có `loading.tsx` + `error.tsx`?
- [ ] Metadata đã có?
- [ ] `npm run build` không sinh warning mới, không lỗi "window is not defined".
