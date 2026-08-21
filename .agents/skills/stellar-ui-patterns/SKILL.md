---
name: stellar-ui-patterns
description: Lớp UI/UX cho dApp Stellar — hiển thị địa chỉ và tx hash, định dạng số dư và amount, trạng thái ví, vòng đời transaction trên giao diện, badge network, thông điệp lỗi đọc được, và link explorer. Dùng khi làm bất kỳ màn hình nào hiển thị dữ liệu on-chain hoặc có thao tác ký transaction.
---

# Stellar dApp — pattern UI/UX

Phần cơ chế SDK, kết nối ví, build/sign/submit → skill `dapp`. File này là **lớp giao diện** đặt lên trên đó: hiển thị thế nào để người dùng không mất tiền vì hiểu nhầm.

## Hiển thị địa chỉ
- Rút gọn: 4 ký tự đầu + 4 cuối (`GABC…X7QK`), font **mono**, `title` chứa địa chỉ đầy đủ.
- Luôn kèm nút copy; copy xong đổi icon sang check 1.2s.
- **Trước khi ký**: hiện địa chỉ **đầy đủ**, không rút gọn. Rút gọn là để liếc, không phải để xác nhận.
- Contract ID (`C...`) hiển thị cùng quy tắc nhưng gắn nhãn "Contract" để phân biệt với account.
- Có tên federation / domain thì hiện tên **kèm** địa chỉ, không thay thế địa chỉ.

## Định dạng số
- Stellar dùng **7 chữ số thập phân**. Giữ amount ở dạng string suốt pipeline; không `Number()`.
- Số dư hiển thị: nhóm hàng nghìn, cắt về 2–4 số lẻ cho dễ đọc, nhưng hiện đủ 7 số trong tooltip hoặc màn hình confirm.
- Số rất nhỏ: đừng hiện `0.00` — hiện `< 0.0001` hoặc số đầy đủ dạng mono.
- Amount và asset code luôn đi cùng nhau (`120.50 XLM`). Số trần không có đơn vị là lỗi.
- Asset code trùng nhau nhưng khác issuer → phải phân biệt bằng issuer rút gọn, nếu không người dùng nhầm token giả.
- Căn phải mọi cột số trong bảng, dùng `tabular-nums`.

## Trạng thái ví — 5 state phải xử lý
| State | UI |
|---|---|
| Chưa cài extension | Hướng dẫn cài + link, không phải lỗi đỏ |
| Chưa kết nối | CTA "Kết nối ví", ẩn dữ liệu cá nhân |
| Sai network | Banner cảnh báo `warning`, chặn mọi hành động ký, nói rõ đang ở đâu / cần ở đâu |
| Account chưa funded | Giải thích cần minimum balance + cách nạp (testnet: friendbot) |
| Đã kết nối | Địa chỉ rút gọn + số dư + nút disconnect |

## Badge network — bắt buộc
Testnet/Futurenet phải có badge **luôn hiện** (`warning` token). Mainnet thì không cần badge, nhưng nếu app hỗ trợ nhiều network thì hiện rõ. Người dùng nhầm network là mất tiền thật.

## Vòng đời transaction trên UI
```
idle → building → chờ ký trong ví → đã submit → confirmed | failed
```
- **Chờ ký**: nút pending, chữ "Xác nhận trong ví…". Người dùng đang nhìn popup ví — nói rõ app đang đợi gì.
- **Đã submit**: hiện tx hash **ngay lập tức**, rút gọn, copy được, có link explorer. Không giấu hash đến khi confirmed.
- **Confirmed**: spinner → tick bằng spring, giữ một nhịp rồi mới cập nhật số dư. Kèm link explorer giữ nguyên trên màn hình.
- **Failed**: giữ nguyên dữ liệu người dùng đã nhập để họ thử lại. Không xoá form.
- Chặn double-submit trong toàn bộ quá trình.
- Có timeout: transaction quá hạn phải nói rõ "đã hết hạn, thử lại" chứ không quay vòng mãi.

## Thông điệp lỗi — dịch sang tiếng người
| Lỗi kỹ thuật | Hiện cho người dùng |
|---|---|
| `tx_insufficient_fee` | "Phí mạng đang cao. Thử lại với phí cao hơn." |
| `op_underfunded` | "Số dư không đủ cho giao dịch này." |
| `op_no_destination` | "Tài khoản nhận chưa được kích hoạt. Cần gửi tối thiểu 1 XLM để tạo tài khoản." |
| `op_no_trust` | "Tài khoản nhận chưa thêm trustline cho tài sản này." |
| `tx_bad_seq` | "Giao dịch không đồng bộ. Tải lại và thử lại." |
| User rejected | "Bạn đã hủy trong ví." — **không** hiện như lỗi đỏ, đây là hành động cố ý. |
| `tx_too_late` | "Giao dịch đã hết hạn. Thử lại." |

Luôn kèm **hành động tiếp theo**. Mã lỗi gốc để trong phần "Chi tiết" thu gọn cho người dùng kỹ thuật báo bug.

## Link explorer
- Mọi tx hash, địa chỉ, contract ID nên link tới explorer đúng network (stellar.expert / Stellar Lab).
- `target="_blank" rel="noopener noreferrer"` + icon external.
- URL explorer sinh từ network hiện tại, không hardcode mainnet.

## Cấm
- Hiện số dư `0` khi thật ra là đang tải — dùng skeleton.
- Rút gọn địa chỉ ở màn hình xác nhận cuối.
- Hiện mã lỗi thô cho người dùng cuối.
- Nút "Gửi" không cho xem lại thông tin trước khi ký.
- Yêu cầu người dùng nhập secret key ở bất kỳ đâu.
