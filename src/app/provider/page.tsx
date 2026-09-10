import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PROVIDER_TILES } from "@/lib/constants";
import { FlowArtwork } from "@/components/FlowArtwork";

export default async function ProviderHubPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("name").eq("id", user!.id).single();
  return <div>
    <div className="hub-heading"><h1>Good work deserves<br /><em>room to grow.</em></h1><p>Welcome, {(profile?.name || "friend").split(" ")[0]}.<br />This is your provider space.</p></div>
    <section className="audit-feature"><div><h2>Bring your practice<br />to Echonflow.</h2><p>From independent coaches to retreat properties. Tell seekers what you offer and make the first connection easier.</p><Link href="/provider/listings" className="flow-button light-button">Manage your practice <span aria-hidden="true">↗</span></Link></div><FlowArtwork /></section>
    <div className="hub-grid">{PROVIDER_TILES.map(t => <Link href={t.href} className="hub-link" key={t.id}><h2>{t.title}</h2><p>{t.id === "listings" ? "Create and manage your services, location, and practice details." : t.note}</p><span>{t.cta} <span aria-hidden="true">↗</span></span></Link>)}</div>
    <section className="provider-wrs"><div><h2>A property with possibilities?</h2><p>Explore your Workation Readiness Score (WRS™) from your resort listing. Understand the foundations of a corporate workation experience.</p><span className="beta-note">Beta scoring · provisional assessment</span></div><Link href="/provider/listings" className="flow-button">Explore WRS™ <span aria-hidden="true">↗</span></Link></section>
  </div>;
}
