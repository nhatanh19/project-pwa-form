# 🚗 PWA Field Survey - Khảo Sát Thói Quen Sử Dụng Phương Tiện Di Chuyển Hàng Ngày

Ứng dụng Web Lũy Tiến (**Progressive Web App - PWA**) di động chuyên dụng cho người đi khảo sát thực địa (*enumerators*) thu thập dữ liệu về thói quen đi lại và xu hướng chuyển đổi phương tiện xanh (xe điện / xe buýt điện).

---

## 🌟 Tính Năng Nổi Bật

- ⚡ **Hỗ trợ Offline Triệt Để 100%:** Khi mất mạng ngoài hiện trường (sóng yếu/vùng sâu), toàn bộ luồng khảo sát, tính năng và lưu trữ vẫn hoạt động bình thường qua **IndexedDB (Dexie.js)**.
- 🔄 **Tự Động Đồng Bộ (Auto-Sync & Background Sync):** Khi có kết nối Internet trở lại, hệ thống tự động đẩy toàn bộ phiếu lưu tạm lên cơ sở dữ liệu **Cloudflare D1 (SQLite Edge)** mà không làm gián đoạn người dùng.
- 📍 **Tự Động Thu Thập Tọa Độ GPS:** Ghi nhận kinh độ (*longitude*), vĩ độ (*latitude*) và sai số định vị (*accuracy*) cho từng lượt khảo sát thực địa kèm liên kết xem trực tiếp trên Google Maps.
- ⏱️ **Lưu Vết Thời Gian & Thời Lượng Phỏng Vấn:** Đo đếm chính xác thời điểm bắt đầu, hoàn thành và thời lượng làm bài (*survey duration in seconds*) phục vụ kiểm soát chất lượng dữ liệu.
- 📊 **Xuất Dữ Liệu Toàn Bộ Ra CSV (Excel-Ready):** Xuất toàn bộ kết quả khảo sát ra file CSV chuẩn mã hóa **UTF-8 with BOM (`\uFEFF`)**, mở trên Microsoft Excel không bị lỗi font tiếng Việt.
- 🎛️ **Động Cơ Câu Hỏi Động & Quản Trị Linh Hoạt:** Cho phép tạo mới và quản trị không giới hạn câu hỏi thuộc nhiều định dạng (`SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `NUMERIC`, `RATING`, `TEXT`, `TEXTAREA`), tự động đồng bộ 2 chiều giữa Server và Client.
- 📈 **Báo Cáo Thống Kê Trực Quan:** Bảng điều khiển biểu đồ Recharts (cơ cấu phương tiện, cự ly di chuyển, lý do lựa chọn, mức độ sẵn sàng chuyển đổi xe xanh) chuẩn di động.
- 📱 **Giao Diện Chuẩn Production (PWA Mobile):** Tương thích 100% màn hình điện thoại cảm ứng, hỗ trợ cài đặt ra màn hình chính (*Add to Home Screen*) với bộ icon đồ họa sắc nét trên cả Android & iOS.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Frontend (Client)
- **Framework:** React 18, TypeScript, Vite
- **UI & Styling:** Tailwind CSS, Radix UI primitives, Lucide React Icons
- **Data Visualization:** Recharts
- **Offline Storage:** Dexie.js (IndexedDB wrapper) & `dexie-react-hooks`
- **PWA / Service Worker:** `vite-plugin-pwa` (Workbox)
- **UI FX:** Canvas Confetti

### Backend & Database (Edge Computing)
- **Edge API Framework:** Hono on Cloudflare Pages Functions
- **Database Serverless:** Cloudflare D1 (Serverless SQLite on Edge)
- **Deployment:** Cloudflare Pages

---

## 📂 Cấu Trúc Thư Mục

```text
├── db/                         # DDL Schema, Seed và Truy vấn phân tích SQLite
│   ├── schema.sql              # Cấu trúc bảng surveys, questions, options, responses, answers
│   ├── seed.sql                # Dữ liệu mẫu ban đầu
│   └── analytics_queries.sql   # Truy vấn tổng hợp KPI và biểu đồ
├── functions/                  # Cloudflare Pages Functions (Backend Hono)
│   ├── api/
│   │   ├── [[route]].ts        # Entrypoint router /api
│   │   └── routes/
│   │       ├── questions.ts    # API quản lý danh mục câu hỏi
│   │       ├── sync.ts         # API batch sync phiếu khảo sát
│   │       ├── analytics.ts    # API tổng hợp báo cáo
│   │       └── export.ts       # API xuất toàn bộ dữ liệu ra CSV
│   └── types/env.ts            # Khai báo binding Cloudflare D1
├── public/                     # Static assets, Web App Manifest & Brand Icons
│   ├── icons/                  # Bộ icon PWA chuẩn W3C (192x192, 512x512, maskable, apple)
│   ├── manifest.webmanifest
│   └── favicon.ico
├── src/                        # Frontend React Application
│   ├── components/
│   │   ├── admin/              # Modal quản trị & tạo mới câu hỏi
│   │   ├── dashboard/          # Biểu đồ phân tích và KPI cards
│   │   ├── layout/             # Header, BottomNav, PWA Install Banner, Offline Banner
│   │   ├── records/            # Sổ tay quản lý phiếu phỏng vấn thực địa
│   │   ├── survey/             # Dynamic Survey Wizard và các thành phần câu hỏi
│   │   └── ui/                 # UI primitives (Button, Card, Slider, Progress, Badge)
│   ├── db/dexie.ts             # Cấu hình Dexie IndexedDB cục bộ
│   ├── hooks/                  # Custom hooks (useOfflineSync, useGeolocation, usePwaInstall...)
│   ├── lib/                    # Helpers (csv-exporter, icon-resolver, utils)
│   └── types/                  # TypeScript interfaces
├── vite.config.ts              # Cấu hình Vite & PWA Service Worker
└── wrangler.toml               # Cấu hình Cloudflare D1 binding
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy môi trường phát triển (Dev Server)
```bash
npm run dev
```

### 3. Đóng gói bản Production
```bash
npm run build
```

### 4. Deploy lên Cloudflare Pages
```bash
# Deploy nhánh Production
npm run deploy:prod

# Hoặc deploy nhánh Main
npm run deploy:main
```

---

## 📄 Bản Quyền & Giấy Phép

Dự án được xây dựng phục vụ học tập và nghiên cứu thực địa.
Giấy phép: MIT.
