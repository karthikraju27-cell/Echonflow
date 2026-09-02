import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { QUIZZES, QUIZ_PASS_PCT } from "@/lib/quizzes-data";
import { findModule, moduleCode, totalChapters } from "@/lib/modules-data";
import { CertificateDoc } from "@/components/certificate/CertificateDoc";

export default async function CertificatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: progressRows } = await supabase
    .from("module_quiz_progress")
    .select("*")
    .eq("seeker_id", user!.id);

  const progressByModule = Object.fromEntries((progressRows ?? []).map((p) => [p.module_id, p]));
  const passedCount = QUIZZES.filter((q) => progressByModule[q.moduleId]?.passed).length;
  const totalCount = QUIZZES.length;
  const allDone = passedCount === totalCount;

  const { data: cert } = await supabase
    .from("certificates")
    .select("*")
    .eq("seeker_id", user!.id)
    .maybeSingle();

  return (
    <div>
      <Link
        href="/seeker/modules"
        className="mb-5 inline-block font-mono text-[11.5px] uppercase text-moss"
      >
        ← Back to curriculum
      </Link>
      <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">
        Certification
      </div>
      <h1 className="mb-2 font-display text-[30px] font-medium text-ink">
        Certificate of Completion
      </h1>
      <p className="max-w-[64ch] font-body text-[14.5px] text-[#4A4738]">
        One quiz per module — 13 modules, {totalChapters()} chapters. Pass every module quiz at{" "}
        {QUIZ_PASS_PCT}% or better to earn your certificate.
      </p>

      <div className="mt-6 max-w-[420px]">
        <div className="mb-2 font-mono text-[11px] text-[#8C8770]">
          {passedCount} of {totalCount} modules passed
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#DCD6BF]">
          <div
            className="h-1.5 rounded-full bg-gold"
            style={{ width: `${Math.round((passedCount / totalCount) * 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-7 flex flex-col">
        {QUIZZES.map((q) => {
          const m = findModule(q.moduleId);
          if (!m) return null;
          const p = progressByModule[q.moduleId];
          const passed = !!p?.passed;
          return (
            <div
              key={q.moduleId}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCD6BF] py-4"
            >
              <div className="flex items-center gap-3.5">
                <span
                  className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.04em] ${
                    passed
                      ? "bg-[#F6E9D2] text-[#955710]"
                      : "border border-[#DCD6BF] text-[#8C8770]"
                  }`}
                >
                  {passed ? "Passed" : "Not yet"}
                </span>
                <div>
                  <div className="font-body text-[14.5px] font-semibold text-ink">
                    {moduleCode(m)} · {m.title}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-[#8C8770]">
                    {p
                      ? `Best score: ${p.best_score}% · ${p.attempts} attempt${p.attempts === 1 ? "" : "s"}`
                      : "Not attempted yet"}
                  </div>
                </div>
              </div>
              <Link
                href={`/seeker/modules/${m.id}/quiz`}
                className="font-mono text-[11px] uppercase tracking-[0.06em] text-moss"
              >
                {passed ? "Retake" : "Take quiz"} →
              </Link>
            </div>
          );
        })}
      </div>

      {!allDone ? (
        <div className="mt-8 max-w-[480px] rounded-md border border-[#DCD6BF] bg-card p-7">
          <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">
            Certificate of Completion
          </div>
          <h2 className="mb-2 font-display text-[19px] font-medium text-ink">
            Pass all 13 module quizzes to unlock your certificate.
          </h2>
          <p className="font-body text-[13.5px] text-[#4A4738]">
            {passedCount} of {totalCount} complete. Your progress is saved to your account.
          </p>
        </div>
      ) : (
        <CertificateDoc
          seekerId={user!.id}
          existingName={cert?.name ?? null}
          issuedAt={cert?.issued_at ?? null}
          totalChapters={totalChapters()}
          passPct={QUIZ_PASS_PCT}
        />
      )}
    </div>
  );
}
