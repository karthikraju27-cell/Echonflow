export interface EraQuestion {
  id: string;
  text: string;
}

export interface EraSection {
  id: string;
  title: string;
  questions: EraQuestion[];
}

// TODO(era): placeholder question set. Replace with the real ~15-question,
// 5-section ERA spec once it's provided (see build brief, Task 4). The
// section -> question -> 1-5 answer -> score shape in EraFlow is designed so
// that swap is content-only — no component logic should need to change.
export const ERA_SECTIONS: EraSection[] = [
  {
    id: "sleep",
    title: "Sleep",
    questions: [
      { id: "sleep_1", text: "I wake up feeling rested most mornings." },
      { id: "sleep_2", text: "I fall asleep within 20 minutes of going to bed." },
      { id: "sleep_3", text: "My sleep schedule is consistent across the week." },
    ],
  },
  {
    id: "stress",
    title: "Stress Load",
    questions: [
      { id: "stress_1", text: "I feel in control of my day-to-day workload." },
      { id: "stress_2", text: "I have effective ways to decompress after a stressful day." },
      { id: "stress_3", text: "Physical tension rarely builds up on me unnoticed." },
    ],
  },
  {
    id: "movement",
    title: "Movement",
    questions: [
      { id: "movement_1", text: "I move my body deliberately most days of the week." },
      { id: "movement_2", text: "I don't sit for long uninterrupted stretches." },
      { id: "movement_3", text: "My body feels capable, not stiff or fragile." },
    ],
  },
  {
    id: "nutrition",
    title: "Nutrition",
    questions: [
      { id: "nutrition_1", text: "My meals are mostly planned rather than grabbed on the run." },
      { id: "nutrition_2", text: "I stay adequately hydrated through the day." },
      { id: "nutrition_3", text: "My energy stays steady between meals." },
    ],
  },
  {
    id: "recovery_env",
    title: "Recovery Environment",
    questions: [
      { id: "recovery_1", text: "My living/working space genuinely supports rest." },
      { id: "recovery_2", text: "I have people or places I can retreat to when depleted." },
      { id: "recovery_3", text: "I take real recovery time, not just screen-scrolling breaks." },
    ],
  },
];

export const ERA_SCALE = [
  { value: 1, label: "Rarely" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Often" },
  { value: 4, label: "Usually" },
  { value: 5, label: "Almost always" },
];
