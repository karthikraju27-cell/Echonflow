import { Resend } from "resend";

// Server-only. If RESEND_API_KEY isn't set (e.g. local dev without it
// configured), sends are skipped with a console warning rather than
// throwing — email is an enhancement, not a hard dependency for any of
// the flows that call into this module.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_ADDRESS = process.env.EMAIL_FROM || "Echonflow <onboarding@resend.dev>";

export async function sendEmail(params: { to: string; subject: string; html: string }) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipped send:", params.subject, "→", params.to);
    return null;
  }
  try {
    return await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
  } catch (err) {
    console.error("[email] send failed:", err);
    return null;
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function wrapper(bodyHtml: string) {
  return `
  <div style="font-family:-apple-system,'Segoe UI',Arial,sans-serif; background:#EFEBDD; padding:32px 16px;">
    <div style="max-width:520px; margin:0 auto; background:#F7F4EA; border:1px solid #DCD6BF; border-radius:6px; padding:28px;">
      <div style="font-family:'Courier New',monospace; font-size:12px; letter-spacing:0.1em; text-transform:uppercase; color:#4F7A5B; margin-bottom:20px;">echonflow</div>
      ${bodyHtml}
    </div>
  </div>`;
}

export function auditResultsEmailHtml(params: {
  overall: number;
  bandName: string;
  bandCopy: string;
  sections: { name: string; value: number | null }[];
  resultsUrl: string;
}) {
  const rows = params.sections
    .map(
      (s) =>
        `<tr><td style="padding:5px 0; color:#4A4738; font-size:13px;">${s.name}</td><td style="padding:5px 0; text-align:right; color:#17251C; font-size:13px; font-weight:600;">${s.value ?? "—"}%</td></tr>`
    )
    .join("");
  return wrapper(`
    <h1 style="font-family:Georgia,serif; font-size:21px; color:#17251C; margin:0 0 12px;">Your Energy &amp; Resilience Audit results</h1>
    <p style="margin:0;"><span style="font-size:34px; font-weight:700; color:#17251C;">${params.overall}%</span> <span style="font-size:16px; color:#8C8770;">${params.bandName}</span></p>
    <p style="font-size:14px; color:#4A4738; line-height:1.55; margin:10px 0 20px;">${params.bandCopy}</p>
    <table style="width:100%; border-collapse:collapse; border-top:1px solid #DCD6BF; padding-top:8px;">${rows}</table>
    <a href="${params.resultsUrl}" style="display:inline-block; background:#1B3328; color:#EFEBDD; text-decoration:none; padding:11px 18px; border-radius:4px; font-size:12.5px; margin-top:22px;">See full results &amp; recommendations →</a>
    <p style="font-size:12px; color:#8C8770; margin-top:26px; line-height:1.5;">Your individual answers are yours — never shared with an employer, full stop.</p>
  `);
}

export function newLeadEmailHtml(params: {
  listingName: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string | null;
  leadMessage: string | null;
  leadsUrl: string;
}) {
  return wrapper(`
    <h1 style="font-family:Georgia,serif; font-size:20px; color:#17251C; margin:0 0 12px;">New lead — ${params.listingName}</h1>
    <p style="font-size:14px; color:#17251C; margin:0 0 4px; font-weight:600;">${params.leadName}</p>
    <p style="font-size:13.5px; color:#4A4738; margin:0 0 4px;">${params.leadEmail}${params.leadPhone ? ` · ${params.leadPhone}` : ""}</p>
    ${params.leadMessage ? `<p style="font-size:13.5px; color:#4A4738; line-height:1.5; margin:14px 0 0; background:#EFEBDD; padding:12px 14px; border-radius:4px;">${params.leadMessage}</p>` : ""}
    <a href="${params.leadsUrl}" style="display:inline-block; background:#1B3328; color:#EFEBDD; text-decoration:none; padding:11px 18px; border-radius:4px; font-size:12.5px; margin-top:22px;">View in your Leads / CRM →</a>
  `);
}

export function leadConfirmationEmailHtml(params: {
  providerName: string;
  providerEmail: string;
  providerPhone: string | null;
}) {
  return wrapper(`
    <h1 style="font-family:Georgia,serif; font-size:20px; color:#17251C; margin:0 0 12px;">You reached out to ${params.providerName}</h1>
    <p style="font-size:14px; color:#4A4738; line-height:1.55; margin:0 0 16px;">Your message is on its way. Here's their direct contact so you can keep the conversation going:</p>
    <p style="font-size:13.5px; color:#17251C; margin:0 0 4px;">${params.providerEmail}</p>
    ${params.providerPhone ? `<p style="font-size:13.5px; color:#17251C; margin:0;">${params.providerPhone}</p>` : ""}
  `);
}

export function reAuditNudgeEmailHtml(params: { daysSince: number; auditUrl: string }) {
  return wrapper(`
    <h1 style="font-family:Georgia,serif; font-size:20px; color:#17251C; margin:0 0 12px;">It's been ${params.daysSince} days</h1>
    <p style="font-size:14px; color:#4A4738; line-height:1.55; margin:0 0 20px;">Energy and resilience shift over a few months, not overnight. Worth a quick re-check to see what's changed.</p>
    <a href="${params.auditUrl}" style="display:inline-block; background:#1B3328; color:#EFEBDD; text-decoration:none; padding:11px 18px; border-radius:4px; font-size:12.5px;">Retake the audit →</a>
  `);
}

export function passwordRecoveryEmailHtml(params: { recoveryUrl: string }) {
  const recoveryUrl = escapeHtml(params.recoveryUrl);
  return wrapper(`
    <div style="font-family:'Courier New',monospace; font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:#4F7A5B; margin-bottom:12px;">Secure account recovery</div>
    <h1 style="font-family:Georgia,serif; font-size:26px; font-weight:400; line-height:1.15; color:#17251C; margin:0 0 14px;">Choose a new password</h1>
    <p style="font-size:14px; color:#4A4738; line-height:1.65; margin:0 0 22px;">We received a request to reset your Echonflow password. This private link can be used once.</p>
    <a href="${recoveryUrl}" style="display:inline-block; background:#1B3328; color:#EFEBDD; text-decoration:none; padding:13px 20px; border-radius:5px; font-size:12.5px; font-weight:600;">Reset my password →</a>
    <p style="font-size:12px; color:#747765; line-height:1.6; margin:24px 0 0;">If you did not request this, you can safely ignore this email. Your current password will remain unchanged.</p>
  `);
}

export function secureSignInEmailHtml(params: { signInUrl: string }) {
  const signInUrl = escapeHtml(params.signInUrl);
  return wrapper(`
    <div style="font-family:'Courier New',monospace; font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:#4F7A5B; margin-bottom:12px;">Private Echonflow workspace</div>
    <h1 style="font-family:Georgia,serif; font-size:26px; font-weight:400; line-height:1.15; color:#17251C; margin:0 0 14px;">Your secure sign-in link</h1>
    <p style="font-size:14px; color:#4A4738; line-height:1.65; margin:0 0 22px;">Use this private, one-time link to open Echonflow Growth OS.</p>
    <a href="${signInUrl}" style="display:inline-block; background:#1B3328; color:#EFEBDD; text-decoration:none; padding:13px 20px; border-radius:5px; font-size:12.5px; font-weight:600;">Open Growth OS →</a>
    <p style="font-size:12px; color:#747765; line-height:1.6; margin:24px 0 0;">If you did not request this, you can safely ignore this email.</p>
  `);
}
