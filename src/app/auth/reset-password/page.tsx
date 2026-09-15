import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { authDestination } from "@/lib/auth-destination";

export const metadata = { title: "Choose a new password — Echonflow", robots: { index: false, follow: false } };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const destination = authDestination(next) ?? "/seeker";
  return (
    <AuthCard
      eyebrow="Final recovery step"
      title="Choose a new password"
      storyTitle={<>Begin again,<br /><em>securely.</em></>}
      storyBody="One new password returns you to the Echonflow space you were opening."
    >
      <ResetPasswordForm returnTo={destination} />
    </AuthCard>
  );
}
