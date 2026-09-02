"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { QUIZ_PASS_PCT } from "@/lib/quizzes-data";
import type { QuizQuestion } from "@/lib/quizzes-data";
import { Button } from "@/components/ui/Button";

interface QuizResult {
  correct: number;
  total: number;
  pct: number;
  passed: boolean;
}

export function QuizFlow({
  seekerId,
  moduleId,
  moduleTitle,
  moduleCode,
  questions,
}: {
  seekerId: string;
  moduleId: string;
  moduleTitle: string;
  moduleCode: string;
  questions: QuizQuestion[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === total;

  function selectAnswer(qIndex: number, optIndex: number) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  }

  async function submit() {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    const pct = Math.round((correct / total) * 100);
    const passed = pct >= QUIZ_PASS_PCT;

    setSaving(true);
    const { data: existing } = await supabase
      .from("module_quiz_progress")
      .select("passed, best_score, attempts")
      .eq("seeker_id", seekerId)
      .eq("module_id", moduleId)
      .maybeSingle();

    await supabase.from("module_quiz_progress").upsert(
      {
        seeker_id: seekerId,
        module_id: moduleId,
        passed: passed || existing?.passed || false,
        best_score: Math.max(pct, existing?.best_score ?? 0),
        attempts: (existing?.attempts ?? 0) + 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "seeker_id,module_id" }
    );
    setSaving(false);

    setResult({ correct, total, pct, passed });
    setSubmitted(true);
    router.refresh();
  }

  function retake() {
    setAnswers({});
    setResult(null);
    setSubmitted(false);
  }

  if (!submitted) {
    return (
      <div className="max-w-[640px]">
        <p className="mb-6 font-body text-[14.5px] text-[#4A4738]">
          {total} questions · pass at {QUIZ_PASS_PCT}% or better · unlimited retakes.
        </p>
        <div className="mb-7">
          <div className="mb-2 font-mono text-[11px] text-[#8C8770]">
            {answeredCount} of {total} answered
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#DCD6BF]">
            <div
              className="h-1.5 rounded-full bg-gold"
              style={{ width: `${Math.round((answeredCount / total) * 100)}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {questions.map((q, i) => (
            <div key={i} className="border-t border-[#DCD6BF] pt-7 first:border-t-0 first:pt-0">
              <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.05em] text-[#8C8770]">
                Question {i + 1} of {total}
              </div>
              <h3 className="mb-4 font-display text-[18px] font-medium leading-snug text-ink">
                {q.q}
              </h3>
              <div className="flex flex-col gap-2.5">
                {q.options.map((opt, oi) => (
                  <button
                    key={oi}
                    type="button"
                    data-qi={i}
                    data-oi={oi}
                    onClick={() => selectAnswer(i, oi)}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left font-body text-[14.5px] ${
                      answers[i] === oi
                        ? "border-[#955710] bg-[#F6E9D2] font-semibold text-ink"
                        : "border-[#C9C3AC] text-[#4A4738]"
                    }`}
                  >
                    <span
                      className={`h-4 w-4 flex-none rounded-full border ${
                        answers[i] === oi ? "border-[#955710] bg-[#955710]" : "border-[#C9C3AC]"
                      }`}
                    />
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-9 flex items-center justify-between border-t border-[#DCD6BF] pt-6">
          <Link
            href={`/seeker/modules/${moduleId}`}
            className="font-mono text-[11.5px] uppercase tracking-[0.06em] text-moss"
          >
            ← Back to module
          </Link>
          <Button type="button" disabled={!allAnswered || saving} onClick={submit}>
            {saving ? "Scoring…" : "Submit quiz"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[640px]">
      <div
        className={`rounded-md border border-[#DCD6BF] bg-card p-6 ${
          result!.passed ? "border-l-[3px] border-l-gold" : "border-l-[3px] border-l-[#9C3620]"
        }`}
      >
        <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-moss">
          {moduleCode} · {moduleTitle}
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <div className="font-display text-[48px] font-bold leading-none text-ink">
            {result!.pct}
            <span className="text-[24px] font-semibold text-[#8C8770]">%</span>
          </div>
          <div>
            <div className="font-display text-[22px] font-medium text-ink">
              {result!.passed ? "Passed" : "Not yet"}
            </div>
            <p className="mt-1 font-body text-[13.5px] text-[#4A4738]">
              {result!.correct} of {result!.total} correct · pass mark is {QUIZ_PASS_PCT}%
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {result!.passed ? (
            <>
              <Link
                href="/seeker/certificate"
                className="rounded bg-forest px-[18px] py-[11px] font-mono text-[11.5px] uppercase tracking-[0.06em] text-mist"
              >
                View certificate progress →
              </Link>
              <Link
                href="/seeker/modules"
                className="rounded border border-[#C9C3AC] px-[18px] py-[11px] font-mono text-[11.5px] uppercase tracking-[0.06em] text-[#4A4738]"
              >
                Back to curriculum
              </Link>
            </>
          ) : (
            <>
              <Button type="button" onClick={retake}>
                Retake this quiz
              </Button>
              <Link
                href={`/seeker/modules/${moduleId}`}
                className="rounded border border-[#C9C3AC] px-[18px] py-[11px] font-mono text-[11.5px] uppercase tracking-[0.06em] text-[#4A4738]"
              >
                Review the module
              </Link>
            </>
          )}
        </div>
      </div>

      <h2 className="mb-4 mt-10 font-display text-[22px] font-medium text-ink">
        Review your answers
      </h2>
      <div className="flex flex-col gap-8">
        {questions.map((q, i) => {
          const a = answers[i];
          const isCorrect = a === q.correct;
          return (
            <div key={i} className="border-t border-[#DCD6BF] pt-7 first:border-t-0 first:pt-0">
              <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.05em] text-[#8C8770]">
                Question {i + 1} of {total} · {isCorrect ? "Correct" : "Missed"}
              </div>
              <h3 className="mb-4 font-display text-[18px] font-medium leading-snug text-ink">
                {q.q}
              </h3>
              <div className="flex flex-col gap-2.5">
                {q.options.map((opt, oi) => {
                  const isRight = oi === q.correct;
                  const isPicked = oi === a;
                  return (
                    <div
                      key={oi}
                      className={`flex items-center gap-3 rounded-lg border px-4 py-3 font-body text-[14.5px] ${
                        isRight
                          ? "border-gold bg-[#F6E9D2] font-semibold text-ink"
                          : isPicked
                            ? "border-[#C0472E] bg-[#F3DAD1] text-ink"
                            : "border-[#C9C3AC] text-[#4A4738]"
                      }`}
                    >
                      <span
                        className={`h-4 w-4 flex-none rounded-full border ${
                          isRight
                            ? "border-[#955710] bg-[#955710]"
                            : isPicked
                              ? "border-[#9C3620] bg-[#9C3620]"
                              : "border-[#C9C3AC]"
                        }`}
                      />
                      {opt}
                    </div>
                  );
                })}
              </div>
              <p className="mt-3.5 rounded-md bg-card px-4 py-3 font-body text-[13.5px] text-[#4A4738]">
                {q.explain}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
