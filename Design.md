# Design.md — Bảng đua Sales Contest (mẫu "OCARCARE Grand Prix")

> **Nguồn tham chiếu:** https://pvi-aviationdivision.github.io/OCARCARE_SALECONTEST2026/ (phân tích ngày 01/11/2026, dữ liệu trên site chốt 08:15 30/10/2026)
> **Mục đích:** đặc tả đủ chi tiết để dựng lại (clone) giao diện bảng đua thi đua bán hàng: cấu trúc trang, design tokens, component, tương tác, chuyển động, mô hình dữ liệu, trạng thái, và **danh sách những gì còn thiếu cần bổ sung**.
> **File liên quan trong repo:**
>
> | File | Nội dung |
> |---|---|
> | [design/tokens.css](design/tokens.css) | Toàn bộ CSS variables + base styles trích từ site |
> | [design/data.schema.json](design/data.schema.json) | JSON Schema của `window.RACE_DATA` (file `data.js`) |
> | [design/data.sample.js](design/data.sample.js) | Dữ liệu mẫu đúng schema để dựng UI ngay |
> | [design/assets/car.svg](design/assets/car.svg) | Icon xe đua (dùng `currentColor`) |
> | [design/assets/favicon.svg](design/assets/favicon.svg) | Favicon |

---

## 1. Tổng quan sản phẩm

| Mục | Mô tả |
|---|---|
| Loại | Trang tĩnh 1 trang (single page), không backend, host GitHub Pages |
| Người dùng | Cán bộ bán hàng, lãnh đạo CN/PGD, đơn vị bảo hiểm đồng hành — chủ yếu mở trên **điện thoại** qua link Zalo |
| Mục tiêu | Tạo không khí "đua xe" để thúc đẩy doanh số: ai đang dẫn, mình đứng thứ mấy, còn thiếu bao nhiêu tới ngưỡng, thưởng bao nhiêu |
| Ẩn dụ thiết kế | **Đường đua (Grand Prix)**: mỗi đơn vị là một chiếc xe chạy trên làn; vạch đích = ngưỡng điều kiện; cờ caro = về đích; bục podium = top 3 |
| Cập nhật | 1 lần/ngày: script đọc Excel → sinh `data.js` → commit lên Pages (`data.js?v=<timestamp>` để phá cache) |
| Ngôn ngữ | Tiếng Việt, định dạng số `vi-VN` |
| SEO | `noindex, nofollow, noarchive` (trang nội bộ nhưng public URL) |
| PWA | Có `manifest.webmanifest` (standalone, icon 192/512) — **không có service worker** |
| Analytics | GoatCounter (đếm pageview + event tùy biến) |

### 1.1 Kiến trúc kỹ thuật

```
index.html            ← HTML + CSS inline + JS inline (vanilla, không framework, không build)
data.js               ← window.RACE_DATA = {...}  (sinh tự động mỗi ngày)
manifest.webmanifest  ← PWA
apple-touch-icon.png, icon-192.png, icon-512.png, og-race.jpg (1200×630)
```

- 3 khối script: **(A)** trang chính, **(B)** trang tổng kết "Về đích" (`#finale`), **(C)** màn chờ tổng kết (`#inter`).
- Không thư viện ngoài (chart vẽ bằng SVG tay, ảnh chia sẻ vẽ bằng `<canvas>`).
- Chỉ phụ thuộc: Google Fonts + GoatCounter.

---

## 2. Design tokens

> Chi tiết đầy đủ: [design/tokens.css](design/tokens.css)

### 2.1 Màu

**Nền (dark-only, xanh navy đêm):**

| Token | Hex | Dùng cho |
|---|---|---|
| `--bg` | `#061230` | Nền trang, `theme-color` |
| `--bg2` | `#0a1c44` | Nền phụ |
| `--panel` / `--panel2` | `#0d2254` / `#112a63` | Card KPI (gradient 180°: panel2 → panel) |
| `--road` | `#081536` | Nền "mặt đường" của mọi progress bar |
| `--line` | `rgba(148,178,255,.16)` | Viền 1px của mọi card |
| Section card | `linear-gradient(180deg,#0c2155,#0a1b47)` | Nền mỗi section |

Body có 2 radial glow: xanh `#1b3f9a55` góc trên phải (1200×600 @ 80% -10%) và cam `#ff7a1a14` mép trái (900×500 @ -10% 30%).

**Chữ:** `--ink #f3f6ff` (chính) · `--ink2 #b9c6e8` (phụ) · `--ink3 #7f90bd` (mờ, trục).

**Thương hiệu & ngữ nghĩa:**

| Token | Hex | Ý nghĩa |
|---|---|---|
| `--orange` | `#ff7a1a` | Màu nhấn #1: xe, doanh thu, focus ô tìm kiếm, CTA |
| `--orange2` | `#ffb03a` | Số nổi bật trong ticker, vạch dự báo |
| `--gold` / `--silver` / `--bronze` | `#ffc93c` / `#d6dee9` / `#e98b5b` | Hạng 1/2/3 (rank badge, podium, xe) |
| `--blue` | `#2f7bff` | HĐBH, thông tin |
| `--red` | `#e8263f` | Badge "SALE CONTEST" |
| `--teal` | `#14b8a6` | Hub, phí bình quân |
| `--green` | `#35d07f` | Tăng hạng, đạt ngưỡng, chấm live |
| `--down` | `#ff5a6e` | Giảm hạng |

**Màu đầu mục section (biến `--sc`):** dải gradient header `linear-gradient(90deg, var(--sc), transparent 85%)`.

| Section | `--sc` |
|---|---|
| 1 · Cá nhân | `#1f55d6` (xanh) |
| 2 · Chi nhánh/PGD/TTTC | `#c81e36` (đỏ) |
| ⚡ · Bứt phá 7 ngày | `#b45309` (hổ phách) |
| 3 · Hub xe | `#0f8f82` (teal) |
| ⌂ · Góc đơn vị BH PVI | `#6d28d9` (tím) |
| ★ · Toàn cảnh | `#3a4f86` (xám xanh) |

