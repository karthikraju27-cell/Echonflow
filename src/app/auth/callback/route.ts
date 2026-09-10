import { authDestination } from "@/lib/auth-destination";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles the redirect from Supabase email confirmation and magic links.
// Exchanges the auth code for a session; middleware then routes the user to
// the correct hub based on their stored role.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(`${origin}/auth/seeker`);
  }

  return NextResponse.redirect(`${origin}${authDestination(searchParams.get("next")) ?? "/seeker"}`);
}
