import { NextResponse } from "next/server";
import { authDestination } from "@/lib/auth-destination";
import { createClient } from "@/lib/supabase/server";

function recoveryReturnTo(destination: string, origin: string) {
  if (!destination.startsWith("/auth/reset-password")) return "/seeker";
  const resetUrl = new URL(destination, origin);
  return authDestination(resetUrl.searchParams.get("next")) ?? "/seeker";
}

function recoveryFailure(origin: string, returnTo: string) {
  const url = new URL("/auth/forgot-password", origin);
  url.searchParams.set("next", returnTo);
  url.searchParams.set("problem", "link_expired");
  return NextResponse.redirect(url);
}

function signInFailure(origin: string) {
  const url = new URL("/auth/admin", origin);
  url.searchParams.set("problem", "link_expired");
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const rawType = searchParams.get("type");
  const requested = authDestination(searchParams.get("next"));
  const destination = requested ?? "/seeker";
  const returnTo = recoveryReturnTo(destination, origin);

  if (!tokenHash || (rawType !== "recovery" && rawType !== "magiclink")) {
    return recoveryFailure(origin, returnTo);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type: rawType,
    token_hash: tokenHash,
  });

  if (error) return rawType === "recovery"
    ? recoveryFailure(origin, returnTo)
    : signInFailure(origin);
  return NextResponse.redirect(new URL(destination, origin));
}
