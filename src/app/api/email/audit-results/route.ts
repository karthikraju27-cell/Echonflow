import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, auditResultsEmailHtml } from "@/lib/email";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await request.json();
  const { overall, bandName, bandCopy, sections } = body as {
    overall: number;
    bandName: string;
    bandCopy: string;
    sections: { name: string; value: number | null }[];
  };

  if (typeof overall !== "number" || !bandName || !Array.isArray(sections)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  await sendEmail({
    to: user.email!,
    subject: `Your Energy & Resilience Audit results — ${overall}% (${bandName})`,
    html: auditResultsEmailHtml({
      overall,
      bandName,
      bandCopy,
      sections,
      resultsUrl: `${origin}/seeker/era`,
    }),
  });

  return NextResponse.json({ ok: true });
}
