"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { BrandMark } from "@/components/BrandMark";
import type { ProviderCategory } from "@/lib/database.types";
import styles from "./onboarding.module.css";

type Track = "practice" | "property";
type Draft = { track: Track; category: ProviderCategory; name: string; city: string; description: string; offer: string; format: string; price: string; contact: string; email: string; phone: string; credentials: string; audience: string };
const initial: Draft = { track: "practice", category: "Trainer", name: "", city: "", description: "", offer: "", format: "In person", price: "", contact: "", email: "", phone: "", credentials: "", audience: "" };
const previewKey = "echonflow-provider-onboarding-preview-v1";
const steps = ["Your path", "Your profile", "Your offering", "Review"];
const categories: Record<Track, ProviderCategory[]> = { practice: ["Trainer", "Therapist / Practitioner", "Nutritionist", "Studio"], property: ["Resort", "Retreat Center"] };
const titles = ["Good care starts with people like you.", "Let people get to know your work.", "Give people a reason to connect.", "Meet your future listing."];
const notes = ["Tell us how you bring wellbeing into the world. We’ll shape the next steps around you.", "A clear, thoughtful introduction helps seekers understand whether you’re the right fit.", "Start with one offering. You can expand your practice as you grow.", "Read this as a seeker would. Make sure it feels clear, accurate, and true to you."];

