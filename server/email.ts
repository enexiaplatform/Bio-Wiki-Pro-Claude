import { Resend } from "resend";
import { getProductName } from "./products.js";
import { deliverablesForPurchase } from "./deliverables.js";
import { commercialNotificationRecipients, getPublicOrigin } from "./runtime-config.js";
import type { QualityLabPortfolioActionItem, QualityLabWeeklyPortfolioReview } from "../shared/quality-lab-actions.js";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
const BASE_URL = getPublicOrigin();

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

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
      <p>© 2026 Life Science Atlas — decision intelligence for regulated manufacturing quality</p>
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
    <p>Your account is ready. Start with a real quality-laboratory decision, then inspect the evidence, assumptions and open inputs behind the model.</p>
    <div class="box">
      <p><strong style="color:#10b981;">Where to start:</strong></p>
      <p>Build an initial <strong>Quality Lab Blueprint</strong><br>
      Inspect the public <strong>illustrative deliverable</strong><br>
      Use Academy and compliance resources as the supporting evidence layer.</p>
    </div>
    <a href="${BASE_URL}/quality-lab/planner" class="cta">Build an initial model →</a>
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
  const isScopeDiagnostic = productType === "scope_diagnostic";
  const isCareerBlueprint = productType === "career_blueprint";

  const html = htmlWrapper(`
    <h1>Thank you, ${name}! Your order is confirmed ✅</h1>
    <p>Your payment for <strong style="color:#f8fafc;">${productName}</strong>${amountDisplay ? ` (${amountDisplay})` : ""} has been received.</p>
      ${isScopeDiagnostic ? `
      <div class="box">
        <p><strong style="color:#10b981;">Your Diagnostic is reserved</strong></p>
        <p>Atlas will respond within two business days to confirm fit, the 60-minute workshop, required inputs and the named participants.</p>
      </div>
      <a href="${BASE_URL}/quality-lab/review?offer=diagnostic" class="cta">Open Diagnostic intake →</a>
      ` : isCareerBlueprint ? `
      <div class="box">
        <p><strong style="color:#10b981;">Your Personal Career Blueprint is unlocked</strong></p>
        <p>Return to your browser-local Career Snapshot to generate the named 38-page Career Operating Blueprint. Atlas receives your profile only when you explicitly request the download.</p>
      </div>
      <a href="${BASE_URL}/career?purchase=success" class="cta">Generate my Career Blueprint â†’</a>
      ` : hasDownloads ? `
    <div class="box">
      <p><strong style="color:#10b981;">Your files are ready</strong></p>
      <p>Everything is in your account — PDFs and Excel workbooks, available to download right now.</p>
    </div>
    <a href="${BASE_URL}/my-downloads" class="cta">Go to My Downloads →</a>
    ` : `
    <div class="box">
      <p><strong style="color:#10b981;">Pro is now active 🎉</strong></p>
      <p>Every currently published Pro lesson, template and premium tool is unlocked. Pro supports evidence work; project-specific Blueprint review is scoped separately.</p>
    </div>
    <a href="${BASE_URL}/academy" class="cta">Open the Academy →</a>
    `}
    <p style="margin-top: 24px; font-size: 13px;">Any issue with your order? Reply to this email or contact <a href="mailto:support@lifescienceatlas.com" style="color:#10b981;">support@lifescienceatlas.com</a></p>
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
      <p>This checklist is just the start. The <strong>GMP Audit Readiness Kit</strong> is included with Pro and adds a preparation guide, CAPA planning templates, a gap-analysis workbook, and 50+ audit Q&amp;A prompts.</p>
    </div>
    <a href="${BASE_URL}/toolkits/gmp-audit-kit" style="display:inline-block; color:#10b981; font-size:14px; text-decoration:none; margin-top: 4px;">See the GMP Audit Readiness Kit →</a>
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
    subject: "Start with a real quality-laboratory decision",
    body: (name) => `
      <h1>Welcome aboard, ${name} 👋</h1>
      <p>Atlas is most useful when you start with a real site, product portfolio and testing-demand question.</p>
      <div class="box"><p>Build a browser-local concept model, inspect the assumptions and identify the evidence that blocks a defensible decision.</p></div>
      <a href="${BASE_URL}/quality-lab/planner" class="cta">Build an initial model →</a>
      <p style="font-size:13px;color:#64748b;">No confidential project data is required to explore the illustrative workflow.</p>
    `,
  },
  2: {
    subject: "See what a controlled Blueprint deliverable contains",
    body: (name) => `
      <h1>Move from a model to a decision package, ${name}</h1>
      <p>A Blueprint is more than a calculation. It exposes the scenario basis, evidence status, unresolved inputs, reviewer boundary and controlled acceptance record.</p>
      <div class="box"><p>The public sample shows how Atlas separates illustrative inputs, concept calculations and project facts that still require verification.</p></div>
      <a href="${BASE_URL}/quality-lab/sample" class="cta">View the illustrative sample →</a>
      <p style="font-size:13px;color:#64748b;">No customer result, reviewer appointment or validation claim is implied by the sample.</p>
    `,
  },
  3: {
    subject: "Frame your next decision with a paid scope diagnostic",
    body: (name) => `
      <h1>Need a defensible Blueprint scope, ${name}?</h1>
      <p>The <strong>$149 Paid Scope Diagnostic</strong> includes one 60-minute stakeholder workshop, input and decision-gap triage, and a written scope memo.</p>
      <a href="${BASE_URL}/quality-lab/review?offer=diagnostic" class="cta">Request the diagnostic →</a>
      <p style="font-size:13px;color:#64748b;">The fee is credited to a Blueprint engagement started within 30 days. Atlas confirms fit before delivery begins.</p>
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
  gmp_audit_kit: "the GMP Audit Readiness Kit",
  starter_kit: "the Career Starter Kit",
  interview_prep: "the Interview Prep Pack",
  bundle: "the Career Accelerator Bundle",
  career_blueprint: "the Personal Career Blueprint",
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
  const href = isSub ? `${BASE_URL}/upgrade` : productType === "career_blueprint" ? `${BASE_URL}/career` : `${BASE_URL}/pricing`;
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

function escapeEmailText(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] ?? character);
}

