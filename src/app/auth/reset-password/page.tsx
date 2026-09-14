import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { authDestination } from "@/lib/auth-destination";

export const metadata = { title: "Choose a new password — Echonflow", robots: { index: false, follow: false } };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const destination = authDestination(next) ?? "/seeker";
  return <AuthCard eyebrow="Secure account recovery" title="Choose a new password"><ResetPasswordForm returnTo={destination} /></AuthCard>;
}
