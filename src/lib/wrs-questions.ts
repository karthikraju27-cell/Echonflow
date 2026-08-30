export interface WrsQuestion {
  id: string;
  text: string;
}

export interface WrsCategory {
  id: string;
  title: string;
  questions: WrsQuestion[];
}

// TODO(wrs): placeholder question set and equal-weighting methodology.
// Replace with the real WRS™ (Workation Readiness Score) rubric — category
// weights, question set, and tier cutoffs — once provided. The
// category -> question -> 1-5 answer -> score shape in WrsFlow is designed
// so that swap is content-only.
export const WRS_CATEGORIES: WrsCategory[] = [
  {
    id: "connectivity",
    title: "Connectivity",
    questions: [
      { id: "connectivity_1", text: "High-speed WiFi is reliably available across guest rooms and workspaces." },
      { id: "connectivity_2", text: "Backup power/internet keeps calls and video meetings running during outages." },
    ],
  },
  {
    id: "workspace",
    title: "Workspace",
    questions: [
      { id: "workspace_1", text: "Dedicated desks or work-friendly seating are available outside guest rooms." },
      { id: "workspace_2", text: "Workspaces have good lighting, ergonomic seating, and minimal noise." },
    ],
  },
  {
    id: "accommodation",
    title: "Accommodation",
    questions: [
      { id: "accommodation_1", text: "Rooms are quiet enough for focused work and video calls." },
      { id: "accommodation_2", text: "Rooms include a proper desk/table suitable for a laptop." },
    ],
  },
  {
    id: "meetings",
    title: "Meetings",
    questions: [
      { id: "meetings_1", text: "A bookable meeting or conference room is available on-site." },
      { id: "meetings_2", text: "AV equipment (screen, mic, speakers) is available for group calls." },
    ],
  },
  {
    id: "wellness",
    title: "Wellness",
    questions: [
      { id: "wellness_1", text: "On-site wellness facilities (spa, yoga, fitness) are available to guests." },
      { id: "wellness_2", text: "Staff can guide guests to wellness activities suited to their needs." },
    ],
  },
  {
    id: "food",
    title: "Food",
    questions: [
      { id: "food_1", text: "Healthy, work-day-friendly meal options are available without pre-booking." },
      { id: "food_2", text: "Coffee/tea and light snacks are accessible during working hours." },
    ],
  },
  {
    id: "accessibility",
    title: "Accessibility",
    questions: [
      { id: "accessibility_1", text: "The property is easy to reach from a major airport or transit hub." },
      { id: "accessibility_2", text: "On-site transport or easy local transit is available for day trips/errands." },
    ],
  },
  {
    id: "sustainability",
    title: "Sustainability",
    questions: [
      { id: "sustainability_1", text: "The property has visible sustainability practices (waste, energy, water)." },
      { id: "sustainability_2", text: "Locally sourced food or materials are used where possible." },
    ],
  },
  {
    id: "corporate_ops",
    title: "Corporate Operations",
    questions: [
      { id: "corporate_ops_1", text: "The property can handle group bookings and corporate billing/invoicing." },
      { id: "corporate_ops_2", text: "A dedicated point of contact is available for corporate/group stays." },
    ],
  },
];

export const WRS_SCALE = [
  { value: 1, label: "Not at all" },
  { value: 2, label: "Rarely" },
  { value: 3, label: "Somewhat" },
  { value: 4, label: "Mostly" },
  { value: 5, label: "Fully" },
];

export interface WrsTierDef {
  label: string;
  min: number;
}

// TODO(wrs): placeholder tier cutoffs — replace with the real WRS™ tiers.
export const WRS_TIERS: WrsTierDef[] = [
  { label: "Platinum", min: 90 },
  { label: "Gold", min: 75 },
  { label: "Silver", min: 60 },
  { label: "Needs Improvement", min: 0 },
];

export function tierForScore(score: number): string {
  return WRS_TIERS.find((t) => score >= t.min)?.label ?? "Needs Improvement";
}
