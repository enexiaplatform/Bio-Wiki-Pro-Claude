# BioWikiPro — Báo cáo trạng thái & Kế hoạch phát triển

> **Mục đích:** Tài liệu bàn giao để một phiên Claude (cowork) tiếp tục lập kế hoạch và phát triển.
> **Ngày cập nhật:** 2026-05-29
> **Commit gần nhất:** `111c67b` — fix blank page (PostHog guard + ErrorBoundary)
> **Live:** https://bio-wiki-pro-claude.vercel.app — **đang hoạt động** (đã verify render thật trong browser)

---

## 1. Sản phẩm là gì

BioWikiPro là một **PWA mobile-first** phục vụ dân **QC/QA ngành Pharma/Biotech/Life Science tại Việt Nam**, mô hình **freemium**. Nội dung định hướng "director-level" về GMP, sterility testing, OOS/CAPA investigation, Annex 1, audit prep và career roadmap.

**Đối tượng:** Senior QC/QA muốn lên Supervisor/Manager; team chuẩn bị audit GMP.

**Định vị:** Viết bởi người có kinh nghiệm thực tế cả phía QC lẫn vendor (industrial microbiology) — framework áp dụng được ngay, không lý thuyết suông. Tập trung thị trường Pharma + F&B Việt Nam.

### Mô hình kiếm tiền (theo ROADMAP_PROMPTS.md)
| Sản phẩm | Giá | Loại | Trạng thái |
|---|---|---|---|
| Academy (48 bài học) | Miễn phí | — | ✅ Đã mở khoá toàn bộ |
| GMP Audit Survival Kit | $59 | one-time | ✅ Trang sản phẩm có; checkout cần verify |
| Career Starter Kit | $15 | one-time | ⚠️ Price ID config, chưa fulfillment |
| Interview Prep Pack | $20 | one-time | ⚠️ Như trên |
| Career Accelerator Bundle | $30 | one-time | ⚠️ Như trên |
| Pro Subscription | $8/tháng | subscription | ⚠️ Endpoint có, chưa hoàn thiện UX |

---

## 2. Kiến trúc (chi tiết xem `CLAUDE.md`)

- **Monorepo:** `client/` (React + Vite), `server/` (Express 5), `shared/` (types + API contract).
- **Frontend:** React 18, Wouter (routing), TanStack Query, shadcn/ui (new-york) + Radix, Tailwind (dark scientific palette), framer-motion.
- **Backend:** Express 5, Drizzle ORM + PostgreSQL, session auth (bcryptjs + connect-pg-simple), Stripe, Resend (email).
- **Deploy:** Vercel — `api/index.ts` là serverless entry (bọc Express), client build static ở `dist/public`. Cấu hình ở `vercel.json`.
- **Analytics:** PostHog (snippet trong `client/index.html` + hook `use-analytics.ts`).

### Routes (client, `client/src/App.tsx`)
`/` (Landing) · `/qc-hub` · `/academy` + `/academy/:slug` · `/insights` · `/tools` · `/compliance` · `/vault` · `/career` · `/solutions` · `/settings` · `/upgrade` · `/toolkits/gmp-audit-kit` · `/login` · `/register` + `/signup` · `/pricing` · `/payment/success` · `/terms` · `/privacy` · `/refund`

### API endpoints (`server/routes.ts`)
- `POST /api/auth/register`, `/login`, `/logout`; `GET /api/auth/me`
- `POST /api/stripe/create-checkout-session`; `GET /api/stripe/customer-portal`; `POST /api/stripe/webhook`
- `POST /api/leads/capture` (lead magnet)
- `POST /api/quotes` (quote request); `POST /api/users/toggle-pro`

---

## 3. Trạng thái dữ liệu (QUAN TRỌNG)

⚠️ **Phần lớn nội dung vẫn là mock data tĩnh**, không phải từ DB.

- Toàn bộ Term/Job/Product/LabTool/SOP/Skill/AcademyEntry đến từ `client/src/data/mockData.ts` (~120 records) qua hooks trong `use-data.ts` (giả lập latency bằng `setTimeout`).
- Nội dung chuyên sâu nằm ở `client/src/data/`: `lessons/microbiologyLessons.ts`, `compliance/auditBank.ts`, `scenarios/emScenarios.ts`, `tools/ccsBuilder.ts`, `tools/investigationTemplates.ts`.
- **Chỉ 2 luồng dùng DB thật:** lead capture (`leads` table) và auth/users + purchases. Bảng DB: `users`, `sessions`, `leads`, `quote_requests` (`shared/schema.ts` + `shared/models/auth.ts`).
- DB push trực tiếp (`npm run db:push`), không có migration files.

---

## 4. Hạ tầng & môi trường

- **Vercel project:** `bio-wiki-pro-claude` (team `enexiaplatforms-projects`).
- **GitHub:** `enexiaplatform/Bio-Wiki-Pro-Claude` (public), auto-deploy từ `main`.
- **Build verified:** `npm run check` (tsc) pass; `npm run build` pass. Client bundle ~758KB (gzip ~228KB).

