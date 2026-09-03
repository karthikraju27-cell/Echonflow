import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail, newLeadEmailHtml, leadConfirmationEmailHtml } from "@/lib/email";

export async function POST(request: Request) {
  // Basic anti-abuse: this only fires from the signed-in seeker directory
  // flow, so require a session (doesn't need to match leadEmail exactly,
  // since the form allows editing the pre-filled address).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await request.json();
  const { listingId, leadName, leadEmail, leadPhone, leadMessage } = body as {
    listingId: string;
    leadName: string;
    leadEmail: string;
    leadPhone: string | null;
    leadMessage: string | null;
  };

  if (!listingId || !leadName || !leadEmail) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const service = createServiceClient();
  const { data: listing } = await service
    .from("listings")
    .select("business_name, owner_id")
    .eq("id", listingId)
    .single();
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const { data: provider } = await service
    .from("profiles")
    .select("name, email, phone")
    .eq("id", listing.owner_id)
    .single();
  if (!provider) return NextResponse.json({ ok: true }); // nothing to notify

  const origin = new URL(request.url).origin;

  await sendEmail({
    to: provider.email,
    subject: `New lead — ${listing.business_name}`,
    html: newLeadEmailHtml({
      listingName: listing.business_name,
      leadName,
      leadEmail,
      leadPhone,
      leadMessage,
      leadsUrl: `${origin}/provider/leads`,
    }),
  });

  await sendEmail({
    to: leadEmail,
    subject: `You reached out to ${listing.business_name}`,
    html: leadConfirmationEmailHtml({
      providerName: listing.business_name,
      providerEmail: provider.email,
      providerPhone: provider.phone,
    }),
  });

  return NextResponse.json({ ok: true });
}
