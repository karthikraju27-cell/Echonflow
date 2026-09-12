import { createClient } from "@/lib/supabase/server";
import { BackToHub } from "@/components/BackToHub";
import { ProviderLeadTracker } from "@/components/provider/ProviderLeadTracker";

export default async function ProviderLeadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listings } = await supabase
    .from("listings")
    .select("id, business_name")
    .eq("owner_id", user!.id);

  const listingIds = (listings ?? []).map((l) => l.id);
  const { data: leads } =
    listingIds.length > 0
      ? await supabase
          .from("leads")
          .select("*")
          .in("listing_id", listingIds)
          .order("created_at", { ascending: false })
      : { data: [] };

  const leadIds = (leads ?? []).map((lead) => lead.id);
  const { data: followups } = leadIds.length
    ? await supabase.from("lead_followups").select("*").in("lead_id", leadIds)
    : { data: [] };

  return (
    <div>
      <BackToHub href="/provider" />
      <ProviderLeadTracker
        leads={leads ?? []}
        followups={followups ?? []}
        listingNames={Object.fromEntries(
          (listings ?? []).map((listing) => [listing.id, listing.business_name])
        )}
      />
    </div>
  );
}
