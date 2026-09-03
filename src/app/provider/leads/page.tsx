import { createClient } from "@/lib/supabase/server";
import { BackToHub } from "@/components/BackToHub";
import { LeadStatusControl } from "@/components/provider/LeadStatusControl";

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
  const listingNameById = Object.fromEntries((listings ?? []).map((l) => [l.id, l.business_name]));

  const { data: leads } =
    listingIds.length > 0
      ? await supabase
          .from("leads")
          .select("*")
          .in("listing_id", listingIds)
          .order("created_at", { ascending: false })
      : { data: [] };

  return (
    <div>
      <BackToHub href="/provider" />
      <h1 className="mb-1.5 font-display text-[32px] font-medium text-ink">Leads / CRM</h1>
      <p className="mb-8 font-body text-[14.5px] text-[#4A4738]">
        Everyone who&apos;s reached out about one of your listings.
      </p>

      {(!leads || leads.length === 0) && (
        <p className="font-body text-[#8C8770]">
          No leads yet. They&apos;ll show up here once someone contacts you through one of your
          listings.
        </p>
      )}

      <div className="flex flex-col">
        {leads?.map((lead) => (
          <div key={lead.id} className="border-b border-[#DCD6BF] py-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="font-body text-[15px] font-semibold text-ink">{lead.name}</div>
              <div className="font-mono text-[11px] text-[#8C8770]">
                {new Date(lead.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <div className="font-mono text-[10.5px] uppercase tracking-[0.05em] text-moss">
                {lead.listing_id ? listingNameById[lead.listing_id] : "General inquiry"}
              </div>
              <LeadStatusControl leadId={lead.id} status={lead.status} />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-body text-[13px] text-[#4A4738]">
              <a href={`mailto:${lead.email}`} className="text-moss">
                {lead.email}
              </a>
              {lead.phone && <span>{lead.phone}</span>}
            </div>
            {lead.message && (
              <p className="mt-2 font-body text-[13.5px] leading-relaxed text-[#4A4738]">
                {lead.message}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
