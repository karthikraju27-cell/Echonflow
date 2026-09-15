import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin-auth";
import { secureSignInEmailHtml, sendEmail } from "@/lib/email";
import { allowRequest } from "@/lib/request-throttle";
import { createServiceClient } from "@/lib/supabase/service";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function genericSuccess() {
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const requestOrigin = request.headers.get("origin");
  if (requestOrigin && requestOrigin !== origin) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allowRequest(`admin-magic-link:${forwardedFor}`)) {
    return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });
  }

  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!emailPattern.test(email) || email.length > 254) {
    return NextResponse.json({ ok: false, reason: "invalid_email" }, { status: 400 });
  }

  // Return the same response for unapproved addresses so the private allowlist
  // cannot be discovered through this public endpoint.
  if (!isAdminEmail(email)) return genericSuccess();

  const supabase = createServiceClient();
  const { data, error } = await supabase.auth.admin.generateLink({ type: "magiclink", email });
  if (error || !data.properties.hashed_token) {
    console.error("[admin-magic-link] link generation failed", error);
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const confirmUrl = new URL("/auth/confirm", origin);
  confirmUrl.searchParams.set("token_hash", data.properties.hashed_token);
  confirmUrl.searchParams.set("type", "magiclink");
  confirmUrl.searchParams.set("next", "/admin/crm");

  const result = await sendEmail({
    to: email,
    subject: "Your Echonflow sign-in link",
    html: secureSignInEmailHtml({ signInUrl: confirmUrl.toString() }),
  });

  if (!result || ("error" in result && result.error)) {
    console.error("[admin-magic-link] Resend delivery failed", result && "error" in result ? result.error : null);
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  return genericSuccess();
}
