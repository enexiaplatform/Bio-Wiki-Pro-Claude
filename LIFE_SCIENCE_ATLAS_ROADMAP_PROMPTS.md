# Life Science Atlas — Claude Code Roadmap Prompts
> Copy từng prompt bên dưới vào Claude Code. Làm theo thứ tự. Mỗi step là một session độc lập.

---

## PHASE 1 — REVENUE-READY (Tuần 1–2)
> Mục tiêu: App có thể nhận tiền thật từ người dùng thật.

---

### STEP 1 — Fix Signup Route (404)

```
Bạn đang làm việc trên Life Science Atlas — một React + Express app (Wouter routing, shadcn/ui, Tailwind).

VẤN ĐỀ: Route /signup đang trả về 404. File RegisterPage.tsx tồn tại ở client/src/pages/RegisterPage.tsx nhưng chưa được đăng ký trong router.

LÀM:
1. Mở client/src/App.tsx, tìm phần định nghĩa routes Wouter, thêm route /signup → RegisterPage và /register → redirect về /signup
2. Kiểm tra RegisterPage.tsx: form phải có các field email, password, confirm password. Nếu form chưa đầy đủ, hoàn thiện nó với validation (zod + react-hook-form đã có sẵn)
3. Đảm bảo link "Sign up" trên LoginPage.tsx trỏ đúng về /signup
4. POST /api/auth/register phải xử lý được request từ form — kiểm tra server/routes.ts và server/storage.ts, đảm bảo endpoint tồn tại và hash password với bcryptjs (đã installed)
5. Sau đăng ký thành công: redirect về /qc-hub và set session

KHÔNG làm: Đừng thay đổi design, đừng thêm tính năng mới. Chỉ fix flow đăng ký end-to-end.

Sau khi xong: chạy npm run dev, test thủ công flow signup → login → /qc-hub
```

---

### STEP 2 — Tích hợp Stripe Checkout thật

```
Bạn đang làm việc trên Life Science Atlas — React + Express app. Stripe đã được cài (package stripe và @stripe/stripe-js có trong package.json).

VẤN ĐỀ: Các nút "Start Pro", "Get Access", "Buy Bundle" trên trang /pricing và /career hiện không làm gì khi click — không có Stripe Checkout, không có error.

MÔ HÌNH SẢN PHẨM CẦN IMPLEMENT:
- GMP Audit Survival Kit: $59 one-time (sẽ thêm ở Step 3)
- Career Starter Kit: $15 one-time
- Interview Prep Pack: $20 one-time  
- Career Accelerator Bundle: $30 one-time
- Pro Subscription: $8/month (DEFER — chưa làm bước này)

LÀM:
1. Tạo file .env.example cập nhật với: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, VITE_STRIPE_PUBLISHABLE_KEY
2. Trong server/routes.ts: thêm POST /api/checkout/create-session. Nhận body { priceId, productName, amount, mode } (mode = "payment" cho one-time). Tạo Stripe Checkout Session với success_url=/payment-success?session_id={CHECKOUT_SESSION_ID} và cancel_url=/pricing. Trả về { url } để redirect
3. Trong server/routes.ts: thêm POST /api/webhooks/stripe để handle checkout.session.completed — log ra console (fulfillment logic làm sau)
4. Trong client/src/pages/Career.tsx: các nút Buy Now gọi POST /api/checkout/create-session rồi redirect về Stripe url. Hiện thị loading state khi đang gọi API
5. Trong client/src/pages/PricingPage.tsx: tương tự cho nút Pro subscription (dùng mode="subscription" — cần tạo Product + Price trên Stripe dashboard trước)
6. Trang PaymentSuccessPage.tsx đã tồn tại — đảm bảo route /payment-success được đăng ký trong App.tsx và trang này hiển thị message thành công

LƯU Ý QUAN TRỌNG: Dùng Stripe Test Mode. STRIPE_SECRET_KEY phải là key sk_test_... — không dùng live key. Hướng dẫn user tạo Products trên Stripe Dashboard (test mode) và điền price ID vào code.

KHÔNG làm: Đừng implement fulfillment logic (gửi file, unlock pro). Chỉ cần Checkout Session hoạt động và redirect đúng.
```

