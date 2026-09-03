"use client";

import { useState } from "react";
import { PROVIDER_CATEGORIES } from "@/lib/constants";
import { ERA_SECTIONS } from "@/lib/era-questions";
import { ListingCard } from "@/components/ListingCard";
import type { Listing, ProviderCategory } from "@/lib/database.types";

const FILTERS = ["all", ...PROVIDER_CATEGORIES] as const;

export function DirectoryClient({
  listings,
  initialSection,
}: {
  listings: Listing[];
  initialSection?: string;
}) {
  const validInitialSection = ERA_SECTIONS.some((s) => s.id === initialSection)
    ? initialSection
    : undefined;
  const [cat, setCat] = useState<(typeof FILTERS)[number]>("all");
  const [sectionFilter, setSectionFilter] = useState<string | undefined>(validInitialSection);

  const sectionMatched = sectionFilter
    ? listings.filter((l) => (l.era_section_tags ?? []).includes(sectionFilter))
    : listings;
  const sectionFilterIsEmpty = !!sectionFilter && sectionMatched.length === 0;
  const base = sectionFilterIsEmpty ? listings : sectionMatched;
  const filtered = base.filter((l) => cat === "all" || l.category === (cat as ProviderCategory));

  const sectionName = ERA_SECTIONS.find((s) => s.id === sectionFilter)?.name;

  return (
    <div>
      {sectionFilter && (
        <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-md border border-[#DCD6BF] bg-card px-4 py-3">
          {sectionFilterIsEmpty ? (
            <p className="font-body text-[13px] text-[#4A4738]">
              No providers tagged for {sectionName} yet — here&apos;s everyone currently on
              Echonflow.
            </p>
          ) : (
            <p className="font-body text-[13px] text-[#4A4738]">
              Matched to your audit: <span className="font-semibold text-ink">{sectionName}</span>
            </p>
          )}
          <button
            type="button"
            onClick={() => setSectionFilter(undefined)}
            className="font-mono text-[10.5px] uppercase tracking-[0.05em] text-moss"
          >
            Clear match ×
          </button>
        </div>
      )}

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
