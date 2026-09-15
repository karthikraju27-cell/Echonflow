import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { authDestination } from "@/lib/auth-destination";

export const metadata = { title: "Reset password — Echonflow", robots: { index: false, follow: false } };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ next?: string; problem?: string }> }) {
  const { next, problem } = await searchParams;
  const destination = authDestination(next) ?? "/seeker";
  const signInHref = destination.startsWith("/admin")
    ? "/auth/admin"
    : destination.startsWith("/provider") ? "/auth/provider" : "/auth/seeker";
  return (
    <AuthCard
      eyebrow="Secure account recovery"
      title="Reset your password"
      storyTitle={<>A clear way<br /><em>back in.</em></>}
      storyBody="Your account, progress and work stay exactly where you left them."
    >
      <ForgotPasswordForm
        returnTo={destination}
        signInHref={signInHref}
        initialError={problem === "link_expired" ? "That reset link has expired or was already used. Request a fresh link below." : undefined}
      />
    </AuthCard>
  );
}
