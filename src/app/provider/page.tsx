import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingForm } from "@/components/provider/ListingForm";
import { ListingCard } from "@/components/ListingCard";

export default async function ProviderDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("owner_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-1.5 font-display text-[32px] font-medium text-ink">Your provider space</h1>
      <p className="mb-8 font-body text-[14.5px] text-[#4A4738]">
        List your practice so seekers can find you in the Echonflow directory.
      </p>

      <ListingForm ownerId={user!.id} />

      <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">
        Your listings ({listings?.length ?? 0})
      </div>
      {(!listings || listings.length === 0) && (
        <p className="font-body text-[#8C8770]">Nothing published yet.</p>
      )}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
        {listings?.map((l) => (
          <div key={l.id}>
            <ListingCard listing={l} href={`/seeker/directory/${l.id}`} />
            {l.category === "Resort" && (
              <Link
                href={`/provider/listings/${l.id}/wrs`}
                className="mt-2 inline-block font-mono text-[10.5px] uppercase tracking-[0.06em] text-gold"
              >
                {l.wrs_score != null ? "Update" : "Take"} WRS™ assessment →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
