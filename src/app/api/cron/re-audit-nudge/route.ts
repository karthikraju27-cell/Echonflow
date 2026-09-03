import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail, reAuditNudgeEmailHtml } from "@/lib/email";

const MIN_DAYS = 60;
const MAX_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

// Runs daily via Vercel Cron (see vercel.json). For each seeker, looks at
// their most recent era_responses row only — if it's 60-90 days old and
// hasn't been nudged yet, sends a re-audit reminder and marks it nudged.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: responses } = await supabase
    .from("era_responses")
    .select("id, seeker_id, score, created_at, nudge_sent_at")
    .order("seeker_id", { ascending: true })
    .order("created_at", { ascending: false });

  if (!responses) return NextResponse.json({ sent: 0 });

  // Keep only each seeker's most recent response.
  const latestBySeeker = new Map<string, (typeof responses)[number]>();
  for (const r of responses) {
    if (!latestBySeeker.has(r.seeker_id)) latestBySeeker.set(r.seeker_id, r);
  }

  const origin = new URL(request.url).origin;
  let sent = 0;

  for (const r of latestBySeeker.values()) {
    if (r.nudge_sent_at) continue;
    const ageDays = Math.floor((Date.now() - new Date(r.created_at).getTime()) / DAY_MS);
    if (ageDays < MIN_DAYS || ageDays > MAX_DAYS) continue;

    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", r.seeker_id)
      .single();
    if (!profile) continue;

    await sendEmail({
      to: profile.email,
      subject: "It's been a couple of months — how's your energy?",
      html: reAuditNudgeEmailHtml({ daysSince: ageDays, auditUrl: `${origin}/seeker/era` }),
    });

    await supabase
      .from("era_responses")
      .update({ nudge_sent_at: new Date().toISOString() })
      .eq("id", r.id);

    sent++;
  }

  return NextResponse.json({ sent });
}
