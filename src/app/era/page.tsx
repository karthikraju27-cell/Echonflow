import { createClient } from "@/lib/supabase/server";
import { EraFlow } from "@/components/era/EraFlow";
import { PublicHeader } from "@/components/PublicHeader";
import { ERA_TITLE, ERA_EYEBROW, ERA_INTRO } from "@/lib/era-questions";

export const metadata = {
  title: "Energy & Resilience Audit — Echonflow",
};

// Public entry point — no account required. Anyone can take the audit and
// see full results; results only persist to the database for signed-in
// seekers (see EraFlow). Signed-in visitors land here with the same
// experience, just with their result saved automatically.
//
// ?org=<slug> carries a pilot cohort (e.g. Krafton) through: an
// unrecognized slug is ignored silently rather than erroring the page.
export default async function PublicEraPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const { org } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hubHref: string | undefined;
  let profileCompanyId: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, company_id")
      .eq("id", user.id)
      .single();
    hubHref = profile?.role === "provider" ? "/provider" : "/seeker";
    profileCompanyId = profile?.company_id ?? null;
  }

  let company: { id: string; slug: string } | null = null;
  if (org) {
    const { data } = await supabase
      .from("companies")
      .select("id, slug")
      .eq("slug", org)
      .maybeSingle();
    company = data ?? null;
  }

  // An explicit ?org= link (e.g. a pilot's onboarding email) wins; absent
  // that, fall back to whatever's already on the seeker's own profile so a
  // signed-in retake here still stamps their existing company.
  const companyId = company?.id ?? profileCompanyId ?? undefined;

  return (
    <div className="min-h-screen bg-mist">
      <PublicHeader hubHref={hubHref} />
      <div className="mx-auto max-w-[1020px] px-6 pb-20 pt-9">
        <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">
          {ERA_EYEBROW}
        </div>
        <h1 className="mb-3 font-display text-[30px] font-medium text-ink">{ERA_TITLE}</h1>
        <p className="mb-7 max-w-[64ch] font-body text-[14.5px] text-[#4A4738]">{ERA_INTRO}</p>
        <EraFlow seekerId={user?.id} companyId={companyId} orgSlug={company?.slug} />
      </div>
    </div>
  );
}
