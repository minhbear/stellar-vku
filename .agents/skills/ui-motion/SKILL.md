---
name: ui-motion
description: Công thức animation cho Next.js với framer-motion và Tailwind — page entrance có tiết tấu, stagger list, modal/dropdown, chuyển state của transaction, số chạy, micro-interaction, và cách tránh jank. Dùng khi thêm animation, khi trang load bị giật/hiện cùng lúc, hoặc khi review code animation.
paths:
  - "**/*.tsx"
  - "**/*.ts"
---

# Animation — công thức cho project

Thư viện: `framer-motion` (`npm i framer-motion`). Với animation đơn giản (hover, fade nhỏ) dùng thẳng Tailwind `transition-*` — đừng kéo framer-motion vào mọi chỗ.

## Luật nền
1. Chỉ animate `transform` và `opacity`. Animate `width`/`height`/`top`/`left`/`margin` gây reflow → giật.
2. Duration: 150ms (micro) · 200–300ms (thường) · tối đa 400ms. Dài hơn thì người dùng thấy chậm chứ không thấy đẹp.
3. Xuất hiện dùng `ease-out`, biến mất dùng `ease-in`. Chuyển động vật lý dùng spring.
4. Animation **không được chặn nội dung**. Nội dung phải đọc được ngay cả khi JS chưa chạy.
5. Tôn trọng `prefers-reduced-motion` — bắt buộc, không phải nice-to-have.

## Reduced motion — đặt một lần, dùng toàn app
```tsx
// hooks/useReducedMotion đã có sẵn trong framer-motion:
import { useReducedMotion } from "framer-motion";

const shouldReduce = useReducedMotion();
const variants = shouldReduce
  ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
  : { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
```

## Page entrance có tiết tấu
Sai lầm phổ biến: mọi thứ fade-in cùng lúc → trang trông "phập" một cái rồi đứng im. Đúng là **stagger theo thứ tự đọc**.

```tsx
"use client";
import React from "react";
import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
};

export function Section({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {React.Children.map(children, (c) => (
        <motion.div variants={item}>{c}</motion.div>
      ))}
    </motion.div>
  );
}
```
- Stagger 50–80ms. Trên 100ms là lê thê.
- Dịch chuyển 8–16px. Trượt 40px trông như banner quảng cáo.
- Chỉ stagger **một tầng** — heading, rồi khối nội dung. Đừng stagger lồng stagger.

## List / bảng dữ liệu
```tsx
<AnimatePresence mode="popLayout">
  {rows.map((r) => (
    <motion.tr
      key={r.id}
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    />
  ))}
</AnimatePresence>
```
- **Luôn có `key` ổn định** (id, không phải index) — thiếu thì exit animation nhảy lung tung.
- Danh sách > 30 item: bỏ stagger, chỉ fade cả khối. Stagger 200 dòng là tra tấn.
- Đổi filter/tab → cross-fade khối kết quả, giữ nguyên chiều cao container để không nhảy layout.

## Skeleton → nội dung
Skeleton phải **cùng kích thước** nội dung thật, rồi cross-fade. Nếu skeleton khác cỡ, người dùng thấy layout giật — tệ hơn là không có skeleton.

## Modal / dropdown / sheet
```tsx
<AnimatePresence>
  {open && (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }} className="fixed inset-0 bg-black/50" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 4 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
    </>
  )}
</AnimatePresence>
```
- Backdrop fade nhanh hơn panel (150ms vs 200ms).
- Exit luôn ngắn hơn enter — đóng phải cảm giác dứt khoát.
- Dropdown: thêm `transformOrigin` khớp phía trigger, scale từ 0.96.

## Transaction lifecycle (đặc thù dApp)
Chuỗi state: `idle → đang ký (ví) → đã submit → confirmed | failed`. Đây là lúc animation làm việc thật, không phải trang trí.

- **Đang chờ ví ký**: nút vào trạng thái pending, spinner đi kèm chữ "Xác nhận trong ví…". Người dùng đang nhìn popup ví — UI phía sau phải nói rõ nó đang đợi cái gì.
- **Đã submit**: đổi sang chữ "Đang xác nhận…" + hiện tx hash **ngay** (rút gọn, copy được). Không giấu hash cho tới khi confirmed.
- **Confirmed**: chuyển spinner → dấu tick bằng spring (`stiffness: 500, damping: 25`), giữ 1 nhịp rồi mới cập nhật số dư. Chuyển ngay lập tức làm người dùng không kịp nhận ra đã thành công.
- **Failed**: **không** rung/shake toàn màn hình. Fade sang khối lỗi có nội dung khắc phục được ("Không đủ XLM trả phí" chứ không phải "tx_failed").
- Số dư đổi → dùng rolling number 400–600ms, `ease-out`. Đừng để con số nhảy phựt.

## Micro-interaction
- Button: `active:scale-[0.98]` + `transition-transform duration-100`. Đủ rồi, không cần framer-motion.
- Hover trên card: `hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`.
- Copy address: đổi icon copy → check trong 1.2s rồi trả lại.
- Không animate hover trên mobile (không có hover) — dùng `@media (hover: hover)`.

## Cấm
- `layout` prop trên list dài (framer-motion đo lại toàn bộ mỗi frame).
- Animation trên nội dung above-the-fold làm trễ LCP.
- Loop animation vô hạn ngoài loading indicator.
- Parallax on scroll cho UI công cụ — nó thuộc về landing page.
- Auto-play animation lặp lại mỗi lần component re-render (dùng `initial={false}` khi cần).
