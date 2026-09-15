import { authDestination } from "@/lib/auth-destination";
import { createClient } from "@/lib/supabase/server";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthForm } from "@/components/auth/AuthForm";
import { authLinkProblem } from "@/lib/auth-messages";

// A pilot onboarding link (e.g. from /era?org=krafton, or shared directly)
// arrives here as ?org=<slug> so the org survives into account creation.
// An unrecognized slug is ignored silently — signup just proceeds without
// a company attached, same as if no org param were present at all.
export default async function SeekerAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; next?: string; problem?: string }>;
}) {
  const { org, next, problem } = await searchParams;

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
    <AuthCard
      eyebrow="Individual account"
      title="Welcome to your space"
      storyTitle={<>A little time<br />for <em>you.</em></>}
      storyBody="Your energy, learning and next wellbeing step—kept together in one calm space."
    >
      <AuthForm
        role="seeker"
        companyId={companyId}
        returnTo={authDestination(next) ?? (companyId && org ? "/era?org=" + encodeURIComponent(org) : undefined)}
        initialError={authLinkProblem(problem)}
      />
    </AuthCard>
  );
}