### Env vars (xem `.env.example`)
Cần set trên Vercel để bật đầy đủ tính năng (hiện nhiều cái là placeholder):
- `DATABASE_URL` — PostgreSQL (auth, leads, purchases)
- `SESSION_SECRET`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VITE_STRIPE_PUBLISHABLE_KEY` + 5 price IDs
- `RESEND_API_KEY`, `EMAIL_FROM` + 5 `DOWNLOAD_*` links (giao sản phẩm)
- `VITE_POSTHOG_KEY` — **chưa set trên Vercel** (app vẫn chạy bình thường nếu thiếu, nhờ fix mới)

> Lưu ý: `VITE_*` được inline lúc **build**, không phải runtime. Đổi giá trị phải re-deploy.

---

## 5. Changelog phiên gần nhất (3 commit)

1. **`8accdb8`** — feat lớn: LeadMagnetBanner + `/api/leads/capture`; Resend email (welcome/purchase/lead magnet); PostHog analytics; mở khoá toàn bộ Academy; GMP Kit $59 CTA trong lesson; trang Terms/Privacy/Refund + Footer; SEO hooks (`use-seo.ts`), robots.txt, sitemap.xml.
2. **`e76e16e`** — fix: bỏ `drizzle-orm` khỏi `rollupOptions.external` trong client build (client import `@shared/schema` vốn dùng drizzle → external làm crash bundle).
3. **`111c67b`** — fix nguyên nhân thật của blank page: `capture()`/`identify()` guard `typeof window.posthog?.x === "function"` (stub PostHog chưa có method khi `init()` bị skip do thiếu key) + thêm `ErrorBoundary` bọc app.

**Bài học:** App không có error boundary nên 1 lỗi runtime nhỏ làm trắng toàn bộ trang. Giờ đã có lưới an toàn.

---

## 6. Nợ kỹ thuật & vấn đề đã biết

| # | Vấn đề | File | Mức độ |
|---|---|---|---|
| 1 | **Định nghĩa trùng lặp** trong schema: `LabTool`, `Skill`, `SOP` mỗi cái khai báo 2 lần (giống hệt); `ToolSection` và `LabToolSection` là 2 type alias trùng nội dung | `shared/schema.ts:114-173` | Trung bình — nên dọn |
| 2 | Bundle client 758KB (1 chunk, >500KB warning) — chưa code-split | `vite.config.ts` | Thấp-TB — ảnh hưởng tốc độ tải |
| 3 | Nội dung vẫn là mock data tĩnh, không quản lý qua CMS/DB | `client/src/data/` | Chiến lược — quyết định hướng |
| 4 | Stripe checkout/fulfillment: endpoint có nhưng cần verify flow end-to-end + xử lý webhook fulfillment (gửi file, unlock pro) | `server/routes.ts`, `email.ts` | Cao — chặn doanh thu |
| 5 | Không có test suite | — | TB |
| 6 | `npm run db:push` không có migration history — rủi ro khi production có data | `drizzle.config.ts` | TB |
| 7 | Nhiều env var trên Vercel có thể vẫn là placeholder → Stripe/email/DB có thể chưa chạy thật | Vercel settings | Cao — cần audit |

---

## 7. Trạng thái roadmap (theo `ROADMAP_PROMPTS.md`)

**PHASE 1 — Revenue-ready:** phần lớn đã làm
- ✅ Step 1 Signup route · ✅ Step 3 trang GMP Kit · ✅ Step 4 Landing · ✅ Step 5 SEO meta · ✅ Step 6 Footer + Legal
- ⚠️ Step 2 Stripe checkout — code có, **cần verify chạy thật + cấu hình price IDs/env trên Vercel**

**PHASE 2 — Foundation:** đã làm
- ✅ Step 7 Email transactional · ✅ Step 8 Lead magnet · ✅ Step 9 Analytics · ✅ Step 10 Academy free

**PHASE 3 — Growth:** chưa làm
- ⬜ Step 11 Blog/SEO content hub · ⬜ Step 12 In-app upgrade prompts · ⬜ Step 13 Digital product delivery · ⬜ Step 14 Performance · ⬜ Step 15 Vercel prod config (một phần đã có)

---

## 8. Đề xuất ưu tiên phát triển tiếp

### P0 — Chốt doanh thu (không có cái này thì app không kiếm được tiền)
1. **Audit env vars trên Vercel** — xác nhận DATABASE_URL, Stripe keys + price IDs, Resend đều là giá trị thật, không phải placeholder.
2. **Verify Stripe checkout end-to-end** ở test mode: click mua → Checkout → success page → webhook `checkout.session.completed` → fulfillment (gửi email kèm `DOWNLOAD_*` link, ghi `createPurchase`, unlock nếu là Pro).
3. **Kiểm tra lead magnet thật:** submit email → lưu `leads` → gửi `sendLeadMagnetEmail` với link checklist.

### P1 — Ổn định & chất lượng
4. Dọn nợ kỹ thuật #1 (xoá định nghĩa trùng trong `shared/schema.ts`).
5. Code-split bundle (lazy-load route bằng `React.lazy` + dynamic import) để giảm 758KB.
6. Thêm migration discipline cho Drizzle trước khi có data production thật.

### P2 — Tăng trưởng
7. Step 11 — Blog/SEO content hub (kéo organic traffic — đây là kênh chính cho B2B niche này).
8. Step 12 — In-app upgrade prompts để convert free → paid.
9. Cân nhắc đưa nội dung từ mock data → CMS/DB để team non-dev cập nhật được.

---

## 9. Câu hỏi mở cho team (cần người quyết)
- Nội dung nên ở mock data, file markdown, hay CMS/DB? (ảnh hưởng kiến trúc data layer)
- Pro subscription $8/tháng có làm ngay phase này không, hay chỉ bán one-time kits trước?
- Thị trường: chỉ Việt Nam (nội dung tiếng Việt) hay song ngữ để mở rộng?
- Domain riêng (thay vì *.vercel.app) — đã có kế hoạch chưa? (ảnh hưởng SEO, email deliverability)

---

## 10. Lệnh thường dùng
```bash
npm run dev        # Express + Vite HMR, port 5000
npm run check      # type-check (tsc)
npm run build      # build client (vite) + server (esbuild) → dist/
npm start          # chạy production build
npm run db:push    # push schema lên DB (không có migration file)
```
Không có `npm test` (chưa có test suite).