export function ProviderOnboardingPreview({ ownerId, initialTrack = "practice" }: { ownerId?: string; initialTrack?: Track }) {
  const preview = !ownerId;
  const key = ownerId ? "echonflow-provider-onboarding-v1:" + ownerId : previewKey;
  const requestId = useRef("");
  const publishing = useRef(false);
  const [busy, setBusy] = useState(false);
  const [publishedId, setPublishedId] = useState("");
  const [draft, setDraft] = useState<Draft>(() => initialTrack === "property"
    ? { ...initial, track: "property", category: "Resort" }
    : initial);
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  function update<K extends keyof Draft>(field: K, value: Draft[K]) { setDraft(d => ({ ...d, [field]: value })); setConfirmed(false); }
  function go(next: number) { setStep(next); setMessage(""); requestAnimationFrame(() => { heading.current?.focus(); heading.current?.scrollIntoView({ block: "start" }); }); }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step === 1 && (!draft.name.trim() || !draft.city.trim() || draft.description.trim().length < 30)) {
      setMessage("Please add your name, location, and an introduction of at least 30 characters."); return;
    }
    if (step === 2 && (!draft.offer.trim() || !draft.audience.trim() || !draft.contact.trim() || !draft.email.trim())) {
      setMessage("Please complete your offering, audience, contact name, and email."); return;
    }
    if (step < 3) go(step + 1);
    else {
      if (publishing.current || !confirmed) return;
      if (preview) { setDone(true); setMessage(""); return; }
      publishing.current = true; setBusy(true); setMessage("");
      requestId.current ||= crypto.randomUUID();
      try { localStorage.setItem(key, JSON.stringify({ draft, step, at: Date.now(), id: requestId.current })); } catch {}
      try {
        const response = await fetch("/api/provider/onboarding", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: requestId.current, draft, confirmed }),
        });
        const result = await response.json();
        if (!response.ok || !result.id) throw new Error(result.error || "Could not publish. Please retry.");
        setPublishedId(result.id); setDone(true);
        try { localStorage.removeItem(key); } catch {}
        requestAnimationFrame(() => heading.current?.focus());
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not publish. Your details are still here. Please retry.");
      } finally { publishing.current = false; setBusy(false); }
    }
  }
  function save() {
    try { localStorage.setItem(key, JSON.stringify({ draft, step, at: Date.now(), id: requestId.current })); setMessage("Draft saved on this browser. Use Restore draft when you return."); }
    catch { setMessage("This browser could not save your draft. Keep this tab open to continue."); }
  }
  function restore() {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) { setMessage("No saved draft on this browser yet."); return; }
      const saved = JSON.parse(raw);
      if (!saved || typeof saved.at !== "number" || Date.now() - saved.at > 7 * 86400000 || !saved.draft || !["practice", "property"].includes(saved.draft.track)) {
        localStorage.removeItem(key); throw Error();
      }
      const d = saved.draft;
      if (Object.keys(initial).some(k => typeof d[k] !== "string") || !categories[d.track as Track].includes(d.category)) throw Error();
      requestId.current = typeof saved.id === "string" ? saved.id : "";
      setDraft(d); setStep(0); setDone(false); setConfirmed(false); setMessage("Draft restored. Review your details as you continue.");
    } catch { setMessage("The saved draft has expired or could not be restored. Please start a new one."); }
  }
  const property = draft.track === "property";
  const Content = preview ? "main" : "div";
  return <div className={styles.page}>
    {preview && <header className={styles.header}><Link href="/" className="wordmark"><BrandMark size={34} />echonflow</Link><span>Provider onboarding · Design preview</span></header>}
    {preview && <div className={styles.preview}>Try the journey with sample details. Nothing here creates an account, submits an application, or publishes a listing.</div>}
    <Content className={styles.layout} id={preview ? "main-content" : undefined}>
      <aside className={styles.sidebar}><p className={styles.sidebarTitle}>A place for<br /><em>what you do best.</em></p><p>Bring your expertise to people looking for their next step in wellbeing.</p><ol aria-label="Onboarding progress">{steps.map((label, i) => <li key={label} aria-current={!done && step === i ? "step" : undefined}><span>{i + 1}</span>{label}{i < step && <small>Complete</small>}</li>)}</ol><div className={styles.promise}><strong>Your work. Your voice.</strong><p>A listing introduces your services. It does not imply clinical endorsement or Echonflow verification.</p></div></aside>
      <section className={styles.workspace}>
        {done ? <div className={styles.complete}><BrandMark size={70} /><h1 ref={heading} tabIndex={-1}>Your introduction<br />is ready to shine.</h1><p>{preview ? "You’ve completed the preview. Your listing has not been submitted or published." : "Your listing is live. Seekers can now discover your work and send an inquiry."}</p><div className={styles.next}><h2>{preview ? "What happens in the final experience?" : "Your next steps"}</h2><p>{preview ? "After signing in as a provider, you’ll review your details and explicitly choose to publish." : "Share your public profile and follow up with seekers from your provider inquiries page. Notifications continue to use your account email."}</p>{property && <p>{draft.category === "Resort" ? "Resorts can then explore the separate Workation Readiness Score (WRS™) assessment. Beta scoring remains provisional." : "Retreat centers can introduce their experiences. WRS™ eligibility for retreat centers is still to be decided."}</p>}</div>{preview ? <button className="flow-button" onClick={() => { setDone(false); go(3); }}>Review my introduction</button> : <div className={styles.resultLinks}><Link className="flow-button" href={"/p/provider/" + publishedId}>View public profile</Link><Link href="/provider/leads">View inquiries</Link><Link href="/provider">My provider space</Link>{draft.category === "Resort" && <Link href={"/provider/listings/" + publishedId + "/wrs"}>Explore WRS™ · beta scoring</Link>}</div>}</div> : <>
          <div className={styles.progress}><span>Step {step + 1} of 4</span><div><button type="button" disabled={busy} onClick={save}>Save draft</button><button type="button" disabled={busy} onClick={restore}>Restore draft</button></div></div>
          <h1 ref={heading} tabIndex={-1}>{titles[step]}</h1><p className={styles.intro}>{notes[step]}</p>
          <form onSubmit={submit} aria-busy={busy}><fieldset disabled={busy}>
            {step === 0 && <>
              <fieldset className={styles.choices}><legend className="sr-only">Choose your provider path</legend>
                {(["practice", "property"] as const).map(track => <label className={styles.choice} key={track} data-selected={draft.track === track}><input type="radio" name="track" checked={draft.track === track} onChange={() => { setDraft(d => ({ ...d, track, category: categories[track][0], format: track === "property" ? "In person" : d.format })); setConfirmed(false); }} /><span><strong>{track === "practice" ? "I offer a service" : "I host experiences"}</strong><span>{track === "practice" ? "Coaches, therapists, nutritionists, and studios." : "Resorts and retreat centers with space to reconnect."}</span></span></label>)}
              </fieldset>
              <label className={styles.field}>Which category fits you best?<select value={draft.category} onChange={e => update("category", e.target.value as ProviderCategory)}>{categories[draft.track].map(c => <option key={c}>{c}</option>)}</select></label>
              <div className={styles.note}>{property ? <><p>Introduce your property first. WRS™ is a separate property-readiness assessment, not the individual Energy &amp; Resilience Audit.</p><Link href="/provider/wrs">Open the WRS™ workspace →</Link></> : "Create your profile and introduce your first offering. Seekers can then contact you to discuss whether it’s a fit."}</div>
            </>}
            {step === 1 && <>
              <div className={styles.fields}><label className={styles.field}>{property ? "Property name" : "Your practice or professional name"}<input required maxLength={120} value={draft.name} onChange={e => update("name", e.target.value)} placeholder={property ? "e.g. The Grove Retreat" : "e.g. Ananya Rao · Movement Coach"} /></label><label className={styles.field}>Where are you based?<input required maxLength={120} value={draft.city} onChange={e => update("city", e.target.value)} placeholder="City, state" /></label></div>
              <label className={styles.field}>{property ? "What makes your place special?" : "Tell us about your practice"}<textarea required minLength={30} maxLength={900} rows={5} value={draft.description} onChange={e => update("description", e.target.value)} placeholder={property ? "Describe your setting, facilities, and the experiences you can host." : "What do you help people with, and how do you approach your work?"} /><span className={styles.hint}>30–900 characters. Be specific. Avoid guarantees or unsupported health claims.</span></label>
              <label className={styles.field}>{property ? "Facilities and relevant credentials (optional)" : "Qualifications and relevant experience (optional)"}<textarea rows={2} maxLength={500} value={draft.credentials} onChange={e => update("credentials", e.target.value)} placeholder={property ? "Workspace, connectivity, accessibility, or certifications" : "Training, qualifications, and experience you can substantiate"} /><span className={styles.hint}>Self-reported information. No verification badge is awarded in this flow.</span></label>
            </>}
            {step === 2 && <>
              <label className={styles.field}>{property ? "Your first experience" : "Your first service"}<input required maxLength={140} value={draft.offer} onChange={e => update("offer", e.target.value)} placeholder={property ? "e.g. A two-day team reset" : "e.g. Personal mobility consultation"} /></label>
              <div className={styles.fields}><label className={styles.field}>How is it delivered?<select value={draft.format} onChange={e => update("format", e.target.value)}>{(property ? ["In person"] : ["In person", "Online", "Online and in person"]).map(f => <option key={f}>{f}</option>)}</select></label><label className={styles.field}>Price or range (optional)<input maxLength={100} value={draft.price} onChange={e => update("price", e.target.value)} placeholder={property ? "e.g. ₹8,000 per person / night" : "e.g. ₹1,500 per session"} /><span className={styles.hint}>Include the unit. Leave blank to show “Discuss pricing”.</span></label></div>
              <label className={styles.field}>Who is this for?<input required maxLength={250} value={draft.audience} onChange={e => update("audience", e.target.value)} placeholder={property ? "e.g. Small teams looking for a restorative offsite" : "e.g. Desk workers looking to improve everyday movement"} /></label>
              <h2 className={styles.contactTitle}>A person behind the practice.</h2><p className={styles.hint}>These business contact details stay private. Inquiry notifications go to your signed-in account email.</p>
              <div className={styles.fields}><label className={styles.field}>Contact name<input required autoComplete="name" maxLength={100} value={draft.contact} onChange={e => update("contact", e.target.value)} /></label><label className={styles.field}>Email<input required type="email" autoComplete="email" maxLength={254} value={draft.email} onChange={e => update("email", e.target.value)} /></label></div>
              <label className={styles.field}>Phone (optional)<input type="tel" autoComplete="tel" maxLength={30} value={draft.phone} onChange={e => update("phone", e.target.value)} /></label>
            </>}
            {step === 3 && <>
              <article className={styles.listing}><div className={styles.listingTop}><span>{draft.category}</span><span>Listing preview</span></div><h2>{draft.name}</h2><p className={styles.location}>{draft.city}</p><p>{draft.description}</p>{draft.credentials && <p className={styles.credentials}><strong>{property ? "Facilities & credentials" : "Experience & qualifications"}</strong>{draft.credentials}<small>Provided by the provider; not independently verified.</small></p>}<div className={styles.offering}><h3>{draft.offer}</h3><p>{draft.audience}</p><div><span>{property ? "In person" : draft.format}</span><strong>{draft.price || "Discuss pricing"}</strong></div></div><span className={styles.inquiryLabel}>Seekers will be able to send an inquiry from your published profile.</span></article>
              <div className={styles.reviewContact}><strong>Onboarding contact</strong><p>{draft.contact} · {draft.email}{draft.phone ? " · " + draft.phone : ""}</p><button type="button" onClick={() => go(2)}>Edit offering or contact details</button><button type="button" onClick={() => go(1)}>Edit profile</button></div>
              {property && <div className={styles.note}><strong>{draft.category === "Resort" ? "WRS™ comes next, separately." : "Your retreat listing comes first."}</strong><p>{draft.category === "Resort" ? "No score is awarded by completing onboarding. The separate resort assessment uses provisional beta scoring." : "This preview does not assign a WRS™ score to retreat centers."}</p></div>}
              <label className={styles.confirm}><input type="checkbox" required checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /><span>{preview ? "I’ve reviewed these details and understand this is a preview, not a published listing." : "I confirm these details are accurate and want to publish my profile and offering in the Echonflow directory."}</span></label>
            </>}
            <div className={styles.actions}>{step > 0 && <button type="button" className={styles.back} onClick={() => go(step - 1)}>Back</button>}<button className="flow-button" type="submit">{busy ? "Publishing…" : step === 3 ? (preview ? "Finish preview" : "Publish my listing") : "Continue"} <span aria-hidden="true">→</span></button></div>
          </fieldset></form>
        </>}
        <p className={styles.status} role="status">{message}</p>
        <p className={styles.storage}>Saved drafts can be restored for 7 days on this browser. Avoid saving personal details on a shared device.</p>
      </section>
    </Content>
  </div>;
}
