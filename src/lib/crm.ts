import { PROVIDER_CATEGORIES } from "@/lib/constants";
import type { CrmLeadStage, CrmLeadType, ProviderCategory } from "@/lib/database.types";

export const CRM_LEAD_TYPES: CrmLeadType[] = [
  "provider",
  "community",
  "corporate",
  "partnership",
];

export const CRM_STAGES: CrmLeadStage[] = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "delivery",
  "paused",
  "lost",
];

const TEXT_LIMITS = {
  lead_name: 140,
  organization: 140,
  contact_name: 100,
  email: 254,
  phone: 30,
  city: 120,
  source: 120,
  offering: 240,
  next_action: 240,
  notes: 3000,
} as const;

export type CrmLeadInput = {
  lead_type: CrmLeadType;
  lead_name: string;
  organization: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  source: string | null;
  provider_category: ProviderCategory | null;
  offering: string | null;
  session_package: number | null;
  estimated_value: number | null;
  stage: CrmLeadStage;
  last_contact_on: string | null;
  next_follow_up_on: string | null;
  next_action: string | null;
  notes: string | null;
  updated_at: string;
};

export function validateCrmLead(value: unknown):
  | { ok: true; input: CrmLeadInput }
  | { ok: false; error: string } {
  if (!value || typeof value !== "object") return { ok: false, error: "This lead could not be read." };
  const raw = value as Record<string, unknown>;
  if (!CRM_LEAD_TYPES.some((type) => type === raw.lead_type)) {
    return { ok: false, error: "Choose a valid relationship type." };
  }
  if (!CRM_STAGES.some((stage) => stage === raw.stage)) {
    return { ok: false, error: "Choose a valid stage." };
  }

  const text = {} as Record<keyof typeof TEXT_LIMITS, string | null>;
  for (const [field, limit] of Object.entries(TEXT_LIMITS) as [keyof typeof TEXT_LIMITS, number][]) {
    if (raw[field] != null && typeof raw[field] !== "string") {
      return { ok: false, error: `Check the ${field.replaceAll("_", " ")} field.` };
    }
    const cleaned = typeof raw[field] === "string" ? raw[field].trim() : "";
    if (cleaned.length > limit) return { ok: false, error: `${field.replaceAll("_", " ")} is too long.` };
    text[field] = cleaned || null;
  }
  if (!text.lead_name) return { ok: false, error: "Add a name for this relationship." };
  if (text.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.email)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const leadType = raw.lead_type as CrmLeadType;
  const category = raw.provider_category;
  if (leadType === "provider" && !PROVIDER_CATEGORIES.some((item) => item === category)) {
    return { ok: false, error: "Choose a provider category." };
  }
  if (category != null && !PROVIDER_CATEGORIES.some((item) => item === category)) {
    return { ok: false, error: "Choose a valid provider category." };
  }

  for (const field of ["last_contact_on", "next_follow_up_on"] as const) {
    const date = raw[field];
    if (date != null && date !== "" && (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date))) {
      return { ok: false, error: `Check the ${field.replaceAll("_", " ")} date.` };
    }
  }

  const packageValue = raw.session_package;
  const sessionPackage = packageValue === "" || packageValue == null ? null : Number(packageValue);
  if (sessionPackage != null && (!Number.isInteger(sessionPackage) || sessionPackage < 1 || sessionPackage > 52)) {
    return { ok: false, error: "Session package must be between 1 and 52 sessions." };
  }
  const valueRaw = raw.estimated_value;
  const estimatedValue = valueRaw === "" || valueRaw == null ? null : Number(valueRaw);
  if (estimatedValue != null && (!Number.isFinite(estimatedValue) || estimatedValue < 0 || estimatedValue > 9999999999.99)) {
    return { ok: false, error: "Check the estimated value." };
  }

  return {
    ok: true,
    input: {
      lead_type: leadType,
      lead_name: text.lead_name,
      organization: text.organization,
      contact_name: text.contact_name,
      email: text.email,
      phone: text.phone,
      city: text.city,
      source: text.source,
      provider_category: leadType === "provider" ? category as ProviderCategory : null,
      offering: text.offering,
      session_package: sessionPackage,
      estimated_value: estimatedValue,
      stage: raw.stage as CrmLeadStage,
      last_contact_on: typeof raw.last_contact_on === "string" && raw.last_contact_on ? raw.last_contact_on : null,
      next_follow_up_on: typeof raw.next_follow_up_on === "string" && raw.next_follow_up_on ? raw.next_follow_up_on : null,
      next_action: text.next_action,
      notes: text.notes,
      updated_at: new Date().toISOString(),
    },
  };
}
