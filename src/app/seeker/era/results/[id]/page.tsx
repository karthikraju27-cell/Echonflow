import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EraResults } from "@/components/era/EraResults";
import { sectionScores as computeSectionScores, type EraAnswer } from "@/lib/era-questions";

// RLS (`era_responses: owner can select`) already scopes this to rows the
// signed-in seeker owns — a mismatched id just returns no row, so no
// separate ownership check is needed here.
export default async function EraResultRowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: row } = await supabase.from("era_responses").select("*").eq("id", id).single();
  if (!row) notFound();

  const answers = row.answers as Record<string, EraAnswer>;
  // Older rows predating the section_scores column (migration 0006) won't
  // have it stored — recompute from answers as a fallback.
  const scores =
    (row.section_scores as Record<string, number | null> | null) ?? computeSectionScores(answers);

  return (
    <div>
      <Link
        href="/seeker/era/history"
        className="mb-5 inline-block font-mono text-[11.5px] uppercase text-moss"
      >
        ← Back to history
      </Link>
      <div className="mb-7 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">
        Result from{" "}
        {new Date(row.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>

      <EraResults
        answers={answers}
        scores={scores}
        overall={row.score ?? 0}
        seekerId={user?.id}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/seeker/era"
              className="rounded bg-forest px-[18px] py-[11px] font-mono text-[11.5px] uppercase tracking-[0.06em] text-mist"
            >
              Retake the audit
            </Link>
            <Link
              href="/seeker/era/history"
              className="font-mono text-[11px] uppercase tracking-[0.05em] text-moss"
            >
              View all past results →
            </Link>
          </div>
        }
      />
    </div>
  );
}
