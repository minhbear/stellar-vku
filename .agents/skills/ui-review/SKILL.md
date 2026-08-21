---
name: ui-review
description: Review một component hoặc page về UI/UX trước khi merge — states, responsive, accessibility, design token, hierarchy, motion, copy, và pattern dApp. Chạy thủ công bằng /ui-review.
argument-hint: "[đường dẫn file hoặc route]"
disable-model-invocation: true
---

# /ui-review — review UI trước khi merge

Mục tiêu: `$1` — nếu trống, review các file UI đã thay đổi trong diff hiện tại (`git diff --name-only` lọc `.tsx`/`.css`).

Đọc code liên quan rồi chấm theo 8 mục dưới. Mỗi vấn đề nêu `file:line`, mô tả **điều gì sai với người dùng**, và cách sửa cụ thể. Không nhận xét chung chung, không khen xã giao. Không tìm ra vấn đề ở mục nào thì bỏ qua mục đó, đừng viết "mục này ổn".

## 1. States
Đủ loading (skeleton khớp nội dung thật) / empty (có hướng dẫn + CTA) / error (đọc hiểu được + retry) / pending? Có chặn double-submit? Với dApp: có state chưa-kết-nối-ví riêng?

## 2. Responsive
Kiểm 375 / 768 / 1440. Tràn ngang? Text bị cắt? Bảng có scroll container riêng? Địa chỉ dài có làm vỡ layout mobile? Touch target ≥ 44px?

## 3. Accessibility
Semantic element đúng; icon-only button có `aria-label`; focus-visible rõ và thứ tự hợp lý; label gắn input; lỗi form nối `aria-describedby`; contrast ≥ 4.5:1; thao tác được bằng bàn phím; modal có focus trap và đóng bằng Esc.

## 4. Design system
Giá trị hardcode (hex, spacing lẻ, cỡ chữ ngoài scale) đáng lẽ là token? Variant tự chế trùng cva có sẵn? Dark mode vỡ chỗ nào? Số/địa chỉ đã dùng font mono chưa?

## 5. Hierarchy & khoảng trắng
Nhìn vào biết ngay hành động chính? Chỉ một primary button mỗi khung nhìn? Khoảng cách phản ánh quan hệ nhóm? Có quá nhiều viền/shadow chồng nhau?

## 6. Motion
Có animate layout property gây jank? Duration hợp lý? Tôn trọng `prefers-reduced-motion`? Nội dung có nhảy khi load xong? List dài có bị stagger?

## 7. Copy
Nhãn nút là động từ cụ thể ("Gửi 10 XLM") chứ không phải "Submit"? Lỗi nói được cách khắc phục? Có mã lỗi thô lọt ra UI? Nhất quán ngôi xưng và hoa/thường?

## 8. An toàn (dApp)
Địa chỉ hiện đầy đủ ở bước xác nhận cuối? Amount và asset code đi cùng nhau? Badge network có? Hành động không hoàn tác được có bước confirm? Có chỗ nào lộ secret key hoặc log dữ liệu nhạy cảm?

## Kết quả
Sắp theo mức: **Blocker** (phải sửa trước merge) → **Nên sửa** → **Nit**. Kết bằng một câu: merge được hay chưa.