**Nhãn loại điểm bán (`.kind`)** — nền alpha 15–20% + chữ pastel: CN xanh `#9fc1ff`, PGD lục `#8ff0b8`, TTTC hồng `#ff9aa8`, HHB tím `#d8b4fe`, HUB cam `#ffc08a`, TTKD teal `#7ff0e0`.

**Màu xe trên làn (`--lc`):** hạng 1–3 = gold/silver/bronze; còn lại theo loại: CN `#5b9dff`, PGD `#4ade80`, TTTC `#ff6b81`, HHB `#c084fc`.

**Bậc thưởng sớm:** bậc 1 `#ff7a1a`, bậc 2 `#2f7bff`, bậc 3 `#14b8a6`.

### 2.2 Typography

| Vai trò | Font | Weight / style | Size |
|---|---|---|---|
| Body | **Be Vietnam Pro** | 400–800 | 15px / line-height 1.5 |
| Heading, số liệu (`.num`) | **Barlow Condensed** | 800, thường *italic*, `tabular-nums` | — |
| H1 hero | Barlow Condensed | 800 italic, UPPERCASE, line-height .9 | `clamp(44px, 11vw, 92px)` |
| Thanh "LAUNCH SPRINT" | Barlow Condensed | 800 italic, letter-spacing 3px | `clamp(22px, 5vw, 34px)` |
| Tiêu đề section `.sec-t` | Barlow Condensed | 800 italic, UPPERCASE | `clamp(20px, 4.8vw, 28px)` |
| Sub-heading `.sub-h` | Barlow Condensed | 800, UPPERCASE, ls .5px | 18px |
| KPI value | Barlow Condensed | 800 | `clamp(28px, 7vw, 38px)` |
| Nhãn/phụ đề | Be Vietnam Pro | 600 | 11–13px |

Chữ "OCARCARE" trong H1: gradient text `180deg #ffd36a → #ff7a1a 55% → #e2560b` + `drop-shadow(0 4px 18px #ff7a1a55)`.

### 2.3 Khoảng cách, bo góc, đổ bóng

- Container `.wrap`: `max-width: 1000px`, padding ngang 16px.
- Section card: margin dọc 22px, padding body 16px, header 14px 16px.
- Bo góc: section 18px · KPI/lane/hub 14px · tier/prize/search/nút 12px · note/rank 10px · road 8px · pill 999px.
- Bóng: card `0 20px 50px #0006` · popup gợi ý `0 20px 40px #000a` · badge đỏ `0 6px 20px #e8263f55`.

### 2.4 Breakpoints

| Điểm | Thay đổi |
|---|---|
| `< 640px` | Chips "Góc đơn vị" chuyển thành 1 hàng cuộn ngang (scroll-snap), tràn sát mép |
| `≥ 760px` | KPI 2→4 cột; `.grid2` (Toàn cảnh) và `.wk` (Bứt phá) 1→2 cột |
| `≤ 760px` (finale) | stats 5→2 cột, kỷ lục 3→2, đơn vị 4→2 |
| `≤ 420px` (finale) | kỷ lục 1 cột |

Thiết kế **mobile-first**: mọi font size quan trọng dùng `clamp()`.

### 2.5 Chuyển động

| Tên | Mô tả | Thông số |
|---|---|---|
| Speed lines | 18 vệt sáng ngẫu nhiên chạy ngang hero (1/4 màu cam) | `zoom` 1.2–3.6s linear infinite |
| Chevron | 3 mũi tên cam nhấp nháy lần lượt | `chev` 1.2s, delay 0/.15/.3s |
| Live dot | Chấm xanh phát sóng | `pulse` 1.8s |
| Ticker | Băng chữ chạy, nội dung nhân đôi để lặp liền | `tick` = max(25s, số tin × 6s) |
| Xe chạy | `left` 0 → x% khi phần tử vào viewport | 1.6s `cubic-bezier(.2,.8,.2,1)` |
| Trail / fill | `width` 0 → x% | 1.4–1.8s cùng easing |
| Count-up | Số đếm từ 0, ease-out cubic | 1.4s (finale 1.6s) |
| Highlight lane | Lane được tìm thấy nháy viền cam 2 lần | `flash` 1.2s ×2 |
| Confetti | 140 mảnh giấy canvas khi có đơn vị `crossed_today` | ~260 frame |

- Kích hoạt bằng `IntersectionObserver` (threshold .15), mỗi phần tử chạy **một lần**.
- `prefers-reduced-motion: reduce` → tắt toàn bộ animation/transition.

---

## 3. Cấu trúc trang (thứ tự từ trên xuống)

```
┌──────────────────────────────────────────────┐
│ HERO  badge · brand · H1 · Sprint · tagline  │
│       pills (cập nhật / thời gian / kênh)    │
│       countdown · timeline xe · 4 KPI        │
├──────────────────────────────────────────────┤
│ TICKER (sticky top, blur)                    │
├──────────────────────────────────────────────┤
│ 1  CÁ NHÂN — CÀNG SỚM CÀNG THƯỞNG            │
│    đường đua 600 HĐBH · 3 bậc · tốc độ       │
│    Top 3 cá nhân: giải · tìm kiếm · lanes    │
│ 2  CHI NHÁNH · PGD · TTTC                    │
│    giải · tìm kiếm · podium · lanes · note   │
│ ⚡ BỨT PHÁ 7 NGÀY QUA (4 bảng)               │
│ 3  HUB XE (2 hub VS) · khối TP Hub bị khoá   │
│ ⌂  GÓC ĐƠN VỊ BH PVI (chips → panel)         │
│ ★  TOÀN CẢNH: chart · theo miền · theo đơn vị│
├──────────────────────────────────────────────┤
│ FOOTER slogan · quy tắc · disclaimer · nguồn │
└──────────────────────────────────────────────┘
+ <canvas id="confetti"> fixed toàn màn hình
+ #finale (trang Về đích) và #inter (màn chờ) — xem §6
```

### 3.1 Hero (`header.hero`)