---

### STEP 3 — Tạo trang sản phẩm GMP Audit Survival Kit

```
Bạn đang làm việc trên Life Science Atlas — React + Express app (Wouter routing, shadcn/ui, Tailwind, dark theme).

MỤC TIÊU: Tạo landing page cho sản phẩm "GMP Audit Survival Kit" — đây là sản phẩm revenue chính $59 one-time, nhắm vào Senior QC/QA Engineer trong ngành Pharma/F&B Vietnam đang chuẩn bị cho GMP audit.

LÀM:
1. Tạo file client/src/pages/GMPAuditKit.tsx — đây là một-trang landing page đầy đủ với:

   HERO SECTION:
   - Headline: "Sống sót qua GMP Audit — Không cần đoán mò"
   - Sub: "Bộ công cụ hoàn chỉnh cho Senior QC/QA: SOP gap analysis, CAPA templates, audit interview scripts — sẵn sàng dùng ngay."
   - CTA button "Mua ngay — $59" (gọi Stripe Checkout)
   - Badge: "One-time payment • Lifetime access • Instant download"

   PAIN POINTS SECTION (3 cards):
   - "Audit đến trong 2 tuần, không biết bắt đầu từ đâu?"
   - "SOP của team thiếu sót, không biết gap nào cần vá gấp?"
   - "Auditor hỏi khó, team không biết trả lời thế nào?"

   WHAT'S INCLUDED (list rõ ràng):
   - 40-trang PDF Guide: GMP Audit Survival Framework
   - Excel: SOP Gap Analysis Template (tự động tính % compliance)
   - 10 CAPA Report Templates (ready-to-fill)
   - Audit Interview Q&A Scripts (50+ câu hỏi thường gặp)
   - Bonus: 30-min consultation call với Henry (QC Sales Expert)

   SOCIAL PROOF placeholder:
   - 3 testimonial cards (dùng placeholder text "QC Manager, Sanofi Vietnam" — sẽ điền thật sau)

   PRICING SECTION:
   - $59 one-time, strike-through "$120 nếu mua riêng lẻ"
   - 30-day money-back guarantee badge
   - CTA button lớn

   FAQ (5 câu): 
   - Phù hợp với tiêu chuẩn nào? (GMP WHO, Annex 1 EU, ISO 15189, FSSC 22000)
   - Sau khi mua nhận file bằng cách nào?
   - Có áp dụng được cho F&B không?
   - Tôi là QC mới có dùng được không?
   - Chính sách hoàn tiền?

2. Đăng ký route /toolkits/gmp-audit-kit trong App.tsx
3. Thêm link vào Navigation — tab "Toolkits" mới giữa Academy và Career (chỉ hiển thị link, không cần Pro gate)

STYLE: Giữ đúng dark theme hiện tại, dùng shadcn/ui components, accent color xanh lá/teal của app. Button CTA màu accent nổi bật. Page này phải trông professional, không như demo.

KHÔNG làm: Đừng implement file delivery. Đừng thay đổi các page khác.
```

---

### STEP 4 — Landing Page tại root `/`

