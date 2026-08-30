"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { WRS_CATEGORIES, WRS_SCALE, tierForScore } from "@/lib/wrs-questions";
import { Button } from "@/components/ui/Button";

type Stage = "intro" | "category" | "results";

export function WrsFlow({ listingId, businessName }: { listingId: string; businessName: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [stage, setStage] = useState<Stage>("intro");
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [tier, setTier] = useState<string | null>(null);

  const category = WRS_CATEGORIES[categoryIndex];
  const answeredInCategory = category?.questions.every((q) => answers[q.id] != null) ?? false;

  function setAnswer(id: string, value: number) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function categoryScore(catId: string) {
    const cat = WRS_CATEGORIES.find((c) => c.id === catId)!;
    const total = cat.questions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
    return Math.round((total / (cat.questions.length * 5)) * 100);
  }

  async function finish() {
    const totalQuestions = WRS_CATEGORIES.reduce((n, c) => n + c.questions.length, 0);
    const total = Object.values(answers).reduce((sum, v) => sum + v, 0);
    const computedScore = Math.round((total / (totalQuestions * 5)) * 100);
    const computedTier = tierForScore(computedScore);
    const breakdown = Object.fromEntries(
      WRS_CATEGORIES.map((c) => [c.id, { title: c.title, score: categoryScore(c.id) }])
    );

    setSaving(true);
    await supabase
      .from("listings")
      .update({ wrs_score: computedScore, wrs_tier: computedTier, wrs_breakdown: breakdown })
      .eq("id", listingId);
    setSaving(false);
    setScore(computedScore);
    setTier(computedTier);
    setStage("results");
    router.refresh();
  }

  if (stage === "intro") {
    return (
      <div className="max-w-[560px] rounded-md border border-[#DCD6BF] bg-card p-[26px]">
        <p className="mb-5 font-body text-sm leading-relaxed text-[#4A4738]">
          9 categories — connectivity, workspace, accommodation, meetings, wellness, food,
          accessibility, sustainability, and corporate operations — for <strong>{businessName}</strong>.
          Answer for how the property actually operates today.
        </p>
        <Button onClick={() => setStage("category")}>Start assessment</Button>
      </div>
    );
  }

  if (stage === "category" && category) {
    return (
      <div className="max-w-[600px]">
        <div className="mb-4 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">
          Category {categoryIndex + 1} of {WRS_CATEGORIES.length} · {category.title}
        </div>
        <div className="mb-6 flex flex-col gap-6 rounded-md border border-[#DCD6BF] bg-card p-[22px]">
          {category.questions.map((q) => (
            <div key={q.id}>
              <p className="mb-2.5 font-body text-sm text-ink">{q.text}</p>
              <div className="flex gap-2">
                {WRS_SCALE.map((s) => (
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
            disabled={categoryIndex === 0}
            onClick={() => setCategoryIndex((i) => Math.max(0, i - 1))}
          >
            ← Previous
          </Button>
          {categoryIndex < WRS_CATEGORIES.length - 1 ? (
            <Button
              type="button"
              disabled={!answeredInCategory}
              onClick={() => setCategoryIndex((i) => i + 1)}
            >
              Next category →
            </Button>
          ) : (
            <Button type="button" disabled={!answeredInCategory || saving} onClick={finish}>
              {saving ? "Scoring…" : "See WRS™ score"}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[460px] rounded-md border border-[#DCD6BF] bg-card p-[26px]">
      <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">
        Workation Readiness Score (WRS™)
      </div>
      <div className="mb-1 font-display text-[48px] font-medium text-ink">{score}</div>
      <div className="mb-5 font-mono text-[12px] uppercase tracking-[0.08em] text-gold">{tier}</div>
      <p className="mb-5 font-body text-sm leading-relaxed text-[#4A4738]">
        Saved to your listing. Seekers will see this on {businessName}&apos;s page. Retake any time as
        the property changes.
      </p>
      <Button
        type="button"
        onClick={() => {
          setAnswers({});
          setCategoryIndex(0);
          setScore(null);
          setTier(null);
          setStage("intro");
        }}
      >
        Retake assessment
      </Button>
    </div>
  );
}