| Phần tử | Chi tiết |
|---|---|
| Badge | `SALE CONTEST` — nền đỏ, pill, chữ trắng 12px 800, ls 2px |
| Brand | `BẢO HIỂM PVI` — Barlow 18px, `#cfe0ff` |
| H1 | `CHÀO SÂN` (trắng) + `OCARCARE` (gradient cam) |
| Sprint bar | Khối xanh `linear-gradient(90deg,#1f55d6,#2f7bff)` nghiêng `skewX(-12deg)` (con bên trong skew ngược lại) + 3 chevron cam |
| Tagline | 600, `--ink2` |
| Meta pills | `● Cập nhật 08:15 · 30/10/2026` (chấm live) · `📅 21/09 – 31/10/2026` · `HĐBH cấp qua OPES…` |
| Countdown | 4 ô `ngày/giờ/phút/giây` (min-width 64px, số 30px) + nhãn "còn lại đến vạch đích". Hết giờ/closed → ô `🏁 đã về đích` |
| Timeline | Thanh đường 34px: vạch giữa nét đứt, fill xanh theo `ngày hiện tại / tổng ngày`, xe cam ở đầu fill, cờ caro bên phải (`repeating-conic-gradient`). Nhãn dưới: `XUẤT PHÁT 21/09 · NGÀY 41/41 · VỀ ĐÍCH 31/10` |
| KPI ×4 | Tổng HĐBH (xanh) · Doanh thu chưa VAT (cam) · Điểm bán đã ghi điểm (đỏ) · Phí BQ/HĐBH (teal). Mỗi thẻ có vòng tròn mờ 70px góc trên phải màu `--c`, dòng delta xanh lá `+2 hôm nay` |

### 3.2 Ticker (`.ticker`)

Sticky `top:0`, nền `#000a` + `backdrop-filter: blur(8px)`, 13px 600, số in đậm màu `--orange2`. Nội dung sinh tự động theo thứ tự:
1. `⚡ Hôm nay +N HĐBH · +X` (nếu có)
2. `🎁 Còn N suất thưởng 300.000đ/HĐBH` (nếu bậc chưa hết)
3. `🏆 <Top 1> đang dẫn đầu với X`
4. `🏁 <đơn vị> vừa vượt ngưỡng …!` (mỗi đơn vị `crossed_today`)
5. Tối đa 6 đơn vị có đơn hôm nay: `🚗 <tên> +N HĐBH · ▲k bậc` / `lần đầu lên bảng`
6. Mỗi hub: `🚙 Hub xe Miền Bắc: X (67% ngưỡng)`
7. `📣 Ghi điểm ngay từ hợp đồng đầu tiên!`

### 3.3 Section card (khuôn chung)

```
section.card[style="--sc:<màu>"]
 ├─ .sec-h   (gradient --sc → trong suốt)
 │   ├─ .sec-n  vòng tròn trắng 46px, số/biểu tượng màu --sc, Barlow 30px italic, viền 4px #fff3
 │   └─ .sec-t (tiêu đề) + .sec-s (phụ đề 12px)
 └─ .sec-b   padding 16px
```

### 3.4 Section 1 — Cá nhân: "Càng sớm càng thưởng"

**a) Đường đua 600 HĐBH (`.e-track`, cao 46px)** — 3 đoạn tỉ lệ theo số suất (300/200/100 → 50%/33.3%/16.7%), mỗi đoạn fill gradient màu bậc, nhãn giữa `300K/200K/100K`. Xe trắng + bong bóng `Đơn thứ 1.126` đặt tại `min(cnt,600)/600`. Thang dưới: `Đơn 1 · 300 · 500 · 600`.

**b) 3 thẻ bậc (`.tiers`, grid 3 cột)** — nhãn, số tiền (màu bậc), trạng thái: `Còn N suất` (bậc đang chạy: viền + glow màu bậc, class `.on`) · `Đã hết suất` (mờ 50%, `.done`) · `Mở từ đơn N`.

**c) Dòng tốc độ (`.pace`)** — `⏱ Tốc độ trung bình ~27,5 HĐBH/ngày → suất 200K dự kiến hết khoảng 12/10…` (dự báo = số suất còn / tốc độ TB).

**d) Top 3 cá nhân** (`#indiv`)
- Dòng "as of": `Mã DAO theo file OPES chốt ngày 30/10 (cập nhật hằng tuần)…`
- Hàng giải (`.prizes`): Top1 5 triệu (vàng, viền vàng) · Top2 4 triệu (bạc) · Top3 3 triệu (đồng) · Ngưỡng điều kiện 125 tr.
- Ô tìm kiếm: theo **họ tên** (gợi ý dropdown) hoặc **mã cán bộ** (≥3 chữ số → tra thẳng). Kết quả hiện hộp `.found` (nền cam nhạt): hạng #/tổng, doanh thu, số HĐ, còn bao nhiêu tới ngưỡng, cách Top 3 bao nhiêu, thưởng sớm.
- Danh sách lane Top 10 + nút `Xem toàn bộ 311 cán bộ đã ghi điểm` / `Thu gọn`.
- Ghi chú cách tính.
- **Trạng thái rỗng:** nếu `indiv.people` trống → khối khoá 🔒 (các ô giải bị blur + overlay "Sẽ cập nhật khi có dữ liệu…").

### 3.5 Component "Lane" (làn đua — dùng ở Cá nhân, Chi nhánh)

```
.lane  (nền #ffffff06, viền --line, bo 14px, --lc = màu xe)
 ├─ .top
 │   ├─ .rk     ô 34×34 bo 10px, Barlow italic 20px; hạng 1-3 nền gold/silver/bronze chữ navy
 │   ├─ .ln     .n tên (14.5px 700, ellipsis) / .m meta: [KIND] miền · đơn vị BH PVI
 │   └─ .rv     .v doanh thu (Barlow 20px) / .mv biến động: ▲2 xanh · ▼1 đỏ · – xám · MỚI cam
 ├─ .road   cao 28px nền --road, vạch giữa nét đứt
 │   ├─ .thr   vạch ngưỡng: nét đứt trắng + cờ caro 10px
 │   ├─ .pj    vạch dự báo 31/10: cam #ffb03a + tam giác ▼ (nét chấm nếu vượt thang)
 │   ├─ .trail vệt gradient trong suốt → --lc
 │   └─ .car   icon xe màu --lc + glow
 ├─ .foot   "52 HĐBH · +1 hôm nay"  |  "✔ Đã đạt ngưỡng" / "Còn 14,8 tr tới ngưỡng"
 ├─ .mix    (chỉ CN) "Gồm: PGD A 120 tr · PGD B 80 tr · +3 điểm khác (…)"
 └─ .pl     [huy hiệu tiến độ] + nút "📤 Ảnh thành tích"
```

