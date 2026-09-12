"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { ProviderCategory, ProviderProspect, RecruitmentStage } from "@/lib/database.types";
import { PROVIDER_CATEGORIES } from "@/lib/constants";
import { RECRUITMENT_STAGES } from "@/lib/provider-recruitment";
import { BrandMark } from "@/components/BrandMark";
import styles from "./recruitment-tracker.module.css";

type Filter = "due" | "all" | RecruitmentStage;
type ProspectDraft = Omit<ProviderProspect, "id" | "created_at" | "updated_at">;

const EMPTY: ProspectDraft = {
  provider_name: "",
  category: "Trainer",
  organization: null,
  contact_name: null,
  email: null,
  phone: null,
  city: null,
  source: null,
  stage: "prospect",
  last_contact_on: null,
  next_follow_up_on: null,
  notes: null,
};

function active(stage: RecruitmentStage) {
  return !["live", "paused", "declined"].includes(stage);
}

function due(prospect: ProspectDraft) {
  return Boolean(prospect.next_follow_up_on && prospect.next_follow_up_on <= today() && active(prospect.stage));
}

function overdue(prospect: ProspectDraft) {
  return Boolean(prospect.next_follow_up_on && prospect.next_follow_up_on < today() && active(prospect.stage));
}

function today() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function RecruitmentTracker({ prospects, accessKey }: { prospects: ProviderProspect[]; accessKey: string }) {
  const [records, setRecords] = useState(prospects);
  const [filter, setFilter] = useState<Filter>("due");
  const [adding, setAdding] = useState(prospects.length === 0);
  const [copyMessage, setCopyMessage] = useState("");
  const dueCount = records.filter(due).length;
  const liveCount = records.filter((record) => record.stage === "live").length;
  const visible = useMemo(() => records.filter((record) => {
    if (filter === "all") return true;
    if (filter === "due") return due(record);
    return record.stage === filter;
  }), [filter, records]);

  async function copyOnboardingLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/auth/provider`);
      setCopyMessage("Onboarding link copied");
    } catch {
      setCopyMessage("Copy this link: " + window.location.origin + "/auth/provider");
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}><BrandMark size={30} /><span>echonflow</span><small>Private workspace</small></div>
        <button type="button" onClick={copyOnboardingLink}>Copy provider onboarding link</button>
      </header>
      <main className={styles.main} id="main-content">
        <section className={styles.intro}>
          <div><p>Layer 2 · Supply growth</p><h1>Provider recruitment</h1><span>Move the right practitioners and properties from first conversation to a live Echonflow presence.</span></div>
          <div className={styles.metrics}><div><strong>{dueCount}</strong><span>due now</span></div><div><strong>{records.length}</strong><span>total</span></div><div><strong>{liveCount}</strong><span>live</span></div></div>
        </section>
        <p className={styles.copyStatus} role="status">{copyMessage}</p>

        <div className={styles.toolbar}>
          <nav aria-label="Filter recruitment pipeline">
            {(["due", "all", ...RECRUITMENT_STAGES] as Filter[]).map((item) => (
              <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)}>
                {item === "due" ? `Due (${dueCount})` : item}
              </button>
            ))}
          </nav>
          <button type="button" className={styles.addButton} onClick={() => setAdding((value) => !value)}>{adding ? "Close" : "Add provider"}</button>
        </div>

        {adding && <section className={styles.addPanel}><h2>Add a prospective provider</h2><p>Start with what you know. Contact details and follow-up dates can be added later.</p><ProspectForm accessKey={accessKey} onSaved={(record) => { setRecords((items) => [record, ...items]); setAdding(false); setFilter("all"); }} /></section>}

        {visible.length === 0 ? <section className={styles.empty}><h2>{records.length ? "Nothing needs attention here." : "Add your first provider relationship."}</h2><p>{records.length ? "Choose another stage or add a follow-up date to a provider." : "A lightweight record is enough to begin. Add context as the conversation develops."}</p></section> : <section className={styles.pipeline}>{visible.map((prospect) => <ProspectRow key={prospect.id} prospect={prospect} accessKey={accessKey} onSaved={(updated) => setRecords((items) => items.map((item) => item.id === updated.id ? updated : item))} />)}</section>}
      </main>
    </div>
  );
}

function ProspectRow({ prospect, accessKey, onSaved }: { prospect: ProviderProspect; accessKey: string; onSaved: (value: ProviderProspect) => void }) {
  const [open, setOpen] = useState(false);
  return <article className={styles.prospect} data-overdue={overdue(prospect)}>
    <button type="button" className={styles.summary} onClick={() => setOpen((value) => !value)} aria-expanded={open}>
      <div><span>{prospect.category}{prospect.city ? ` · ${prospect.city}` : ""}</span><h2>{prospect.provider_name}</h2><p>{prospect.organization || prospect.contact_name || "Contact details to be added"}</p></div>
      <div className={styles.summaryRight}><span className={styles.stage} data-stage={prospect.stage}>{prospect.stage}</span><span>{prospect.next_follow_up_on ? `${overdue(prospect) ? "Overdue" : "Next"} · ${new Date(prospect.next_follow_up_on + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : "No follow-up set"}</span><strong>{open ? "Close" : "Open"}</strong></div>
    </button>
    {open && <div className={styles.editor}><ProspectForm accessKey={accessKey} prospect={prospect} onSaved={onSaved} /></div>}
  </article>;
}

function ProspectForm({ accessKey, prospect, onSaved }: { accessKey: string; prospect?: ProviderProspect; onSaved: (value: ProviderProspect) => void }) {
  const [draft, setDraft] = useState<ProspectDraft>(prospect ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  function update<K extends keyof ProspectDraft>(field: K, value: ProspectDraft[K]) { setDraft((current) => ({ ...current, [field]: value })); }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/admin/provider-recruitment", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-key": accessKey }, body: JSON.stringify({ action: prospect ? "update" : "create", id: prospect?.id, prospect: draft }) });
      const result = await response.json();
      if (!response.ok || !result.id) throw new Error(result.error || "Could not save.");
      onSaved({ ...draft, id: result.id, created_at: prospect?.created_at ?? new Date().toISOString(), updated_at: new Date().toISOString() });
      setMessage("Saved");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save. Please try again."); }
    finally { setSaving(false); }
  }
  function contactedToday() { update("last_contact_on", today()); if (draft.stage === "prospect") update("stage", "contacted"); }
  return <form className={styles.form} onSubmit={save} aria-busy={saving}>
    <div className={styles.grid}><label>Provider or practice name<input required maxLength={140} value={draft.provider_name} onChange={(e) => update("provider_name", e.target.value)} /></label><label>Category<select value={draft.category} onChange={(e) => update("category", e.target.value as ProviderCategory)}>{PROVIDER_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label><label>Organization (optional)<input maxLength={140} value={draft.organization ?? ""} onChange={(e) => update("organization", e.target.value || null)} /></label><label>City (optional)<input maxLength={120} value={draft.city ?? ""} onChange={(e) => update("city", e.target.value || null)} /></label><label>Contact name (optional)<input maxLength={100} value={draft.contact_name ?? ""} onChange={(e) => update("contact_name", e.target.value || null)} /></label><label>Email (optional)<input type="email" maxLength={254} value={draft.email ?? ""} onChange={(e) => update("email", e.target.value || null)} /></label><label>Phone (optional)<input type="tel" maxLength={30} value={draft.phone ?? ""} onChange={(e) => update("phone", e.target.value || null)} /></label><label>Source (optional)<input maxLength={120} value={draft.source ?? ""} onChange={(e) => update("source", e.target.value || null)} placeholder="Referral, event, outreach…" /></label><label>Stage<select value={draft.stage} onChange={(e) => update("stage", e.target.value as RecruitmentStage)}>{RECRUITMENT_STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select></label><label>Last contact<input type="date" value={draft.last_contact_on ?? ""} onChange={(e) => update("last_contact_on", e.target.value || null)} /></label><label>Next follow-up<input type="date" value={draft.next_follow_up_on ?? ""} onChange={(e) => update("next_follow_up_on", e.target.value || null)} /></label></div>
    <label>Private notes<textarea rows={4} maxLength={3000} value={draft.notes ?? ""} onChange={(e) => update("notes", e.target.value || null)} placeholder="Context, interest, objections, or the next promise" /></label>
    <div className={styles.formActions}><button type="button" onClick={contactedToday}>Record contact today</button><button type="submit" disabled={saving}>{saving ? "Saving…" : prospect ? "Save changes" : "Add provider"}</button></div><p role="status">{message}</p>
  </form>;
}
