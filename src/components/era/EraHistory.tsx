import { bandFor } from "@/lib/era-questions";
import type { EraResponse } from "@/lib/database.types";

export function EraHistory({ responses }: { responses: EraResponse[] }) {
  if (responses.length === 0) return null;

  return (
    <div className="mt-14 max-w-[600px] border-t border-[#DCD6BF] pt-8">
      <div className="mb-4 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">
        Your past results
      </div>
      <div className="flex flex-col">
        {responses.map((r, i) => {
          const score = r.score ?? 0;
          const band = bandFor(score);
          return (
            <div
              key={r.id}
              className="flex items-center justify-between gap-4 border-b border-[#DCD6BF] py-3"
            >
              <span className="font-mono text-[12px] text-[#8C8770]">
                {new Date(r.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
                {i === 0 ? " · most recent" : ""}
              </span>
              <span className="font-body text-[13.5px] text-[#4A4738]">
                {score}% — {band.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
