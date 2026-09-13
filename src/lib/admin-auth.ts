import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

function adminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email: string | null | undefined) {
  return Boolean(email && adminEmails().has(email.trim().toLowerCase()));
}

export async function getAdminUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user && isAdminEmail(user.email) ? user : null;
}
