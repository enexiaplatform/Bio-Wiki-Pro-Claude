import { Resend } from "resend";
import { getProductName } from "./products.js";
import { deliverablesForPurchase } from "./deliverables.js";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
const BASE_URL = process.env.BASE_URL ?? "https://bio-wiki-pro-claude.vercel.app";

function htmlWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Life Science Atlas</title>
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
      <div class="logo">Life Science <span>Atlas</span></div>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© 2026 Life Science Atlas — QC/QA knowledge for Pharma & Life Sciences</p>
      <p style="margin-top: 6px;"><a href="${BASE_URL}/terms">Terms</a> · <a href="${BASE_URL}/privacy">Privacy</a></p>
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

  const name = firstName ?? "there";
  const html = htmlWrapper(`
    <h1>Welcome to Life Science Atlas, ${name}! 🎉</h1>
    <p>Your account is ready. Start building real QC/QA expertise — from sterility testing to audit readiness.</p>
    <div class="box">
      <p><strong style="color:#10b981;">Where to start:</strong></p>
      <p>📚 Explore the free <strong>Academy lessons</strong> and learning paths<br>
      🔬 Use the <strong>QC Hub</strong> for fast reference<br>
      🛡️ Grab the <strong>GMP Audit Survival Kit</strong> if you have an inspection coming up</p>
    </div>
    <a href="${BASE_URL}/academy" class="cta">Open the Academy →</a>
    <p style="margin-top: 24px; font-size: 13px;">Questions or feedback? Just reply to this email — we read every one.</p>
  `);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Welcome to Life Science Atlas, ${name}!`,
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

  const productName = getProductName(productType);
  const amountDisplay = amountCents ? `$${(amountCents / 100).toFixed(2)}` : "";
  const name = firstName ?? "there";
  // Kits/bundles unlock downloadable files served in-app at /my-downloads;
  // anything else (Pro subscription) unlocks content rather than a file.
  const hasDownloads = deliverablesForPurchase(productType).length > 0;

  const html = htmlWrapper(`
    <h1>Thank you, ${name}! Your order is confirmed ✅</h1>
    <p>Your payment for <strong style="color:#f8fafc;">${productName}</strong>${amountDisplay ? ` (${amountDisplay})` : ""} has been received.</p>
    ${hasDownloads ? `
    <div class="box">
      <p><strong style="color:#10b981;">Your files are ready</strong></p>
      <p>Everything is in your account — PDFs and Excel workbooks, available to download right now.</p>
    </div>
    <a href="${BASE_URL}/my-downloads" class="cta">Go to My Downloads →</a>
    ` : `
    <div class="box">
      <p><strong style="color:#10b981;">Pro is now active 🎉</strong></p>
      <p>Every in-depth lesson, template, and tool is unlocked. Jump back in any time.</p>
    </div>
    <a href="${BASE_URL}/academy" class="cta">Open the Academy →</a>
    `}
    <p style="margin-top: 24px; font-size: 13px;">Any issue with your order? Reply to this email or contact <a href="mailto:support@biowikipro.com" style="color:#10b981;">support@biowikipro.com</a></p>
  `);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Order confirmed: ${productName} — Life Science Atlas`,
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
    <h1>Your GMP Audit Quick Checklist 📋</h1>
    <p>Thanks for signing up! Here's your pre-audit checklist to help you walk in prepared.</p>
    <a href="${downloadUrl}" class="cta">Download the GMP Audit Checklist (PDF) →</a>
    <div class="box">
      <p><strong style="color:#10b981;">Need to go deeper?</strong></p>
      <p>This checklist is just the start. The <strong>GMP Audit Survival Kit ($59)</strong> includes a full audit survival guide, 10 CAPA templates, and 50+ audit Q&A scripts.</p>
    </div>
    <a href="${BASE_URL}/toolkits/gmp-audit-kit" style="display:inline-block; color:#10b981; font-size:14px; text-decoration:none; margin-top: 4px;">See the GMP Audit Survival Kit →</a>
  `);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Your GMP Audit Quick Checklist — Life Science Atlas",
      html,
    });
  } catch (err) {
    console.error("[Email] Failed to send lead magnet email:", err);
  }
}

export async function sendVerificationEmail(
  to: string,
  verifyUrl: string,
  firstName?: string
): Promise<void> {
  if (!resend) {
    console.log(`[Email] Would send verification to ${to} (Resend not configured): ${verifyUrl}`);
    return;
  }

  const name = firstName ?? "there";
  const html = htmlWrapper(`
    <h1>Confirm your email</h1>
    <p>Hi ${name}, thanks for joining Life Science Atlas. Confirm your email to secure your account.</p>
    <a href="${verifyUrl}" class="cta">Verify email →</a>
    <div class="box">
      <p>This link expires in <strong style="color:#10b981;">24 hours</strong>. You can keep using Life Science Atlas in the meantime.</p>
    </div>
    <p style="font-size: 13px; color: #64748b;">If you didn't create this account, you can ignore this email.</p>
  `);

  try {
    await resend.emails.send({ from: FROM_EMAIL, to, subject: "Confirm your Life Science Atlas email", html });
  } catch (err) {
    console.error("[Email] Failed to send verification email:", err);
  }
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  firstName?: string
): Promise<void> {
  if (!resend) {
    console.log(`[Email] Would send password reset to ${to} (Resend not configured): ${resetUrl}`);
    return;
  }

  const name = firstName ?? "there";
  const html = htmlWrapper(`
    <h1>Reset your password</h1>
    <p>Hi ${name}, we received a request to reset the password for your Life Science Atlas account.</p>
    <a href="${resetUrl}" class="cta">Reset password →</a>
    <div class="box">
      <p>This link expires in <strong style="color:#10b981;">1 hour</strong> and can be used once.</p>
    </div>
    <p style="font-size: 13px; color: #64748b;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
  `);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Reset your Life Science Atlas password",
      html,
    });
  } catch (err) {
    console.error("[Email] Failed to send password reset email:", err);
  }
}

export async function sendDunningEmail(
  to: string,
  graceUntil: Date,
  firstName?: string
): Promise<void> {
  if (!resend) {
    console.log(`[Email] Would send dunning email to ${to} (Resend not configured)`);
    return;
  }

  const name = firstName ?? "there";
  const deadline = graceUntil.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const html = htmlWrapper(`
    <h1>Your Pro payment didn't go through ⚠️</h1>
    <p>Hi ${name}, we couldn't collect the renewal payment for your <strong>Life Science Atlas Pro</strong> subscription.</p>
    <div class="box">
      <p>Your Pro access stays active until <strong style="color:#10b981;">${deadline}</strong>.
      Please update your payment method before then to avoid any interruption.</p>
    </div>
    <a href="${BASE_URL}/upgrade" class="cta">Update payment method →</a>
    <p style="font-size: 13px; color: #64748b;">If you've just paid again, you can ignore this email.</p>
  `);

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Update your Pro payment — Life Science Atlas",
      html,
    });
  } catch (err) {
    console.error("[Email] Failed to send dunning email:", err);
  }
}

// Free→Pro nurture sequence. `step` 1..3 maps to a different message; the cron
// picks the step from how many days since signup and what's already been sent.
const NURTURE_CONTENT: Record<number, { subject: string; body: (name: string) => string }> = {
  1: {
    subject: "Getting started with your free QC/QA lessons",
    body: (name) => `
      <h1>Welcome aboard, ${name} 👋</h1>
      <p>You've got dozens of in-depth GMP lessons free — the fastest way to start
      is to pick one learning path and work through it end to end.</p>
      <div class="box"><p>Most popular starting point: <strong>Microbiology QC
      Fundamentals</strong> — sterility, bioburden, EM, endotoxin and water, in order.</p></div>
      <a href="${BASE_URL}/library" class="cta">Browse the library →</a>
      <p style="font-size:13px;color:#64748b;">Reply any time if you're not sure where to start — we read every email.</p>
    `,
  },
  2: {
    subject: "The deep-dives most QC/QA teams get wrong",
    body: (name) => `
      <h1>Where the real findings hide, ${name}</h1>
      <p>The free lessons cover the fundamentals. The <strong>Pro</strong> deep-dives
      cover what actually trips teams up in an inspection:</p>
      <div class="box"><p>Audit-trail review programs · cleaning validation with MACO
      worked examples · OOS/OOT investigation · GAMP 5 CSV · contamination control
      strategy · SPC & Gauge R&R — each with templates and checklists.</p></div>
      <a href="${BASE_URL}/upgrade" class="cta">See what Pro unlocks →</a>
      <p style="font-size:13px;color:#64748b;">Every Pro lesson ends with a quiz so you can check you've actually got it.</p>
    `,
  },
  3: {
    subject: "Your 7-day Pro trial is waiting",
    body: (name) => `
      <h1>Try Pro free for 7 days, ${name}</h1>
      <p>You've been learning on the free tier — here's an easy way to see the rest.
      Start a <strong>7-day free trial</strong> of Pro: full access to every advanced
      lesson, template, and checklist. Cancel any time before it ends and you won't be
      charged.</p>
      <a href="${BASE_URL}/upgrade" class="cta">Start your free trial →</a>
      <p style="font-size:13px;color:#64748b;">$8/mo after the trial · cancel in two clicks · no hard sell.</p>
    `,
  },
};

// Trial-ending reminder (sent 3 days and 1 day before the Pro trial ends).
export async function sendTrialEndingEmail(
  to: string,
  daysLeft: number,
  endDate: Date,
  firstName?: string,
): Promise<void> {
  if (!resend) {
    console.log(`[Email] Would send trial-ending (${daysLeft}d) to ${to} (Resend not configured)`);
    return;
  }
  const name = firstName ?? "there";
  const when = daysLeft <= 1 ? "tomorrow" : `in ${daysLeft} days`;
  const ends = endDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const html = htmlWrapper(`
    <h1>Your Pro trial ends ${when}, ${name}</h1>
    <p>Your <strong>Life Science Atlas Pro</strong> free trial ends on <strong>${ends}</strong>.
    Keep full access to every advanced lesson, template, and checklist — no action
    needed, your subscription simply continues at $8/mo.</p>
    <div class="box"><p>Not ready? You can cancel in two clicks from your billing
    portal before ${ends} and you won't be charged.</p></div>
    <a href="${BASE_URL}/settings" class="cta">Manage your subscription →</a>
    <p style="font-size:13px;color:#64748b;">Questions about Pro? Just reply — we read every email.</p>
  `);
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: daysLeft <= 1 ? "Your Pro trial ends tomorrow — Life Science Atlas" : `Your Pro trial ends in ${daysLeft} days`,
      html,
    });
  } catch (err) {
    console.error("[Email] Failed to send trial-ending email:", err);
  }
}

const PRODUCT_LABELS: Record<string, string> = {
  pro_subscription: "Life Science Atlas Pro",
  pro_subscription_annual: "Life Science Atlas Pro (annual)",
  gmp_audit_kit: "the GMP Audit Survival Kit",
  starter_kit: "the Career Starter Kit",
  interview_prep: "the Interview Prep Pack",
  bundle: "the Career Accelerator Bundle",
};

// Abandoned-checkout reminder (sent once, ~a day after starting checkout without
// completing it). `productType` matches the Stripe metadata.
export async function sendAbandonedCheckoutEmail(
  to: string,
  productType: string,
  firstName?: string,
): Promise<void> {
  if (!resend) {
    console.log(`[Email] Would send abandoned-checkout (${productType}) to ${to} (Resend not configured)`);
    return;
  }
  const name = firstName ?? "there";
  const label = PRODUCT_LABELS[productType] ?? "your Life Science Atlas order";
  const isSub = productType.startsWith("pro_subscription");
  const href = isSub ? `${BASE_URL}/upgrade` : `${BASE_URL}/pricing`;
  const html = htmlWrapper(`
    <h1>Still thinking it over, ${name}?</h1>
    <p>You started checking out for <strong>${label}</strong> but didn't finish.
    No pressure — your spot's still here whenever you're ready.</p>
    <div class="box"><p>Secure Stripe checkout · instant access${isSub ? " · 7-day free trial, cancel anytime" : " · files ready immediately in your account"}.</p></div>
    <a href="${href}" class="cta">Pick up where you left off →</a>
    <p style="font-size:13px;color:#64748b;">If something got in the way or you have a question, just reply — happy to help.</p>
  `);
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "You left something behind — Life Science Atlas",
      html,
    });
  } catch (err) {
    console.error("[Email] Failed to send abandoned-checkout email:", err);
  }
}

// Re-engagement nudge for a learner who went quiet (last lesson 7–14 days ago).
export async function sendReEngagementEmail(to: string, firstName?: string): Promise<void> {
  if (!resend) {
    console.log(`[Email] Would send re-engagement to ${to} (Resend not configured)`);
    return;
  }
  const name = firstName ?? "there";
  const html = htmlWrapper(`
    <h1>Pick your QC/QA learning back up, ${name}</h1>
    <p>You made a strong start — and your progress is saved. A focused 15 minutes
    is all it takes to keep momentum.</p>
    <div class="box"><p>Jump back into your next lesson, or pick a fresh learning
    path: sterile manufacturing, validation, data integrity, or quality systems.</p></div>
    <a href="${BASE_URL}/my-learning" class="cta">Resume where you left off →</a>
    <p style="font-size:13px;color:#64748b;">Not the right time? No problem — your spot will be here.</p>
  `);
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Your QC/QA progress is waiting — Life Science Atlas",
      html,
    });
  } catch (err) {
    console.error("[Email] Failed to send re-engagement email:", err);
  }
}

export async function sendNurtureEmail(to: string, step: number, firstName?: string): Promise<void> {
  const content = NURTURE_CONTENT[step];
  if (!content) return;
  if (!resend) {
    console.log(`[Email] Would send nurture step ${step} to ${to} (Resend not configured)`);
    return;
  }
  const name = firstName ?? "there";
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: content.subject,
      html: htmlWrapper(content.body(name)),
    });
  } catch (err) {
    console.error(`[Email] Failed to send nurture step ${step}:`, err);
  }
}
