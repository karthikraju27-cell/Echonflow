export interface WrsQuestion {
  id: string;
  text: string;
}

export interface WrsCategory {
  id: string;
  title: string;
  description: string;
  weight: number;
  action: string;
  questions: WrsQuestion[];
}

export interface WrsCategoryScore {
  title: string;
  score: number;
  weight: number;
}

export type WrsBreakdown = Record<string, WrsCategoryScore>;
export type WrsAnswers = Record<string, number>;

// WRS™ beta v1. These operational dimensions reflect the current Echonflow
// property-readiness model. It is self-reported and provisional; it is not a
// certification or an independently verified property audit.
export const WRS_CATEGORIES: WrsCategory[] = [
  {
    id: "connectivity",
    title: "Connectivity",
    description: "Reliable internet and continuity for uninterrupted work.",
    weight: 15,
    action: "Document internet speed in work areas and add a tested backup connection and power plan.",
    questions: [
      { id: "connectivity_1", text: "Business-grade internet is consistently available in guest rooms and shared work areas." },
      { id: "connectivity_2", text: "The property regularly tests and records upload speed, download speed, and latency." },
      { id: "connectivity_3", text: "Backup internet and power can keep video calls running during an outage." },
    ],
  },
  {
    id: "workspace",
    title: "Workspace",
    description: "Comfortable places for focused work throughout the day.",
    weight: 12,
    action: "Create a quiet work zone with ergonomic chairs, task lighting, charging points, and clear usage rules.",
    questions: [
      { id: "workspace_1", text: "Dedicated work areas are available outside guest rooms." },
      { id: "workspace_2", text: "Work areas provide ergonomic seating, task lighting, power, and comfortable desk height." },
      { id: "workspace_3", text: "Quiet zones and call-friendly zones are clearly separated and actively managed." },
    ],
  },
  {
    id: "accommodation",
    title: "Accommodation",
    description: "Rooms that support both restorative sleep and practical work.",
    weight: 12,
    action: "Audit room noise, blackout quality, desk usability, charging access, and housekeeping flexibility.",
    questions: [
      { id: "accommodation_1", text: "Guest rooms are quiet, dark, and comfortable enough for reliable sleep." },
      { id: "accommodation_2", text: "Rooms include a usable laptop surface, nearby charging, and a supportive chair." },
      { id: "accommodation_3", text: "Housekeeping and room-service timings can adapt around a working guest's schedule." },
    ],
  },
  {
    id: "meetings",
    title: "Meetings",
    description: "Spaces and equipment for team collaboration and calls.",
    weight: 12,
    action: "Package a bookable meeting room with tested AV, simple pricing, and on-call technical support.",
    questions: [
      { id: "meetings_1", text: "A private, bookable meeting room is available for teams." },
      { id: "meetings_2", text: "Display, camera, microphone, speakers, and adapters are tested before group arrivals." },
      { id: "meetings_3", text: "A staff member can quickly resolve common meeting-room and connectivity issues." },
    ],
  },
  {
    id: "wellness",
    title: "Wellness",
    description: "Recovery experiences that fit naturally around the workday.",
    weight: 12,
    action: "Build a simple workation wellness menu with morning, break-time, and evening recovery options.",
    questions: [
      { id: "wellness_1", text: "Movement, mindfulness, nature, fitness, or spa experiences are available on-site." },
      { id: "wellness_2", text: "Wellness sessions can be scheduled around working hours and team agendas." },
      { id: "wellness_3", text: "Qualified practitioners deliver activities with clear scope and safety practices." },
    ],
  },
  {
    id: "food",
    title: "Food & hydration",
    description: "Consistent nourishment for focus, energy, and dietary needs.",
    weight: 10,
    action: "Offer predictable workday meal windows, hydration stations, and clearly labelled dietary choices.",
    questions: [
      { id: "food_1", text: "Balanced meals are available at timings that suit a normal working day." },
      { id: "food_2", text: "Water, tea, coffee, and light snacks remain accessible between meals." },
      { id: "food_3", text: "Dietary requirements and allergens are captured in advance and handled consistently." },
    ],
  },
  {
    id: "accessibility",
    title: "Access & mobility",
    description: "A predictable journey to and around the property.",
    weight: 8,
    action: "Publish realistic travel times and arrange dependable transfers with a named arrival contact.",
    questions: [
      { id: "accessibility_1", text: "Travel time and route information from the nearest airport or transport hub are clear and accurate." },
      { id: "accessibility_2", text: "Reliable transfers can be arranged for individual and group arrivals." },
      { id: "accessibility_3", text: "The property communicates mobility limitations and accessible facilities before booking." },
    ],
  },
  {
    id: "sustainability",
    title: "Sustainability",
    description: "Visible, measurable care for place and community.",
    weight: 8,
    action: "Track one measurable improvement across waste, water, energy, or local sourcing and share the evidence.",
    questions: [
      { id: "sustainability_1", text: "Waste, water, and energy practices are documented and visible in daily operations." },
      { id: "sustainability_2", text: "Local food, products, people, or experiences are meaningfully included in the guest offering." },
      { id: "sustainability_3", text: "The property tracks at least one environmental or community-impact measure over time." },
    ],
  },
  {
    id: "corporate_ops",
    title: "Corporate operations",
    description: "Commercial and service processes that make a group stay dependable.",
    weight: 11,
    action: "Create one corporate workation pack covering capacity, inclusions, billing, escalation, and a named coordinator.",
    questions: [
      { id: "corporate_ops_1", text: "The property can provide one proposal, contract, invoice, and payment process for a group." },
      { id: "corporate_ops_2", text: "A named coordinator owns planning before arrival and delivery during the stay." },
      { id: "corporate_ops_3", text: "Group capacity, inclusions, response times, and escalation steps are clearly documented." },
    ],
  },
];

export const WRS_SCALE = [
  { value: 0, label: "Not available", short: "Not yet" },
  { value: 1, label: "Available occasionally or informally", short: "Ad hoc" },
  { value: 2, label: "Partly in place, with some gaps", short: "Partial" },
  { value: 3, label: "Reliable for most guests and groups", short: "Reliable" },
  { value: 4, label: "Documented, tested, and operationally proven", short: "Proven" },
] as const;

export const WRS_TIERS = [
  { label: "Platinum", min: 90 },
  { label: "Gold", min: 75 },
  { label: "Silver", min: 60 },
  { label: "Developing", min: 0 },
] as const;

export function tierForScore(score: number): string {
  return WRS_TIERS.find((tier) => score >= tier.min)?.label ?? "Developing";
}

export function categoryScore(category: WrsCategory, answers: WrsAnswers): number {
  const total = category.questions.reduce((sum, question) => sum + (answers[question.id] ?? 0), 0);
  return Math.round((total / (category.questions.length * 4)) * 100);
}

export function scoreWrs(answers: WrsAnswers) {
  const breakdown: WrsBreakdown = Object.fromEntries(
    WRS_CATEGORIES.map((category) => [
      category.id,
      { title: category.title, score: categoryScore(category, answers), weight: category.weight },
    ])
  );
  const score = Math.round(
    WRS_CATEGORIES.reduce(
      (total, category) => total + breakdown[category.id].score * (category.weight / 100),
      0
    )
  );
  return { score, tier: tierForScore(score), breakdown };
}

export function wrsPriorities(breakdown: WrsBreakdown) {
  return WRS_CATEGORIES
    .map((category) => ({ ...category, score: breakdown[category.id]?.score ?? 0 }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
}
