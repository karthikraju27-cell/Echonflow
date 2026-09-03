import { createClient } from "@/lib/supabase/server";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthForm } from "@/components/auth/AuthForm";

// A pilot onboarding link (e.g. from /era?org=krafton, or shared directly)
// arrives here as ?org=<slug> so the org survives into account creation.
// An unrecognized slug is ignored silently — signup just proceeds without
// a company attached, same as if no org param were present at all.
export default async function SeekerAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const { org } = await searchParams;

  let companyId: string | undefined;
  if (org) {
    const supabase = await createClient();
    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("slug", org)
      .maybeSingle();
    companyId = company?.id;
  }

  return (
    <AuthCard eyebrow="Seeker sign-in" title="Welcome back">
      <AuthForm role="seeker" companyId={companyId} />
    </AuthCard>
  );
}
