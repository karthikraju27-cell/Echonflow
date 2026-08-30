import { AuthCard } from "@/components/auth/AuthCard";
import { AuthForm } from "@/components/auth/AuthForm";

export default function SeekerAuthPage() {
  return (
    <AuthCard eyebrow="Seeker sign-in" title="Welcome back">
      <AuthForm role="seeker" />
    </AuthCard>
  );
}
