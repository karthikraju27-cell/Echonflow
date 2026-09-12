"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  WRS_CATEGORIES,
  WRS_SCALE,
  scoreWrs,
  wrsPriorities,
  type WrsAnswers,
  type WrsBreakdown,
} from "@/lib/wrs-questions";
import styles from "./wrs-flow.module.css";

type Stage = "intro" | "category" | "results";
const PROGRESS_LIFETIME = 7 * 86_400_000;

function saveProgress(storageKey: string, answers: WrsAnswers, categoryIndex: number) {
  try {
    localStorage.setItem(storageKey, JSON.stringify({
      version: 1,
      answers,
      categoryIndex,
      at: Date.now(),
    }));
  } catch {
    // The assessment remains usable when browser storage is unavailable.
  }
}

function normalizeBreakdown(value: Record<string, unknown> | null | undefined): WrsBreakdown | null {
  if (!value) return null;
  const entries = WRS_CATEGORIES.flatMap((category) => {
    const item = value[category.id];
    if (!item || typeof item !== "object") return [];
    const score = (item as { score?: unknown }).score;
    if (typeof score !== "number") return [];
    return [[category.id, { title: category.title, score, weight: category.weight }] as const];
  });
  return entries.length === WRS_CATEGORIES.length ? Object.fromEntries(entries) : null;
}

