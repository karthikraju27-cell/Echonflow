import { NextResponse } from "next/server";
import { hasAdminAccess } from "@/lib/admin-access";
import { validateProspect } from "@/lib/provider-recruitment";
import { createServiceClient } from "@/lib/supabase/service";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Submit this update from Echonflow." }, { status: 403 });
  }
  if (!hasAdminAccess(request.headers.get("x-admin-key"))) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 20_000) return NextResponse.json({ error: "Update too large." }, { status: 413 });
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }

  const result = validateProspect(body.prospect);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  const service = createServiceClient();

  if (body.action === "create") {
    const { data, error } = await service
      .from("provider_prospects")
      .insert(result.input)
      .select("id")
      .single();
    if (error || !data) return NextResponse.json({ error: "Could not add this provider." }, { status: 503 });
    return NextResponse.json({ id: data.id });
  }

  if (body.action === "update" && typeof body.id === "string" && UUID_RE.test(body.id)) {
    const { data, error } = await service
      .from("provider_prospects")
      .update(result.input)
      .eq("id", body.id)
      .select("id")
      .maybeSingle();
    if (error || !data) return NextResponse.json({ error: "Could not save this provider." }, { status: 503 });
    return NextResponse.json({ id: data.id });
  }

  return NextResponse.json({ error: "Invalid update." }, { status: 400 });
}
