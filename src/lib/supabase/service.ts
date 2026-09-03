import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// Service-role client — bypasses RLS. Server-only, and only for the narrow
// cases that genuinely need to read across users (looking up a provider's
// email to notify them of a lead; the daily re-audit cron scanning all
// seekers). Never import this into anything that runs client-side.
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