export function WrsFlow({
  listingId,
  businessName,
  initialScore,
  initialTier,
  initialBreakdown,
}: {
  listingId: string;
  businessName: string;
  initialScore?: number | null;
  initialTier?: string | null;
  initialBreakdown?: Record<string, unknown> | null;
}) {
  const router = useRouter();
  const storageKey = `echonflow-wrs-beta-v1:${listingId}`;
  const previousBreakdown = normalizeBreakdown(initialBreakdown);
  const [stage, setStage] = useState<Stage>(initialScore != null ? "results" : "intro");
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [answers, setAnswers] = useState<WrsAnswers>({});
  const [saving, setSaving] = useState(false);
  const [score, setScore] = useState<number | null>(initialScore ?? null);
  const [tier, setTier] = useState<string | null>(initialTier ?? null);
  const [breakdown, setBreakdown] = useState<WrsBreakdown | null>(previousBreakdown);
  const [message, setMessage] = useState("");

  const category = WRS_CATEGORIES[categoryIndex];
  const totalQuestions = WRS_CATEGORIES.reduce((total, item) => total + item.questions.length, 0);
  const answeredCount = Object.keys(answers).length;
  const answeredInCategory = category.questions.every((question) => answers[question.id] != null);
  const priorities = useMemo(() => breakdown ? wrsPriorities(breakdown) : [], [breakdown]);

  function begin() {
    setMessage("");
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as {
          version?: number;
          answers?: Record<string, unknown>;
          categoryIndex?: number;
          at?: number;
        };
        const validAnswers = saved.answers && Object.values(saved.answers).every(
          (value) => typeof value === "number" && value >= 0 && value <= 4
        );
        const fresh = typeof saved.at === "number" && Date.now() - saved.at < PROGRESS_LIFETIME;
        if (saved.version === 1 && validAnswers && fresh) {
          setAnswers(saved.answers as WrsAnswers);
          setCategoryIndex(Math.min(Math.max(saved.categoryIndex ?? 0, 0), WRS_CATEGORIES.length - 1));
          setMessage("Your saved assessment has been restored.");
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
    setStage("category");
  }

  function setAnswer(id: string, value: number) {
    const nextAnswers = { ...answers, [id]: value };
    setAnswers(nextAnswers);
    saveProgress(storageKey, nextAnswers, categoryIndex);
  }

  function move(nextIndex: number) {
    setCategoryIndex(nextIndex);
    saveProgress(storageKey, answers, nextIndex);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function finish() {
    const result = scoreWrs(answers);
    setSaving(true);
    setMessage("");
    const { error } = await createClient()
      .from("listings")
      .update({
        wrs_score: result.score,
        wrs_tier: result.tier,
        wrs_breakdown: result.breakdown,
      })
      .eq("id", listingId);
    setSaving(false);
    if (error) {
      setMessage("Your answers are safe on this browser, but the score could not be saved. Please try again.");
      return;
    }
    setScore(result.score);
    setTier(result.tier);
    setBreakdown(result.breakdown);
    setStage("results");
    try { localStorage.removeItem(storageKey); } catch {}
    router.refresh();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() {
    setAnswers({});
    setCategoryIndex(0);
    setMessage("");
    try { localStorage.removeItem(storageKey); } catch {}
    setStage("intro");
  }

  if (stage === "intro") {
    return (
      <section className={styles.introCard}>
        <div className={styles.beta}>WRS™ beta · Self-assessment</div>
        <h2>See how ready your property is for a working team.</h2>
        <p>
          Answer 27 operational questions across nine dimensions. You’ll receive a weighted
          0–100 score, a readiness tier, and three priorities for improvement.
        </p>
        <div className={styles.factRow}>
          <span><strong>9</strong> dimensions</span>
          <span><strong>27</strong> questions</span>
          <span><strong>8–10</strong> minutes</span>
        </div>
        <button type="button" className="flow-button" onClick={begin}>Start WRS™ assessment <span>→</span></button>
        <small>
          Answer for how {businessName} operates today. Progress is saved on this browser for seven days.
        </small>
      </section>
    );
  }

  if (stage === "category") {
    return (
      <section className={styles.assessment}>
        <header className={styles.assessmentHeader}>
          <div>
            <span>Dimension {categoryIndex + 1} of {WRS_CATEGORIES.length}</span>
            <h2>{category.title}</h2>
            <p>{category.description}</p>
          </div>
          <div className={styles.counter}><strong>{answeredCount}</strong><span>of {totalQuestions}<br />answered</span></div>
        </header>
        <div className={styles.progress} aria-hidden="true">
          <span style={{ width: `${((categoryIndex + 1) / WRS_CATEGORIES.length) * 100}%` }} />
        </div>
        <p className={styles.scalePrompt}>Choose the answer that best describes the property today.</p>
        <div className={styles.questions}>
          {category.questions.map((question, questionIndex) => (
            <fieldset key={question.id} className={styles.question}>
              <legend><span>{String(questionIndex + 1).padStart(2, "0")}</span>{question.text}</legend>
              <div className={styles.scale}>
                {WRS_SCALE.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={answers[question.id] === option.value}
                    onClick={() => setAnswer(question.id, option.value)}
                  >
                    <strong>{option.short}</strong>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <p className={styles.status} role="status">{message}</p>
        <div className={styles.actions}>
          <button type="button" disabled={categoryIndex === 0} onClick={() => move(categoryIndex - 1)}>← Previous</button>
          {categoryIndex < WRS_CATEGORIES.length - 1 ? (
            <button type="button" className="flow-button" disabled={!answeredInCategory} onClick={() => move(categoryIndex + 1)}>Next dimension <span>→</span></button>
          ) : (
            <button type="button" className="flow-button" disabled={!answeredInCategory || saving} onClick={finish}>{saving ? "Scoring…" : "Calculate my WRS™"} <span>→</span></button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.results}>
      <div className={styles.resultHero}>
        <div><span>Workation Readiness Score</span><strong>{score}</strong><small>out of 100</small></div>
        <div><span>Readiness tier</span><h2>{tier}</h2><p>Beta scoring · self-reported and provisional</p></div>
      </div>
      <div className={styles.resultGrid}>
        <section>
          <h2>Your readiness by dimension</h2>
          <p>The score is weighted toward the operational foundations teams depend on most.</p>
          <div className={styles.breakdown}>
            {breakdown && WRS_CATEGORIES.map((item) => {
              const itemScore = breakdown[item.id]?.score ?? 0;
              return <div key={item.id} className={styles.breakdownRow}><div><span>{item.title}</span><small>{item.weight}% weight</small><strong>{itemScore}</strong></div><div><span style={{ width: `${itemScore}%` }} /></div></div>;
            })}
          </div>
        </section>
        <aside className={styles.priorities}>
          <span>Your next three priorities</span>
          <h2>Turn readiness gaps into an action plan.</h2>
          {priorities.map((item, index) => <article key={item.id}><strong>{String(index + 1).padStart(2, "0")} · {item.title}</strong><p>{item.action}</p></article>)}
        </aside>
      </div>
      <div className={styles.disclaimer}>
        <strong>What this score means</strong>
        <p>WRS™ beta is a planning tool based on information supplied by the property. It is not an Echonflow certification, guarantee, or independent inspection.</p>
      </div>
      <div className={styles.resultActions}>
        <button type="button" onClick={restart}>Update assessment</button>
        <Link href={`/p/provider/${listingId}`} className="flow-button">View public property profile <span>↗</span></Link>
        <Link href="/provider/wrs">All WRS™ properties</Link>
      </div>
      <p className={styles.status} role="status">{message}</p>
    </section>
  );
}
