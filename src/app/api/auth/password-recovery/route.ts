import { NextResponse } from "next/server";
import { authDestination } from "@/lib/auth-destination";
import { passwordRecoveryEmailHtml, sendEmail } from "@/lib/email";
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
  if (!allowRequest(`password-recovery:${forwardedFor}`)) {
    return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });
  }

  let body: { email?: unknown; returnTo?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!emailPattern.test(email) || email.length > 254) {
    return NextResponse.json({ ok: false, reason: "invalid_email" }, { status: 400 });
  }

  const returnTo = authDestination(typeof body.returnTo === "string" ? body.returnTo : null) ?? "/seeker";
  const resetPage = `/auth/reset-password?next=${encodeURIComponent(returnTo)}`;
  const confirmUrl = new URL("/auth/confirm", origin);

  const supabase = createServiceClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
  });

  // Keep the response identical when no account exists, so this public form
  // cannot be used to discover who has an Echonflow account.
  if (error || !data.properties.hashed_token) {
    const detail = `${error?.code ?? ""} ${error?.message ?? ""}`.toLowerCase();
    if (detail.includes("not found") || detail.includes("does not exist")) return genericSuccess();
    console.error("[password-recovery] link generation failed", error);
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  confirmUrl.searchParams.set("token_hash", data.properties.hashed_token);
  confirmUrl.searchParams.set("type", "recovery");
  confirmUrl.searchParams.set("next", resetPage);

  const result = await sendEmail({
    to: email,
    subject: "Reset your Echonflow password",
    html: passwordRecoveryEmailHtml({ recoveryUrl: confirmUrl.toString() }),
  });

  if (!result || ("error" in result && result.error)) {
    console.error("[password-recovery] Resend delivery failed", result && "error" in result ? result.error : null);
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  return genericSuccess();
}
