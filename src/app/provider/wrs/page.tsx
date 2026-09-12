import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Workation Readiness Score — Echonflow",
  robots: { index: false, follow: false },
};

export default async function ProviderWrsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: resorts } = await supabase
    .from("listings")
    .select("id, business_name, location, wrs_score, wrs_tier, created_at")
    .eq("owner_id", user!.id)
    .eq("category", "Resort")
    .order("created_at", { ascending: false });

  return (
    <div className="wrs-workspace">
      <header className="wrs-workspace-heading">
        <div>
          <span>Property intelligence · beta</span>
          <h1>Workation Readiness<br />Score (WRS™)</h1>
          <p>Assess whether your property can reliably host working teams, see operational gaps, and improve over time.</p>
        </div>
        <div className="wrs-workspace-meta"><strong>9</strong><span>readiness<br />dimensions</span></div>
      </header>

      <section className="wrs-workspace-note">
        <strong>A planning score, built for progress.</strong>
        <p>WRS™ beta is self-reported and provisional. It does not represent an independent inspection or Echonflow certification.</p>
      </section>

      {!resorts?.length ? (
        <section className="wrs-empty">
          <span>Start with your property</span>
          <h2>Create a Resort listing before taking WRS™.</h2>
          <p>The listing identifies the property whose readiness is being assessed. Once it is published, its assessment opens here immediately.</p>
          <Link href="/provider/onboarding?track=property" className="flow-button">Introduce my property <span>→</span></Link>
        </section>
      ) : (
        <section className="wrs-property-list">
          <div className="wrs-list-heading"><h2>Your Resort properties</h2><Link href="/provider/onboarding?track=property">Add another property →</Link></div>
          {resorts.map((resort) => (
            <article key={resort.id} className="wrs-property-row">
              <div><span>Resort · {resort.location}</span><h3>{resort.business_name}</h3></div>
              {resort.wrs_score == null ? (
                <div className="wrs-property-state"><span>Not assessed</span><Link href={`/provider/listings/${resort.id}/wrs`} className="flow-button">Start assessment <span>→</span></Link></div>
              ) : (
                <div className="wrs-property-state"><p><strong>{resort.wrs_score}</strong><span>{resort.wrs_tier}<small>Beta score</small></span></p><Link href={`/provider/listings/${resort.id}/wrs`} className="flow-button">View score <span>→</span></Link></div>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