**Thang đo:** `max = max(ngưỡng, doanh thu top 1) × 1.12` — mọi lane cùng thang để so sánh trực quan. Xe được đặt `left: max(x%, chiều rộng xe + 4px)` để không bị cắt ở 0.

**Huy hiệu tiến độ (`projHtml`)** — dự báo tuyến tính `proj = v + v/ngày_đã_qua × ngày_còn_lại`:

| Huy hiệu | Điều kiện | Màu |
|---|---|---|
| `ĐÃ ĐẠT` + "Dự kiến 31/10: ~X" | v ≥ ngưỡng | xanh lá |
| `ĐÚNG TIẾN ĐỘ` + "Dự kiến 31/10: ~X" | proj ≥ ngưỡng | xanh dương |
| `CẦN TĂNG TỐC` + "Cần ~X/ngày để đạt…" | proj < ngưỡng | cam |
| `CHƯA ĐẠT` + "Thiếu X" | hết ngày | cam |

### 3.6 Section 2 — Chi nhánh · PGD · TTTC

1. Hàng giải: Hạng 1 7 triệu · Hạng 2 5 triệu · Hạng 3 3 triệu · Ngưỡng 250 tr.
2. Ô tìm kiếm điểm bán (placeholder "Tìm CN / PGD / TTTC của bạn…"): tìm **không dấu**, nhiều từ (AND), ưu tiên tên khớp; tối đa 12 gợi ý; điều hướng ↑ ↓ Enter. Gợi ý hiện `PGD X → CN Y` nếu PGD được ghi nhận cho CN. Chọn → hộp `.found` + mở rộng danh sách nếu hạng > 10 + cuộn tới lane + highlight. Điểm bán thuộc Hub → báo "thuộc hạng mục Hub xe" và cuộn tới mục 3. Điểm bán chưa có đơn → "Chưa có HĐBH… Ghi điểm ngay từ hợp đồng đầu tiên!".
3. **Podium** (grid `1fr 1.12fr 1fr`, thứ tự hiển thị 2-1-3): tên, doanh thu (count-up), khối bục cao 118/92/76px gradient màu hạng → navy, số hạng Barlow 34px, giải thưởng, trạng thái ngưỡng.
4. Thang: `0 · Vạch 250 tr 🏁 · ▼ dự kiến 31/10 · <max>`.
5. Lanes Top 10 + "Xem toàn bộ 127 đơn vị đã ghi điểm".
6. Note điều kiện + "Hiện có N điểm đạt ngưỡng".

### 3.7 Section ⚡ — Bứt phá 7 ngày qua

