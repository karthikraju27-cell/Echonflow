import { PROVIDER_CATEGORIES } from "@/lib/constants";

const limits = { name: 120, city: 120, description: 900, offer: 140, audience: 250, contact: 100, email: 254, phone: 30, price: 100, credentials: 500, format: 30, category: 40 };
export function validateOnboarding(value: unknown): { ok: false; error: string } | { ok: true; id: string; draft: Record<string, string> } {
  if (!value || typeof value !== "object") return { ok: false, error: "Invalid submission." };
  const body = value as Record<string, unknown>;
  if (body.confirmed !== true || typeof body.id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.id)) return { ok: false, error: "Please review and confirm your listing." };
  if (!body.draft || typeof body.draft !== "object") return { ok: false, error: "Provider details are missing." };
  const input = body.draft as Record<string, unknown>;
  const draft: Record<string, string> = {};
  for (const [field, limit] of Object.entries(limits)) {
    if (typeof input[field] !== "string" || input[field].length > limit) return { ok: false, error: "Please check your " + field + " field." };
    draft[field] = input[field].trim();
  }
  if (["name","city","offer","audience","contact"].some(field => !draft[field]) || draft.description.length < 30) return { ok: false, error: "Complete your profile, offering and contact details." };
  if (!PROVIDER_CATEGORIES.some(c => c === draft.category) || !["In person","Online","Online and in person"].includes(draft.format)) return { ok: false, error: "Choose a valid category and delivery format." };
  if (!/^[^s@]+@[^s@]+.[^s@]+$/.test(draft.email)) return { ok: false, error: "Enter a valid contact email." };
  return { ok: true, id: body.id, draft };
}
