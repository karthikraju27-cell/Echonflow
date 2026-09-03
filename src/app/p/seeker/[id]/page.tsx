import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PublicHeader } from "@/components/PublicHeader";

// Genuinely public — outside /seeker and /provider, so src/proxy.ts never
// gates it. Only ever shows a name and certificates earned. Never
// era_responses — that stays private under every circumstance, opted in
// or not (see migration 0008 and the RLS policies it added).

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", id)
    .eq("public_profile", true)
    .maybeSingle();
  if (!profile) return { title: "Profile — Echonflow" };

  const description = `${profile.name}'s wellness profile on Echonflow.`;
  return {
    title: `${profile.name} — Echonflow`,
    description,
    openGraph: { title: `${profile.name} — Echonflow`, description, type: "profile" },
  };
}

export default async function PublicSeekerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", id)
    .eq("public_profile", true)
    .maybeSingle();
  if (!profile) notFound();

  const { data: certificate } = await supabase
    .from("certificates")
    .select("name, issued_at")
    .eq("seeker_id", id)
    .maybeSingle();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let hubHref: string | undefined;
  if (user) {
    const { data: viewerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    hubHref = viewerProfile?.role === "provider" ? "/provider" : "/seeker";
  }

  return (
    <div className="min-h-screen bg-mist">
      <PublicHeader hubHref={hubHref} />
      <div className="mx-auto max-w-[720px] px-6 pb-20 pt-9">
        <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">
          Echonflow profile
        </div>
        <h1 className="mb-8 font-display text-[32px] font-medium text-ink">{profile.name}</h1>

        {certificate ? (
          <div className="max-w-[480px] rounded-md border border-[#DCD6BF] bg-card p-6">
            <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-gold">
              Certified
            </div>
            <div className="font-display text-[19px] font-medium text-ink">
              Echonflow Wellness Curriculum
            </div>
            <div className="mt-1.5 font-body text-[13px] text-[#4A4738]">
              Completed all 13 modules ·{" "}
              {new Date(certificate.issued_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        ) : (
          <p className="font-body text-[#8C8770]">No certificates earned yet.</p>
        )}
      </div>
    </div>
  );
}