```
Bạn đang làm việc trên Life Science Atlas. Hiện tại / tự redirect về /qc-hub — không có landing page. Người lạ vào domain không hiểu app này là gì.

MỤC TIÊU: Tạo landing page standalone tại / cho đối tượng Senior QC/QA Engineer Vietnam (3-7 năm kinh nghiệm, muốn lên Supervisor/Manager).

LÀM:
1. Tạo client/src/pages/LandingPage.tsx với các section:

   HERO:
   - Headline: "Nền tảng kiến thức cho QC/QA Pharma chuyên nghiệp"
   - Sub: "Từ GMP audit tools đến career roadmap — mọi thứ bạn cần để lên cấp từ Senior QC → QA Manager"
   - 2 CTA: "Khám phá miễn phí" (→ /academy) và "Xem GMP Audit Kit" (→ /toolkits/gmp-audit-kit, button accent)
   - Stats row: "48 bài học chuyên sâu • 7 modules • 500+ QC/QA professionals"

   PROBLEM SECTION:
   - "Bạn đã có 3-5 năm kinh nghiệm QC. Nhưng..."
   - 3 pain points: audit stress, career plateau, thiếu structured knowledge

   SOLUTION SECTION:
   - 3 cards: Academy (free knowledge), GMP Audit Kit (tools), Career Hub (pathway)

   FEATURED PRODUCT (full-width banner):
   - GMP Audit Survival Kit $59 — brief description + CTA

   TRUST SECTION:
   - "Built by someone who's been on both sides of audits" — Henry's credibility blurb (QC background + vendor-side audit experience)

   FINAL CTA:
   - "Bắt đầu miễn phí" → /academy

2. Trong App.tsx: thay redirect "/" → "/qc-hub" thành render <LandingPage />. Giữ nguyên /qc-hub vẫn accessible.
3. Navigation: thêm logo/brand name click về / thay vì /qc-hub

STYLE: Giữ dark theme. Đây là page quan trọng nhất — làm đẹp, professional. Dùng framer-motion (đã installed) cho subtle animations ở hero.

KHÔNG thay đổi: các page khác, routing của các module hiện tại.
```

---

### STEP 5 — SEO Meta Tags cho mọi route

```
Bạn đang làm việc trên Life Science Atlas — React SPA (Vite, Wouter). Hiện tại document.title rỗng trên mọi route, không có meta description, không có OG tags.

LÀM:
1. Tạo hook client/src/hooks/use-seo.ts:
   - Nhận { title, description, ogImage? }
   - Set document.title = `${title} | Life Science Atlas`
   - Set/update <meta name="description"> 
   - Set/update <meta property="og:title">, og:description, og:url
   - Cleanup khi unmount

2. Áp dụng useSEO() vào từng page với nội dung phù hợp:
   - LandingPage: "Nền tảng kiến thức QC/QA Pharma | Life Science Atlas" / "48 bài học GMP, audit tools và career roadmap cho QC/QA professionals Vietnam"
   - QCHub: "QC Hub — Kiến thức Microbiology QC | Life Science Atlas" / "15 chủ đề từ USP <61>, Annex 1, môi trường kiểm soát đến CAPA"
   - Academy: "Academy — Học QC/QA Pharma chuyên sâu | Life Science Atlas" / "48 bài học director-level về GMP, sterility testing, OOS investigation"
   - GMPAuditKit: "GMP Audit Survival Kit $59 | Life Science Atlas" / "Bộ công cụ hoàn chỉnh: SOP gap analysis, CAPA templates, audit scripts cho Senior QC/QA Pharma Vietnam"
   - Career: "Career Hub QC/QA Pharma Vietnam | Life Science Atlas" / "Lộ trình từ QC Analyst đến QA Manager — salary, skills, employers Vietnam"
   - LoginPage: "Đăng nhập | Life Science Atlas"
   - RegisterPage: "Đăng ký miễn phí | Life Science Atlas"

3. Trong index.html (Vite root): thêm default meta tags làm fallback:
   - <title>Life Science Atlas — Nền tảng kiến thức QC/QA Pharma Vietnam</title>
   - <meta name="description" content="...">
   - <link rel="canonical" href="https://lifescienceatlas.com">
   - Open Graph tags cơ bản

4. Thêm robots.txt vào public/ folder: Allow all, Sitemap: .../sitemap.xml
5. Tạo public/sitemap.xml đơn giản với các URL chính (static, không cần generate động)

KHÔNG thay đổi: logic, styling, data của bất kỳ component nào.
```

---

### STEP 6 — Footer + Trang Legal

