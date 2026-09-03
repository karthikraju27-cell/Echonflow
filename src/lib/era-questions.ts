import { findChapter, moduleCode as formatModuleCode } from "@/lib/modules-data";

// The real Energy & Resilience Audit — 12 questions across 5 sections,
// ported from the reference build (see SEEKER_EXPERIENCE_SPEC.md gap #2).
// Question wording, scoring, and recommendation logic are kept verbatim;
// only the storage/rendering plumbing is new (real accounts instead of
// client-only state).

export type QuestionType = "single" | "scale5" | "multi" | "priority";

export interface EraOption {
  label: string;
  score?: number;
  track?: string;
}

export interface EraQuestion {
  id: string;
  sectionId: string;
  type: QuestionType;
  scored: boolean;
  label: string;
  prompt: string;
  options?: EraOption[];
  noneLabel?: string;
  minLabel?: string;
  maxLabel?: string;
}

export interface EraSection {
  id: string;
  name: string;
  note: string;
}

export interface EraBand {
  min: number;
  name: string;
  copy: string;
}

export interface EraRec {
  moduleId: string;
  chapterId: string;
  why: string;
}

export type MultiAnswer = { selected: number[]; none: boolean };
export type EraAnswer = number | MultiAnswer;

export const ERA_TITLE = "The Executive Energy & Resilience Audit";
export const ERA_EYEBROW = "3-minute diagnostic · 12 questions";
export const ERA_INTRO =
  "A diagnostic across cognitive load, physical strain, circadian health, workplace culture, and recovery environment — the same one used to map where energy is actually leaking, and what kind of reset would actually fix it, before recommending anything. There's no passing score.";

export const ERA_SECTIONS: EraSection[] = [
  {
    id: "cognitive",
    name: "Cognitive Load & Mental Stamina",
    note: "Executive function, decision fatigue, and focus preservation.",
  },
  {
    id: "somatic",
    name: "Somatic & Ergonomic Load",
    note: "The physical toll of a sedentary desk environment on muscle and nervous system.",
  },
  {
    id: "circadian",
    name: "Circadian Health & Energy Architecture",
    note: "Systemic exhaustion via sleep and biological rhythm disruption.",
  },
  {
    id: "culture",
    name: "Organizational Alignment & Culture",
    note: "Whether the environment around you supports wellness, or quietly sabotages it.",
  },
  {
    id: "environment",
    name: "Recovery Environment & Retreat Fit",
    note: "Whether you have a real way to decompress at all — and whether a change of setting would outperform it.",
  },
];

