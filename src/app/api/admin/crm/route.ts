import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { validateCrmLead } from "@/lib/crm";
import { createServiceClient } from "@/lib/supabase/service";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Submit this update from Echonflow." }, { status: 403 });
  }
  if (!await getAdminUser()) {
    return NextResponse.json({ error: "Your CRM session has expired. Sign in again." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 24_000) return NextResponse.json({ error: "This update is too large." }, { status: 413 });
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "This update could not be read." }, { status: 400 });
  }

  const result = validateCrmLead(body.lead);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  const service = createServiceClient();

  if (body.action === "create") {
    const { data, error } = await service.from("crm_leads").insert(result.input).select("id").single();
    if (error || !data) return NextResponse.json({ error: "This relationship could not be added." }, { status: 503 });
    return NextResponse.json({ id: data.id });
  }

  if (body.action === "update" && typeof body.id === "string" && UUID_RE.test(body.id)) {
    const { data, error } = await service.from("crm_leads").update(result.input).eq("id", body.id).select("id").maybeSingle();
    if (error || !data) return NextResponse.json({ error: "Your changes could not be saved." }, { status: 503 });
    return NextResponse.json({ id: data.id });
  }

  return NextResponse.json({ error: "This update is not valid." }, { status: 400 });
}
