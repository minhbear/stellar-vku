---
name: design-system
description: Nguồn chân lý về design token của project — bảng màu semantic, typography scale, spacing, radius, shadow, motion, breakpoint, và block CSS variable khởi tạo cho globals.css. Dùng khi chọn màu/khoảng cách/cỡ chữ, khi thêm token mới, hoặc khi kiểm tra UI có bám design system không.
---

# Design system — nguồn chân lý

> Khi file này lệch với `app/globals.css`, **`globals.css` thắng** — và phải cập nhật lại file này ngay trong cùng PR.

## Nguyên tắc số 1
Màu / cỡ chữ / spacing mới **phải vào token trước khi dùng**. Không có giá trị hardcode trong component.

## Bảng token semantic
| Token | Dùng cho |
|---|---|
| `background` / `foreground` | nền trang / chữ chính |
| `card` / `card-foreground` | bề mặt nổi trên nền |
| `popover` / `popover-foreground` | dropdown, tooltip, command palette |
| `primary` / `primary-foreground` | hành động chính, brand |
| `secondary` / `secondary-foreground` | hành động phụ |
| `muted` / `muted-foreground` | nền nhạt, chữ phụ, metadata |
| `accent` / `accent-foreground` | hover state, highlight |
| `destructive` | xóa, lỗi, transaction failed |
| `success` | transaction confirmed (token thêm, không có sẵn trong shadcn) |
| `warning` | network mismatch, testnet badge |
| `border` / `input` / `ring` | viền, viền input, focus ring |

## Block khởi tạo cho `app/globals.css`
> Brand hue đang là placeholder — đổi `--primary` sang màu brand của dự án rồi xoá dòng TODO này.

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;
    --primary: 221 83% 53%;          /* TODO: brand color */
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222 47% 11%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --accent: 210 40% 96%;
    --accent-foreground: 222 47% 11%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 210 40% 98%;
    --success: 142 71% 45%;
    --success-foreground: 210 40% 98%;
    --warning: 38 92% 50%;
    --warning-foreground: 222 47% 11%;
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 221 83% 53%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222 47% 8%;
    --foreground: 210 40% 98%;
    --card: 222 47% 11%;
    --card-foreground: 210 40% 98%;
    --popover: 222 47% 11%;
    --popover-foreground: 210 40% 98%;
    --primary: 217 91% 60%;
    --primary-foreground: 222 47% 11%;
    --secondary: 217 33% 17%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    --accent: 217 33% 17%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 63% 55%;
    --destructive-foreground: 210 40% 98%;
    --success: 142 69% 52%;
    --success-foreground: 222 47% 11%;
    --warning: 38 92% 55%;
    --warning-foreground: 222 47% 11%;
    --border: 217 33% 20%;
    --input: 217 33% 20%;
    --ring: 217 91% 60%;
  }
}
```

Mỗi token thêm mới phải khai báo ở **cả** `:root` và `.dark`, và đăng ký trong `tailwind.config` để dùng được `bg-success`, `text-warning`…

## Typography
- Font: khai báo qua `next/font` (self-host). Không `<link>` tới Google Fonts.
- Sans cho UI; **mono bắt buộc** cho địa chỉ ví, tx hash, contract ID, số dư — dữ liệu on-chain phải dễ đối chiếu từng ký tự.
- Scale: `xs 12 · sm 14 · base 16 · lg 18 · xl 20 · 2xl 24 · 3xl 30 · 4xl 36`. Không dùng cỡ ngoài scale.
- Heading `tracking-tight`; đoạn văn dài `max-w-[65ch]`.
- Tối đa 2 trọng lượng chính trên một màn hình (vd 400 + 600).

## Spacing & layout
- Scale 4px: `1 2 3 4 6 8 12 16 24`.
- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- Proximity: khoảng cách trong nhóm luôn nhỏ hơn khoảng cách giữa các nhóm.

## Radius / shadow
- Theo `--radius`: `rounded-md` mặc định, `rounded-lg` cho card, `rounded-full` cho avatar/badge/pill.
- Shadow tiết chế: `shadow-sm` cho card, `shadow-md` cho popover/dropdown. Không `shadow-2xl` cho UI phẳng.
- Không dùng đồng thời border đậm + shadow lớn trên cùng một phần tử.

## Motion
- Duration: 150ms micro-interaction, 200–300ms transition thường, không quá 400ms.
- Easing: `ease-out` khi xuất hiện, `ease-in` khi biến mất.
- Chỉ animate `transform` và `opacity`.
- Luôn tôn trọng `prefers-reduced-motion`.

## Breakpoints
`sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536` — thiết kế từ 375px trước.
