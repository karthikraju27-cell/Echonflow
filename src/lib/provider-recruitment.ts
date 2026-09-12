import { PROVIDER_CATEGORIES } from "@/lib/constants";
import type { ProviderCategory, RecruitmentStage } from "@/lib/database.types";

export const RECRUITMENT_STAGES: RecruitmentStage[] = [
  "prospect",
  "contacted",
  "interested",
  "onboarding",
  "live",
  "paused",
  "declined",
];

const LIMITS = {
  provider_name: 140,
  organization: 140,
  contact_name: 100,
  email: 254,
  phone: 30,
  city: 120,
  source: 120,
  notes: 3000,
} as const;

export type ProspectInput = {
  provider_name: string;
  category: ProviderCategory;
  organization: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  source: string | null;
  stage: RecruitmentStage;
  last_contact_on: string | null;
  next_follow_up_on: string | null;
  notes: string | null;
  updated_at: string;
};

export function validateProspect(value: unknown):
  | { ok: true; input: ProspectInput }
  | { ok: false; error: string } {
  if (!value || typeof value !== "object") return { ok: false, error: "Invalid provider record." };
  const raw = value as Record<string, unknown>;
  const providerName = typeof raw.provider_name === "string" ? raw.provider_name.trim() : "";
  const category = raw.category;
  const stage = raw.stage;
  if (!providerName || providerName.length > LIMITS.provider_name) {
    return { ok: false, error: "Add a provider name of up to 140 characters." };
  }
  if (!PROVIDER_CATEGORIES.some((item) => item === category)) {
    return { ok: false, error: "Choose a valid provider category." };
  }
  if (!RECRUITMENT_STAGES.some((item) => item === stage)) {
    return { ok: false, error: "Choose a valid recruitment stage." };
  }

  const optional = {} as Record<keyof typeof LIMITS, string | null>;
  for (const [field, limit] of Object.entries(LIMITS) as [keyof typeof LIMITS, number][]) {
    if (field === "provider_name") continue;
    if (raw[field] != null && typeof raw[field] !== "string") {
      return { ok: false, error: `Check the ${field.replaceAll("_", " ")} field.` };
    }
    const text = typeof raw[field] === "string" ? raw[field].trim() : "";
    if (text.length > limit) return { ok: false, error: `${field.replaceAll("_", " ")} is too long.` };
    optional[field] = text || null;
  }
  if (optional.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(optional.email)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  const dates = ["last_contact_on", "next_follow_up_on"] as const;
  for (const field of dates) {
    const value = raw[field];
    if (value != null && value !== "" && (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))) {
      return { ok: false, error: `Check the ${field.replaceAll("_", " ")} date.` };
    }
  }

  return {
    ok: true,
    input: {
      provider_name: providerName,
      category: category as ProviderCategory,
      organization: optional.organization,
      contact_name: optional.contact_name,
      email: optional.email,
      phone: optional.phone,
      city: optional.city,
      source: optional.source,
      notes: optional.notes,
      stage: stage as RecruitmentStage,
      last_contact_on: typeof raw.last_contact_on === "string" && raw.last_contact_on ? raw.last_contact_on : null,
      next_follow_up_on: typeof raw.next_follow_up_on === "string" && raw.next_follow_up_on ? raw.next_follow_up_on : null,
      updated_at: new Date().toISOString(),
    },
  };
}
