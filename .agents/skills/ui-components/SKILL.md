---
name: ui-components
description: Quy ước viết UI component với Tailwind + shadcn/ui — cấu trúc file, cn(), cva variants, dùng design token thay vì giá trị hardcode, responsive, dark mode, 4 state bắt buộc, accessibility. Dùng khi tạo hoặc sửa bất kỳ component React/TSX nào.
paths:
  - "**/*.tsx"
  - components/**
  - src/components/**
---

# UI components — quy ước project

## Cấu trúc
- `components/ui/*` — primitive shadcn. Regenerate được, **không sửa tay** trừ khi ghi lý do vào comment đầu file.
- `components/<domain>/*` — component nghiệp vụ (wallet, payment, asset…), compose từ primitive.
- Một file = một component export chính. Sub-component chỉ dùng nội bộ thì để cùng file.
- Props: interface `XxxProps`, extends `React.ComponentProps<"div">` khi bọc element DOM, và forward `className` qua `cn()`.
- Không default export cho component (trừ `page.tsx`, `layout.tsx` — Next.js yêu cầu).

## Styling
- Luôn dùng `cn()` (clsx + tailwind-merge) để hợp nhất class. Không nối chuỗi bằng template literal — sẽ vỡ khi consumer truyền `className` đè.
- Nhiều biến thể → dùng `cva`, không viết chuỗi ternary class.
- **Chỉ dùng token**: `bg-background`, `text-muted-foreground`, `border-border`, `bg-primary`… Không hardcode `bg-[#0f172a]`, `text-gray-500`, `p-[13px]`. Thiếu token thì thêm vào theme trước (xem skill `design-system`).
- Spacing bám scale 4px. Arbitrary value phải có comment giải thích.
- Mobile-first: base cho mobile rồi `sm: md: lg:`. Không viết desktop rồi override ngược.
- Dark mode qua semantic token, không viết `dark:` thủ công cho từng màu.

## 4 state bắt buộc — component hiển thị dữ liệu phải xử lý đủ
| State | Yêu cầu |
|---|---|
| loading | Skeleton khớp hình dạng nội dung thật, không phải spinner giữa màn hình |
| empty | Có nội dung hướng dẫn + hành động tiếp theo, không chỉ chữ "No data" |
| error | Thông điệp người dùng hiểu được + nút retry |
| pending | Nút disabled + đổi label ("Đang gửi…"), chặn double-submit |

Với dApp còn thêm state **chưa kết nối ví** — hiện CTA connect thay vì hiện dữ liệu rỗng.

## Accessibility — không phải tùy chọn
- Element tương tác phải là `<button>`/`<a>`, không phải `<div onClick>`.
- Icon-only button bắt buộc có `aria-label`.
- Focus nhìn thấy được: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`. Không `outline-none` trần.
- Input có `<Label htmlFor>` gắn đúng id; lỗi nối bằng `aria-describedby`.
- Contrast ≥ 4.5:1 cho text thường, ≥ 3:1 cho text lớn và icon mang nghĩa.
- Ảnh có `alt` mô tả; ảnh trang trí `alt=""`.
- Touch target ≥ 44×44px trên mobile.

## Hiệu năng
- `next/image` cho mọi ảnh, có `sizes` khi responsive.
- Component nặng (chart, QR scanner, editor) → `next/dynamic`.
- Không tạo object/array/arrow function mới trong props của item trong list dài.

## Cấm
- Inline `style={{}}` khi Tailwind làm được.
- `!important` / prefix `!` để chữa specificity.
- CSS global mới ngoài `globals.css`.
- Copy component từ chỗ khác mà giữ nguyên màu hardcode.