```
Bạn đang làm việc trên Life Science Atlas. Hiện tại không có footer, không có trang Terms/Privacy/Refund — đây là yêu cầu bắt buộc để kích hoạt Stripe live mode.

LÀM:
1. Tạo component client/src/components/Footer.tsx:
   - 3 cột: "Life Science Atlas" (logo + tagline + copyright 2026), "Sản phẩm" (links: Academy, QC Hub, GMP Audit Kit, Career Hub), "Pháp lý" (links: Terms of Service, Privacy Policy, Refund Policy)
   - Background tối hơn main, border-top mỏng
   - Mobile: stack thành 1 cột

2. Thêm <Footer /> vào layout chính (client/src/App.tsx hoặc Layout component nếu có) — hiển thị trên mọi page TRỪ LandingPage (landing page có footer riêng inline)

3. Tạo 3 trang legal (plain text, không cần fancy design, chỉ cần readable):

   client/src/pages/TermsPage.tsx — Terms of Service:
   - Effective date: June 2026
   - Mô tả service (educational platform, not regulatory advice)
   - Điều khoản mua hàng, refund policy reference
   - Prohibited uses
   - Limitation of liability
   - Governing law: Vietnam

   client/src/pages/PrivacyPage.tsx — Privacy Policy:
   - Data collected: email, name, payment info (via Stripe — không store thẻ)
   - How used: deliver service, send receipts
   - Third parties: Stripe (payments), Vercel (hosting)
   - User rights: delete account, export data
   - Contact: email Henry

   client/src/pages/RefundPage.tsx — Refund Policy:
   - Digital products: 30-day money-back guarantee, no questions asked
   - Cách request: email trong 30 ngày
   - Processing time: 5-10 business days

4. Đăng ký 3 routes: /terms, /privacy, /refund trong App.tsx

STYLE: Dùng prose layout, đơn giản. Max-width 700px, padding đủ để readable. Không cần sidebar hay navigation phức tạp.
```

---

## PHASE 2 — FOUNDATION (Tuần 3–4)
> Mục tiêu: Auth bền vững, email hoạt động, lead magnet đầu tiên, analytics.

---

### STEP 7 — Email Transactional (Welcome + Receipt)

```
Bạn đang làm việc trên Life Science Atlas — Express 5 backend. 

MỤC TIÊU: Gửi email tự động khi user đăng ký và khi mua hàng thành công.

LÀM:
1. Cài đặt Resend: npm install resend (đây là email API đơn giản nhất, free tier 3000 emails/month)
2. Thêm RESEND_API_KEY vào .env.example
3. Tạo server/email.ts với các hàm:
   - sendWelcomeEmail(to: string, name: string): "Chào mừng đến Life Science Atlas — bắt đầu với Academy"
   - sendPurchaseConfirmation(to: string, productName: string, amount: number): receipt + hướng dẫn nhận file
   - sendDownloadLink(to: string, productName: string, downloadUrl: string): link download sản phẩm

4. Trong POST /api/auth/register: gọi sendWelcomeEmail sau khi tạo user thành công
5. Trong POST /api/webhooks/stripe, khi event checkout.session.completed:
   - Lấy customer email từ session
   - Gọi sendPurchaseConfirmation
   - Log ra DB (bảng purchases nếu có, hoặc chỉ log console)

6. Template email: dùng plain HTML đơn giản, dark background (#0f1117), text trắng, button accent teal. Không cần template engine phức tạp — string literal HTML là đủ.

LƯU Ý: Resend cần verify domain để gửi từ custom domain. Trong dev/test: dùng onboarding@resend.dev làm from address. Production: cần thêm DNS record cho domain sau.

KHÔNG làm: Đừng implement file delivery system phức tạp. Download link tạm thời có thể là Google Drive link hardcode — sẽ nâng cấp sau.
```

---

### STEP 8 — Lead Magnet: Email Capture + Free Checklist

