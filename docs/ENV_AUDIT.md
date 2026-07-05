# Life Science Atlas — Environment Variable Audit

> **Mục đích:** Checklist kiểm kê toàn bộ biến môi trường app cần, để đối chiếu giá trị thật trên Vercel (real vs placeholder).
> **Ngày:** 2026-05-29 · **Phương pháp:** quét mọi `process.env.*` trong `server/` và `import.meta.env.*` trong `client/`, đối chiếu `.env.example`.

## Cách đọc bảng
- **Build-time (`VITE_*`)** = inline vào bundle lúc `npm run build`. **Đổi giá trị BẮT BUỘC re-deploy.** Không phải secret (lộ ra client).
- **Runtime** = đọc lúc server chạy. Đổi chỉ cần restart/redeploy function, không cần rebuild client.
- Hầu hết biến có **fallback** trong code → thiếu biến app không crash, nhưng **placeholder sẽ tạo hành vi sai âm thầm** (link hỏng, email sai, checkout lỗi).

---

## 1. Database

| Biến | Dùng ở đâu | Bắt buộc cho | Build/Runtime | Ghi chú |
|---|---|---|---|---|
| `DATABASE_URL` | `server/db.ts:6`, `server/routes.ts:30,32` (session store) | Auth, leads, purchases, session persistence | Runtime | Postgres. Thiếu → session fallback về memory (mất session khi function cold-start). Drizzle dùng `db:push` (không migration). |

---

## 2. Auth & Core

| Biến | Dùng ở đâu | Bắt buộc cho | Build/Runtime | Ghi chú |
|---|---|---|---|---|
| `SESSION_SECRET` | `server/routes.ts:41` | Ký session cookie (login) | Runtime | Có fallback `"default_secret"` — **production phải set giá trị mạnh, ngẫu nhiên**. |
| `BASE_URL` | `server/routes.ts:236,266`, `server/email.ts:8` | Stripe success/cancel/return URL, link trong email | Runtime | Fallback: `http://localhost:5000` (routes) / `https://lifescienceatlas.com` (email). **Phải set = domain production thật** nếu không Stripe redirect/email link sẽ trỏ về localhost. |
| `NODE_ENV` | `server/routes.ts:47` (cookie secure), `server/index.ts:82` | Cookie `secure`, chế độ chạy | Runtime | Thường do platform set (`production` trên Vercel). Không cần khai báo thủ công. |
| `PORT` | `server/index.ts:93` | Cổng server (chỉ local/self-host) | Runtime | Vercel serverless tự quản; chỉ liên quan local. |

> `NODE_ENV` và `PORT` **không có trong `.env.example`** vì do platform quản lý — liệt kê ở đây cho đủ.

---

## 3. Stripe (thanh toán)

| Biến | Dùng ở đâu | Bắt buộc cho | Build/Runtime | Ghi chú |
|---|---|---|---|---|
| `STRIPE_SECRET_KEY` | `server/routes.ts:11,12` | Mọi tính năng Stripe (checkout, portal, webhook) | Runtime | Thiếu → `stripe = null`, các endpoint trả `503`. Dùng `sk_test_...` khi test. |
| `STRIPE_WEBHOOK_SECRET` | `server/routes.ts:71,83` | Verify chữ ký webhook `checkout.session.completed` / `subscription.deleted` | Runtime | Thiếu → webhook trả `503` → **không unlock Pro / không ghi purchase / không gửi email mua hàng**. |
| `STRIPE_PRO_PRICE_ID` | `server/routes.ts:18` (PRICE_MAP `pro_subscription`) | Checkout gói Pro subscription | Runtime | Phải là Price ID thật từ Stripe Dashboard. |
| `STRIPE_STARTER_KIT_PRICE_ID` | `server/routes.ts:19` (`starter_kit`) | Checkout Career Starter Kit | Runtime | — |
| `STRIPE_INTERVIEW_PREP_PRICE_ID` | `server/routes.ts:20` (`interview_prep`) | Checkout Interview Prep | Runtime | — |
| `STRIPE_BUNDLE_PRICE_ID` | `server/routes.ts:21` (`bundle`) | Checkout Career Bundle | Runtime | — |
| `STRIPE_GMP_AUDIT_KIT_PRICE_ID` | `server/routes.ts:22` (`gmp_audit_kit`) | Checkout GMP Audit Kit ($59) | Runtime | — |
| `VITE_STRIPE_PUBLISHABLE_KEY` | _(khai báo trong `.env.example:6` nhưng **KHÔNG dùng** trong client code)_ | — | **Build-time** | ⚠️ **Hiện không được tham chiếu ở đâu.** Checkout là redirect-based (server tạo session → client redirect tới `session.url`), không cần publishable key ở client. Set nếu sau này dùng Stripe.js/Elements; còn không thì là dead config. |