export const ERA_QUESTIONS: EraQuestion[] = [
  {
    id: "q1",
    sectionId: "cognitive",
    type: "single",
    scored: true,
    label: "Cognitive Recovery (Brain Fog)",
    prompt:
      "How frequently do you experience a noticeable drop in mental clarity, decision-making efficiency, or concentration before the workday ends?",
    options: [
      { label: "Daily (typically by mid-afternoon)", score: 1 },
      { label: "2–3 times per week", score: 2 },
      { label: "Rarely — I maintain high cognitive stamina throughout the day", score: 3 },
    ],
  },
  {
    id: "q2",
    sectionId: "cognitive",
    type: "single",
    scored: true,
    label: "Hyper-Vigilance & Adrenaline",
    prompt:
      "Do you find it difficult to emotionally or mentally “switch off” from work communications within two hours of completing your shift?",
    options: [
      {
        label: "Yes — my mind remains actively engaged in work problems late into the night",
        score: 1,
      },
      { label: "Occasionally, depending on project cycles", score: 2 },
      {
        label: "No — I have a distinct psychological boundary between work and personal time",
        score: 3,
      },
    ],
  },
  {
    id: "q3",
    sectionId: "cognitive",
    type: "scale5",
    scored: true,
    label: "Creative Resilience",
    prompt:
      "When faced with sudden project changes or high-pressure deadlines, how would you rate your internal capacity to adapt without feeling overwhelmed?",
    minLabel: "Highly fragile / instant stress spike",
    maxLabel: "Highly resilient / calm pivot",
  },
  {
    id: "q4",
    sectionId: "somatic",
    type: "multi",
    scored: true,
    label: "Postural Decompression Fatigue",
    prompt:
      "Select the physical areas where you experience chronic tightness, dull aches, or pain during or immediately after the work week.",
    options: [
      { label: "Cervical spine / upper trapezius — neck and shoulder stiffness" },
      { label: "Lumbar region — lower back compression from sitting" },
      { label: "Temporal / ocular strain — headaches or eye fatigue from screen glare" },
      { label: "Wrist / carpal tunnel discomfort" },
    ],
    noneLabel: "No physical discomfort detected",
  },
  {
    id: "q5",
    sectionId: "somatic",
    type: "single",
    scored: true,
    label: "Somatic Movement Baseline",
    prompt:
      "On average, during an 8-hour workday, how often do you actively stand up, stretch, or change your physical environment?",
    options: [
      { label: "Only during formal lunch/tea breaks (highly sedentary)", score: 1 },
      { label: "Every 2 to 3 hours", score: 2 },
      { label: "Every 60–90 minutes (optimal movement pattern)", score: 3 },
    ],
  },
  {
    id: "q6",
    sectionId: "circadian",
    type: "single",
    scored: true,
    label: "Sleep Architecture Validation",
    prompt: "Which statement most accurately describes your sleep quality over the past 14 days?",
    options: [
      {
        label:
          "Disrupted — I experience sleep-onset latency (mind racing) or wake up frequently",
        score: 1,
      },
      {
        label: "Insufficient — I sleep uninterrupted but wake up feeling physically unrefreshed",
        score: 2,
      },
      {
        label: "Restorative — I achieve deep, consistent sleep and wake up naturally energized",
        score: 3,
      },
    ],
  },
  {
    id: "q7",
    sectionId: "circadian",
    type: "single",
    scored: true,
    label: "Stimulant Dependency",
    prompt:
      "To maintain baseline professional productivity, how heavily do you rely on external stimulants (caffeine, nicotine, sugar) throughout the day?",
    options: [
      { label: "High dependency — 3+ servings required to avoid energy crashes", score: 1 },
      { label: "Moderate dependency — 1–2 servings out of habit", score: 2 },
      { label: "Low or no dependency — natural energy baseline", score: 3 },
    ],
  },
  {
    id: "q8",
    sectionId: "culture",
    type: "single",
    scored: true,
    label: "Well-being Psychological Safety",
    prompt:
      "Do you feel that your immediate leadership team respects personal boundaries and actively encourages self-care practices?",
    options: [
      {
        label:
          "No — prioritizing wellness is subtly perceived as a lack of professional commitment",
        score: 1,
      },
      {
        label: "It's spoken about conceptually, but operational metrics prioritize overwork",
        score: 2,
      },
      { label: "Yes — wellness is actively modeled by leadership", score: 3 },
    ],
  },
  {
    id: "q9",
    sectionId: "culture",
    type: "priority",
    scored: false,
    label: "Future Intervention Optimization",
    prompt:
      "If you could introduce one targeted wellness intervention into your work life, which would yield the highest immediate impact on your performance?",
    options: [
      { label: "Nervous System Regulation — breathwork, anxiety management", track: "nervous" },
      { label: "Ergonomic & Physical Recovery — mobility drills, pain relief", track: "ergonomic" },
      {
        label: "Time-Management & Mindset — boundary setting, stress psychology",
        track: "mindset",
      },
    ],
  },
  {
    id: "q10",
    sectionId: "environment",
    type: "single",
    scored: true,
    label: "Environmental Impact on Recovery",
    prompt:
      "When attempting to completely decompress from work stress, which setting do you feel rejuvenates your nervous system the fastest?",
    options: [
      {
        label: "Nothing consistent — I don't have a real way to fully decompress from work stress right now",
        score: 1,
      },
      {
        label: "A controlled, indoor space — a wellness studio, gym, or quiet room at home",
        score: 2,
      },
      { label: "A natural, outdoor setting — greenery and open air, away from screens", score: 3 },
    ],
  },
  {
    id: "q11",
    sectionId: "environment",
    type: "single",
    scored: true,
    label: "Outdoor Openness Baseline",
    prompt:
      "How willing would you be to participate in mindfulness, yoga, or sound healing sessions conducted in structured, scenic outdoor spaces (e.g., resort lawns, forest trails)?",
    options: [
      { label: "Not really my thing — I'd rather do structured wellness activities indoors", score: 1 },
      { label: "Willing, with the right conditions — good weather, a comfortable space", score: 2 },
      { label: "Very open — outdoor, nature-based sessions genuinely appeal to me", score: 3 },
    ],
  },
  {
    id: "q12",
    sectionId: "environment",
    type: "single",
    scored: true,
    label: "The Retreat Value Metric",
    prompt:
      "If your organization hosts an off-site wellness program, do you believe spending 3 days in a nature-led resort would improve your work morale and team connection more than a standard city-based workshop?",
    options: [
      { label: "No — a change of location wouldn't move the needle much for me", score: 1 },
      {
        label: "Maybe — it could help, but I'm not certain it beats a well-run in-city session",
        score: 2,
      },
      {
        label:
          "Yes — a real change of scenery in nature would meaningfully outperform a city-based session",
        score: 3,
      },
    ],
  },
];

