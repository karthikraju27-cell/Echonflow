import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateOnboarding } from "@/lib/provider-onboarding";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return NextResponse.json({ error: "Please submit from the Echonflow website." }, { status: 403 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Your session expired. Save your draft, sign in again, and restore it." }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "provider") return NextResponse.json({ error: "A provider account is required." }, { status: 403 });
  let body;
  try {
    const raw = await request.text();
    if (raw.length > 20000) return NextResponse.json({ error: "Submission too large." }, { status: 413 });
    body = JSON.parse(raw);
  } catch { return NextResponse.json({ error: "Invalid submission." }, { status: 400 }); }
  const result = validateOnboarding(body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  const { data: id, error } = await supabase.rpc("publish_provider_onboarding", { p_id: result.id, p_draft: result.draft });
  if (error || !id) return NextResponse.json({ error: "We couldn’t publish your listing. Your details are still here. Please retry or contact Echonflow." }, { status: 503 });
  return NextResponse.json({ id });
}
