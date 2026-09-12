import { createServiceClient } from "@/lib/supabase/service";
import { hasAdminAccess } from "@/lib/admin-access";
import { RecruitmentTracker } from "@/components/admin/RecruitmentTracker";

export const dynamic = "force-dynamic";
export const metadata = { title: "Provider recruitment — Echonflow", robots: { index: false, follow: false } };

function Locked() {
  return <main className="mx-auto max-w-[560px] px-6 py-24 text-center"><p>Not found.</p></main>;
}

export default async function ProviderRecruitmentPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  if (!hasAdminAccess(key)) return <Locked />;

  const { data, error } = await createServiceClient()
    .from("provider_prospects")
    .select("*")
    .order("next_follow_up_on", { ascending: true, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (error) throw new Error("Unable to load provider recruitment.");
  return <RecruitmentTracker prospects={data ?? []} accessKey={key!} />;
}