```
Bạn đang làm việc trên Life Science Atlas.

MỤC TIÊU: Thu email của người dùng chưa đăng ký bằng cách offer free "GMP Audit Checklist" PDF — đây là bước đầu tiên của funnel GMP Audit Kit.

LÀM:
1. Tạo component client/src/components/LeadMagnetBanner.tsx:
   - Design: banner nổi bật (không popup), đặt ở đầu trang Academy và QC Hub
   - Text: "🎁 Tải miễn phí: GMP Audit Quick Checklist (PDF) — 25 điểm kiểm tra trước ngày audit"
   - Form: input email + button "Nhận ngay"
   - Submit → POST /api/leads/capture
   - Success state: "Đã gửi! Kiểm tra email của bạn."
   - Nếu user đã đăng nhập: ẩn banner

2. Trong server/routes.ts: thêm POST /api/leads/capture
   - Nhận { email }
   - Validate email format
   - Save vào DB (tạo bảng leads: id, email, source, created_at)
   - Gọi sendDownloadLink với link Google Drive của file checklist
   - Trả về { success: true }

3. Trong shared/schema.ts: thêm Drizzle table định nghĩa cho leads
4. Chạy npm run db:push để tạo bảng

5. Tạo nội dung file GMP Audit Quick Checklist (text để điền vào Google Doc/PDF):
   - 25 checklist items chia làm 5 nhóm: Documentation, Personnel, Equipment, Environment, Records
   - Mỗi item: checkbox + mô tả ngắn + reference (GMP WHO / Annex 1 / ISO)
   - Footer: "Full toolkit tại lifescienceatlas.com/toolkits/gmp-audit-kit"
   Xuất nội dung này ra file docs/gmp-audit-checklist-content.md để Henry dùng tạo PDF.

KHÔNG làm: Đừng dùng third-party email marketing platform (Mailchimp, etc.) ở bước này. Chỉ dùng Resend để gửi file.
```

---

### STEP 9 — Analytics: Track Key Events

```
Bạn đang làm việc trên Life Science Atlas — React + Vite frontend.

MỤC TIÊU: Cài analytics để biết user đang làm gì — đặc biệt là funnel checkout.

LÀM:
1. Cài PostHog: npm install posthog-js
2. Thêm VITE_POSTHOG_KEY vào .env.example (free tier PostHog cloud: app.posthog.com)
3. Khởi tạo PostHog trong client/src/main.tsx:
   posthog.init(import.meta.env.VITE_POSTHOG_KEY, { api_host: 'https://app.posthog.com' })

4. Tạo hook client/src/hooks/use-analytics.ts với các hàm:
   - trackPageView(pageName: string)
   - trackEvent(event: string, properties?: object)

5. Track các events quan trọng:
   - 'page_view' với { page } — trong mỗi page component (dùng useEffect)
   - 'checkout_started' với { product, amount } — khi click Buy Now
   - 'checkout_completed' — trên PaymentSuccessPage
   - 'lead_captured' — khi submit lead magnet form
   - 'signup_completed' — sau khi đăng ký thành công
   - 'academy_entry_viewed' với { entryId, entryTitle, isPro }
   - 'upgrade_prompt_shown' — khi ProModal hiển thị
   - 'upgrade_clicked' — khi click upgrade trong ProModal

6. Identify user sau khi login: posthog.identify(userId, { email })

KHÔNG làm: Đừng dùng Google Analytics (cần cookie consent banner phức tạp hơn). PostHog có thể chạy cookieless.
```

---

### STEP 10 — Make Academy Fully Free + SEO Optimize

