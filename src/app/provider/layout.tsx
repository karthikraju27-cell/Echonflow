import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/Shell";

export default async function ProviderLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/");

  return (
    <Shell name={profile.name || user.email || "Provider"} role={profile.role}>
      {children}
    </Shell>
  );
}
