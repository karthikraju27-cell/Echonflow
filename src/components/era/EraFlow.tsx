"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ERA_SECTIONS, ERA_SCALE } from "@/lib/era-questions";
import { Button } from "@/components/ui/Button";

type Stage = "intro" | "section" | "results";

export function EraFlow({ seekerId }: { seekerId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [stage, setStage] = useState<Stage>("intro");
  const [sectionIndex, setSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const section = ERA_SECTIONS[sectionIndex];
  const totalQuestions = ERA_SECTIONS.reduce((n, s) => n + s.questions.length, 0);
  const answeredInSection = section?.questions.every((q) => answers[q.id] != null) ?? false;

  function setAnswer(id: string, value: number) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  async function finish() {
    const total = Object.values(answers).reduce((sum, v) => sum + v, 0);
    const maxTotal = totalQuestions * 5;
    const computed = Math.round((total / maxTotal) * 100);
    setSaving(true);
    await supabase.from("era_responses").insert({
      seeker_id: seekerId,
      answers,
      score: computed,
    });
    setSaving(false);
    setScore(computed);
    setStage("results");
    router.refresh();
  }

  if (stage === "intro") {
    return (
      <div className="max-w-[520px] rounded-md border border-[#DCD6BF] bg-card p-[26px]">
        <p className="mb-5 font-body text-sm leading-relaxed text-[#4A4738]">
          Five sections, {totalQuestions} questions — sleep, stress load, movement, nutrition, and
          recovery-environment fit. Answer honestly; there&apos;s no wrong score.
        </p>
        <Button onClick={() => setStage("section")}>Start audit</Button>
      </div>
    );
  }

  if (stage === "section" && section) {
    return (
      <div className="max-w-[560px]">
        <div className="mb-4 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">
          Section {sectionIndex + 1} of {ERA_SECTIONS.length} · {section.title}
        </div>
        <div className="mb-6 flex flex-col gap-6 rounded-md border border-[#DCD6BF] bg-card p-[22px]">
          {section.questions.map((q) => (
            <div key={q.id}>
              <p className="mb-2.5 font-body text-sm text-ink">{q.text}</p>
              <div className="flex gap-2">
                {ERA_SCALE.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setAnswer(q.id, s.value)}
                    title={s.label}
                    className={`h-8 w-8 rounded-full border font-mono text-[11px] ${
                      answers[q.id] === s.value
                        ? "border-forest bg-forest text-mist"
                        : "border-[#C9C3AC] text-[#4A4738]"
                    }`}
                  >
                    {s.value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            type="button"
            disabled={sectionIndex === 0}
            onClick={() => setSectionIndex((i) => Math.max(0, i - 1))}
          >
            ← Previous
          </Button>
          {sectionIndex < ERA_SECTIONS.length - 1 ? (
            <Button
              type="button"
              disabled={!answeredInSection}
              onClick={() => setSectionIndex((i) => i + 1)}
            >
              Next section →
            </Button>
          ) : (
            <Button type="button" disabled={!answeredInSection || saving} onClick={finish}>
              {saving ? "Scoring…" : "See results"}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[420px] rounded-md border border-[#DCD6BF] bg-card p-[26px]">
      <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">Your score</div>
      <div className="mb-4 font-display text-[48px] font-medium text-ink">{score}</div>
      <p className="mb-5 font-body text-sm leading-relaxed text-[#4A4738]">
        Saved to your Echonflow profile. Retake any time — your history stays with you.
      </p>
      <Button
        type="button"
        onClick={() => {
          setAnswers({});
          setSectionIndex(0);
          setScore(null);
          setStage("intro");
        }}
      >
        Retake audit
      </Button>
    </div>
  );
}
