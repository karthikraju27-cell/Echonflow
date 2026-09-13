import { redirect } from "next/navigation";
import { GrowthCrm } from "@/components/admin/GrowthCrm";
import { getAdminUser } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";
export const metadata = { title: "Growth CRM — Echonflow", robots: { index: false, follow: false } };

export default async function CrmPage() {
  const admin = await getAdminUser();
  if (!admin) redirect("/auth/admin");

  const { data, error } = await createServiceClient()
    .from("crm_leads")
    .select("*")
    .order("next_follow_up_on", { ascending: true, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (error) throw new Error("Unable to load the Echonflow CRM.");
  return <GrowthCrm leads={data ?? []} adminEmail={admin.email ?? "Admin"} />;
}
