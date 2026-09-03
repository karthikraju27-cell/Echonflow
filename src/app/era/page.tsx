import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EraFlow } from "@/components/era/EraFlow";
import { ERA_TITLE, ERA_EYEBROW, ERA_INTRO } from "@/lib/era-questions";

export const metadata = {
  title: "Energy & Resilience Audit — Echonflow",
};

// Public entry point — no account required. Anyone can take the audit and
// see full results; results only persist to the database for signed-in
// seekers (see EraFlow). Signed-in visitors land here with the same
// experience, just with their result saved automatically.
export default async function PublicEraPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-mist">
      <div className="flex items-center justify-between border-b border-[#DCD6BF] px-6 py-4">
        <Link href="/" className="font-mono text-[13px] tracking-[0.1em] text-forest">
          echonflow
        </Link>
        {user ? (
          <Link href="/seeker" className="font-mono text-[11.5px] uppercase text-moss">
            Your hub →
          </Link>
        ) : (
          <Link href="/auth/seeker" className="font-mono text-[11.5px] uppercase text-moss">
            Sign in
          </Link>
        )}
      </div>
      <div className="mx-auto max-w-[1020px] px-6 pb-20 pt-9">
        <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">
          {ERA_EYEBROW}
        </div>
        <h1 className="mb-3 font-display text-[30px] font-medium text-ink">{ERA_TITLE}</h1>
        <p className="mb-7 max-w-[64ch] font-body text-[14.5px] text-[#4A4738]">{ERA_INTRO}</p>
        <EraFlow seekerId={user?.id} />
      </div>
    </div>
  );
}
