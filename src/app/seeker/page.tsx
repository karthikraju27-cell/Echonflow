import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SEEKER_TILES } from "@/lib/constants";
import { PublicProfileToggle } from "@/components/seeker/PublicProfileToggle";
import { FlowArtwork } from "@/components/FlowArtwork";

export default async function SeekerHubPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("name, public_profile").eq("id", user!.id).single();
  const { count } = await supabase.from("era_responses").select("id", { count: "exact", head: true }).eq("seeker_id", user!.id);
  const hasAudit = (count ?? 0) > 0;
  return (
    <div>
      <div className="hub-heading"><h1>A little time for you,<br /><em>{(profile?.name || "friend").split(" ")[0]}.</em></h1><p>Your wellbeing is a practice.<br />Make space for it today.</p></div>
      <section className="audit-feature"><div><h2>{hasAudit ? "Check in with yourself." : "How are you, really?"}</h2><p>Look beyond “fine”. Explore your energy, recovery, and resilience to find a meaningful next step.</p><Link className="flow-button light-button" href="/seeker/era">{hasAudit ? "Retake your audit" : "Take your energy audit"} <span aria-hidden="true">↗</span></Link><Link className="history-link" href="/seeker/era/history">Your past results</Link></div><FlowArtwork /></section>
      <div className="section-heading compact-heading"><h2>Keep your momentum.</h2><p>Learning, discovery, and a little inspiration.</p></div>
      <div className="hub-grid">{SEEKER_TILES.filter(t => t.id !== "era").map((t) => <Link className="hub-link" href={t.id === "varta" ? "/varta" : t.href} key={t.id}><h3>{t.id === "varta" ? "Vārtā" : t.title}</h3><p>{t.note}</p><span>{t.cta} <span aria-hidden="true">↗</span></span></Link>)}</div>
      <section className="profile-settings"><h2>Your public presence</h2><p>Choose whether to share your name and earned certificates.</p><PublicProfileToggle seekerId={user!.id} initialValue={profile?.public_profile ?? false} /></section>
    </div>
  );
}
