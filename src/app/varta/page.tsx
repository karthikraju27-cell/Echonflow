import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/Shell";
import VartaPage from "@/app/seeker/varta/page";

export const metadata = { title: "Vārtā — Echonflow" };

export default async function SharedVartaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/seeker?next=%2Fvarta");
  const { data: profile } = await supabase.from("profiles").select("name, role").eq("id", user.id).single();
  if (!profile) redirect("/auth/seeker");
  return <Shell name={profile.name} role={profile.role}><VartaPage /></Shell>;
}
