"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminLogoutButton() {
  const router = useRouter();

  async function logout() {
    await createClient().auth.signOut();
    router.push("/auth/admin");
    router.refresh();
  }

  return <button type="button" onClick={logout}>Log out</button>;
}
