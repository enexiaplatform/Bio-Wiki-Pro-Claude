# Stripe — Hướng dẫn test luồng mua one-time end-to-end

> Mục tiêu: verify luồng `checkout → payment → webhook → ghi DB + gửi email kèm link download` chạy thật ở **Stripe Test Mode**, trên local.

## 0. Catalog sản phẩm (single source of truth: `server/products.ts`)

| productType (metadata) | Tên | Giá | Mode | Price ID env | Download env |
|---|---|---|---|---|---|
| `gmp_audit_kit` | GMP Audit Survival Kit | $59 | payment | `STRIPE_GMP_AUDIT_KIT_PRICE_ID` | `DOWNLOAD_GMP_AUDIT_KIT` |
| `career_blueprint` | Personal Career Blueprint | $20 | payment | `STRIPE_CAREER_BLUEPRINT_PRICE_ID` | _(generated securely from the user's saved assessment)_ |
| `starter_kit` | Career Starter Kit | $15 | payment | `STRIPE_STARTER_KIT_PRICE_ID` | `DOWNLOAD_STARTER_KIT` |
| `interview_prep` | Interview Prep Package | $20 | payment | `STRIPE_INTERVIEW_PREP_PRICE_ID` | `DOWNLOAD_INTERVIEW_PREP` |
| `bundle` | Career Accelerator Bundle | $30 | payment | `STRIPE_BUNDLE_PRICE_ID` | `DOWNLOAD_BUNDLE` |
| `pro_subscription` | Life Science Atlas Pro | — | subscription | `STRIPE_PRO_PRICE_ID` | _(không có file — unlock entitlement)_ |

Thêm/sửa sản phẩm → chỉ sửa `server/products.ts`. `routes.ts` (price + mode) và `email.ts` (tên + download) đều đọc từ đây.

---

## 1. Yêu cầu trước khi test

1. **Stripe CLI** — cài: https://stripe.com/docs/stripe-cli
   ```bash
   stripe login   # đăng nhập tài khoản (test mode)
   ```
2. **Tạo Products + Prices ở Test Mode** (Stripe Dashboard → Test mode → Products), mỗi sản phẩm 1 price one-time:
   - GMP Audit Survival Kit — $59.00 · Personal Career Blueprint — $20.00 · Career Starter Kit — $15.00 · Interview Prep Package — $20.00 · Career Accelerator Bundle — $30.00
   - Copy mỗi **Price ID** (`price_...`) vào `.env` đúng biến ở bảng trên.
3. **`.env`** cần (test mode):
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...        # lấy ở bước 3 bên dưới
   STRIPE_GMP_AUDIT_KIT_PRICE_ID=price_...
   STRIPE_CAREER_BLUEPRINT_PRICE_ID=price_...
   STRIPE_STARTER_KIT_PRICE_ID=price_...
   STRIPE_INTERVIEW_PREP_PRICE_ID=price_...
   STRIPE_BUNDLE_PRICE_ID=price_...
   DATABASE_URL=postgres://...            # cần để ghi purchase + login
   BASE_URL=http://localhost:5000
   RESEND_API_KEY=re_...                  # optional — thiếu thì email chỉ log ra console
   DOWNLOAD_GMP_AUDIT_KIT=https://...     # link file thật (nếu thiếu, email báo "gửi trong 24h")
   DOWNLOAD_STARTER_KIT=https://...
   DOWNLOAD_INTERVIEW_PREP=https://...
   DOWNLOAD_BUNDLE=https://...
   ```

> Endpoint `create-checkout-session` **yêu cầu đăng nhập** (`isAuthenticated`) — phải có user + session. Test cần register/login trước.

---

## 2. Chạy app

```bash
npm run dev      # http://localhost:5000
```

## 3. Mở webhook forwarding (terminal riêng)

```bash
stripe listen --forward-to localhost:5000/api/stripe/webhook
```
- CLI in ra `whsec_...` → copy vào `STRIPE_WEBHOOK_SECRET` trong `.env` rồi **restart `npm run dev`**.
- Giữ terminal này chạy suốt khi test.

---

## 4. Test end-to-end

### A. Qua UI
1. Đăng ký/đăng nhập tại `/register` hoặc `/login`.
2. Vào trang sản phẩm (vd `/toolkits/gmp-audit-kit` hoặc `/pricing`/`/career`) → click nút mua.
3. Bị redirect tới Stripe Checkout → nhập **thẻ test**:
   - Số thẻ: `4242 4242 4242 4242`
   - Hết hạn: bất kỳ ngày tương lai (vd `12/34`) · CVC: bất kỳ 3 số · ZIP: bất kỳ
4. Thanh toán xong → redirect về `/payment/success?session_id=...`.

### B. Hoặc test checkout API trực tiếp (đã login, có cookie session)
```bash
curl -X POST http://localhost:5000/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -b "connect.sid=<session-cookie>" \
  -d '{"productType":"gmp_audit_kit"}'
# → { "url": "https://checkout.stripe.com/..." }  → mở url, trả bằng thẻ 4242
```

### C. Hoặc trigger webhook không cần UI
```bash
stripe trigger checkout.session.completed
```
> Lưu ý: event do `trigger` tạo có thể **không có** `metadata.userId/productType` → handler trả 400 (đúng spec). Để test fulfillment thật, dùng luồng A/B (checkout thật sinh metadata).

---

## 5. Verify (checklist nghiệm thu)

Sau khi thanh toán bằng thẻ 4242:

- [ ] **Stripe CLI** (terminal `stripe listen`) hiện `checkout.session.completed` → forward tới `/api/stripe/webhook` trả **`200`** (`{ received: true }`).
- [ ] **Log server** không có "Webhook signature verification failed" / "Missing metadata".
- [ ] **DB** — bảng `purchases` có 1 dòng mới: `product_type` đúng, `status='completed'`, `amount` = giá (cents, vd `5900`), `stripe_session_id` set.
  ```sql
  SELECT product_type, amount, status, stripe_session_id FROM purchases ORDER BY created_at DESC LIMIT 5;
  ```
- [ ] **Email** — nếu `RESEND_API_KEY` set: nhận email "Xác nhận đơn hàng" kèm link tải đúng `DOWNLOAD_*` của sản phẩm. Nếu chưa set: log server in `[Email] Would send purchase confirmation to ...`.
- [ ] **Redirect** — trình duyệt về `/payment/success`.
- [ ] Lặp lại cho cả 4 sản phẩm → mỗi cái ra đúng price + đúng link download.

### Trường hợp lỗi cần test thêm
- `productType` sai → `create-checkout-session` trả **400** "Invalid productType or missing price configuration".
- Chưa cấu hình Stripe (`STRIPE_SECRET_KEY` rỗng) → endpoint trả **503**.
- Thẻ bị từ chối: `4000 0000 0000 0002` (generic decline).

---

## 6. Lưu ý production (Vercel)
- Webhook production: tạo endpoint ở Stripe Dashboard trỏ tới `https://<domain>/api/stripe/webhook`, lấy `whsec_...` thật set vào Vercel env (KHÁC với secret của `stripe listen`).
- ⚠️ **Phải subscribe đủ 6 event** (không chỉ `checkout.session.completed`) nếu không vòng đời subscription/dunning sẽ hỏng âm thầm: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.payment_succeeded`. Xem `docs/GO_LIVE.md` §2b.
- `BASE_URL` phải = domain thật (không để localhost) — quyết định success/cancel URL.
- Đổi `VITE_*` phải re-deploy; Stripe/Resend/DB là runtime nên chỉ cần cập nhật env + redeploy function.
- Đối chiếu đầy đủ env: xem `docs/ENV_AUDIT.md`.
