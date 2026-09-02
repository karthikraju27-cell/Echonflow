import type { ProviderCategory } from "@/lib/database.types";

export const PROVIDER_CATEGORIES: ProviderCategory[] = [
  "Resort",
  "Trainer",
  "Therapist / Practitioner",
  "Studio",
  "Retreat Center",
  "Nutritionist",
];

export const SEEKER_TILES = [
  {
    id: "modules",
    href: "/seeker/modules",
    title: "Learning Modules",
    note: "13 modules, 116 chapters — the free wellness curriculum.",
    cta: "Start learning",
  },
  {
    id: "era",
    href: "/seeker/era",
    title: "Energy & Resilience Audit",
    note: "A 5-part audit that scores your recovery, sleep, and stress load.",
    cta: "Take the audit",
  },
  {
    id: "varta",
    href: "/seeker/varta",
    title: "Vārtā — Reels & Insights",
    note: "Curated wellness reels and short written takes, categorised.",
    cta: "Browse Vārtā",
  },
  {
    id: "directory",
    href: "/seeker/directory",
    title: "Find a Provider",
    note: "Resorts, trainers, and practitioners listed by other side of Echonflow.",
    cta: "Browse providers",
  },
  {
    id: "retreats",
    href: "/seeker/retreats",
    title: "Retreats & Sessions",
    note: "Multi-day retreats, 1:1s, and small-group sessions.",
    cta: "Explore retreats",
  },
] as const;
