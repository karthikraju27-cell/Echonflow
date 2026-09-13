import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { getAdminUser } from "@/lib/admin-auth";

export default async function AdminAuthPage() {
  if (await getAdminUser()) redirect("/admin/crm");

  return (
    <AuthCard eyebrow="Private business workspace" title="Welcome back, Karthik">
      <AdminLoginForm />
    </AuthCard>
  );
}