> 5 price IDs: thiếu cái nào → `productType` tương ứng trả `400 Invalid productType` ở `create-checkout-session`.

---

## 4. Email / Resend (transactional + lead magnet)

| Biến | Dùng ở đâu | Bắt buộc cho | Build/Runtime | Ghi chú |
|---|---|---|---|---|
| `RESEND_API_KEY` | `server/email.ts:3,4` | Mọi email (welcome, purchase confirmation, lead magnet) | Runtime | Thiếu → `resend = null`, email bị bỏ qua âm thầm (không gửi, không lỗi). |
| `EMAIL_FROM` | `server/email.ts:7` | Địa chỉ "From" của email | Runtime | Fallback `onboarding@resend.dev`. Production nên dùng domain đã verify trên Resend. |

### Download links (5 biến `DOWNLOAD_*`)

| Biến | Dùng ở đâu | Bắt buộc cho | Build/Runtime | Ghi chú |
|---|---|---|---|---|
| `DOWNLOAD_GMP_AUDIT_KIT` | `server/email.ts:21` | Giao file sau khi mua GMP Audit Kit | Runtime | Fallback link placeholder → khách nhận **link hỏng** nếu chưa set. |
| `DOWNLOAD_STARTER_KIT` | `server/email.ts:22` | Giao file Career Starter Kit | Runtime | Như trên. |
| `DOWNLOAD_INTERVIEW_PREP` | `server/email.ts:23` | Giao file Interview Prep | Runtime | Như trên. |
| `DOWNLOAD_BUNDLE` | `server/email.ts:24` | Giao file Career Bundle | Runtime | Như trên. |
| `DOWNLOAD_GMP_CHECKLIST` | `server/routes.ts:315` | Link checklist trong email **lead magnet** (không phải mua hàng) | Runtime | Khác 4 link trên: dùng ở luồng `/api/leads/capture`, không có trong map của `email.ts`. |

---

## 5. Analytics

| Biến | Dùng ở đâu | Bắt buộc cho | Build/Runtime | Ghi chú |
|---|---|---|---|---|
| `VITE_POSTHOG_KEY` | `client/src/hooks/use-analytics.ts:15` | Tracking PostHog (page_view, lead_captured, …) | **Build-time** ⚠️ | Inline lúc build → **đổi phải re-deploy**. Thiếu → `initPostHog()` skip, không track (app vẫn chạy bình thường sau fix guard ở commit `111c67b`). PostHog snippet trong `client/index.html` chỉ tạo stub; key thật truyền qua `init()` trong hook này. |

---

## Tổng kết & cảnh báo

- **Biến build-time (`VITE_*`) — đổi PHẢI re-deploy:** `VITE_POSTHOG_KEY` (đang dùng), `VITE_STRIPE_PUBLISHABLE_KEY` (khai báo nhưng chưa dùng).
- **Tất cả còn lại là runtime.**
- **Chặn doanh thu nếu là placeholder:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, 5 price IDs, `BASE_URL`, `RESEND_API_KEY`, 5 `DOWNLOAD_*`.
- **Rủi ro âm thầm (không báo lỗi nhưng sai):** mọi biến có fallback — đặc biệt `DOWNLOAD_*` (link placeholder), `EMAIL_FROM`, `BASE_URL`, `SESSION_SECRET` (default yếu).
- **Discrepancy phát hiện được:**
  1. `VITE_STRIPE_PUBLISHABLE_KEY` có trong `.env.example` nhưng không tham chiếu ở client → dead config (hoặc thiếu tích hợp Stripe.js dự kiến).
  2. `NODE_ENV`, `PORT` được code dùng nhưng không có trong `.env.example` (do platform quản lý — chấp nhận được).

### Tổng số biến cần đối chiếu trên Vercel
**18 biến app dùng thật** (chưa kể `NODE_ENV`/`PORT` do platform set): DATABASE_URL · SESSION_SECRET · BASE_URL · STRIPE_SECRET_KEY · STRIPE_WEBHOOK_SECRET · 5×STRIPE_*_PRICE_ID · RESEND_API_KEY · EMAIL_FROM · 5×DOWNLOAD_* · VITE_POSTHOG_KEY. (+`VITE_STRIPE_PUBLISHABLE_KEY` nếu muốn giữ cho tương lai.)