Lưới 2 cột (≥760px), 4 hộp `.wkb`, mỗi hộp ≤5–6 dòng `.wkr` (tag · tên #hạng · giá trị):

| Hộp | Cách tính | Cột tag / giá trị |
|---|---|---|
| 🚀 Tăng hạng mạnh nhất | `rank7 − rank` lớn nhất | `▲39` / `#102 → #63` |
| 💰 Doanh thu tuần cao nhất | `week_premium` | `1.` / `+72,9 tr` |
| 🔥 Bền bỉ nhất | `active_days7` | 7 ô vuông chấm (xanh = có đơn) / `6/7 ngày` |
| 🆕 Mới lên bảng (3 ngày) | `first_date ≥ report_date − 2` | 🆕 / doanh thu |

Mỗi hộp có câu rỗng riêng (vd "Chưa có đơn vị mới — CN/PGD nào sẽ là người tiếp theo?").

### 3.8 Section 3 — Hub xe

- Hàng giải: GĐ Hub hạng 1 15 triệu · hạng 2 10 triệu · "Thưởng thêm theo mốc +5tr / +10tr".
- 2 thẻ `.hub` xếp dọc, giữa có chữ **VS**. Mỗi thẻ: rank, tên thân thiện ("Hub xe Miền Bắc" suy từ tên gốc "TTKD OTO MIEN BAC"), doanh thu 22px, road cao 44px với **3 mốc** (vạch ngưỡng caro + 2 vạch chấm), xe 58×26, nhãn mốc dưới road (`1,25 tỷ Điều kiện · 1,825 tỷ +5 triệu · 2,5 tỷ +10 triệu`), thanh teal `% ngưỡng`, dòng "Còn X tới mốc Y", huy hiệu tiến độ + nút chia sẻ.
- **Khối khoá 🔒 "Trưởng phòng Hub xe — Top 4"**: 4 ô giải blur + overlay lý do "chưa phân tách được cấp phòng/nhóm".

### 3.9 Section ⌂ — Góc đơn vị BH PVI

- **Chips** (role=tablist): tên rút gọn + badge số HĐBH; chip 0 HĐ màu mờ; chip đang chọn gradient tím `#7c3aed → #a855f7`.
- Khởi tạo: `?dv=<slug>` trong URL → lựa chọn lần trước (`localStorage.ocar_pvi`) → thông báo "👆 Chọn một đơn vị…".
- **Panel** khi chọn:
  1. Header: tên đơn vị, "Hạng #k/16 · đơn gần nhất <tag>", nút `🔗 Sao chép link đơn vị` (copy `?dv=slug`, đổi thành "✔ Đã sao chép" 1.8s).
  2. 4 KPI: HĐBH · Doanh thu · **Độ phủ điểm bán** `active/total` + thanh tím · Phí BQ/HĐBH.
  3. Bảng "Điểm bán đã có đơn (n)": sắp theo `Doanh thu` | `Lâu chưa ra đơn nhất`; cảnh báo "N điểm đã quá 7 ngày chưa có đơn mới". Mỗi dòng: [KIND] tên, "Thuộc CN…", **tag ngày đơn gần nhất** (xanh ≤3 ngày · cam ≤7 · đỏ >7 kèm ⚠), số HĐ, doanh thu (+hôm nay).
  4. "Thứ hạng thi đua các điểm bán của đơn vị": rank, tên, khoảng cách tới ngưỡng và Top 3.
  5. `<details>` "Điểm bán chưa phát sinh đơn (n) — danh sách cần đôn đốc" (dạng tag).

### 3.10 Section ★ — Toàn cảnh cuộc đua

- **Biểu đồ combo SVG** (tự vẽ, responsive, vẽ lại khi resize > 40px): đường cam = doanh thu **luỹ kế** + vùng gradient cam; cột xanh mờ = **HĐBH mới mỗi ngày** (trục phải, số trên đầu cột); 5 gridline, trục trái "triệu đ" với bước tròn (1/2/2.5/5/10 × 10ⁿ); nhãn ngày thưa dần theo bề rộng; điểm cuối trắng to + nhãn giá trị; `<title>` tooltip native.
- **Theo miền** & **Đơn vị BH PVI đồng hành**: bảng thanh ngang `.hbar` (tên · thanh · HĐBH · doanh thu). Miền gradient xanh, đơn vị gradient cam.

### 3.11 Footer

Slogan Barlow italic `TĂNG TỐC HÔM NAY / DẪN ĐẦU NGÀY MAI!` (dòng 2 cam), 3 quy tắc tính điểm (`<ul>`), disclaimer số liệu tạm tính, dòng nguồn `Nguồn: <file> · tạo lúc <time>`.

---

## 4. Tính năng phụ

### 4.1 Ảnh chia sẻ thành tích (canvas 1080×1350, PNG)

Nút `📤 Ảnh thành tích` trên lane CN/Hub → vẽ ảnh dọc (tỉ lệ 4:5, hợp Zalo/Facebook): nền gradient navy + vệt tốc độ, pill "SALE CONTEST", tiêu đề chương trình, thẻ kính mờ chứa loại đơn vị, tên, **#hạng** cỡ 160px (màu hạng), "trên N điểm bán · ▲k bậc trong tuần", doanh thu + số HĐ, thanh tiến độ gradient xanh→cam, trạng thái ngưỡng, slogan, dòng cập nhật + URL.
Ưu tiên `navigator.share({files})` (mobile), fallback tải file `OCARCARE_<ten_khong_dau>.png`. Nút đổi chữ thành "⏳ Đang tạo ảnh…" trong lúc vẽ.

### 4.2 Confetti

Bắn 1 lần khi có đơn vị `crossed_today = true` (trang chính) hoặc khi mở trang Về đích.

### 4.3 Analytics (GoatCounter event)

`xem-toan-bo-ca-nhan`, `xem-toan-bo-chi-nhanh`, `tim-ca-nhan`, `tim-kiem/<slug>`, `chon-don-vi/<slug>`, `sao-chep-link/<slug>`, `xep-lau-chua-ra-don`, `chia-se-anh/<slug>`, `chung-nhan`.

### 4.4 Định dạng số (`money()`)

| Giá trị | Hiển thị |
|---|---|
| ≥ 1 tỷ | `7,933 tỷ` (≤3 chữ số thập phân) |
| ≥ 1 triệu | `354,3 tr` (≤1 chữ số thập phân) |
| còn lại | `300.000đ` |
| Giải thưởng | `5 triệu` |
| Ngày | `30/10/2026` hoặc `30/10` |

---

## 5. Mô hình dữ liệu

> Schema đầy đủ: [design/data.schema.json](design/data.schema.json) · mẫu: [design/data.sample.js](design/data.sample.js)

```
window.RACE_DATA
├─ meta        ngày/giờ báo cáo, tổng HĐ, tổng phí, hôm nay, closed, nguồn
├─ config      THỂ LỆ: program · early.tiers · individual · branch · hub(+milestones, manager) · final
├─ branches[]  điểm bán có doanh thu (đã rank, có prev_rank/rank7/week_*/active_days7/crossed_today)
├─ hubs[]      hub xe
├─ lookup[]    danh mục TẤT CẢ điểm bán (kể cả 0 đơn) → tìm kiếm + "chưa phát sinh"
├─ daily[]     LUỸ KẾ theo ngày
├─ regions[]   theo miền
├─ pvi_units[] theo đơn vị BH đồng hành (+ độ phủ)
├─ pos[]       chi tiết điểm bán có đơn (last/first/nd)
├─ indiv{}     cá nhân: people[] (rank, bonus, early[]), no_dao
└─ records{}   kỷ lục (cho trang tổng kết)
```

**Quy tắc nghiệp vụ được mã hoá trong UI:**
- Doanh thu = phí bảo hiểm **chưa VAT**, theo **ngày cấp** HĐBH trong khoảng `program.start..end`.
- CN, PGD, TTTC, House Hold **xếp hạng đồng cấp**, mỗi điểm bán tính riêng; Hub xếp hạng riêng.
- `qualified = premium ≥ threshold`; giải chỉ trao cho người **vừa trong top vừa đạt ngưỡng**.
- Thưởng sớm: HĐBH thứ 1–300 = 300K, 301–500 = 200K, 501–600 = 100K, theo **thứ tự giờ phát hành**.
- Mũi tên ▲▼ so với `prev_rank` (lần cập nhật trước); "tuần" so với `rank7`.
- Hub: thưởng thêm theo mốc (`milestones`).

**Pipeline (không public, cần tự xây — xem §8):** Excel báo cáo nghiệp vụ → lọc kênh/mã KM → map điểm bán & đơn vị → tổng hợp → so với snapshot hôm trước (prev_rank, crossed_today) và 7 ngày trước (rank7) → ghi `data.js`.

---

## 6. Các trạng thái của trang (state machine)

```
             meta.closed=false                meta.closed=true
 ┌──────────────────────────┐      ┌────────────────────────────────┐
 │ ĐANG ĐUA (mặc định)      │ ───► │ MÀN CHỜ TỔNG KẾT (#inter)      │
 │ countdown chạy, live dot │      │ ẩn mọi thứ, chỉ hiện màn chờ   │
 └──────────────────────────┘      │ (xem bảng cũ: ?xem=1 → bảng    │
                                    │  ở chế độ CLOSED: chấm vàng,   │
                                    │  "Số liệu chốt", ghi chú vàng) │
                                    └──────────────┬─────────────────┘
                                                   │ config.final.enabled=true
                                                   ▼ (xem trước: ?tongket=1)
                                    ┌────────────────────────────────┐
                                    │ TRANG VỀ ĐÍCH (#finale) ở trên │
                                    │ + bảng đua chung cuộc ở dưới   │
                                    │ official=false → "TẠM TÍNH"    │
                                    └────────────────────────────────┘
```

### 6.1 Màn chờ tổng kết (`#inter`)
Toàn màn hình, dải cờ caro trên/dưới, cờ 🏁 vẫy, H1 gradient vàng "BAN TỔ CHỨC ĐANG TỔNG KẾT", xe nhún nhảy, **stepper 4 bước** (Chốt số liệu ✓ → Khoá số đến hết `lock_date` (spinner nếu đang chạy) → Đối soát 3 bên → Công bố & vinh danh), hộp "Mời quay lại xem kết quả <Thứ, dd/mm/yyyy>" + countdown ngày/giờ/phút.

### 6.2 Trang Về đích (`#finale`)
1. Hero: chip `✔ KẾT QUẢ CHÍNH THỨC` / `⏳ TẠM TÍNH · ĐANG ĐỐI SOÁT`, tiêu đề "VỀ ĐÍCH!" gradient vàng, xe chạy qua cờ, 5 stat count-up.
2. `01` Hành trình 41 ngày — đường luỹ kế vàng **vẽ dần** (stroke-dashoffset) + cột mốc tự động (đơn đầu tiên, HĐ thứ 100/300/600, vượt 1/3/5 tỷ, ngày kỷ lục).
3. `02` Bục vinh quang cá nhân · `03` Bục điểm bán — podium nảy lên lần lượt 2→3→1; mỗi người có nút `🎖 Giấy chứng nhận`.
4. `04` Hub xe (2 cột) + Trưởng phòng Hub.
5. `05` Bức tường 600 HĐBH đầu tiên (tag tên · thưởng; 40 đầu + "Xem tất cả").
6. `06` Kỷ lục & danh hiệu (lưới thẻ: ngày nhiều HĐ nhất, ngày doanh thu cao nhất, HĐ phí cao nhất, điểm bán bền bỉ, tân binh, cán bộ nhiều HĐ, đơn vị phủ rộng, đơn vị doanh thu cao, hub dẫn đầu).
7. `07` Lưới 16 đơn vị BH PVI (+ thanh độ phủ).
8. Lời cảm ơn + **tổng quỹ thưởng** + ghi chú thanh toán + nút "Xem lại bảng đua chi tiết ↓".

**Giấy chứng nhận (canvas 1080×1350):** khung vàng đôi, cờ caro, "GIẤY CHỨNG NHẬN / THÀNH TÍCH XUẤT SẮC", tên (tự co chữ), đơn vị, pill vàng giải thưởng, chỉ số, ghi chú tạm tính, xe + cờ đích.

### 6.3 Trạng thái lỗi / rỗng
| Tình huống | Hiển thị |
|---|---|
| Không có `data.js` | "Chưa có dữ liệu (data.js). Vui lòng chạy update." |
| Chưa có HĐBH | "Chưa có HĐBH — ghi điểm ngay từ hợp đồng đầu tiên!" |
| Không có dữ liệu cá nhân | Khối khoá 🔒 blur |
| `pvi_units` rỗng | Ẩn cả section ⌂ |
| Tìm không thấy | "Không tìm thấy đơn vị" / "thử nhập Mã DAO" |

---

## 7. Tiếp cận (accessibility) & hiệu năng — hiện trạng

**Đã có:** `lang="vi"`, `aria-label` cho ticker/ô tìm kiếm/chips, `role="img"` + `aria-label` cho chart, `aria-live` cho màn chờ, `prefers-reduced-motion`, tương phản chữ trên nền tối đạt AA (ink3 ≈ 5:1), điều hướng bàn phím trong gợi ý tìm kiếm, `tabular-nums`.

**Hiệu năng:** 1 file HTML ~119 KB + data.js ~215 KB (không nén JSON), không framework; render toàn bộ bằng `innerHTML`; animation chỉ khi vào viewport.

---

## 8. ⚠️ Những gì còn thiếu & đề xuất

### 8.1 Thiếu trong bộ thiết kế này (không lấy được từ site)

| # | Thiếu | Đề xuất |
|---|---|---|
| 1 | **Ảnh bitmap**: `og-race.jpg` (1200×630), `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | Thiết kế lại theo thương hiệu mới (nền `#061230`, xe cam, chữ Barlow italic). Không tái sử dụng logo/branding PVI–OPES–VPBank nếu không phải chương trình của họ |
| 2 | **Script cập nhật dữ liệu** (Excel → `data.js`) — không public | Viết script Python (pandas/openpyxl) hoặc Node: đọc báo cáo → lọc theo mã KM/kênh → map đơn vị → tính rank/prev_rank/rank7/week/active_days7/crossed_today (cần lưu **snapshot hằng ngày** `snapshots/YYYY-MM-DD.json`) → xuất `data.js` khớp [data.schema.json](design/data.schema.json) |
| 3 | **Thể lệ chính thức** (ngưỡng, giải, thời gian, đối tượng) | Lấy từ văn bản chương trình rồi điền vào `config` — UI không hard-code ngưỡng |
| 4 | **Danh mục điểm bán đầy đủ** (`lookup`: mã, tên, loại, đơn vị cha, đơn vị BH phụ trách, tỉnh, miền) | Cần 1 file master riêng; thiếu nó sẽ mất tính năng tìm kiếm & "điểm bán chưa phát sinh đơn" |
| 5 | **Dữ liệu cá nhân** (mã cán bộ ↔ HĐBH) | Nếu nguồn không có → để `indiv` rỗng, UI tự hiện khối khoá |
| 6 | **Bản thiết kế light mode** | Site chỉ dark. Nếu cần in/chiếu → bổ sung bộ token sáng (đề xuất: nền `#f5f7fc`, panel `#fff`, ink `#0b1636`, giữ màu cam/vàng) |
| 7 | **Ảnh chụp tham chiếu/Figma** | Chưa có file Figma; nên chụp màn hình từng section (mobile 375px & desktop 1000px) làm baseline kiểm thử giao diện |

### 8.2 Điểm yếu của site gốc nên cải thiện khi clone

| # | Vấn đề | Đề xuất |
|---|---|---|
| 1 | **Lộ thông tin cá nhân**: họ tên + mã cán bộ + doanh thu công khai, chỉ chặn bằng `noindex` | Che bớt tên (`Nguyễn T. T. Thảo`) hoặc chỉ hiện mã; cân nhắc password/SSO đơn giản; tuân thủ Nghị định 13/2023 về dữ liệu cá nhân |
| 2 | Toàn bộ CSS/JS inline trong 1 file 119 KB, có rule CSS trùng lặp (`.kind.pgd`, `.iv-h`…) | Tách `styles.css` / `app.js` / `finale.js`; dùng [tokens.css](design/tokens.css); lint |
| 3 | Render bằng `innerHTML` chuỗi lớn | Giữ được (đã escape), nhưng nên gom thành các hàm component thuần, hoặc dùng Preact/Lit nếu mở rộng |
| 4 | Không có service worker dù có manifest | Thêm SW cache-first cho shell, network-first cho `data.js` → mở được khi mạng yếu |
| 5 | Chips dùng `role="tab"` nhưng thiếu `aria-selected`, `tabpanel` | Bổ sung ARIA; focus ring `:focus-visible` cho mọi nút (đã thêm trong tokens.css) |
| 6 | Emoji làm icon (📤 🏁 🔥 🚀) — hiển thị khác nhau giữa Android/iOS/Windows | Chấp nhận được cho tone vui; nếu cần nhất quán → bộ SVG icon (Lucide/Tabler) |
| 7 | Dự báo về đích tuyến tính đơn giản | Có thể dùng trung bình 7 ngày gần nhất (phản ánh tốc độ hiện tại tốt hơn) và ghi rõ cách tính |
| 8 | Chart không có tooltip tương tác trên mobile (chỉ `<title>`) | Thêm tooltip chạm (tap) hiển thị ngày/giá trị |
| 9 | Không có nút chia sẻ link cho cá nhân/điểm bán (chỉ có cho đơn vị BH) | Thêm deep-link `?cn=<mã>` / `?dao=<mã>` tự cuộn & highlight |
| 10 | Không có bộ lọc theo miền/loại trong danh sách lane | Thêm segmented control `Tất cả · CN · PGD · TTTC` và `Bắc · Trung · Nam` |
| 11 | Không có trang in/xuất báo cáo | Thêm `@media print` hoặc nút xuất CSV từ dữ liệu đang xem |

### 8.3 Áp dụng cho dữ liệu Savico (file `doanh-thu-savico-t10.xlsx` trong thư mục này)

File hiện có là **"Báo cáo hiệu quả kinh doanh nghiệp vụ bảo hiểm xe cơ giới"** (01/10–31/10/2026, đơn vị PVI Link, mã KM `KM230` "CT tặng BHVCX qua SAVICO"), sheet `Doanh thu` (~5 HĐBH) và sheet `Mã đơn vị` (22 đơn vị PVI + danh sách đại lý ô tô như Toyota Long Biên, Toyota Giải Phóng – Nam Định, Ô tô Hải Dương, Dana, Ô tô Đà Nẵng, Ô tô Quảng Nam, Ô tô Hưng Thịnh, Ô tô Đại Thịnh…).

**Ánh xạ cột → schema đề xuất:**

| Cột Excel | Trường `RACE_DATA` |
|---|---|
| Ngày cấp đơn | `daily[].date`, `last`, `first_date` |
| Phí BH (không VAT) | `premium` |
| Số đơn BH | đếm `policies`, thứ tự cho thưởng sớm |
| Đơn vị cấp đơn (PVI Hải Hưng, PVI Đà Nẵng…) | `pvi` / `pvi_units[]` |
| Đại lý / Thông tin dịch vụ (showroom) | **điểm bán** → `branches[]` (kind đề xuất: `DL` = đại lý/showroom) |
| Cán bộ | `indiv.people[].nm` (cần thêm **mã cán bộ** ổn định) |
| Mã khuyến mại | `config.program.promo_codes` (`KM230`) |
| Tên sản phẩm | lọc: chỉ tính "Bảo hiểm vật chất xe" hay cả TNDS? → **cần quyết định** |
| Sheet "Mã đơn vị" (mã 2 số) | `lookup[].v` + suy ra `region` |

**Còn thiếu riêng cho Savico (cần bổ sung trước khi dựng):**
1. **Thể lệ Savico**: thời gian chương trình, ngưỡng & giải cho từng hạng mục (showroom / cán bộ / đơn vị PVI), có thưởng "N HĐ đầu tiên" không.
2. **Danh mục showroom đầy đủ** (mã, tên, tỉnh, miền, đơn vị PVI phụ trách) — cột "Đại lý" hiện là chuỗi tự do, cần chuẩn hoá.
3. **Hạng mục thay cho "Hub xe"**: Savico có cấp tương đương (vùng/công ty con) không? Nếu không → bỏ section 3, hoặc đổi thành "Theo hãng xe (Toyota/Ford/…)".
4. **Branding Savico**: logo, màu chủ đạo (thay `--orange` / `--sc-*`), tên chương trình, slogan — hiện mọi chữ "OCARCARE / OPES / VPBank / BH PVI" cần thay.
5. **Khối lượng dữ liệu nhỏ** (vài HĐ/tháng): nên bật sẵn các trạng thái rỗng, đổi thang đo lane sang `max(ngưỡng × 1.12, top1)` và cân nhắc ẩn "Bứt phá 7 ngày" khi < 5 đơn vị.
6. **Quyền riêng tư khách hàng**: file có tên khách hàng — **không bao giờ** đưa vào `data.js`.

---

## 9. Bản clone trong repo

| File | Vai trò |
|---|---|
| [index.html](index.html) | Khung trang (hero, ticker, 6 section, footer, `#finale`, `#inter`) |
| [css/app.css](css/app.css) · [css/finale.css](css/finale.css) | Style trang chính / trang Về đích + màn chờ (dựa trên [tokens.css](design/tokens.css)) |
| [js/app.js](js/app.js) | Toàn bộ logic trang chính, xuất `window.RaceUI` cho finale |
| [js/finale.js](js/finale.js) | Màn chờ tổng kết + trang Về đích + giấy chứng nhận |
| [data.js](data.js) | Dữ liệu mẫu hư cấu (16 điểm bán, 2 hub, 14 cá nhân, 40 ngày) — lựa chọn "Dữ liệu mẫu (demo)" |
| [contest.config.js](contest.config.js) | Nguồn Drive (thư mục, API key, chu kỳ), thương hiệu, nhãn, ngưỡng/giải |
| [js/loader.js](js/loader.js) | Đọc trực tiếp thư mục Google Drive (Drive API v3), danh sách chọn file, tự cập nhật |
| [js/adapter-savico.js](js/adapter-savico.js) | Excel báo cáo XCG → `RACE_DATA` |
| [serve.ps1](serve.ps1) | Server tĩnh + giả lập Drive API v3 để chạy thử không cần API key |
| [DRIVE.md](DRIVE.md) | Hướng dẫn kết nối Google Drive, lấy API key, cách đọc file |
| [GITHUB.md](GITHUB.md) · [make-deploy.ps1](make-deploy.ps1) | Đăng lên GitHub Pages (đóng gói thư mục `deploy\`, không kèm file .xlsx) |

Chạy thử: `powershell -ExecutionPolicy Bypass -File serve.ps1` → mở http://localhost:5173.
Xem trước trạng thái: `?tongket=1` (Về đích) · `?cho=1` (màn chờ) · `?xem=1` (bảng chốt khi đã `closed`) · `?dv=sai-gon` (mở sẵn 1 đơn vị).

**Khác biệt so với site gốc:**
- Text thương hiệu đọc từ `config.brand` (badge, org, title, highlight, sprint, tagline, channel, slogan).
- `config.privacy.mask_names` để viết tắt tên cán bộ ("Trần Q. Bảo"), xem §8.2-1.
- Thêm bộ lọc loại điểm bán / miền trên đường đua mục 2 (§8.2-10).
- Sửa cách tính "ngày thứ N": dùng `floor` thay `round`, nên ngày báo cáo 30/10 là 40/41 thay vì 41/41. Nhờ vậy dự báo về đích còn hoạt động ở ngày áp chót.
- ARIA: `aria-selected` cho chips, `aria-pressed` cho nút sắp xếp/lọc, `role=listbox/option` cho gợi ý, Esc để đóng gợi ý.
- Tách CSS/JS thành file riêng; class nhãn Hub là `.kind.khub` để không trùng `.hub`.

## 10. Phiên bản hiện tại: Báo cáo Ban lãnh đạo (theme Đỏ – Trắng – Xanh dương)

Từ 02/11/2026, trang chính ([index.html](index.html)) là **báo cáo tổng hợp doanh thu chưa VAT**, không còn là bảng đua. Bảng đua (`css/app.css`, `css/finale.css`, `js/app.js`, `js/finale.js`, `js/adapter-savico.js`, `data.js`, `design/tokens.css`) vẫn giữ trong thư mục nhưng **không được tải và không được đóng gói** (`make-deploy.ps1`).

| Thành phần | File |
|---|---|
| Theme & bố cục (token màu, bảng, biểu đồ, bản in A4) | [css/report.css](css/report.css) |
| Tổng hợp theo Sheet 2, chống trùng, đối chiếu TỔNG CỘNG | [js/report-adapter.js](js/report-adapter.js) |
| Trang báo cáo: KPI, kiểm soát số liệu, 6 tiêu chí (bảng + biểu đồ + xuất CSV) | [js/report.js](js/report.js) |
| Nguồn chính: Google Drive — tự lấy file mới nhất, tự cập nhật mỗi 60 giây | [js/loader.js](js/loader.js) |
| Nút **Upload** + kéo thả: xem nhanh một file Excel trên máy, nút "Quay lại Google Drive" | [js/upload.js](js/upload.js) |

**Thay đổi so với trước:**
- Bỏ ô chọn file và nút "In báo cáo".
- Nhãn nguồn (GOOGLE DRIVE / UPLOAD) hiện cạnh tên file.
- File không có Sheet 2 dùng danh mục chuẩn `contest.config.js → units`.

**Màu:**
- Xanh `#0b2a6b` / `#1d4ed8`: màu chủ đạo (thanh tiêu đề, đầu bảng, nút).
- Đỏ `#d71920`: điểm nhấn thương hiệu (viền trên, số thứ tự mục, dòng tổng).
- Nền trắng / `#f3f5fa`.

**Biểu đồ:**
- Một chuỗi số liệu dùng một màu `#2563eb`.
- Biểu đồ cơ cấu dùng tối đa 4 màu `#1d4ed8 #d71920 #7ba7f7 #f08488`. Bộ màu này đã kiểm tra bằng `validate_palette.js`: CVD ΔE ≥ 16 trên nền trắng. Từ nhóm thứ 5 trở đi gộp vào "Khác".
- Không dùng biểu đồ hai trục.
- Luôn có bảng số đi kèm.

## 11. Checklist dựng lại (acceptance)

- [ ] Dùng [tokens.css](design/tokens.css); không mã màu cứng ngoài token (trừ gradient trang trí).
- [ ] Hiển thị đúng ở 360px, 375px, 768px, 1000px+; không cuộn ngang trang.
- [ ] Mọi ngưỡng/giải/ngày đọc từ `config`, đổi `config` không cần sửa UI.
- [ ] Count-up, xe chạy, trail chỉ chạy khi vào viewport, một lần; tắt khi reduced-motion.
- [ ] Tìm kiếm không dấu, đa từ, bàn phím ↑↓Enter, đóng khi click ngoài.
- [ ] Tìm thấy → mở rộng danh sách, cuộn, highlight lane.
- [ ] Ảnh chia sẻ 1080×1350 tạo được trên iOS Safari & Android Chrome (Web Share) và desktop (download).
- [ ] 3 trạng thái: đang đua / màn chờ (`closed`) / về đích (`final.enabled`, xem trước `?tongket=1`).
- [ ] Các trạng thái rỗng ở §6.3 hiển thị đúng với [data.sample.js](design/data.sample.js) đã xoá bớt dữ liệu.
- [ ] Không có dữ liệu khách hàng trong `data.js`; xử lý theo §8.2-1 cho tên cán bộ.
