import { AuthCard } from "@/components/auth/AuthCard";
import { AuthForm } from "@/components/auth/AuthForm";

export default function ProviderAuthPage() {
  return (
    <AuthCard eyebrow="Provider sign-in" title="Welcome, practitioner">
      <AuthForm role="provider" />
    </AuthCard>
  );
}
