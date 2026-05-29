import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
const BASE_URL = process.env.BASE_URL ?? "https://bio-wiki-pro-claude.vercel.app";

// Product display names
const PRODUCT_NAMES: Record<string, string> = {
  gmp_audit_kit: "GMP Audit Survival Kit",
  starter_kit: "Career Starter Kit",
  interview_prep: "Interview Prep Package",
  bundle: "Career Bundle",
  pro_subscription: "BioWikiPro Pro",
};

// Temporary Google Drive download links (replace with real links)
const PRODUCT_DOWNLOAD_LINKS: Record<string, string> = {
  gmp_audit_kit: process.env.DOWNLOAD_GMP_AUDIT_KIT ?? "https://drive.google.com/placeholder/gmp-audit-kit",
  starter_kit: process.env.DOWNLOAD_STARTER_KIT ?? "https://drive.google.com/placeholder/starter-kit",
  interview_prep: process.env.DOWNLOAD_INTERVIEW_PREP ?? "https://drive.google.com/placeholder/interview-prep",
  bundle: process.env.DOWNLOAD_BUNDLE ?? "https://drive.google.com/placeholder/bundle",
};

function htmlWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BioWikiPro</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0f1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #e2e8f0; }
    .container { max-width: 560px; margin: 40px auto; background: #1a1f2e; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1a3a2e 0%, #0f2420 100%); padding: 32px 40px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .logo { font-size: 20px; font-weight: 700; color: #10b981; letter-spacing: -0.5px; }
    .logo span { color: #e2e8f0; }
    .body { padding: 36px 40px; }
    h1 { font-size: 24px; font-weight: 700; color: #f8fafc; margin: 0 0 12px; line-height: 1.3; }
    p { font-size: 15px; line-height: 1.7; color: #94a3b8; margin: 0 0 16px; }
    .cta { display: inline-block; background: #10b981; color: #fff !important; text-decoration: none; font-weight: 600; font-size: 15px; padding: 14px 28px; border-radius: 10px; margin: 8px 0 24px; }
    .box { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); border-radius: 12px; padding: 20px 24px; margin: 20px 0; }
    .box p { margin: 0; color: #e2e8f0; font-size: 14px; }
    .footer { padding: 20px 40px 32px; border-top: 1px solid rgba(255,255,255,0.05); }
    .footer p { font-size: 12px; color: #475569; margin: 0; }
    .footer a { color: #10b981; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">BioWiki<span>Pro</span></div>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© 2026 BioWikiPro — Nền tảng kiến thức QC/QA Pharma Vietnam</p>
      <p style="margin-top: 6px;"><a href="${BASE_URL}/terms">Terms</a> · <a href="${BASE_URL}/privacy">Privacy</a> · <a href="${BASE_URL}/refund">Refund</a></p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendWelcomeEmail(to: string, firstName?: string): Promise<void> {
  if (!resend) {
    console.log(`[Email] Would send welcome email to ${to} (Resend not configured)`);
    return;
  }

  const name = firstName ?? "bạn";
  const html = htmlWrapper(`
    <h1>Chào mừng đến BioWikiPro, ${name}! 🎉</h1>
    <p>Tài khoản của bạn đã được tạo thành công. Bắt đầu hành trình từ Senior QC → QA Manager ngay hôm nay.</p>
    <div class="box">
      <p><strong style="color:#10b981;">Gợi ý bắt đầu:</strong></p>
      <p>📚 Khám phá <strong>48 bài học GMP</strong> miễn phí trong Academy<br>
      🔬 Sử dụng <strong>QC Hub</strong> tra cứu kiến thức nhanh<br>
      🛡️ Xem <strong>GMP Audit Survival Kit</strong> nếu bạn sắp có audit</p>
    </div>
    <a href="${BASE_URL}/academy" class="cta">Vào Academy miễn phí →</a>
    <p style="margin-top: 24px; font-size: 13px;">Câu hỏi hoặc phản hồi? Reply email này — Henry đọc trực tiếp.</p>
  `);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Chào mừng đến BioWikiPro, ${name}!`,
      html,
    });
  } catch (err) {
    console.error("[Email] Failed to send welcome email:", err);
  }
}

export async function sendPurchaseConfirmation(
  to: string,
  productType: string,
  amountCents?: number,
  firstName?: string
): Promise<void> {
  if (!resend) {
    console.log(`[Email] Would send purchase confirmation to ${to} (Resend not configured)`);
    return;
  }

  const productName = PRODUCT_NAMES[productType] ?? productType;
  const amountDisplay = amountCents ? `$${(amountCents / 100).toFixed(2)}` : "";
  const name = firstName ?? "bạn";
  const downloadLink = PRODUCT_DOWNLOAD_LINKS[productType];

  const html = htmlWrapper(`
    <h1>Cảm ơn ${name}! Đơn hàng thành công ✅</h1>
    <p>Thanh toán cho <strong style="color:#f8fafc;">${productName}</strong>${amountDisplay ? ` (${amountDisplay})` : ""} đã được xác nhận.</p>
    ${downloadLink ? `
    <div class="box">
      <p><strong style="color:#10b981;">Tải xuống ngay:</strong></p>
      <p>File của bạn đã sẵn sàng — click vào link bên dưới để tải về.</p>
    </div>
    <a href="${downloadLink}" class="cta">Tải xuống ${productName} →</a>
    <p style="font-size: 13px; color: #64748b;">Link này dành riêng cho bạn. Không chia sẻ với người khác.</p>
    ` : `
    <div class="box">
      <p>Chúng tôi sẽ gửi tài liệu trong vòng <strong style="color:#10b981;">24 giờ</strong>. Kiểm tra hộp thư đến.</p>
    </div>
    `}
    <p style="margin-top: 24px; font-size: 13px;">Có vấn đề gì với đơn hàng? Reply email này hoặc liên hệ <a href="mailto:support@biowikipro.com" style="color:#10b981;">support@biowikipro.com</a></p>
  `);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Xác nhận đơn hàng: ${productName} — BioWikiPro`,
      html,
    });
  } catch (err) {
    console.error("[Email] Failed to send purchase confirmation:", err);
  }
}

export async function sendLeadMagnetEmail(to: string, downloadUrl: string): Promise<void> {
  if (!resend) {
    console.log(`[Email] Would send lead magnet to ${to} (Resend not configured)`);
    return;
  }

  const html = htmlWrapper(`
    <h1>GMP Audit Quick Checklist của bạn 📋</h1>
    <p>Cảm ơn bạn đã đăng ký! Đây là file checklist 25 điểm kiểm tra trước ngày audit.</p>
    <a href="${downloadUrl}" class="cta">Tải GMP Audit Checklist (PDF) →</a>
    <div class="box">
      <p><strong style="color:#10b981;">Cần chuẩn bị kỹ hơn?</strong></p>
      <p>Checklist này chỉ là phần đầu. <strong>GMP Audit Survival Kit ($59)</strong> bao gồm 40-trang guide, 10 CAPA templates, và 50+ audit Q&A scripts đầy đủ.</p>
    </div>
    <a href="${BASE_URL}/toolkits/gmp-audit-kit" style="display:inline-block; color:#10b981; font-size:14px; text-decoration:none; margin-top: 4px;">Xem GMP Audit Survival Kit →</a>
  `);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "GMP Audit Quick Checklist — BioWikiPro",
      html,
    });
  } catch (err) {
    console.error("[Email] Failed to send lead magnet email:", err);
  }
}
