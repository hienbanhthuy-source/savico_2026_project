# Kết nối bảng đua với thư mục Google Drive

> **Cách hoạt động hiện tại (02/11/2026):**
> - Trang tự lấy **file mới nhất** trong thư mục và cập nhật mỗi 60 giây ([js/loader.js](js/loader.js)). Không còn ô chọn file.
> - Nút **Upload** dùng để xem nhanh một file trên máy ([js/upload.js](js/upload.js)).
> - File không có Sheet 2 thì dùng danh mục chuẩn `contest.config.js → units`.

Trang web **đọc trực tiếp** các file trong thư mục Drive bằng Google Drive API v3. Không cần server riêng hay Apps Script.

```
Trình duyệt ──► googleapis.com/drive/v3/files?q='<thư mục>' in parents   (danh sách file)
            ──► googleapis.com/drive/v3/files/<id>?alt=media             (tải .xlsx)
            ──► SheetJS đọc Excel → js/adapter-savico.js → bảng đua
            └─ mỗi 60 giây: so modifiedTime/md5 → file đổi thì tải lại và vẽ lại
```

## 1. Thư mục Drive

- Thư mục: https://drive.google.com/drive/folders/1AOS64WLo4rMg0HPQD6bWL4ec2JqrBEO3
- Phải chia sẻ ở chế độ **"Bất kỳ ai có đường liên kết – Người xem"**. API key chỉ đọc được file công khai.
- Hỗ trợ file `.xlsx`, `.xls` và **Google Sheets** (Sheets được xuất sang xlsx khi đọc).
- Mỗi file trong thư mục là một lựa chọn trong danh sách **"📂 Dữ liệu"** ở đầu trang.
- Thêm, xoá hoặc đổi tên file thì danh sách tự cập nhật ở lần kiểm tra kế tiếp.
- Sửa file đang xem: cách cập nhật tuỳ loại file.
  - **Google Sheets:** sửa thẳng trên Drive.
  - **Excel:** dùng *Quản lý phiên bản → Tải lên phiên bản mới* để giữ nguyên ID file.
  - Sau đó trang tự tải lại trong ≤ 60 giây và hiện thông báo "🔄 … vừa thay đổi".

## 2. Lấy API key (một lần)

1. Vào https://console.cloud.google.com/ → chọn hoặc tạo project (vd. `bang-dua-savico`).
2. **APIs & Services → Library** → tìm **Google Drive API** → **Enable**.
3. **APIs & Services → Credentials → + Create credentials → API key**.
4. **Edit API key** để giới hạn:
   - *Application restrictions → Websites*: thêm domain đăng trang (vd. `https://<tên>.github.io/*`), và `http://localhost:5173/*` nếu muốn thử trên máy.
   - *API restrictions → Restrict key → Google Drive API*.
5. Dán key vào [contest.config.js](contest.config.js) tại `source.api_key`. Cách đăng trang lên GitHub Pages: xem [GITHUB.md](GITHUB.md).

Key này lộ ra trong mã trang (bình thường với API key trình duyệt). Nhờ được giới hạn theo domain và chỉ cho Drive API, người khác không dùng lại được ở trang khác.

## 3. Cấu hình ([contest.config.js](contest.config.js))

| Khoá | Ý nghĩa |
|---|---|
| `source.folder_id` | ID thư mục Drive |
| `source.api_key` | API key ở bước 2 — **bắt buộc trên GitHub Pages**. Để trống: chạy localhost sẽ dùng bản giả lập của `serve.ps1`, chạy online sẽ báo lỗi chưa cấu hình |
| `source.poll_seconds` | Chu kỳ kiểm tra thay đổi (tối thiểu 15 giây) |
| `brand.org` | Tên hiển thị góc trái thanh trên cùng |
| `privacy.mask_names` | `true` = viết tắt tên cán bộ ("Vũ T. Nhài"); `false` = hiện đầy đủ |

## 4. Cách tổng hợp số liệu ([js/report-adapter.js](js/report-adapter.js))

Mẫu: "Báo cáo hiệu quả kinh doanh nghiệp vụ bảo hiểm xe cơ giới" (mỗi dòng một HĐBH) + **Sheet 2 "Mã đơn vị"** (cột A tên đơn vị, cột B mã). Cột được nhận diện **theo tên**, không theo vị trí.

**Điều kiện tính:** mã đơn vị trong **Số đơn BH** (đoạn thứ 2: `26/`**`08`**`/02/AUTO/…`) phải có trong Sheet 2. Đơn không khớp bị loại và liệt kê ở mục *Kiểm soát số liệu*.

| Tiêu chí | Lấy từ cột | Ghi chú |
|---|---|---|
| 1. Đơn vị cấp | Mã trong Số đơn BH ↔ Sheet 2 | Đủ 22 đơn vị theo **thứ tự Sheet 2**, tên theo Sheet 2 |
| 2. Cán bộ phụ trách | Cán bộ | Phần trong ngoặc hiển thị là phòng ban |
| 3. Doanh thu chưa VAT | Phí BH (không VAT) → VNĐ | Theo ngày cấp đơn và theo Tên sản phẩm |
| 4. Kênh bán hàng | Kênh bán hàng | Đại lý / showroom |
| 5. Nhóm kênh BH | Nhóm kênh BH | |
| 6. Nhóm loại xe | Nhóm loại xe | |

**Chống trùng & đối chiếu:**
- Dòng trùng hoàn toàn (cùng số đơn, ngày cấp, cán bộ, phí) chỉ tính một lần.
- Số HĐBH đếm theo số đơn duy nhất.
- Tổng phí đọc được được đối chiếu với dòng **TỔNG CỘNG** của file (✔ khớp / ✖ lệch).
- Mọi bảng tổng hợp đều cộng ra cùng một tổng.

Cột **Khách hàng không được đọc**. Lưu ý: vì thư mục để công khai, ai có link vẫn mở được file gốc.

## 5. Chạy thử trên máy (không cần API key)

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Mở http://localhost:5173. `serve.ps1` giả lập đúng các đường dẫn Drive API v3 tại `/drive/v3`, lấy dữ liệu thật từ thư mục công khai.

Thử tính năng tự cập nhật: đặt một file `.drive-mock/<id-file>.xlsx`, server sẽ trả file đó thay cho bản trên Drive. Bấm ↻ (hoặc chờ 60 giây), trang sẽ báo "vừa thay đổi". Xoá thư mục `.drive-mock` để trở lại bình thường.
