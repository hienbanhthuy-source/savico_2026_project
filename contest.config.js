/* =========================================================================
   Cấu hình chương trình khi lấy dữ liệu từ Google Drive.
   - source: trang đọc TRỰC TIẾP thư mục Google Drive qua Drive API v3 (xem DRIVE.md)
   - adapter: cách đọc báo cáo Excel
   - phần còn lại giống `config` trong design/data.schema.json
   ⚠ Ngưỡng / giải thưởng dưới đây là GIÁ TRỊ TẠM — thay theo Thể lệ chính thức.
   ========================================================================= */
window.CONTEST_CONFIG = {
  source: {
    folder_id: "1AOS64WLo4rMg0HPQD6bWL4ec2JqrBEO3", // thư mục phải chia sẻ "Bất kỳ ai có đường liên kết"
    /* API key Google Cloud (bật Google Drive API, giới hạn Websites = https://<tài-khoản>.github.io/*).
       BẮT BUỘC khi đăng lên GitHub Pages: trình duyệt gọi thẳng googleapis.com.
       Để trống + chạy localhost → dùng bản giả lập Drive API của serve.ps1. Xem DRIVE.md, GITHUB.md */
    api_key: "",
    api_base: "https://www.googleapis.com/drive/v3",
    local_proxy: "/drive/v3",
    poll_seconds: 60,      // chu kỳ kiểm tra file thay đổi
    include_demo: true     // thêm lựa chọn "Dữ liệu mẫu" vào danh sách
  },

  adapter: {
    products: null,        // null = tính mọi sản phẩm; vd ["Bảo hiểm vật chất xe"] để chỉ tính BHVCX
    unit_kind: "DL",       // loại điểm bán mặc định (Đại lý / Showroom)
    /* Miền theo mã đơn vị PVI (đoạn thứ 2 của số đơn: 26/08/02/AUTO/… → 08) */
    region_by_unit_code: {
      "01": "Miền Bắc", "02": "Miền Bắc", "03": "Miền Bắc", "04": "Miền Bắc", "05": "Miền Bắc",
      "07": "Miền Bắc", "08": "Miền Bắc", "09": "Miền Bắc", "10": "Miền Bắc", "28": "Miền Bắc",
      "34": "Miền Bắc", "38": "Miền Bắc", "41": "Miền Bắc", "42": "Miền Bắc", "47": "Miền Bắc", "50": "Miền Bắc",
      "11": "Miền Trung", "13": "Miền Trung", "26": "Miền Trung", "36": "Miền Trung", "37": "Miền Trung", "55": "Miền Trung"
    }
  },

  /* Danh mục chuẩn "Mã đơn vị" = Sheet 2 của file gốc doanh-thu-savico-t10.xlsx (đúng thứ tự).
     Dùng khi file trên Drive / file upload KHÔNG có Sheet 2; nếu file có Sheet 2 thì ưu tiên Sheet 2 của file. */
  units: [
    ["CHI NHÁNH BẢO HIỂM PVI LINK", "47"], ["CÔNG TY BẢO HIỂM PVI ĐÔNG ĐÔ", "03"], ["CÔNG TY BẢO HIỂM PVI THĂNG LONG", "02"],
    ["CÔNG TY BẢO HIỂM PVI HÀ NỘI", "01"], ["CÔNG TY BẢO HIỂM PVI HÀ THÀNH", "34"], ["CÔNG TY BẢO HIỂM PVI THỦ ĐÔ", "38"],
    ["CÔNG TY BẢO HIỂM PVI TRÀNG AN", "41"], ["CÔNG TY BẢO HIỂM PVI ÂU LẠC", "42"], ["CÔNG TY BẢO HIỂM PVI HẢI HƯNG", "08"],
    ["CÔNG TY BẢO HIỂM PVI KINH BẮC", "07"], ["CÔNG TY BẢO HIỂM PVI QUẢNG NINH", "05"], ["CÔNG TY BẢO HIỂM PVI DUYÊN HẢI", "04"],
    ["CÔNG TY BẢO HIỂM PVI VĨNH PHÚ", "09"], ["CÔNG TY BẢO HIỂM PVI THÁI NGUYÊN", "28"], ["CÔNG TY BẢO HIỂM PVI THANH HOÁ", "10"],
    ["CÔNG TY BẢO HIỂM PVI BẮC TRUNG BỘ", "11"], ["CHI NHÁNH BẢO HIỂM PVI QUẢNG TRỊ", "37"], ["CÔNG TY BẢO HIỂM PVI HUẾ", "26"],
    ["CÔNG TY BẢO HIỂM PVI ĐÀ NẴNG", "13"], ["CHI NHÁNH BẢO HIỂM PVI NAM ĐÀ NẴNG", "36"], ["CHI NHÁNH BẢO HIỂM PVI NINH BÌNH", "50"],
    ["CHI NHÁNH BẢO HIỂM PVI HÀ TĨNH", "55"]
  ],

  brand: {
    badge: "Chuyển đổi số",
    org: "BẢO HIỂM PVI × SAVICO",
    title: "Chào sân",
    highlight: "Savico",
    sprint: "Launch Sprint",
    tagline: "Tăng tốc doanh số — Bứt phá cùng bảo hiểm xe cơ giới qua hệ thống showroom",
    channel: "HĐBH cấp qua đại lý / showroom, đồng hành cùng Bảo hiểm PVI",
    slogan: ["Tăng tốc hôm nay", "Dẫn đầu ngày mai!"],
    share_footer: "Bảng đua Sales Contest"
  },
  labels: {
    units_title: "Đại lý · Showroom",
    units_sub: "Các showroom xếp hạng đồng cấp theo doanh thu",
    unit_noun: "showroom",
    unit_cat: "ĐẠI LÝ / SHOWROOM",
    search_placeholder: "Tìm showroom / đại lý của bạn…",
    rules: [
      "Doanh thu thi đua = phí bảo hiểm <b>chưa gồm VAT</b>, theo ngày cấp HĐBH trong kỳ của báo cáo đang chọn.",
      "Mỗi showroom tính riêng doanh thu; nhãn loại là hãng xe của showroom.",
      "Trang tự kiểm tra file trên Google Drive định kỳ và cập nhật khi file thay đổi."
    ]
  },
  privacy: { mask_names: true },

  program: { name: "Chào sân Savico", start: null, end: null }, // null = lấy theo "Từ ngày … Đến ngày …" trong file
  early: { tiers: [
    { from: 1, to: 20, reward: 300000, label: "20 HĐBH đầu tiên" },
    { from: 21, to: 40, reward: 200000, label: "20 HĐBH tiếp theo" },
    { from: 41, to: 50, reward: 100000, label: "10 HĐBH cuối cùng" }
  ] },
  individual: { threshold: 15e6, prizes: [3e6, 2e6, 1e6] },
  branch: { threshold: 30e6, prizes: [5e6, 3e6, 2e6] },
  hub: { threshold: 1250e6, prizes: [15e6, 10e6], milestones: [{ value: 1250e6, label: "Điều kiện" }], manager: null },
  final: { enabled: false, official: false, closed: false, payout_note: "", hub_manager: null, return_date: null, lock_date: null }
};
