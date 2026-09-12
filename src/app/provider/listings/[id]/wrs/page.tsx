import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { WrsFlow } from "@/components/wrs/WrsFlow";

export default async function ListingWrsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: listing } = await supabase.from("listings").select("*").eq("id", id).single();
  if (!listing) notFound();
  if (listing.owner_id !== user.id) redirect("/provider");
  if (listing.category !== "Resort") redirect("/provider");

  return (
    <div>
      <Link href="/provider/wrs" className="mb-5 inline-block font-mono text-[11.5px] uppercase text-moss">
        ← Back to WRS™ properties
      </Link>
      <h1 className="mb-1.5 font-display text-[30px] font-medium text-ink">
        Workation Readiness Score (WRS™)
      </h1>
      <p className="mb-2 font-body text-[14.5px] text-[#4A4738]">
        Assess {listing.business_name} across the nine dimensions of workation readiness.
      </p>
      <p className="mb-7 font-body text-[12.5px] text-[#8C8770]">
        Beta scoring — this methodology is provisional and will be refined over time.
      </p>
      <WrsFlow
        listingId={listing.id}
        businessName={listing.business_name}
        initialScore={listing.wrs_score}
        initialTier={listing.wrs_tier}
        initialBreakdown={listing.wrs_breakdown}
      />
    </div>
  );
}
