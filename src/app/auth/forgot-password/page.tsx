import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { authDestination } from "@/lib/auth-destination";

export const metadata = { title: "Reset password — Echonflow", robots: { index: false, follow: false } };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const destination = authDestination(next) ?? "/seeker";
  const signInHref = destination.startsWith("/admin")
    ? "/auth/admin"
    : destination.startsWith("/provider") ? "/auth/provider" : "/auth/seeker";
  return <AuthCard eyebrow="Account recovery" title="Let’s get you back in"><ForgotPasswordForm returnTo={destination} signInHref={signInHref} /></AuthCard>;
}