```
Bạn đang làm việc trên Life Science Atlas.

MỤC TIÊU: Theo pivot strategy, Academy chuyển thành fully free (lead magnet + SEO base). Bỏ Pro gate trên Academy entries. Đồng thời optimize từng entry cho SEO.

LÀM:
1. Trong client/src/data/mockData.ts: set isPro = false cho TẤT CẢ Academy entries. Academy hoàn toàn miễn phí.

2. Trong client/src/pages/Academy.tsx: 
   - Xóa bỏ mọi "PRO" badge và lock overlay trên Academy entries
   - Xóa bỏ ProModal trigger cho Academy
   - Thêm subtle CTA ở cuối mỗi entry: "Cần tools cho audit? → GMP Audit Survival Kit $59"

3. Trong client/src/pages/AcademyEntryPage.tsx (lesson detail):
   - Ở cuối bài học: thêm "Related Tools" section link về /toolkits/gmp-audit-kit nếu bài học liên quan đến audit/GMP
   - Thêm "Bài tiếp theo" navigation
   - Đảm bảo useSEO() được gọi với title = entry.title + " | Life Science Atlas" và description = entry.summary hoặc 2 câu đầu của nội dung

4. Trong mockData.ts, thêm field summary (1-2 câu) cho mỗi Academy entry nếu chưa có — dùng làm meta description.

5. Kiểm tra route /academy/:slug hoặc /academy/:id trong App.tsx — đảm bảo deep link vào từng bài học hoạt động (quan trọng cho SEO).

KHÔNG thay đổi: Pro gate trên các module khác (Lab Tools, Compliance, Vault). Chỉ mở Academy.
```

---

## PHASE 3 — GROWTH (Tuần 5–8)
> Mục tiêu: Traffic organic, email nurture, LinkedIn content system.

---

### STEP 11 — Blog/SEO Content Hub

```
Bạn đang làm việc trên Life Science Atlas — React + Express app.

MỤC TIÊU: Tạo Blog section để publish SEO articles nhắm vào long-tail keywords tiếng Việt trong ngành QC/Pharma.

LÀM:
1. Tạo type BlogPost trong shared/schema.ts:
   { id, slug, title, metaDescription, content (markdown), category, publishedAt, readTime, tags[] }

2. Tạo client/src/data/blogPosts.ts với 5 bài viết đầu tiên (nội dung tiếng Việt):
   - "Annex 1 2022 là gì và QC Pharma Vietnam cần chuẩn bị gì?"
   - "Quy trình xử lý OOS (Out of Specification) theo GMP WHO — hướng dẫn thực tế"
   - "Environmental Monitoring trong Cleanroom: tần suất, vị trí lấy mẫu, và action limits"
   - "CAPA là gì? Root cause analysis cho QC Pharma không cần consultant"
   - "Lộ trình thăng tiến từ QC Analyst lên QA Manager tại Việt Nam — salary và skills cần có"
   Mỗi bài: ít nhất 800 từ, có H2/H3 headings, kết thúc bằng CTA về GMP Audit Kit hoặc Academy.

3. Tạo client/src/pages/BlogPage.tsx: list tất cả bài viết, có filter theo category
4. Tạo client/src/pages/BlogPostPage.tsx: render markdown content, sidebar CTA, related posts
5. Đăng ký routes: /blog và /blog/:slug trong App.tsx
6. Thêm "Blog" vào Navigation
7. Mỗi BlogPostPage: useSEO() với title và metaDescription riêng
8. Thêm link /blog vào Footer

Dùng thư viện marked hoặc react-markdown để render markdown: npm install react-markdown

KHÔNG làm: Đừng kết nối với CMS bên ngoài. Static data trong blogPosts.ts là đủ cho giai đoạn này.
```

---

### STEP 12 — In-App Upgrade Prompts (Pro Conversion)

```
Bạn đang làm việc trên Life Science Atlas.

MỤC TIÊU: Khi user miễn phí chạm vào nội dung Pro (Lab Tools, Compliance, Vault), thay vì ProModal generic, hiển thị upgrade prompt thông minh hơn — có context, có urgency, có social proof.

LÀM:
1. Redesign component client/src/components/ProModal.tsx thành UpgradeModal với:
   - Headline dynamic theo feature: "Mở khóa Lab Tools — Quyết định nhanh hơn trong 5 phút"
   - 3 bullet points benefits theo feature được trigger
   - Pricing: "$8/month hoặc thử GMP Audit Kit $59 one-time"
   - 2 CTAs: "Nâng cấp Pro" (→ /pricing) và "Xem GMP Audit Kit" (→ /toolkits/gmp-audit-kit)
   - Social proof: "Đang được dùng bởi QC teams tại Sanofi, DHG, Imexpharm" (placeholder)
   - X để đóng

2. Tạo trigger config — map từng feature sang message:
   const upgradeMessages = {
     'lab-tools': { headline: '...', bullets: [...] },
     'compliance': { headline: '...', bullets: [...] },
     'vault': { headline: '...', bullets: [...] },
     'insights': { headline: '...', bullets: [...] }
   }

3. Cập nhật các trang Lab Tools, Compliance, Vault, Insights để pass feature key khi trigger modal

4. Thêm exit-intent trigger trên LandingPage: sau 30 giây hoặc khi mouse ra khỏi viewport → hiện subtle banner bottom "Đừng bỏ lỡ: GMP Audit Kit $59 — giảm 50% trong tuần này" (hardcode, không cần backend)

KHÔNG làm: Đừng implement actual Pro subscription flow (Step 2 đã handle checkout). Chỉ improve conversion UI.
```

