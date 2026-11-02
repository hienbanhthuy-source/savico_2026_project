# Đăng báo cáo lên GitHub Pages

Trang lấy dữ liệu theo hai cách:

| Nguồn | Cách hoạt động | Cần gì |
|---|---|---|
| **Google Drive** (nguồn chính) | Tự lấy **file mới nhất** trong thư mục Drive, kiểm tra thay đổi mỗi 60 giây và tự vẽ lại báo cáo | API key Google (chỉ đọc). Thư mục chia sẻ "Bất kỳ ai có đường liên kết" |
| **Upload** (xem nhanh) | Chọn hoặc kéo thả một file Excel trên máy. File được đọc ngay trong trình duyệt, không gửi đi đâu | Không cần gì. Bấm **Quay lại Google Drive** để trở về |

## Bước 0 — API key (một lần)

Làm theo [DRIVE.md](DRIVE.md) mục 2. Ở *Website restrictions*, thêm `https://<tài-khoản>.github.io/*`. Sau đó dán key vào [contest.config.js](contest.config.js) → `source.api_key`.

## Bước 1 — Đóng gói

```bash
powershell -ExecutionPolicy Bypass -File make-deploy.ps1
```

Lệnh này tạo thư mục `deploy\` gồm:
- `index.html`, `contest.config.js`, `css/report.css`
- `js/report-adapter.js`, `js/report.js`, `js/upload.js`, `js/loader.js`
- `.nojekyll`

Thư mục **không chứa** file `.xlsx`. Nếu chưa điền API key, script sẽ cảnh báo.

## Bước 2 — Tạo repo và tải file lên (chỉ cần trình duyệt)

1. Đăng nhập https://github.com.
2. Bấm **New repository**, đặt tên ví dụ `bao-cao-xcg`, chọn **Public**, rồi **Create repository**.
3. Bấm **uploading an existing file**, kéo thả **toàn bộ** nội dung thư mục `deploy\` vào. Bật *View → Hidden items* để thấy `.nojekyll`. Bấm **Commit changes**.

## Bước 3 — Bật GitHub Pages

Vào **Settings → Pages**, chọn *Deploy from a branch* → **main** / **(root)** → **Save**. Sau 1–2 phút, trang có địa chỉ `https://<tài-khoản>.github.io/bao-cao-xcg/`.

## Cập nhật về sau

| Thay đổi | Cần làm |
|---|---|
| Thêm / sửa file Excel trong thư mục Drive | **Không cần làm gì.** Trang tự hiện file mới nhất trong ≤ 60 giây |
| Muốn xem một file chưa đưa lên Drive | Bấm **Upload** |
| Sửa giao diện / code / cấu hình | Chạy lại `make-deploy.ps1`, vào repo chọn **Add file → Upload files**, kéo các file đã sửa vào (ghi đè), rồi Commit |

> **"File mới nhất"** là file có thời gian sửa gần nhất trong thư mục. Nếu file không có Sheet 2 "Mã đơn vị", trang dùng **danh mục chuẩn** (Sheet 2 của file gốc) trong `contest.config.js → units`.
