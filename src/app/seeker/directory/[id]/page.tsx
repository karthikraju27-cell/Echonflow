import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ContactProviderForm } from "@/components/directory/ContactProviderForm";

interface WrsCategoryScore {
  title: string;
  score: number;
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: listing } = await supabase.from("listings").select("*").eq("id", id).single();
  if (!listing) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("id", user!.id)
    .single();

  const breakdown = (listing.wrs_breakdown as Record<string, WrsCategoryScore> | null) ?? null;

  return (
    <div>
      <Link
        href="/seeker/directory"
        className="mb-5 inline-block font-mono text-[11.5px] uppercase text-moss"
      >
        ← Back to directory
      </Link>

      <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">
        {listing.category}
      </div>
      <h1 className="mb-1.5 font-display text-[30px] font-medium text-ink">{listing.business_name}</h1>
      <p className="mb-2 font-body text-[14.5px] text-[#4A4738]">{listing.location}</p>
      {listing.description && (
        <p className="mb-2 max-w-[560px] font-body text-[14.5px] leading-relaxed text-[#4A4738]">
          {listing.description}
        </p>
      )}
      {listing.price_range && (
        <p className="mb-7 font-mono text-[12px] text-gold">{listing.price_range}</p>
      )}

      {listing.category === "Resort" && (
        <div className="mb-6 max-w-[480px] rounded-md border border-[#DCD6BF] bg-card p-[22px]">
          <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">
            Workation Readiness Score (WRS™)
          </div>
          {listing.wrs_score != null ? (
            <>
              <div className="mb-1 font-display text-[40px] font-medium text-ink">
                {listing.wrs_score}
              </div>
              <div className="mb-5 font-mono text-[12px] uppercase tracking-[0.08em] text-gold">
                {listing.wrs_tier}
              </div>
              {breakdown && (
                <div className="flex flex-col gap-2.5">
                  {Object.values(breakdown).map((cat) => (
                    <div key={cat.title}>
                      <div className="mb-1 flex justify-between font-body text-[12.5px] text-[#4A4738]">
                        <span>{cat.title}</span>
                        <span>{cat.score}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[#DCD6BF]">
                        <div
                          className="h-1.5 rounded-full bg-moss"
                          style={{ width: `${cat.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="font-body text-[13px] text-[#8C8770]">
              This property hasn&apos;t completed its WRS™ assessment yet.
            </p>
          )}
        </div>
      )}

      <div className="max-w-[420px] rounded-md border border-[#DCD6BF] bg-card p-[22px]">
        {listing.payment_link ? (
          <>
            <p className="mb-3.5 font-body text-[13.5px] text-[#4A4738]">
              Ready to book with {listing.business_name}?
            </p>
            <a
              href={listing.payment_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded bg-forest px-[18px] py-[11px] font-mono text-[11.5px] uppercase tracking-[0.06em] text-mist"
            >
              Book &amp; pay →
            </a>
          </>
        ) : (
          <ContactProviderForm
            seekerId={user!.id}
            listingId={listing.id}
            businessName={listing.business_name}
            defaultName={profile?.name ?? ""}
            defaultEmail={profile?.email ?? ""}
          />
        )}
      </div>
    </div>
  );
}