const WORK_QUEUE_TIMING_LABELS: Record<QualityLabPortfolioActionItem["timing"], string> = {
  overdue: "Overdue",
  "due-soon": "Due within 7 days",
  scheduled: "Scheduled",
  unscheduled: "Needs a due date",
};

/**
 * Opt-in digest for account-held Blueprint review snapshots. Returns true only
 * when Resend accepted the send so the cron does not consume its daily guard
 * while email delivery is unconfigured or has failed.
 */
export async function sendQualityLabWorkQueueEmail(
  to: string,
  firstName: string | undefined,
  items: QualityLabPortfolioActionItem[],
  metrics: { overdueCount: number; dueSoonCount: number; unscheduledBlockingCount: number; readyForReviewCount: number },
): Promise<boolean> {
  if (!resend) {
    console.log(`[Email] Would send Blueprint work queue to ${to} (Resend not configured)`);
    return false;
  }
  const name = escapeEmailText(firstName ?? "there");
  const rows = items.slice(0, 5).map((item) => {
    const due = item.action.dueDate ? ` · due ${escapeEmailText(item.action.dueDate)}` : "";
    return `<div style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
      <p style="margin:0 0 4px;color:#5eead4;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">${WORK_QUEUE_TIMING_LABELS[item.timing]}${due}</p>
      <p style="margin:0 0 4px;color:#f8fafc;font-weight:700;">${escapeEmailText(item.action.question)}</p>
      <p style="margin:0;font-size:13px;">${escapeEmailText(item.projectName)} · Owner: ${escapeEmailText(item.action.ownerRole || "Unassigned")}</p>
    </div>`;
  }).join("");
  const remaining = Math.max(0, items.length - 5);
  const html = htmlWrapper(`
    <h1>Your Blueprint work queue, ${name}</h1>
    <p>This reminder covers only Blueprint review snapshots you explicitly saved to your account. Browser-local concept projects are never included.</p>
    <div class="box"><p><strong>${metrics.overdueCount}</strong> overdue · <strong>${metrics.dueSoonCount}</strong> due within 7 days · <strong>${metrics.unscheduledBlockingCount}</strong> blocking without a date · <strong>${metrics.readyForReviewCount}</strong> ready for review</p></div>
    ${rows}
    ${remaining ? `<p style="font-size:13px;margin-top:16px;">Plus ${remaining} more active action${remaining === 1 ? "" : "s"} in your portfolio.</p>` : ""}
    <a href="${BASE_URL}/quality-lab/projects?source=work-queue-email" class="cta">Open today&apos;s work queue →</a>
    <p style="font-size:13px;color:#64748b;">Change or turn off this reminder from the Projects page at any time.</p>
  `);
  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: metrics.overdueCount > 0
        ? `${metrics.overdueCount} overdue Blueprint action${metrics.overdueCount === 1 ? "" : "s"}`
        : "Your Blueprint work queue — Life Science Atlas",
      html,
    });
    if (response.error) {
      console.error("[Email] Blueprint work queue rejected:", response.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Email] Failed to send Blueprint work queue:", err);
    return false;
  }
}

const WEEKLY_EVENT_LABELS: Record<QualityLabWeeklyPortfolioReview["recentEvents"][number]["type"], string> = {
  created: "New action",
  reopened: "Reopened",
  updated: "Updated",
  "auto-resolved": "Closed",
};