export const ERA_BANDS: EraBand[] = [
  {
    min: 85,
    name: "Resilient",
    copy: "Your baseline is genuinely strong. The read below is mostly about protecting it.",
  },
  {
    min: 65,
    name: "Stable",
    copy: "A solid foundation with a couple of clear cracks — worth patching before they widen.",
  },
  {
    min: 40,
    name: "Strained",
    copy: "Real, accumulated load across more than one system. A few targeted changes would compound fast.",
  },
  {
    min: 0,
    name: "Depleted",
    copy: "Multiple systems are running on empty at once. Start small, start with just one thing, start today.",
  },
];

export const ERA_RECS: Record<string, EraRec[]> = {
  cognitive: [
    {
      moduleId: "stress-management",
      chapterId: "breathwork",
      why: "A fast, physiological lever for a mind that won't downshift after a hard day.",
    },
    {
      moduleId: "mental-emotional-wellness",
      chapterId: "nervous-system-basics",
      why: "Why your nervous system keeps defaulting to “on”, and how to actually cue it back off.",
    },
  ],
  somatic: [
    {
      moduleId: "workplace-digital-wellness",
      chapterId: "ergonomics-101",
      why: "The desk-setup fundamentals that address chronic neck, back, and wrist strain directly.",
    },
    {
      moduleId: "movement-fitness",
      chapterId: "exercise-desk-workers",
      why: "What actually offsets eight-plus hours of sitting — it isn't just “exercise more.”",
    },
  ],
  circadian: [
    {
      moduleId: "sleep-science",
      chapterId: "sleep-disruptors",
      why: "Including exactly why that 3pm coffee is still active in your system at bedtime.",
    },
    {
      moduleId: "sleep-science",
      chapterId: "fixing-sleep-schedule",
      why: "A realistic reset plan — 7 to 10 days, not one heroic night of sleep.",
    },
  ],
  culture: [
    {
      moduleId: "workplace-digital-wellness",
      chapterId: "work-life-boundaries",
      why: "Why constant availability quietly costs performance, and what a real boundary looks like.",
    },
    {
      moduleId: "stress-management",
      chapterId: "burnout-signs",
      why: "The three-part definition of burnout — and how to catch it before it's a crisis.",
    },
  ],
  environment: [
    {
      moduleId: "stress-management",
      chapterId: "recovery-practices",
      why: "What actually counts as recovery — and why passive scrolling usually doesn't.",
    },
    {
      moduleId: "mental-emotional-wellness",
      chapterId: "mindfulness-meditation",
      why: "The fundamentals behind the outdoor, nature-based sessions your answers pointed toward.",
    },
  ],
};

export const ERA_TRACK_RECS: Record<string, EraRec> = {
  nervous: {
    moduleId: "stress-management",
    chapterId: "breathwork",
    why: "Your stated priority: calming an overactive nervous system.",
  },
  ergonomic: {
    moduleId: "workplace-digital-wellness",
    chapterId: "ergonomics-101",
    why: "Your stated priority: undoing the physical toll of the desk.",
  },
  mindset: {
    moduleId: "stress-management",
    chapterId: "boundaries",
    why: "Your stated priority: better boundaries and a steadier mindset.",
  },
};

// ---------------------------------------------------------------------------
// Scoring — pure functions, ported 1:1 from the reference build's
// eraQuestionScore01 / eraSectionScores / eraOverallScore / eraBandFor /
// eraPriorityTrack / eraRetreatInterest / eraBuildRecommendations.
// ---------------------------------------------------------------------------

