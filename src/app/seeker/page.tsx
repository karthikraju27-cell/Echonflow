import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SEEKER_TILES } from "@/lib/constants";
import { PublicProfileToggle } from "@/components/seeker/PublicProfileToggle";

export default async function SeekerHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, public_profile")
    .eq("id", user!.id)
    .single();
  const firstName = (profile?.name || "there").split(" ")[0];

  return (
    <div>
      <h1 className="mb-1.5 font-display text-[32px] font-medium text-ink">Welcome, {firstName}</h1>
      <p className="mb-8 font-body text-[14.5px] text-[#4A4738]">
        Everything you need to build your wellness, in one place.
      </p>
      <PublicProfileToggle seekerId={user!.id} initialValue={profile?.public_profile ?? false} />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
        {SEEKER_TILES.map((t) =>
          t.id === "era" ? (
            <div key={t.id} className="rounded-md border border-[#DCD6BF] bg-card p-5 text-ink">
              <Link href={t.href} className="block">
                <div className="mb-2 font-display text-lg font-medium">{t.title}</div>
                <div className="mb-3 font-body text-[13px] leading-relaxed text-[#4A4738]">
                  {t.note}
                </div>
                <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-gold">
                  {t.cta} →
                </div>
              </Link>
              <Link
                href="/seeker/era/history"
                className="mt-3 inline-block font-mono text-[10.5px] uppercase tracking-[0.06em] text-moss"
              >
                Past results →
              </Link>
            </div>
          ) : (
            <Link
              key={t.id}
              href={t.href}
              className="block rounded-md border border-[#DCD6BF] bg-card p-5 text-ink"
            >
              <div className="mb-2 font-display text-lg font-medium">{t.title}</div>
              <div className="mb-3 font-body text-[13px] leading-relaxed text-[#4A4738]">
                {t.note}
              </div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-gold">
                {t.cta} →
              </div>
            </Link>
          )
        )}
      </div>
    </div>
  );
}
