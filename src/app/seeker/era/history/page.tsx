import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { bandFor } from "@/lib/era-questions";

export default async function EraHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: responses } = await supabase
    .from("era_responses")
    .select("id, score, created_at")
    .eq("seeker_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <Link href="/seeker/era" className="mb-5 inline-block font-mono text-[11.5px] uppercase text-moss">
        ← Back to audit
      </Link>
      <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">
        Energy &amp; Resilience Audit
      </div>
      <h1 className="mb-7 font-display text-[30px] font-medium text-ink">Your past results</h1>

      {(!responses || responses.length === 0) && (
        <p className="font-body text-[#8C8770]">
          No results yet — take the audit to start building your history.
        </p>
      )}

      <div className="flex flex-col">
        {responses?.map((r, i) => {
          const score = r.score ?? 0;
          const band = bandFor(score);
          return (
            <Link
              key={r.id}
              href={`/seeker/era/results/${r.id}`}
              className="flex items-center justify-between gap-4 border-b border-[#DCD6BF] py-4"
            >
              <div>
                <div className="font-body text-[14.5px] font-semibold text-ink">
                  {new Date(r.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {i === 0 && (
                    <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.05em] text-gold">
                      Most recent
                    </span>
                  )}
                </div>
                <div className="mt-0.5 font-body text-[13px] text-[#4A4738]">
                  {score}% — {band.name}
                </div>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.05em] text-moss">
                View →
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
