import { AuthCard } from "@/components/auth/AuthCard";
import { AuthForm } from "@/components/auth/AuthForm";
import { authDestination } from "@/lib/auth-destination";
import { authLinkProblem } from "@/lib/auth-messages";

export default async function ProviderAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; problem?: string }>;
}) {
  const { next, problem } = await searchParams;
  return (
    <AuthCard
      eyebrow="Provider account"
      title="Welcome, practitioner"
      storyTitle={<>Good work deserves<br /><em>room to grow.</em></>}
      storyBody="One account for your practice, listings, WRS™ assessment and seeker inquiries."
    >
      <AuthForm
        role="provider"
        returnTo={authDestination(next) ?? "/provider/onboarding"}
        initialError={authLinkProblem(problem)}
      />
    </AuthCard>
  );
}
