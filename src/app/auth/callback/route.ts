import { authDestination } from "@/lib/auth-destination";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function recoveryDestination(value: string, origin: string) {
  const resetUrl = new URL(value, origin);
  return authDestination(resetUrl.searchParams.get("next")) ?? "/seeker";
}

function failedLinkDestination(destination: string, origin: string) {
  if (destination.startsWith("/auth/reset-password")) {
    const url = new URL("/auth/forgot-password", origin);
    url.searchParams.set("next", recoveryDestination(destination, origin));
    url.searchParams.set("problem", "link_expired");
    return url;
  }

  const authPath = destination.startsWith("/admin")
    ? "/auth/admin"
    : destination.startsWith("/provider") ? "/auth/provider" : "/auth/seeker";
  const url = new URL(authPath, origin);
  url.searchParams.set("next", destination);
  url.searchParams.set("problem", "link_expired");
  return url;
}

// Handles the redirect from Supabase email confirmation and magic links.
// Exchanges the auth code for a session; middleware then routes the user to
// the correct hub based on their stored role.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const destination = authDestination(searchParams.get("next")) ?? "/seeker";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(failedLinkDestination(destination, origin));
  } else if (searchParams.has("error")) {
    return NextResponse.redirect(failedLinkDestination(destination, origin));
  }

  return NextResponse.redirect(new URL(destination, origin));
}