/** Weekly opt-in review built only from account-held Blueprint snapshots. */
export async function sendQualityLabWeeklyReviewEmail(
  to: string,
  firstName: string | undefined,
  review: QualityLabWeeklyPortfolioReview,
): Promise<boolean> {
  if (!resend) {
    console.log(`[Email] Would send weekly Blueprint review to ${to} (Resend not configured)`);
    return false;
  }
  const name = escapeEmailText(firstName ?? "there");
  const events = review.recentEvents.slice(0, 5).map((event) => `<div style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
    <p style="margin:0 0 4px;color:#5eead4;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">${WEEKLY_EVENT_LABELS[event.type]} · ${escapeEmailText(event.recordedAt.slice(0, 10))}</p>
    <p style="margin:0 0 4px;color:#f8fafc;font-weight:700;">${escapeEmailText(event.actionQuestion)}</p>
    <p style="margin:0;font-size:13px;">${escapeEmailText(event.projectName)} · ${escapeEmailText(event.summary)}</p>
  </div>`).join("");
  const priorities = review.priorityItems.slice(0, 3).map((item) => `<li style="margin:8px 0;"><strong>${escapeEmailText(item.projectName)}:</strong> ${escapeEmailText(item.action.question)}</li>`).join("");
  const html = htmlWrapper(`
    <h1>Your weekly Blueprint review, ${name}</h1>
    <p>${escapeEmailText(review.windowStart)} through ${escapeEmailText(review.windowEnd)} · only review snapshots you explicitly saved to your account are included. Browser-local projects never leave the device.</p>
    <div class="box"><p><strong>${review.newCount}</strong> new or reopened · <strong>${review.resolvedCount}</strong> closed · <strong>${review.updatedCount}</strong> updated · <strong>${review.activeBlockingCount}</strong> active blockers</p></div>
    ${events || "<p>No action-history changes were recorded this week.</p>"}
    ${priorities ? `<h2 style="font-size:17px;margin-top:24px;">Priority work still open</h2><ul style="padding-left:20px;">${priorities}</ul>` : ""}
    <a href="${BASE_URL}/quality-lab/projects?source=weekly-review-email" class="cta">Open portfolio review →</a>
    <p style="font-size:13px;color:#64748b;">This coordination summary is not QA approval, change control or an audit trail. Change or turn off the reminder from Projects at any time.</p>
  `);
  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: review.activeBlockingCount > 0
        ? `Weekly Blueprint review: ${review.activeBlockingCount} active blocker${review.activeBlockingCount === 1 ? "" : "s"}`
        : "Your weekly Blueprint portfolio review",
      html,
    });
    if (response.error) {
      console.error("[Email] Weekly Blueprint review rejected:", response.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Email] Failed to send weekly Blueprint review:", err);
    return false;
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

export interface CommercialRequestEmailInput {
  requestId: string;
  name: string;
  email: string;
  company?: string;
  offer: string;
  summary: string;
}

/** Sends the buyer acknowledgement and the internal work-queue alert together. */
export async function sendCommercialRequestEmails(input: CommercialRequestEmailInput): Promise<void> {
  if (!resend) {
    console.log(`[Email] Would acknowledge commercial request ${input.requestId} to ${input.email} (Resend not configured)`);
    return;
  }

  const safe = {
    id: escapeHtml(input.requestId),
    name: escapeHtml(input.name),
    email: escapeHtml(input.email),
    company: escapeHtml(input.company || "Not provided"),
    offer: escapeHtml(input.offer),
    summary: escapeHtml(input.summary).replace(/\n/g, "<br>"),
  };
  const ownerRecipients = commercialNotificationRecipients();
  const messages = [
    resend.emails.send({
      from: FROM_EMAIL,
      to: input.email,
      subject: `Request received: ${input.offer} — Life Science Atlas`,
      html: htmlWrapper(`
        <h1>We received your request, ${safe.name}.</h1>
        <p>Reference <strong style="color:#f8fafc;">${safe.id}</strong> · ${safe.offer}</p>
        <div class="box"><p>Atlas will respond within two business days to confirm fit, required inputs, the next workshop or call, delivery basis and commercial terms.</p></div>
        <p>Please do not email confidential formulations, credentials, proprietary methods or personal data about other people before a data-handling basis is agreed.</p>
        <a href="${BASE_URL}/quality-lab/sample" class="cta">Review the illustrative deliverable →</a>
      `),
    }),
  ];

  if (ownerRecipients.length > 0) {
    messages.push(resend.emails.send({
      from: FROM_EMAIL,
      to: ownerRecipients,
      replyTo: input.email,
      subject: `[Commercial request ${safe.id}] ${input.offer} — ${input.company || input.name}`,
      html: htmlWrapper(`
        <h1>New commercial request</h1>
        <div class="box"><p><strong>Offer:</strong> ${safe.offer}<br><strong>Contact:</strong> ${safe.name} &lt;${safe.email}&gt;<br><strong>Company:</strong> ${safe.company}<br><strong>Response due:</strong> within two business days</p></div>
        <p>${safe.summary}</p>
        <a href="${BASE_URL}/admin" class="cta">Open Admin Control Center →</a>
      `),
    }));
  }

  const results = await Promise.allSettled(messages);
  results.forEach((result) => {
    if (result.status === "rejected") console.error("[Email] Commercial request notification failed:", result.reason);
  });
}
