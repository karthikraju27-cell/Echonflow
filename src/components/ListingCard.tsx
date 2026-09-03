import Link from "next/link";
import type { Listing } from "@/lib/database.types";

export function ListingCard({ listing, href }: { listing: Listing; href?: string }) {
  const content = (
    <>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-moss">
          {listing.category}
        </span>
        {listing.category === "Resort" && listing.wrs_score != null && (
          <span
            className="font-mono text-[10px] uppercase tracking-[0.08em] text-gold"
            title="WRS™ scoring uses a placeholder methodology and is not yet final."
          >
            WRS™ {listing.wrs_score} · {listing.wrs_tier}{" "}
            <span className="text-[#8C8770]">(beta)</span>
          </span>
        )}
      </div>
      <div className="mb-1 font-display text-lg font-medium text-ink">{listing.business_name}</div>
      <div className="mb-2 font-body text-[13px] text-[#4A4738]">{listing.location}</div>
      {listing.description && (
        <div className="mb-2 font-body text-[13px] leading-relaxed text-[#4A4738]">
          {listing.description}
        </div>
      )}
      {listing.price_range && (
        <div className="font-mono text-[11px] text-gold">{listing.price_range}</div>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-md border border-[#DCD6BF] bg-card p-4">
        {content}
      </Link>
    );
  }

  return <div className="rounded-md border border-[#DCD6BF] bg-card p-4">{content}</div>;
}
