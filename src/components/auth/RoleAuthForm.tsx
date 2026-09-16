import type { ComponentProps } from "react";
import { createClient } from "@/lib/supabase/server";
import { AuthForm } from "./AuthForm";
import { SwitchAccount } from "./SwitchAccount";

export async function RoleAuthForm(props: ComponentProps<typeof AuthForm>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== props.role) {
      return <SwitchAccount requestedRole={props.role} currentRole={profile?.role} />;
    }
  }
  return <AuthForm {...props} />;
}