---

### STEP 13 — Digital Product Delivery System

```
Bạn đang làm việc trên Life Science Atlas — Express backend.

MỤC TIÊU: Sau khi khách mua GMP Audit Kit $59, họ phải nhận được file tự động. Implement delivery system đơn giản.

LÀM:
1. Tạo bảng purchases trong shared/schema.ts:
   { id, email, productId, stripeSessionId, deliveredAt, created_at }
   Chạy npm run db:push

2. Trong server/routes.ts, endpoint POST /api/webhooks/stripe:
   - Khi checkout.session.completed: insert vào bảng purchases
   - Gọi fulfillProduct(email, productId)

3. Tạo server/fulfillment.ts với function fulfillProduct:
   - Switch theo productId
   - "gmp-audit-kit" → gọi sendDownloadLink với URL của file (lưu trong env: GMP_KIT_DOWNLOAD_URL)
   - "career-starter-kit" → tương tự với CAREER_KIT_DOWNLOAD_URL
   - "interview-prep-pack" → INTERVIEW_PREP_DOWNLOAD_URL
   - Cập nhật deliveredAt trong bảng purchases

4. Tạo endpoint GET /api/purchases/:email — cho phép user xem lịch sử mua hàng của họ (cần auth)

5. Trong client/src/pages/Settings.tsx: thêm section "Sản phẩm đã mua" — hiển thị list purchases với download links

6. Thêm VITE_* env vars cho các download URLs vào .env.example

LƯU Ý: Download URL nên là signed URL có expiry (Google Drive không ideal cho production — khuyên dùng Cloudflare R2 hoặc Supabase Storage sau này). Tạm thời dùng Google Drive public link là được.

KHÔNG làm: Đừng implement tự upload file lên server — file lưu ở cloud storage bên ngoài, server chỉ lưu URL.
```

---

### STEP 14 — Performance & Stability Fixes

```
Bạn đang làm việc trên Life Science Atlas — React + Vite.

Report từ testing: có hiện tượng "Topics: 0 → Topics: 15" flash khi load, và khả năng memory leak / heavy re-render gây browser freeze.

LÀM:
1. Trong client/src/hooks/use-data.ts: tất cả data hooks đang dùng setTimeout để simulate latency — giữ nguyên nhưng thêm initialData hoặc placeholderData trong React Query config để tránh flash "0 items"

2. Tìm và fix flash issue: trong bất kỳ component nào render count/number từ data hooks, thêm loading skeleton thay vì hiển thị "0":
   - QCHub: skeleton cards trong khi load
   - Academy: skeleton grid
   - Career: skeleton states

3. Thêm React.memo() cho các component render nhiều lần không cần thiết:
   - Academy entry cards (render lại toàn bộ list khi hover 1 card)
   - Navigation component
   - Footer component

4. Trong vite.config.ts: thêm build optimization:
   - Code splitting: tách vendor bundle (react, radix, framer-motion)
   - Lazy load các pages nặng: GMPAuditKit, Blog, Career với React.lazy()

5. Fix accessibility issue: trong index.html, thay maximum-scale=1 thành user-scalable=yes trong meta viewport — đây là vi phạm WCAG 1.4.4

6. Kiểm tra và fix bất kỳ console.error nào trong browser khi chạy app (missing keys, prop type errors, etc.)

KHÔNG thay đổi: logic nghiệp vụ, styling, data.
```

