import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { isAdminEmail } from "@/lib/admin-auth";
import { authLinkProblem } from "@/lib/auth-messages";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ problem?: string }>;
}) {
  const { problem } = await searchParams;
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (user && isAdminEmail(user.email)) redirect("/admin/crm");

  return (
    <AuthCard
      eyebrow="Private Echonflow workspace"
      title="Sign in to Growth OS"
      storyTitle={<>The work<br />behind <em>the work.</em></>}
      storyBody="Relationships, follow-ups and momentum—kept together in one private place."
    >
      <AdminLoginForm currentEmail={user?.email} initialError={authLinkProblem(problem)} />
    </AuthCard>
  );
}
