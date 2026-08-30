"use client";

import { useEffect, useMemo, useState } from "react";
import Script from "next/script";
import type { VartaPost } from "@/lib/database.types";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

export function VartaClient({ posts }: { posts: VartaPost[] }) {
  const categories = useMemo(
    () => ["all", ...Array.from(new Set(posts.map((p) => p.category)))],
    [posts]
  );
  const [cat, setCat] = useState("all");
  const filtered = posts.filter((p) => cat === "all" || p.category === cat);

  useEffect(() => {
    window.instgrm?.Embeds.process();
  }, [filtered]);

  return (
    <div>
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
        onLoad={() => window.instgrm?.Embeds.process()}
      />
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((c) => (
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
        <p className="font-body text-[#8C8770]">Nothing in this category yet.</p>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="rounded-md border border-[#DCD6BF] bg-card p-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-moss">
                {p.category}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-gold">
                {p.type}
              </span>
            </div>
            <div className="mb-2 font-display text-base font-medium text-ink">{p.title}</div>
            {p.blurb && (
              <p className="mb-3 font-body text-[13px] leading-relaxed text-[#4A4738]">{p.blurb}</p>
            )}
            {p.instagram_id && (
              <blockquote
                className="instagram-media"
                data-instgrm-permalink={`https://www.instagram.com/reel/${p.instagram_id}/`}
                data-instgrm-version="14"
                style={{ margin: 0 }}
              />
            )}
            {p.curator && (
              <div className="mt-3 font-mono text-[10.5px] text-[#8C8770]">curated by {p.curator}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
