---
name: forms-and-validation
description: Quy ước form trong project — react-hook-form + zod, schema dùng chung client/server, hiển thị lỗi, trạng thái pending, optimistic update, và validate riêng cho input blockchain (địa chỉ Stellar, amount, memo). Dùng khi tạo hoặc sửa form, dialog nhập liệu, hay server action.
paths:
  - "**/*form*"
  - "**/actions.ts"
  - "**/actions/**"
  - "**/schemas/**"
---

# Form & validation — quy ước project

Stack: `react-hook-form` + `zod` + `@hookform/resolvers` + component `Form*` của shadcn.

## Schema
- Một schema zod **duy nhất** cho mỗi form, để trong `lib/schemas/`, import ở cả client (resolver) và server.
- Kiểu suy ra bằng `z.infer`, không khai báo interface song song.
- Thông điệp lỗi viết cho người dùng đọc, nhất quán ngôn ngữ với phần còn lại của app.

## Validate input blockchain (đặc thù dApp)
| Field | Luật |
|---|---|
| Địa chỉ Stellar | `StrKey.isValidEd25519PublicKey()` cho `G...`, `isValidContract()` cho `C...`. Không tự viết regex. |
| Muxed address | `M...` — quyết định có hỗ trợ hay không và nói rõ trong lỗi, đừng để rơi vào nhánh "địa chỉ không hợp lệ" mơ hồ. |
| Amount | String, không `number` (float làm tròn sai). Tối đa **7 chữ số thập phân**. Chặn `0`, số âm, và `NaN`. |
| Số dư | Kiểm "đủ số dư" phải trừ cả phí và **minimum balance** dự trữ — không chỉ so với balance hiển thị. |
| Memo | Memo text tối đa **28 bytes** (không phải 28 ký tự — tiếng Việt có dấu ăn nhiều byte hơn). Đếm bằng `Buffer.byteLength`. |
| Federation address | `name*domain.com` — resolve rồi hiện địa chỉ đã resolve để người dùng xác nhận trước khi ký. |

Với địa chỉ nhận: hiện dạng rút gọn + cho người dùng **nhìn thấy đầy đủ** trước khi ký. Gửi nhầm địa chỉ là không hoàn tác được.

## Client
- `zodResolver` + `mode: "onBlur"`. Không `onChange` với form dài.
- Nút submit `disabled` khi pending, đổi label ("Đang gửi…"), có spinner.
- Với form ký transaction, label phải nói đúng bước đang chờ: "Xác nhận trong ví…" → "Đang xác nhận…".
- **Không reset form khi submit lỗi** — người dùng phải giữ lại dữ liệu đã gõ.
- Confirm step cho hành động không hoàn tác được (gửi tiền, thu hồi trustline): hiện lại đầy đủ địa chỉ, số tiền, phí, network trước nút ký cuối.

## Server
- Server action **luôn validate lại** bằng cùng schema. Client validation chỉ là UX.
- Kiểm auth trước khi ghi; không tin bất kỳ id nào từ client.
- Trả `{ ok: true, data }` hoặc `{ ok: false, fieldErrors, message }`; map `fieldErrors` vào `setError` của RHF.
- Ghi thành công → `revalidatePath`/`revalidateTag`, rồi `redirect` nếu đổi route.
- Secret key / signing key **không bao giờ** đi qua form hay server action.

## Phản hồi cho người dùng
- Lỗi field → hiện ngay dưới field đó.
- Lỗi toàn form (network, RPC down, ví từ chối) → alert **trong form**, không chỉ toast. Toast biến mất, người dùng có thể bỏ lỡ.
- Thành công → toast + cập nhật UI + link tới explorer nếu là transaction.
- Thao tác nhanh, có thể rollback (toggle, favorite) → `useOptimistic`.

## Cấm
- Validate chỉ ở client.
- `alert()` / `confirm()` của browser.
- Form không có element `<form>` (mất submit bằng Enter, mất autofill).
- Field không có label thật — placeholder không thay được label.
- Dùng `parseFloat` cho amount tiền.
