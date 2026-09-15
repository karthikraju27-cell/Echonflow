import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Founder access is part of the application configuration, so the private CRM
// remains reachable even if a deployment is missing the optional ADMIN_EMAILS
// environment variable. Additional admins should still be added through that
// server-only variable.
const foundingAdminEmails = ["karthikraju27@gmail.com"];

function adminEmails() {
  return new Set(
    [...foundingAdminEmails, ...(process.env.ADMIN_EMAILS ?? "").split(",")]
      .map(normalizeEmail)
      .filter(Boolean),
  );
}

function normalizeEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const [localPart, domain] = normalized.split("@");

  // Gmail delivers +tag aliases to the same verified inbox. Treat an approved
  // admin's aliases as the same identity so a provider session such as
  // name+provider@gmail.com can open the private workspace without a second
  // Echonflow login.
  if ((domain === "gmail.com" || domain === "googlemail.com") && localPart) {
    return `${localPart.split("+")[0]}@gmail.com`;
  }

  return normalized;
}

export function isAdminEmail(email: string | null | undefined) {
  return Boolean(email && adminEmails().has(normalizeEmail(email)));
}

export async function getAdminUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user && isAdminEmail(user.email) ? user : null;
}
