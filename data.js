/* =========================================================================
   DỮ LIỆU MẪU (hư cấu) — đúng schema design/data.schema.json.
   Pipeline thật nên xuất thẳng JSON thuần: window.RACE_DATA = {...}.
   Ở đây dùng một hàm dựng nhỏ để các số tổng (meta, daily, regions,
   pvi_units, records) luôn khớp với danh sách điểm bán.
   ========================================================================= */
(function () {
  const TR = 1e6;
  const REPORT = "2026-10-30";

  const config = {
    brand: {
      badge: "Chuyển đổi số",
      org: "BẢO HIỂM PVI",
      title: "Chào sân",
      highlight: "Savico",
      sprint: "Launch Sprint",
      tagline: "Tăng tốc doanh số — Bứt phá cùng bảo hiểm vật chất xe ô tô",
      channel: "HĐBH cấp qua kênh đối tác, đồng hành cùng Bảo hiểm PVI",
      slogan: ["Tăng tốc hôm nay", "Dẫn đầu ngày mai!"],
      share_footer: "Bảng đua Sales Contest"
    },
    privacy: { mask_names: true },
    program: { name: "Chào sân Savico — Launch Sprint", start: "2026-09-21", end: "2026-10-31", channel_keyword: "SAVICO", promo_codes: ["KM230"] },
    early: { tiers: [
      { from: 1, to: 300, reward: 300000, label: "300 HĐBH đầu tiên" },
      { from: 301, to: 500, reward: 200000, label: "200 HĐBH tiếp theo" },
      { from: 501, to: 600, reward: 100000, label: "100 HĐBH cuối cùng" }
    ] },
    final: { enabled: false, official: false, payout_note: "Dự kiến thanh toán cuối tháng 11/2026 sau khi đối soát.", hub_manager: null, return_date: "2026-11-18", lock_date: "2026-11-15" },
    individual: { threshold: 125 * TR, prizes: [5 * TR, 4 * TR, 3 * TR], note: "Tạm tính theo mã cán bộ bán" },
    branch: { threshold: 250 * TR, prizes: [7 * TR, 5 * TR, 3 * TR] },
    hub: {
      threshold: 1250 * TR, prizes: [15 * TR, 10 * TR],
      milestones: [
        { value: 1250 * TR, label: "Điều kiện" },
        { value: 1825 * TR, label: "+5 triệu" },
        { value: 2500 * TR, label: "+10 triệu" }
      ],
      manager: { threshold: 400 * TR, prizes: [6 * TR, 5 * TR, 4 * TR, 3 * TR], note: "Chưa phân tách được cấp phòng/nhóm Hub — công bố theo kết quả chính thức" }
    }
  };

  /* id, kind, tên, miền, tỉnh, đơn vị BH, phí (tr), HĐ, prev_rank, rank7, phí tuần (tr), HĐ tuần,
     số ngày có đơn/7, ngày đơn đầu, HĐ hôm nay, phí hôm nay (tr), ngày đơn gần nhất, [điểm con] */
  const U = [
    ["B01", "CN", "CN Hoàn Kiếm", "Miền Bắc", "Hà Nội", "BH PVI Đông Đô", 342.5, 49, 1, 1, 38.2, 6, 4, "2026-09-21", 0, 0, "2026-10-29", [["B01a", "PGD", "PGD Hàng Bài", 62.3, 9, "2026-10-22"], ["B01b", "PGD", "PGD Tràng Tiền", 21.4, 3, "2026-10-12"]]],
    ["B02", "CN", "CN Biên Hoà", "Miền Nam", "Đồng Nai", "BH PVI Sài Gòn", 296.8, 42, 2, 3, 44.1, 7, 5, "2026-09-22", 1, 7.2, "2026-10-30"],
    ["B03", "CN", "CN Buôn Ma Thuột", "Miền Trung", "Đắk Lắk", "BH PVI Đà Nẵng", 271.4, 38, 3, 2, 18.6, 3, 2, "2026-09-23", 0, 0, "2026-10-27"],
    ["B04", "PGD", "PGD Cầu Giấy", "Miền Bắc", "Hà Nội", "BH PVI Đông Đô", 238.9, 31, 5, 6, 52.7, 8, 6, "2026-09-24", 1, 6.1, "2026-10-30"],
    ["B05", "CN", "CN Hải Phòng", "Miền Bắc", "Hải Phòng", "BH PVI Duyên Hải", 226.3, 33, 4, 4, 21.3, 3, 3, "2026-09-21", 0, 0, "2026-10-28", [["B05a", "PGD", "PGD Ngô Quyền", 48.6, 7, "2026-10-28"]]],
    ["B06", "TTTC", "TTTC Quận 1", "Miền Nam", "TP. Hồ Chí Minh", "BH PVI Sài Gòn", 205.1, 27, 6, 9, 47.9, 6, 5, "2026-09-25", 0, 0, "2026-10-29"],
    ["B07", "CN", "CN Đà Nẵng", "Miền Trung", "Đà Nẵng", "BH PVI Đà Nẵng", 188.6, 26, 7, 5, 9.8, 1, 1, "2026-09-22", 0, 0, "2026-10-24"],
    ["B08", "PGD", "PGD Lê Chân", "Miền Bắc", "Hải Phòng", "BH PVI Duyên Hải", 176.2, 24, 9, 12, 58.4, 8, 6, "2026-09-28", 2, 13.5, "2026-10-30"],
    ["B09", "CN", "CN Hải Dương", "Miền Bắc", "Hải Dương", "BH PVI Hải Hưng", 169.7, 25, 8, 7, 12.1, 2, 2, "2026-09-23", 0, 0, "2026-10-26"],
    ["B10", "HHB", "HHB Phú Mỹ Hưng", "Miền Nam", "TP. Hồ Chí Minh", "BH PVI Sài Gòn", 151.3, 19, 10, 8, 6.4, 1, 1, "2026-09-26", 0, 0, "2026-10-21"],
    ["B11", "CN", "CN Nha Trang", "Miền Trung", "Khánh Hoà", "BH PVI Đà Nẵng", 132.8, 18, 12, 14, 31.6, 4, 4, "2026-10-02", 0, 0, "2026-10-29"],
    ["B12", "PGD", "PGD Thủ Đức", "Miền Nam", "TP. Hồ Chí Minh", "BH PVI Link", 118.4, 16, 11, 10, 0, 0, 0, "2026-09-27", 0, 0, "2026-10-19"],
    ["B13", "CN", "CN Hưng Yên", "Miền Bắc", "Hưng Yên", "BH PVI Hải Hưng", 96.2, 14, 13, 15, 28.9, 4, 3, "2026-10-05", 0, 0, "2026-10-29"],
    ["B14", "TTTC", "TTTC Ba Đình", "Miền Bắc", "Hà Nội", "BH PVI Link", 74.5, 10, 14, 13, 8.2, 1, 1, "2026-09-30", 0, 0, "2026-10-25"],
    ["B15", "PGD", "PGD Ngũ Hành Sơn", "Miền Trung", "Đà Nẵng", "BH PVI Đà Nẵng", 41.7, 6, 16, null, 41.7, 6, 4, "2026-10-24", 0, 0, "2026-10-29"],
    ["B16", "CN", "CN Quảng Ninh", "Miền Bắc", "Quảng Ninh", "BH PVI Duyên Hải", 12.6, 2, null, null, 12.6, 2, 1, "2026-10-29", 1, 6.3, "2026-10-30"]
  ];
  const HU = [
    ["H01", "HUB", "TTKD OTO MIEN BAC", "Miền Bắc", "Hà Nội", "BH PVI Link", 912.4, 131, 1, 1, 118.2, 17, 6, "2026-09-22", 1, 6.8, "2026-10-30"],
    ["H02", "HUB", "TTKD OTO MIEN NAM", "Miền Nam", "TP. Hồ Chí Minh", "BH PVI Sài Gòn", 604.7, 88, 2, 2, 96.5, 14, 5, "2026-09-24", 0, 0, "2026-10-29"]
  ];
  /* Điểm bán chưa phát sinh đơn: mã, loại, tên, đơn vị BH, tỉnh */
  const ZERO = [
    ["Z01", "CN", "CN Thái Bình", "BH PVI Duyên Hải", "Thái Bình"],
    ["Z02", "PGD", "PGD Long Biên", "BH PVI Đông Đô", "Hà Nội"],
    ["Z03", "PGD", "PGD Gò Vấp", "BH PVI Sài Gòn", "TP. Hồ Chí Minh"],
    ["Z04", "CN", "CN Huế", "BH PVI Đà Nẵng", "Huế"],
    ["Z05", "PGD", "PGD Kim Mã", "BH PVI Link", "Hà Nội"],
    ["Z06", "CN", "CN Bắc Ninh", "BH PVI Hải Hưng", "Bắc Ninh"],
    ["Z07", "CN", "CN Thanh Hoá", "BH PVI Thanh Hoá", "Thanh Hoá"]
  ];
  /* Cá nhân: mã, họ tên, mã điểm bán, phí (tr), HĐ, phí tuần (tr), [số đơn ở bậc 1,2,3] */
  const PP = [
    ["10001", "Nguyễn Thị Minh Anh", "B02", 168.4, 24, 22.5, [11, 6, 2]],
    ["10002", "Trần Quốc Bảo", "H01", 151.2, 22, 31.4, [6, 7, 4]],
    ["10003", "Lê Thu Hà", "B01", 139.7, 20, 12.0, [12, 3, 1]],
    ["10004", "Phạm Đức Huy", "B04", 128.5, 17, 27.6, [5, 6, 3]],
    ["10005", "Đỗ Mai Phương", "H02", 117.9, 18, 26.1, [7, 4, 2]],
    ["10006", "Vũ Hoàng Long", "B03", 104.3, 15, 9.2, [9, 2, 0]],
    ["10007", "Bùi Thanh Tâm", "B06", 96.8, 13, 18.4, [3, 5, 3]],
    ["10008", "Hoàng Gia Khánh", "B05", 88.1, 13, 0, [8, 1, 1]],
    ["10009", "Ngô Phương Linh", "B08", 79.4, 11, 30.2, [1, 4, 4]],
    ["10010", "Đặng Văn Tú", "B07", 71.6, 10, 0, [6, 2, 0]],
    ["10011", "Trịnh Hải Yến", "H01", 64.2, 9, 12.3, [2, 3, 2]],
    ["10012", "Phan Minh Quân", "B09", 52.7, 8, 6.1, [4, 2, 1]],
    ["10013", "Mai Ngọc Diệp", "B11", 38.5, 5, 15.2, [0, 0, 3]],
    ["10014", "Lý Thành Đạt", "B13", 21.9, 3, 14.7, [0, 0, 0]]
  ];

  const unit = r => {
    const premium = Math.round(r[6] * TR), today = Math.round(r[15] * TR);
    const thr = r[1] === "HUB" ? config.hub.threshold : config.branch.threshold;
    return {
      id: r[0], kind: r[1], name: r[2], region: r[3], province: r[4], pvi: r[5],
      premium, policies: r[7], last: r[16], rank: 0, prev_rank: r[8],
      today_premium: today, today_policies: r[14],
      qualified: premium >= thr, crossed_today: premium >= thr && premium - today < thr,
      rank7: r[9], week_premium: Math.round(r[10] * TR), week_policies: r[11],
      active_days7: r[12], first_date: r[13], _subs: r[17] || []
    };
  };
  const rankBy = arr => arr.sort((a, b) => b.premium - a.premium).forEach((u, i) => { u.rank = i + 1; });
  const branches = U.map(unit), hubs = HU.map(unit);
  rankBy(branches); rankBy(hubs);
  const all = branches.concat(hubs);

  /* điểm bán chi tiết (pos) + danh mục (lookup) */
  const pos = [], lookup = [];
  all.forEach(u => {
    let restP = u.premium, restN = u.policies;
    u._subs.forEach(s => {
      const p = Math.round(s[3] * TR); restP -= p; restN -= s[4];
      pos.push({ c: s[0], n: s[2], t: s[1], k: u.kind, u: u.id, un: u.name, v: u.pvi, region: u.region, premium: p, policies: s[4], today_premium: 0, today_policies: 0, last: s[5], first: u.first_date, nd: Math.max(1, Math.round(s[4] * 0.7)) });
      lookup.push({ c: s[0], n: s[2], t: s[1], k: u.kind, u: u.id, un: u.name, v: u.pvi, p: u.province });
    });
    pos.push({ c: u.id, n: u.name, t: u.kind === "HUB" ? "TTKD" : u.kind, k: u.kind, u: u.id, un: u.name, v: u.pvi, region: u.region, premium: restP, policies: restN, today_premium: u.today_premium, today_policies: u.today_policies, last: u.last, first: u.first_date, nd: Math.max(1, Math.round(restN * 0.7)) });
    lookup.push({ c: u.id, n: u.name, t: u.kind === "HUB" ? "TTKD" : u.kind, k: u.kind, u: u.id, un: u.name, v: u.pvi, p: u.province });
    delete u._subs;
  });
  ZERO.forEach(z => lookup.push({ c: z[0], n: z[2], t: z[1], k: z[1], u: z[0], un: z[2], v: z[3], p: z[4] }));
  pos.sort((a, b) => b.premium - a.premium);

  const totalP = all.reduce((s, u) => s + u.premium, 0);
  const totalN = all.reduce((s, u) => s + u.policies, 0);

  /* luỹ kế theo ngày (giả lập có nhịp tuần + tăng dần) */
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const start = new Date("2026-09-21T12:00:00+07:00"), end = new Date(REPORT + "T12:00:00+07:00");
  const nDays = Math.round((end - start) / 864e5) + 1;
  const w = [], pw = [];
  for (let i = 0; i < nDays; i++) {
    const d = new Date(start.getTime() + i * 864e5), wd = d.getDay();
    w.push((0.4 + i / nDays) * (wd === 0 ? 0.15 : wd === 6 ? 0.5 : 1) * (0.6 + rnd() * 0.8));
    pw.push(0.75 + rnd() * 0.5);
  }
  const ws = w.reduce((s, x) => s + x, 0);
  /* chia theo phần dư lớn nhất để tổng khớp mà không dồn vào một ngày */
  const exact = w.map(x => x / ws * totalN), newN = exact.map(Math.floor);
  exact.map((x, i) => [x - newN[i], i]).sort((a, b) => b[0] - a[0])
    .slice(0, totalN - newN.reduce((s, x) => s + x, 0)).forEach(([, i]) => { newN[i]++; });
  const rawP = newN.map((n, i) => n * pw[i]), rs = rawP.reduce((s, x) => s + x, 0);
  let cn = 0, cp = 0;
  const daily = newN.map((n, i) => {
    cn += n; cp += rawP[i] / rs * totalP;
    const d = new Date(start.getTime() + i * 864e5);
    return { date: d.toISOString().slice(0, 10), policies: cn, premium: Math.round(i === nDays - 1 ? totalP : cp) };
  });

  const group = (key) => {
    const m = {};
    all.forEach(u => { const g = m[u[key]] = m[u[key]] || { name: u[key], premium: 0, policies: 0, today_premium: 0, today_policies: 0 }; g.premium += u.premium; g.policies += u.policies; g.today_premium += u.today_premium; g.today_policies += u.today_policies; });
    return m;
  };
  const regions = Object.values(group("region")).map(g => ({ name: g.name, premium: g.premium, policies: g.policies })).sort((a, b) => b.premium - a.premium);
  const pm = group("pvi");
  lookup.forEach(x => { pm[x.v] = pm[x.v] || { name: x.v, premium: 0, policies: 0, today_premium: 0, today_policies: 0 }; });
  const pvi_units = Object.values(pm).map(g => ({
    ...g,
    points_total: lookup.filter(x => x.v === g.name).length,
    points_active: pos.filter(z => z.v === g.name).length
  })).sort((a, b) => b.premium - a.premium).map((g, i) => ({ ...g, rank: i + 1 }));

  const byId = Object.fromEntries(all.map(u => [u.id, u]));
  const ER = config.early.tiers.map(t => t.reward);
  const people = PP.map((p, i) => {
    const u = byId[p[2]], premium = Math.round(p[3] * TR), bonus = p[6].reduce((s, n, j) => s + n * ER[j], 0);
    return { id: p[0], nm: p[1], b: u.id, u: u.name, k: u.kind, v: u.pvi, premium, policies: p[4], week_premium: Math.round(p[5] * TR), bonus, early: p[6], qualified: premium >= config.individual.threshold, rank: i + 1 };
  });

  const newDay = daily.map((d, i) => ({ d: d.date, n: d.policies - (i ? daily[i - 1].policies : 0), p: d.premium - (i ? daily[i - 1].premium : 0) }));
  const bestN = newDay.reduce((a, b) => (b.n > a.n ? b : a));
  const bestP = newDay.reduce((a, b) => (b.p > a.p ? b : a));

  window.RACE_DATA = {
    meta: {
      report_date: REPORT, report_time: "08:15", model: "diem-ban", generated_at: REPORT + " 17:06",
      source: "du-lieu-mau.xlsx", closed: false, source_date: REPORT,
      total_policies: totalN, total_premium: totalP,
      today_policies: all.reduce((s, u) => s + u.today_policies, 0),
      today_premium: all.reduce((s, u) => s + u.today_premium, 0),
      active_units: all.length, unmapped: { premium: 0, policies: 0 }
    },
    config, branches, hubs, lookup, daily, regions, pvi_units, pos,
    indiv: {
      asof: "2026-10-27", source: "ma-can-bo-mau.xlsx", people_count: people.length,
      no_dao: { policies: 3, premium: 19800000 },
      early_total: Math.min(totalN, 600), early_assigned: people.reduce((s, p) => s + p.early.reduce((a, b) => a + b, 0), 0),
      bonus_total: people.reduce((s, p) => s + p.bonus, 0), people
    },
    records: {
      best_day_n: { d: bestN.d, n: bestN.n, p: bestN.p },
      best_day_p: { d: bestP.d, n: bestP.n, p: bestP.p },
      max_policy: { p: 41800000, d: "2026-10-19", n: "CN Hoàn Kiếm" },
      points_total: lookup.length
    }
  };
})();
