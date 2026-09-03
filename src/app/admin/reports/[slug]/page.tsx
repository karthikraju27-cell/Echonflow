import { createServiceClient } from "@/lib/supabase/service";
import { ERA_SECTIONS } from "@/lib/era-questions";

// Personal-use gate, not a real admin system — a shared secret in
// ADMIN_REPORT_SECRET, checked against ?key=. Same trust model as
// CRON_SECRET. Anything wrong (bad key, unknown slug) renders the same
// generic message, so this page never confirms or denies a slug exists.
function Locked() {
  return (
    <div className="mx-auto max-w-[560px] px-6 py-24 text-center">
      <p className="font-body text-[14px] text-[#8C8770]">Not found.</p>
    </div>
  );
}

export default async function CompanyReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const { slug } = await params;
  const { key } = await searchParams;

  if (!process.env.ADMIN_REPORT_SECRET || key !== process.env.ADMIN_REPORT_SECRET) {
    return <Locked />;
  }

  const supabase = createServiceClient();
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!company) return <Locked />;

  const { count: totalProfiles } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("company_id", company.id);

  const { data: responses } = await supabase
    .from("era_responses")
    .select("score, section_scores")
    .eq("company_id", company.id);

  const totalResponses = responses?.length ?? 0;
  const totalSignedUp = totalProfiles ?? 0;
  const completionRate = totalSignedUp > 0 ? Math.round((totalResponses / totalSignedUp) * 100) : 0;
  const belowThreshold = totalResponses < company.min_report_threshold;

  let avgOverall: number | null = null;
  const avgBySection: Record<string, number> = {};
  if (!belowThreshold && responses) {
    avgOverall = Math.round(
      responses.reduce((sum, r) => sum + (r.score ?? 0), 0) / totalResponses
    );
    for (const section of ERA_SECTIONS) {
      const values = responses
        .map((r) => (r.section_scores as Record<string, number | null> | null)?.[section.id])
        .filter((v): v is number => v !== null && v !== undefined);
      avgBySection[section.id] = values.length
        ? Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
        : 0;
    }
  }

  return (
    <div className="min-h-screen bg-mist">
      <div className="mx-auto max-w-[720px] px-6 py-16">
        <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">
          Pilot report
        </div>
        <h1 className="mb-8 font-display text-[30px] font-medium text-ink">{company.name}</h1>

        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-md border border-[#DCD6BF] bg-card p-5">
            <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.06em] text-moss">
              Signed up
            </div>
            <div className="font-display text-[28px] font-medium text-ink">{totalSignedUp}</div>
          </div>
          <div className="rounded-md border border-[#DCD6BF] bg-card p-5">
            <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.06em] text-moss">
              Audits completed
            </div>
            <div className="font-display text-[28px] font-medium text-ink">{totalResponses}</div>
          </div>
          <div className="rounded-md border border-[#DCD6BF] bg-card p-5">
            <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.06em] text-moss">
              Completion rate
            </div>
            <div className="font-display text-[28px] font-medium text-ink">{completionRate}%</div>
          </div>
        </div>

        {belowThreshold ? (
          <div className="rounded-md border border-[#DCD6BF] bg-card p-[24px]">
            <p className="font-body text-[14px] text-[#4A4738]">
              Not enough responses yet for a breakdown.
            </p>
          </div>
        ) : (
          <div className="rounded-md border border-[#DCD6BF] bg-card p-[24px]">
            <div className="mb-6 flex items-baseline gap-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-moss">
                Average overall score
              </span>
              <span className="font-display text-[22px] font-medium text-ink">{avgOverall}%</span>
            </div>
            <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.06em] text-moss">
              Average by area
            </div>
            <div className="flex flex-col gap-4">
              {ERA_SECTIONS.map((s) => {
                const v = avgBySection[s.id] ?? 0;
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
        )}

        <p className="mt-8 max-w-[64ch] font-body text-[12.5px] text-[#8C8770]">
          Aggregate only — individual responses are never shown or linked from this page.
        </p>
      </div>
    </div>
  );
}