export function questionScore01(q: EraQuestion, answer: EraAnswer | undefined): number | null {
  if (answer === undefined || answer === null) return null;
  if (q.type === "single") {
    const idx = answer as number;
    const score = q.options?.[idx]?.score;
    return score != null ? (score - 1) / 2 : null;
  }
  if (q.type === "scale5") {
    const v = answer as number;
    return (v - 1) / 4;
  }
  if (q.type === "multi") {
    const a = answer as MultiAnswer;
    if (a.none) return 1;
    const n = (a.selected || []).length;
    return Math.max(0, 1 - n / 4);
  }
  return null; // priority questions aren't scored
}

export function isAnswered(q: EraQuestion, answer: EraAnswer | undefined): boolean {
  if (answer === undefined) return false;
  if (q.type === "multi") {
    const a = answer as MultiAnswer;
    return a.none || (a.selected && a.selected.length > 0);
  }
  return true;
}

export function sectionScores(
  answers: Record<string, EraAnswer>
): Record<string, number | null> {
  const bySection: Record<string, number[]> = {};
  ERA_SECTIONS.forEach((s) => (bySection[s.id] = []));
  ERA_QUESTIONS.forEach((q) => {
    if (!q.scored) return;
    const s01 = questionScore01(q, answers[q.id]);
    if (s01 !== null) bySection[q.sectionId].push(s01);
  });
  const out: Record<string, number | null> = {};
  Object.keys(bySection).forEach((id) => {
    const arr = bySection[id];
    out[id] = arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) : null;
  });
  return out;
}

export function overallScore(scores: Record<string, number | null>): number {
  const vals = Object.values(scores).filter((v): v is number => v !== null);
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
}

export function bandFor(score: number): EraBand {
  return ERA_BANDS.find((b) => score >= b.min) ?? ERA_BANDS[ERA_BANDS.length - 1];
}

export function priorityTrack(answers: Record<string, EraAnswer>): string | null {
  const a = answers["q9"];
  if (a === undefined) return null;
  const q9 = ERA_QUESTIONS.find((q) => q.id === "q9")!;
  return q9.options?.[a as number]?.track ?? null;
}

export function retreatInterest(answers: Record<string, EraAnswer>): boolean {
  const q11 = ERA_QUESTIONS.find((q) => q.id === "q11")!;
  const q12 = ERA_QUESTIONS.find((q) => q.id === "q12")!;
  const s11 = questionScore01(q11, answers["q11"]);
  const s12 = questionScore01(q12, answers["q12"]);
  if (s11 === null || s12 === null) return false;
  return (s11 + s12) / 2 >= 0.5;
}

export interface ChapterRecommendation {
  retreat?: false;
  tag: string;
  moduleId: string;
  chapterId: string;
  moduleTitle: string;
  moduleCode: string;
  chapterTitle: string;
  why: string;
}

export interface RetreatRecommendation {
  retreat: true;
  tag: string;
  title: string;
  why: string;
}

export type Recommendation = ChapterRecommendation | RetreatRecommendation;

export function buildRecommendations(
  scores: Record<string, number | null>,
  track: string | null,
  hasRetreatInterest: boolean
): Recommendation[] {
  const sorted = Object.entries(scores)
    .filter((entry): entry is [string, number] => entry[1] !== null)
    .sort((a, b) => a[1] - b[1]);

  const picks: ChapterRecommendation[] = [];
  const seen = new Set<string>();

  function addRec(rec: EraRec | undefined, tag: string) {
    if (!rec) return;
    const key = rec.moduleId + "/" + rec.chapterId;
    if (seen.has(key)) return;
    const found = findChapter(rec.moduleId, rec.chapterId);
    if (!found) return;
    seen.add(key);
    picks.push({
      tag,
      moduleId: rec.moduleId,
      chapterId: rec.chapterId,
      moduleTitle: found.m.title,
      moduleCode: formatModuleCode(found.m),
      chapterTitle: found.c.title,
      why: rec.why,
    });
  }

  if (track) addRec(ERA_TRACK_RECS[track], "Your stated priority");
  sorted.slice(0, 2).forEach(([sectionId]) => {
    (ERA_RECS[sectionId] || []).forEach((rec) => addRec(rec, "Lowest-scoring area"));
  });

  const capped: Recommendation[] = picks.slice(0, 4);
  if (hasRetreatInterest) {
    capped.push({
      retreat: true,
      tag: "Worth exploring",
      title: "An off-site reset, not just another module",
      why: "Your answers point to a change of environment — not just more reading — moving the needle for you.",
    });
  }
  return capped;
}
