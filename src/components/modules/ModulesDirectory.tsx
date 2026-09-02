"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MODULES,
  TRACKS,
  moduleCode,
  moduleMinutes,
  trackName,
  totalChapters,
} from "@/lib/modules-data";

const FILTERS = ["all", ...Object.keys(TRACKS)];

export function ModulesDirectory() {
  const [track, setTrack] = useState("all");
  const filtered = MODULES.filter((m) => track === "all" || m.track === track);

  return (
    <div>
      <h1 className="mb-1.5 font-display text-[30px] font-medium text-ink">
        {MODULES.length} modules. {totalChapters()} chapters.
      </h1>
      <p className="mb-6 max-w-[60ch] font-body text-[14.5px] text-[#4A4738]">
        Ordered to build from foundations to specifics — but every module stands on its own.
        Jump around freely.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((t) => (
          <button
            key={t}
            onClick={() => setTrack(t)}
            className={`rounded-full px-3.5 py-[7px] font-mono text-[11px] uppercase tracking-[0.03em] ${
              track === t
                ? "border border-forest bg-forest text-mist"
                : "border border-[#C9C3AC] text-[#4A4738]"
            }`}
          >
            {t === "all" ? "All modules" : trackName(t)}
          </button>
        ))}
      </div>

      <div className="border-t border-[#DCD6BF]">
        {filtered.map((m) => (
          <Link
            key={m.id}
            href={`/seeker/modules/${m.id}`}
            className="grid grid-cols-[56px_1fr_auto] items-start gap-4 border-b border-[#DCD6BF] py-6 sm:grid-cols-[64px_1fr_120px_90px]"
          >
            <div className="pt-0.5 font-mono text-[13px] text-[#8C8770]">{moduleCode(m)}</div>
            <div>
              <div className="font-display text-[19px] font-medium text-ink">{m.title}</div>
              <div className="mt-1.5 max-w-[62ch] font-body text-[13.5px] text-[#4A4738]">
                {m.blurb}
              </div>
            </div>
            <div className="hidden pt-0.5 sm:block">
              <span className="rounded-full border border-[#C9C3AC] px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.03em] text-[#4A4738]">
                {trackName(m.track)}
              </span>
            </div>
            <div className="col-start-3 pt-0.5 text-right font-mono text-[12px] text-[#8C8770] sm:col-start-4">
              {m.chapters.length} ch · {moduleMinutes(m)}m
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
