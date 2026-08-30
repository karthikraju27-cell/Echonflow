"use client";

import { useState } from "react";
import { PROVIDER_CATEGORIES } from "@/lib/constants";
import { ListingCard } from "@/components/ListingCard";
import type { Listing, ProviderCategory } from "@/lib/database.types";

const FILTERS = ["all", ...PROVIDER_CATEGORIES] as const;

export function DirectoryClient({ listings }: { listings: Listing[] }) {
  const [cat, setCat] = useState<(typeof FILTERS)[number]>("all");
  const filtered = listings.filter((l) => cat === "all" || l.category === (cat as ProviderCategory));

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded px-[18px] py-[11px] font-mono text-[11.5px] uppercase tracking-[0.06em] ${
              cat === c
                ? "border border-forest bg-forest text-mist"
                : "border border-[#C9C3AC] text-[#4A4738]"
            }`}
          >
            {c === "all" ? "All" : c}
          </button>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="font-body text-[#8C8770]">No providers listed under this category yet.</p>
      )}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
        {filtered.map((l) => (
          <ListingCard key={l.id} listing={l} href={`/seeker/directory/${l.id}`} />
        ))}
      </div>
    </div>
  );
}
