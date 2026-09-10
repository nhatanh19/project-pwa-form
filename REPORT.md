# MINI-PROJECT SHORT TECHNICAL REPORT

**Course:** Cross-Platform Mobile App Development (VKU)  
**Mini-Project Title:** PWA Offline-First Mobile Field Survey Application  
**Team / Student Name:** Đoàn Nhật Ánh  
**Submission Date:** 03/09/2026  

---

## 1. GENERAL INFORMATION & DELIVERABLE LINKS

* **Team Members:**
  1. Đoàn Nhật Anh — Student ID: 23IT.B007 — Role: Full-Stack Engineer & PWA Architect — Contribution: 100%
* **🔗 Live Demo URL:** [https://pwa-traffic-survey.pages.dev](https://pwa-traffic-survey.pages.dev) , [form-pwa.anhdn.online](https://form-pwa.anhdn.online)
* **💻 GitHub Repository:** [https://github.com/nhatanh19/project-pwa-form](https://github.com/nhatanh19/project-pwa-form)
* **🎥 Video Demo (Optional):** [https://pwa-traffic-survey.pages.dev](https://pwa-traffic-survey.pages.dev)

---

## 2. FEATURE IMPLEMENTATION CHECKLIST

| #   | Required Feature                                   | Status     | Implementation Details & Acceptance Level                                                                                                                                                                   |
|:---:| -------------------------------------------------- |:----------:| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Responsive Mobile Viewport & Ergonomics**        | ✅ Complete | 100% responsive on mobile devices (320px–430px+), safe-area-inset padding, touch-friendly cards (60px height), zero button collision.                                                                       |
| 2   | **Local Offline Persistence (100% Offline-First)** | ✅ Complete | Uses **Dexie.js (IndexedDB)** for local persistence (`surveys`, `offline_submissions`, `analytics_cache`). Seed fallback ensures instant functionality on initial load.                                     |
| 3   | **Automatic Background Synchronization**           | ✅ Complete | Listens to `window.online` events + periodic 30s auto-sync. Submissions are queued offline and batch-synced via `POST /api/sync/batch` to **Cloudflare D1 (SQLite Edge)** with idempotent retry backoff.    |
| 4   | **Dynamic Question Engine & Builder**              | ✅ Complete | Supports $N$ dynamic questions of types: `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `NUMERIC`, `RATING`, `TEXT`, `TEXTAREA`. Integrated Question Manager modal with real-time reactive updates via `useLiveQuery`. |
| 5   | **Real-Time GPS Geolocation Tagging**              | ✅ Complete | Leverages `navigator.geolocation` (`enableHighAccuracy: true`) to automatically capture latitude, longitude, and accuracy radius ($\pm\text{m}$) for each submission with Google Maps inspection links.     |
| 6   | **Audit Timestamping & Duration Tracking**         | ✅ Complete | Tracks `client_created_at` (start), `completed_at` (finish), and `survey_duration_seconds` (interview duration) for enumerator quality control and data auditing.                                           |
| 7   | **Comprehensive CSV Export (Excel-Ready)**         | ✅ Complete | Generates RFC 4180 CSV with **UTF-8 BOM (`\uFEFF`)** prefix for seamless rendering in Microsoft Excel without Vietnamese diacritics corruption. Supports both local IndexedDB & Server D1 exports.          |
| 8   | **Interactive Analytics Dashboard**                | ✅ Complete | Built with Recharts: Vehicle Mode breakdown (Pie), Commute Distance distribution (Bar), Decision Factors (Horizontal Bar), and Green Vehicle Transition Readiness (Rating distribution).                    |
| 9   | **PWA Compliance & Native Installation**           | ✅ Complete | Web App Manifest with `display: standalone`, high-res maskable icons (192x192, 512x512), Apple touch icons, and custom `beforeinstallprompt` installation banner.                                           |

---

## 3. TECHNICAL ARCHITECTURE & PROJECT STRUCTURE

```text
pwa-field-survey/
├── db/                         # Database DDL & Seed Scripts
│   ├── schema.sql              # Cloudflare D1 SQLite Schema (surveys, questions, options, responses, answers)
│   ├── seed.sql                # Initial Seed Data for Traffic Habits Survey
│   └── analytics_queries.sql   # SQL Aggregation Queries for KPI and Recharts Charts
├── functions/                  # Cloudflare Pages Functions (Edge Serverless Backend)
│   ├── api/
│   │   ├── [[route]].ts        # Hono Application Entrypoint mounted at /api/*
│   │   └── routes/
│   │       ├── questions.ts    # CRUD Endpoints for Survey Questions (no-store caching)
│   │       ├── sync.ts         # Batch Sync Endpoint with schema auto-migration
│   │       ├── analytics.ts    # Summary Aggregations Endpoint
│   │       └── export.ts       # Server-side CSV Export Endpoint (UTF-8 BOM)
│   └── types/env.ts            # Cloudflare D1 Bindings & Environment Interfaces
├── public/                     # Static PWA Assets
│   ├── icons/                  # High-DPI Brand Icons (192x192, 512x512, maskable, apple-touch-icon)
│   ├── manifest.webmanifest    # W3C Web App Manifest Configuration
│   └── favicon.ico
├── src/                        # Frontend Application Root
│   ├── components/
│   │   ├── admin/              # Question Manager Modal (Live Schema Sync)
│   │   ├── dashboard/          # Analytics KPI Cards, Pie & Bar Charts
│   │   ├── layout/             # Sticky Header, BottomNav, Install Banner, Offline Sync Banner
│   │   ├── records/            # Field Records Log (Sổ tay phiếu) with Accordion & Map Links
│   │   ├── survey/             # Dynamic Survey Wizard, QuestionCard, DynamicChoice, Rating, Slider
│   │   └── ui/                 # Reusable UI Primitives (Radix UI + Tailwind)
│   ├── db/dexie.ts             # Dexie.js Database Class & Schema Definition
│   ├── hooks/                  # Custom React Hooks (useOfflineSync, useGeolocation, useSurveyQuestions)
│   ├── lib/                    # Utilities (csv-exporter, icon-resolver, formatters)
│   └── types/                  # TypeScript Types & Interfaces
├── index.html                  # HTML5 Entry with Apple Touch Meta & Manifest Link
├── vite.config.ts              # Vite Bundler & Workbox PWA Plugin Configuration
└── wrangler.toml               # Cloudflare Pages & D1 Database Binding Configuration
```

### Architecture Highlights:

1. **Offline-First Persistence Flow:** All user actions (filling forms, submitting surveys, adding questions) write immediately to **Dexie IndexedDB** first. The user interface reactively updates via `useLiveQuery`, guaranteeing zero UI blocking even during complete network dropouts.
2. **Edge Synchronization Engine:** A batch-sync queue in `useOfflineSync` packages offline submissions with GPS coordinates, timestamps, and answer trees into `POST /api/sync/batch`. Transactions on Cloudflare D1 are executed in atomic batches with `INSERT OR IGNORE` idempotency.
3. **Data Protection & Exception Handling:** Backend routes incorporate defensive schema verification (`ensureD1Schema`, `ensureQuestionsSchema`) with automated non-destructive `ALTER TABLE` column migrations.

---

## 4. EMPIRICAL EVIDENCE & SCREENSHOTS

### Flow 1: Dynamic Survey Wizard with Geolocation & Star Rating

*The mobile wizard renders adaptive question inputs (e.g., 5-star sentiment rating with touch targets, numeric slider with direct keypad toggle) and a live GPS coordinate badge ($10.7769^\circ\text{ N}, 106.7009^\circ\text{ E}$). The bottom action bar maintains strict safe-area clearance above the bottom navigation bar.*

### Flow 2: Offline Field Records Notebook (Sổ Tay Phiếu)

*Displays collected survey records categorized into "Tất cả", "Chờ gửi (Trong máy)", and "Đã đồng bộ". Clicking a record opens an expandable accordion showing full question-answer breakdown, survey duration (e.g. 1m 24s), and a direct Google Maps location verification link.*

### Flow 3: Real-Time Analytics Dashboard

*Aggregates field survey submissions into visual KPI metrics, Vehicle Mode distribution pie chart, Daily Commute Distance distribution bar chart, Transportation Decision factors, and Green Transition Readiness distribution.*

### Flow 4: Dynamic Question Manager & UTF-8 BOM CSV Export

*Field supervisors can create new custom survey questions across 6 types that sync immediately to all devices. Field data can be downloaded as a CSV file that renders cleanly in Microsoft Excel with intact Vietnamese diacritics.*

---

## 5. TECHNICAL CHALLENGES & RESOLUTIONS

### Challenge 1: Service Worker / Cloudflare CDN Stale Cache Intercepting Live Dynamic Questions

* **Problem:** When administrators added or modified questions on the database, the mobile PWA client continued serving cached 5-question structures from a stale Workbox `api-questions-cache` and intermediate HTTP caches.
* **Resolution:** Removed `/api/questions` from the Service Worker CacheStorage runtime caching layer, delegating offline persistence exclusively to **IndexedDB (Dexie)**. Added `Cache-Control: no-store, no-cache, must-revalidate` headers to backend routes and integrated dynamic timestamp cache-busting (`&_t=${Date.now()}`) in client fetch requests.

### Challenge 2: Mobile Viewport Collision & Action Bar Clipping on 360px Screens

* **Problem:** On compact mobile screens (360px width), the sticky survey wizard bottom action button ("Kiểm tra tóm tắt") collided with the fixed Bottom Navigation bar, causing text truncation and overlapping touch targets.
* **Resolution:** Redesigned the wizard bottom bar with a dedicated `bottom-[64px]` clearance and increased main content container padding to `pb-44`. Compacted button labels to `Xem tóm tắt` with `whitespace-nowrap`, `min-w-0`, and responsive typography, guaranteeing 100% visibility across all phone form factors.
