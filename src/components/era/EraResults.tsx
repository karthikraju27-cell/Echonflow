import type { ReactNode } from "react";
import Link from "next/link";
import {
  ERA_SECTIONS,
  bandFor,
  priorityTrack,
  retreatInterest,
  buildRecommendations,
  type EraAnswer,
} from "@/lib/era-questions";

// Renders a full ERA results view from a set of answers + section scores —
// used both for a just-completed attempt (EraFlow) and a historical row
// re-rendered from storage (/seeker/era/results/[id]). `actions` lets each
// caller supply its own bottom button row, since "retake" behaves
// differently in each context (reset in place vs. navigate to /seeker/era).
export function EraResults({
  answers,
  scores,
  overall,
  seekerId,
  actions,
}: {
  answers: Record<string, EraAnswer>;
  scores: Record<string, number | null>;
  overall: number;
  seekerId?: string;
  actions: ReactNode;
}) {
  const band = bandFor(overall);
  const track = priorityTrack(answers);
  const hasRetreatInterest = retreatInterest(answers);
  const recs = buildRecommendations(scores, track, hasRetreatInterest);
  const weakestSectionId = Object.entries(scores)
    .filter((entry): entry is [string, number] => entry[1] !== null)
    .sort((a, b) => a[1] - b[1])[0]?.[0];
  const weakestSectionName = ERA_SECTIONS.find((s) => s.id === weakestSectionId)?.name;

  return (
    <div className="max-w-[720px]">
      <div className="mb-8 flex flex-wrap items-center gap-6">
        <div className="font-display text-[56px] font-medium leading-none text-ink">
          {overall}
          <span className="text-[28px] text-[#8C8770]">%</span>
        </div>
        <div>
          <h1 className="font-display text-[26px] font-medium text-ink">{band.name}</h1>
          <p className="mt-1.5 max-w-[52ch] font-body text-[14.5px] text-[#4A4738]">
            {band.copy}
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-md border border-[#DCD6BF] bg-card p-[24px]">
        <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.06em] text-moss">
          Breakdown by area
        </div>
        <div className="flex flex-col gap-4">
          {ERA_SECTIONS.map((s) => {
            const v = scores[s.id] ?? 0;
            return (
              <div key={s.id}>
                <div className="mb-1.5 flex justify-between font-body text-[13.5px] text-[#4A4738]">
                  <span>{s.name}</span>
                  <span className="font-mono">{v}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#DCD6BF]">
                  <div className="h-1.5 rounded-full bg-moss" style={{ width: `${v}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {seekerId && weakestSectionId && (
        <div className="mb-8 rounded-md border border-[#DCD6BF] bg-card p-[22px]">
          <p className="mb-3.5 font-body text-[14px] text-ink">
            {weakestSectionName} scored lowest — see providers matched to that.
          </p>
          <Link
            href={`/seeker/directory?section=${weakestSectionId}`}
            className="inline-block rounded bg-forest px-[18px] py-[11px] font-mono text-[11.5px] uppercase tracking-[0.06em] text-mist"
          >
            See matched providers →
          </Link>
        </div>
      )}

      {!seekerId && (
        <div className="mb-8 rounded-md border border-[#DCD6BF] bg-[#F6E9D2] p-[22px]">
          <p className="mb-3.5 font-body text-[14px] text-ink">
            Create a free account to save this and get matched to providers.
          </p>
          <Link
            href="/auth/seeker"
            className="inline-block rounded bg-forest px-[18px] py-[11px] font-mono text-[11.5px] uppercase tracking-[0.06em] text-mist"
          >
            Create free account →
          </Link>
        </div>
      )}

      <p className="mb-8 max-w-[64ch] font-body text-[12.5px] text-[#8C8770]">
        Your individual answers are yours — never shared with an employer, full stop.
      </p>

      <h2 className="mb-4 font-display text-[22px] font-medium text-ink">Where to start</h2>
      <div className="mb-9 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
        {recs.map((r, i) =>
          r.retreat ? (
            <Link
              key={i}
              href="/seeker/retreats"
              className="flex flex-col gap-2 rounded-md border border-[#DCD6BF] bg-card p-5"
            >
              <span className="w-fit rounded-full border border-[#C9C3AC] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.04em] text-[#4A4738]">
                {r.tag}
              </span>
              <h3 className="font-display text-[17px] font-medium text-ink">{r.title}</h3>
              <p className="font-body text-[13px] text-[#4A4738]">{r.why}</p>
              <span className="mt-auto pt-2 font-mono text-[11px] text-gold">
                Retreats &amp; sessions →
              </span>
            </Link>
          ) : (
            <Link
              key={i}
              href={`/seeker/modules/${r.moduleId}/${r.chapterId}`}
              className="flex flex-col gap-2 rounded-md border border-[#DCD6BF] bg-card p-5"
            >
              <span className="w-fit rounded-full border border-[#C9C3AC] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.04em] text-[#4A4738]">
                {r.tag}
              </span>
              <h3 className="font-display text-[17px] font-medium text-ink">{r.chapterTitle}</h3>
              <p className="font-body text-[13px] text-[#4A4738]">{r.why}</p>
              <span className="mt-auto pt-2 font-mono text-[11px] text-gold">
                {r.moduleCode} · {r.moduleTitle} →
              </span>
            </Link>
          )
        )}
      </div>

      {actions}
    </div>
  );
}
