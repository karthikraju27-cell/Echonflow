"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ERA_QUESTIONS,
  ERA_SECTIONS,
  isAnswered,
  sectionScores as computeSectionScores,
  overallScore as computeOverallScore,
  bandFor,
  type EraAnswer,
  type MultiAnswer,
} from "@/lib/era-questions";
import { EraResults } from "@/components/era/EraResults";
import { Button } from "@/components/ui/Button";

type Stage = "intro" | "question" | "results";

const STORAGE_KEY = "echonflow-era-progress";
const RESUME_WINDOW_MS = 24 * 60 * 60 * 1000;

interface SavedProgress {
  step: number;
  answers: Record<string, EraAnswer>;
  savedAt: number;
}

function loadSavedProgress(): SavedProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedProgress;
    if (Date.now() - parsed.savedAt > RESUME_WINDOW_MS) return null;
    if (!parsed.answers || Object.keys(parsed.answers).length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveProgress(step: number, answers: Record<string, EraAnswer>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, answers, savedAt: Date.now() }));
  } catch {
    // localStorage unavailable (private browsing, etc.) — resume just won't work.
  }
}

function clearSavedProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function EraFlow({
  seekerId,
  companyId,
  orgSlug,
  hasHistory = false,
}: {
  seekerId?: string;
  companyId?: string;
  orgSlug?: string;
  hasHistory?: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [stage, setStage] = useState<Stage>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, EraAnswer>>({});
  const [saving, setSaving] = useState(false);
  const [resumed, setResumed] = useState(false);

  // Resume an in-progress attempt (<24h old) on mount, before the first paint
  // of the intro screen would otherwise show. Hydrating from localStorage —
  // an external source only available client-side — has to happen in an
  // effect; it can't be computed during render without a server/client
  // markup mismatch.
  useEffect(() => {
    const saved = loadSavedProgress();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnswers(saved.answers);
      setStep(Math.min(saved.step, ERA_QUESTIONS.length - 1));
      setStage("question");
      setResumed(true);
    }
  }, []);

  // Persist as the seeker answers, so closing the tab mid-audit doesn't lose
  // progress.
  useEffect(() => {
    if (stage === "question") saveProgress(step, answers);
  }, [stage, step, answers]);

  const total = ERA_QUESTIONS.length;
  const question = ERA_QUESTIONS[step];
  const section = ERA_SECTIONS.find((s) => s.id === question?.sectionId);
  const answered = question ? isAnswered(question, answers[question.id]) : false;

  // An org-linked visit (?org=<slug>, e.g. a pilot's onboarding link) only
  // ever gets counted in that company's report if the response is actually
  // saved — which only happens for a signed-in seeker. An anonymous
  // completion here is never persisted at all, so gate results behind
  // account creation rather than silently losing the response. The
  // general public /era link (no org) stays fully anonymous.
  const requiresSignupToSeeResults = !seekerId && !!orgSlug;

  function setSingleAnswer(value: number) {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }

  function toggleMultiOption(optionIndex: number) {
    setAnswers((prev) => {
      const current = (prev[question.id] as MultiAnswer) ?? { selected: [], none: false };
      const already = current.selected.includes(optionIndex);
      const selected = already
        ? current.selected.filter((i) => i !== optionIndex)
        : [...current.selected, optionIndex];
      return { ...prev, [question.id]: { selected, none: false } };
    });
  }

  function selectNone() {
    setAnswers((prev) => ({ ...prev, [question.id]: { selected: [], none: true } }));
  }

  async function finish() {
    setSaving(true);
    if (seekerId) {
      const scores = computeSectionScores(answers);
      const overall = computeOverallScore(scores);
      await supabase.from("era_responses").insert({
        seeker_id: seekerId,
        answers,
        score: overall,
        section_scores: scores,
        company_id: companyId ?? null,
      });
      if (companyId) {
        // Only backfills a profile that has no company_id yet — never
        // overwrites one already set (e.g. from a different pilot).
        await supabase
          .from("profiles")
          .update({ company_id: companyId })
          .eq("id", seekerId)
          .is("company_id", null);
      }
      router.refresh();

      const band = bandFor(overall);
      fetch("/api/email/audit-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overall,
          bandName: band.name,
          bandCopy: band.copy,
          sections: ERA_SECTIONS.map((s) => ({ name: s.name, value: scores[s.id] })),
        }),
      }).catch(() => {
        // Best-effort — a failed results email shouldn't block seeing results.
      });
    }
    setSaving(false);
    setStage("results");
    clearSavedProgress();
  }

  function goToSignup() {
    // Progress is already autosaved to localStorage on every answer change
    // (see the effect above) and deliberately left in place here — signing
    // up and landing back on /seeker/era resumes right at this last,
    // already-answered question, one click from finish().
    router.push(`/auth/seeker?org=${encodeURIComponent(orgSlug!)}`);
  }

  function retake() {
    setAnswers({});
    setStep(0);
    setStage("intro");
    clearSavedProgress();
  }

  if (stage === "intro") {
    return (
      <div className="max-w-[560px] rounded-md border border-[#DCD6BF] bg-card p-[26px]">
        <p className="mb-5 font-body text-sm leading-relaxed text-[#4A4738]">
          A diagnostic across cognitive load, physical strain, circadian health, workplace
          culture, and recovery environment — the same one used to map where energy is actually
          leaking, and what kind of reset would actually fix it, before recommending anything.
          There&apos;s no passing score.
        </p>
        {!seekerId && (
          <p className="mb-5 font-body text-[13px] text-[#8C8770]">
            {requiresSignupToSeeResults
              ? "This link needs a free account to show your results at the end — it takes under a minute, and your individual answers are never shared with your employer."
              : "You don't need an account to take this — you can create one afterward to save your results and get matched to providers."}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <Button onClick={() => setStage("question")}>Start audit</Button>
          {seekerId && hasHistory && (
            <Link
              href="/seeker/era/history"
              className="font-mono text-[11px] uppercase tracking-[0.05em] text-moss"
            >
              View past results →
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (stage === "question" && question) {
    const pct = Math.round((step / total) * 100);
    const multiAnswer = answers[question.id] as MultiAnswer | undefined;

    return (
      <div className="max-w-[600px]">
        {resumed && (
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.05em] text-gold">
            Picked up where you left off
          </p>
        )}
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">
            {section?.name}
          </span>
          <span className="font-mono text-[11px] text-[#8C8770]">
            Question {step + 1} of {total}
          </span>
        </div>
        <div className="mb-6 h-1.5 w-full rounded-full bg-[#DCD6BF]">
          <div className="h-1.5 rounded-full bg-gold" style={{ width: `${pct}%` }} />
        </div>

        <div className="mb-7 rounded-md border border-[#DCD6BF] bg-card p-[24px]">
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-[#955710]">
            {question.label}
          </div>
          <h2 className="mb-5 font-display text-[20px] font-medium leading-snug text-ink">
            {question.prompt}
          </h2>

          {(question.type === "single" || question.type === "priority") && question.options && (
            <div className="flex flex-col gap-2.5">
              {question.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSingleAnswer(i)}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left font-body text-[14.5px] ${
                    answers[question.id] === i
                      ? "border-[#955710] bg-[#F6E9D2] font-semibold text-ink"
                      : "border-[#C9C3AC] text-[#4A4738]"
                  }`}
                >
                  <span
                    className={`h-4 w-4 flex-none rounded-full border ${
                      answers[question.id] === i
                        ? "border-[#955710] bg-[#955710]"
                        : "border-[#C9C3AC]"
                    }`}
                  />
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {question.type === "multi" && question.options && (
            <div className="flex flex-col gap-2.5">
              {question.options.map((opt, i) => {
                const selected = !!multiAnswer?.selected.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleMultiOption(i)}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left font-body text-[14.5px] ${
                      selected
                        ? "border-[#955710] bg-[#F6E9D2] font-semibold text-ink"
                        : "border-[#C9C3AC] text-[#4A4738]"
                    }`}
                  >
                    <span
                      className={`h-4 w-4 flex-none rounded ${
                        selected ? "border-[#955710] bg-[#955710]" : "border border-[#C9C3AC]"
                      }`}
                    />
                    {opt.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={selectNone}
                className={`flex items-center gap-3 rounded-lg border border-dashed px-4 py-3 text-left font-body text-[14.5px] ${
                  multiAnswer?.none
                    ? "border-[#955710] bg-[#F6E9D2] font-semibold text-ink"
                    : "border-[#C9C3AC] text-[#4A4738]"
                }`}
              >
                <span
                  className={`h-4 w-4 flex-none rounded ${
                    multiAnswer?.none ? "border-[#955710] bg-[#955710]" : "border border-[#C9C3AC]"
                  }`}
                />
                {question.noneLabel}
              </button>
            </div>
          )}

          {question.type === "scale5" && (
            <div>
              <div className="flex justify-between gap-2.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSingleAnswer(n)}
                    className={`flex aspect-square flex-1 items-center justify-center rounded-full border font-mono text-[15px] font-semibold ${
                      answers[question.id] === n
                        ? "border-[#955710] bg-[#955710] text-mist"
                        : "border-[#C9C3AC] text-[#4A4738]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="mt-2.5 flex justify-between gap-4 font-body text-[12px] text-[#8C8770]">
                <span>{question.minLabel}</span>
                <span className="text-right">{question.maxLabel}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            ← Back
          </Button>
          {step < total - 1 ? (
            <Button type="button" disabled={!answered} onClick={() => setStep((s) => s + 1)}>
              Next →
            </Button>
          ) : (
            <Button
              type="button"
              disabled={!answered || saving}
              onClick={requiresSignupToSeeResults ? goToSignup : finish}
            >
              {requiresSignupToSeeResults
                ? "Create free account to see results →"
                : saving
                  ? "Scoring…"
                  : "See your results"}
            </Button>
          )}
        </div>
        <p className="mt-4 text-center font-body text-[12.5px] text-[#8C8770]">
          Not comfortable finishing?{" "}
          <Link href="/" className="text-moss underline">
            Exit to the homepage
          </Link>
          {!seekerId && " — nothing is saved either way."}
        </p>
      </div>
    );
  }

  // results
  const scores = computeSectionScores(answers);
  const overall = computeOverallScore(scores);

  return (
    <EraResults
      answers={answers}
      scores={scores}
      overall={overall}
      seekerId={seekerId}
      orgSlug={orgSlug}
      actions={
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/seeker/modules"
            className="rounded bg-forest px-[18px] py-[11px] font-mono text-[11.5px] uppercase tracking-[0.06em] text-mist"
          >
            Explore the full curriculum
          </Link>
          <Button type="button" variant="outline" onClick={retake}>
            Retake the audit
          </Button>
          {seekerId && (
            <Link
              href="/seeker/era/history"
              className="font-mono text-[11px] uppercase tracking-[0.05em] text-moss"
            >
              View past results →
            </Link>
          )}
        </div>
      }
    />
  );
}