---

### STEP 15 — Vercel Production Config & Deploy

```
Bạn đang làm việc trên Life Science Atlas. App đang deploy trên Vercel tại lifescienceatlas.com.

MỤC TIÊU: Đảm bảo production deployment ổn định, environment variables đúng, và Stripe webhook hoạt động với live URL.

LÀM:
1. Kiểm tra vercel.json hiện tại — đảm bảo:
   - Express server được route đúng (API routes → server function)
   - Static files (dist/public/) được serve đúng
   - SPA fallback: mọi route không match → trả về index.html (quan trọng cho Wouter client routing)
   - Headers: Cache-Control đúng cho static assets

2. Tạo file docs/DEPLOYMENT.md hướng dẫn:
   - Danh sách tất cả Environment Variables cần set trên Vercel Dashboard:
     DATABASE_URL, SESSION_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, 
     VITE_STRIPE_PUBLISHABLE_KEY, RESEND_API_KEY, VITE_POSTHOG_KEY,
     GMP_KIT_DOWNLOAD_URL, CAREER_KIT_DOWNLOAD_URL, INTERVIEW_PREP_DOWNLOAD_URL
   - Cách set up Stripe Webhook endpoint: https://lifescienceatlas.com/api/webhooks/stripe
   - Cách chuyển từ Stripe Test mode sang Live mode
   - Cách verify email domain trên Resend

3. Kiểm tra server/index.ts: trust proxy setting phải đúng cho Vercel (express().set('trust proxy', 1))

4. Kiểm tra express-session config: cookie secure: true khi NODE_ENV=production

5. Chạy npm run build locally — fix bất kỳ TypeScript error hoặc build error nào. Build phải pass clean trước khi deploy.

6. Commit tất cả changes với message rõ ràng và push lên GitHub — Vercel sẽ auto-deploy.

SAU KHI DEPLOY:
- Test signup flow trên production URL
- Test Stripe Checkout với test card (4242 4242 4242 4242)
- Verify webhook nhận được events (Stripe Dashboard → Webhooks → Recent deliveries)
- Kiểm tra email gửi được (check inbox sau khi signup và purchase)
```

---

## CHECKLIST TRƯỚC KHI LAUNCH

```
Copy prompt này vào Claude Code để chạy final check:

Bạn đang làm việc trên Life Science Atlas. Trước khi launch chính thức, kiểm tra toàn bộ các điểm sau và báo cáo pass/fail cho từng mục:

CRITICAL (phải pass tất cả):
[ ] / hiển thị LandingPage (không redirect /qc-hub)
[ ] /signup tải được, form submit tạo được user
[ ] /login hoạt động, session persist sau refresh
[ ] /toolkits/gmp-audit-kit tải được, nút "Mua ngay" redirect về Stripe Checkout
[ ] /pricing nút Start Pro redirect về Stripe Checkout
[ ] /payment-success hiển thị sau khi Stripe redirect về
[ ] /terms, /privacy, /refund tải được
[ ] document.title không rỗng trên bất kỳ route nào
[ ] <meta name="description"> có nội dung trên mọi route
[ ] Footer hiển thị trên tất cả pages

IMPORTANT (cố gắng pass):
[ ] Email welcome gửi được sau signup (test với email thật)
[ ] Email receipt gửi được sau purchase test (Stripe test mode)
[ ] Lead magnet form capture email và gửi file
[ ] Academy entries tải được (tất cả free, không có Pro lock)
[ ] /blog hiển thị danh sách bài viết
[ ] npm run build chạy không có error
[ ] Console browser không có error đỏ

Với mỗi mục FAIL: mô tả vấn đề và fix ngay.
```

---

*Last updated: 2026-05-28 | Strategy: Toolkits-first, GMP Audit Kit $59 as wedge product*
