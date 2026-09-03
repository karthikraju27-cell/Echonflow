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
  priorityTrack as computePriorityTrack,
  retreatInterest as computeRetreatInterest,
  buildRecommendations,
  type EraAnswer,
  type MultiAnswer,
} from "@/lib/era-questions";
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

export function EraFlow({ seekerId }: { seekerId?: string }) {
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
      });
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
            You don&apos;t need an account to take this — you can create one afterward to save
            your results and get matched to providers.
          </p>
        )}
        <Button onClick={() => setStage("question")}>Start audit</Button>
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
            <Button type="button" disabled={!answered || saving} onClick={finish}>
              {saving ? "Scoring…" : "See your results"}
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
  const band = bandFor(overall);
  const track = computePriorityTrack(answers);
  const hasRetreatInterest = computeRetreatInterest(answers);
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

      <div className="flex flex-wrap gap-2.5">
        <Link
          href="/seeker/modules"
          className="rounded bg-forest px-[18px] py-[11px] font-mono text-[11.5px] uppercase tracking-[0.06em] text-mist"
        >
          Explore the full curriculum
        </Link>
        <Button type="button" variant="outline" onClick={retake}>
          Retake the audit
        </Button>
      </div>
    </div>
  );
}
