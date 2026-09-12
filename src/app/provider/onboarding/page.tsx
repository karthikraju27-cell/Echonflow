import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProviderOnboardingPreview } from "@/components/provider/onboarding/ProviderOnboardingPreview";

export const metadata = { title: "Introduce your practice — Echonflow", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ track?: string }> }) {
  const { track } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/provider?next=%2Fprovider%2Fonboarding");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "provider") redirect("/seeker");
  return <ProviderOnboardingPreview ownerId={user.id} initialTrack={track === "property" ? "property" : "practice"} />;
}
