"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { BrandMark } from "@/components/BrandMark";
import { PROVIDER_CATEGORIES } from "@/lib/constants";
import { CRM_LEAD_TYPES, CRM_STAGES } from "@/lib/crm";
import type { CrmLead, CrmLeadStage, CrmLeadType, ProviderCategory } from "@/lib/database.types";
import styles from "./growth-crm.module.css";

type View = "today" | "all" | CrmLeadType;
type Draft = Omit<CrmLead, "id" | "created_at" | "updated_at">;

const TYPE_LABELS: Record<CrmLeadType, string> = {
  provider: "Providers",
  community: "Communities",
  corporate: "Corporate",
  partnership: "Partnerships",
};

const STAGE_LABELS: Record<CrmLeadStage, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal sent",
  won: "Won",
  delivery: "In delivery",
  paused: "Paused",
  lost: "Closed",
};

const EMPTY: Draft = {
  lead_type: "provider",
  lead_name: "",
  organization: null,
  contact_name: null,
  email: null,
  phone: null,
  city: null,
  source: null,
  provider_category: "Trainer",
  offering: null,
  session_package: null,
  estimated_value: null,
  stage: "new",
  last_contact_on: null,
  next_follow_up_on: null,
  next_action: null,
  notes: null,
};

function localDate() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

function isActive(stage: CrmLeadStage) {
  return !["won", "delivery", "lost"].includes(stage);
}

function isDue(lead: Draft) {
  return Boolean(lead.next_follow_up_on && lead.next_follow_up_on <= localDate() && isActive(lead.stage));
}

function isOverdue(lead: Draft) {
  return Boolean(lead.next_follow_up_on && lead.next_follow_up_on < localDate() && isActive(lead.stage));
}

function needsAttention(lead: Draft) {
  return lead.stage === "new" || isDue(lead);
}

function formatDate(date: string | null) {
  if (!date) return "No date set";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatValue(value: number | null) {
  if (value == null) return null;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export function GrowthCrm({ leads, adminEmail }: { leads: CrmLead[]; adminEmail: string }) {
  const [records, setRecords] = useState(leads);
  const [view, setView] = useState<View>("today");
  const [stage, setStage] = useState<"all" | CrmLeadStage>("all");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);

  const attentionCount = records.filter(needsAttention).length;
  const activeCount = records.filter((lead) => isActive(lead.stage)).length;
  const proposalCount = records.filter((lead) => lead.stage === "proposal").length;
  const pipelineValue = records
    .filter((lead) => isActive(lead.stage))
    .reduce((total, lead) => total + (lead.estimated_value ?? 0), 0);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return records.filter((lead) => {
      if (view === "today" && !needsAttention(lead)) return false;
      if (view !== "today" && view !== "all" && lead.lead_type !== view) return false;
      if (stage !== "all" && lead.stage !== stage) return false;
      if (!needle) return true;
      return [lead.lead_name, lead.organization, lead.contact_name, lead.city, lead.email, lead.next_action]
        .some((value) => value?.toLowerCase().includes(needle));
    });
  }, [query, records, stage, view]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Echonflow home">
          <BrandMark size={30} />
          <span>echonflow</span>
          <small>Growth OS</small>
        </Link>
        <div className={styles.account}>
          <span>{adminEmail}</span>
          <AdminLogoutButton />
        </div>
      </header>

      <main className={styles.main} id="main-content">
        <section className={styles.intro}>
          <div>
            <h1>Every relationship,<br /><em>moving forward.</em></h1>
            <p>Your private workspace for providers, communities, corporate pilots and growth partnerships.</p>
          </div>
          <button
            type="button"
            className={styles.primaryAction}
            onClick={() => setAdding((open) => !open)}
            aria-expanded={adding}
            aria-controls="new-crm-lead"
          >
            {adding ? "Close form" : "Add lead"}
          </button>
        </section>

        {adding && (
          <section className={styles.addPanel} id="new-crm-lead">
            <div><span className={styles.formEyebrow}>New CRM lead</span><h2>Add a lead</h2><p>Start with what you know. You can open the record and add more detail at any time.</p></div>
            <LeadForm onSaved={(lead) => { setRecords((current) => [lead, ...current]); setAdding(false); setView("all"); }} />
          </section>
        )}

        <section className={styles.metrics} aria-label="CRM summary">
          <div data-alert={attentionCount > 0}><strong>{attentionCount}</strong><span>need attention</span></div>
          <div><strong>{activeCount}</strong><span>active conversations</span></div>
          <div><strong>{proposalCount}</strong><span>proposals pending</span></div>
          <div><strong>{formatValue(pipelineValue) ?? "₹0"}</strong><span>visible pipeline</span></div>
        </section>

        <section className={styles.workspace}>
          <div className={styles.viewBar}>
            <nav aria-label="CRM views">
              {(["today", "all", ...CRM_LEAD_TYPES] as View[]).map((item) => {
                const count = item === "today" ? attentionCount : item === "all" ? records.length : records.filter((lead) => lead.lead_type === item).length;
                return <button type="button" key={item} aria-pressed={view === item} onClick={() => setView(item)}>{item === "today" ? "Today" : item === "all" ? "All" : TYPE_LABELS[item]} <span>{count}</span></button>;
              })}
            </nav>
            <div className={styles.filters}>
              <label><span className="sr-only">Search relationships</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people or organisations" /></label>
              <label><span className="sr-only">Filter by stage</span><select value={stage} onChange={(event) => setStage(event.target.value as "all" | CrmLeadStage)}><option value="all">Every stage</option>{CRM_STAGES.map((item) => <option value={item} key={item}>{STAGE_LABELS[item]}</option>)}</select></label>
            </div>
          </div>

          {visible.length === 0 ? (
            <div className={styles.empty}>
              <h2>{records.length ? "Your desk is clear here." : "Your first relationship starts here."}</h2>
              <p>{records.length ? "Change the view or stage filter to see another part of the pipeline." : "Add a provider, community, company or partner and give it one next action."}</p>
              {!records.length && <button type="button" className={styles.emptyAction} onClick={() => setAdding(true)}>Add your first lead</button>}
            </div>
          ) : (
            <div className={styles.pipeline}>
              {visible.map((lead) => <LeadRow key={lead.id} lead={lead} onSaved={(updated) => setRecords((current) => current.map((item) => item.id === updated.id ? updated : item))} />)}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function LeadRow({ lead, onSaved }: { lead: CrmLead; onSaved: (lead: CrmLead) => void }) {
  const [open, setOpen] = useState(false);
  const supporting = [lead.organization, lead.contact_name, lead.city].filter(Boolean).join(" · ") || "Contact details to be added";
  return (
    <article className={styles.lead} data-overdue={isOverdue(lead)}>
      <button type="button" className={styles.summary} onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span className={styles.type} data-type={lead.lead_type}>{TYPE_LABELS[lead.lead_type]}</span>
        <div className={styles.identity}><h2>{lead.lead_name}</h2><p>{supporting}</p></div>
        <div className={styles.next}><span>{lead.next_action || "Add the next action"}</span><small>{lead.next_follow_up_on ? `${isOverdue(lead) ? "Overdue" : "Follow up"} · ${formatDate(lead.next_follow_up_on)}` : "No follow-up date"}</small></div>
        <div className={styles.state}><span data-stage={lead.stage}>{STAGE_LABELS[lead.stage]}</span><strong>{open ? "Close" : "Open"}</strong></div>
      </button>
      {open && <div className={styles.editor}><LeadForm lead={lead} onSaved={onSaved} /></div>}
    </article>
  );
}

function LeadForm({ lead, onSaved }: { lead?: CrmLead; onSaved: (lead: CrmLead) => void }) {
  const [draft, setDraft] = useState<Draft>(lead ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function update<K extends keyof Draft>(field: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function changeType(value: CrmLeadType) {
    setDraft((current) => ({ ...current, lead_type: value, provider_category: value === "provider" ? current.provider_category ?? "Trainer" : null }));
  }

  function contactedToday() {
    setDraft((current) => ({ ...current, last_contact_on: localDate(), stage: current.stage === "new" ? "contacted" : current.stage }));
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: lead ? "update" : "create", id: lead?.id, lead: draft }),
      });
      const result = await response.json() as { id?: string; error?: string };
      if (!response.ok || !result.id) throw new Error(result.error || "Your changes could not be saved.");
      onSaved({ ...draft, id: result.id, created_at: lead?.created_at ?? new Date().toISOString(), updated_at: new Date().toISOString() });
      setMessage("Saved");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Your changes could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={save} aria-busy={saving}>
      <fieldset><legend>Relationship</legend><div className={styles.grid}>
        <label>Type<select value={draft.lead_type} onChange={(event) => changeType(event.target.value as CrmLeadType)}>{CRM_LEAD_TYPES.map((type) => <option value={type} key={type}>{TYPE_LABELS[type]}</option>)}</select></label>
        <label>Name<input autoFocus={!lead} required maxLength={140} value={draft.lead_name} onChange={(event) => update("lead_name", event.target.value)} placeholder="Person, practice or community" /></label>
        <label>Organisation<input maxLength={140} value={draft.organization ?? ""} onChange={(event) => update("organization", event.target.value || null)} /></label>
        {draft.lead_type === "provider" && <label>Provider category<select value={draft.provider_category ?? "Trainer"} onChange={(event) => update("provider_category", event.target.value as ProviderCategory)}>{PROVIDER_CATEGORIES.map((category) => <option value={category} key={category}>{category}</option>)}</select></label>}
        <label>City<input maxLength={120} value={draft.city ?? ""} onChange={(event) => update("city", event.target.value || null)} /></label>
        <label>Source<input maxLength={120} value={draft.source ?? ""} onChange={(event) => update("source", event.target.value || null)} placeholder="Referral, outreach, event…" /></label>
      </div></fieldset>

      <fieldset><legend>Contact</legend><div className={styles.grid}>
        <label>Contact name<input maxLength={100} value={draft.contact_name ?? ""} onChange={(event) => update("contact_name", event.target.value || null)} /></label>
        <label>Email<input type="email" maxLength={254} value={draft.email ?? ""} onChange={(event) => update("email", event.target.value || null)} /></label>
        <label>Phone<input type="tel" maxLength={30} value={draft.phone ?? ""} onChange={(event) => update("phone", event.target.value || null)} /></label>
      </div></fieldset>

      <fieldset><legend>Opportunity</legend><div className={styles.grid}>
        <label>What they need<input maxLength={240} value={draft.offering ?? ""} onChange={(event) => update("offering", event.target.value || null)} placeholder="On-site sessions, provider listing…" /></label>
        {(draft.lead_type === "community" || draft.lead_type === "corporate") && <label>Sessions in package<input type="number" min={1} max={52} value={draft.session_package ?? ""} onChange={(event) => update("session_package", event.target.value ? Number(event.target.value) : null)} placeholder="2, 3, 4 or custom" /></label>}
        <label>Estimated value (₹)<input type="number" min={0} step={1} value={draft.estimated_value ?? ""} onChange={(event) => update("estimated_value", event.target.value ? Number(event.target.value) : null)} /></label>
        <label>Stage<select value={draft.stage} onChange={(event) => update("stage", event.target.value as CrmLeadStage)}>{CRM_STAGES.map((stage) => <option value={stage} key={stage}>{STAGE_LABELS[stage]}</option>)}</select></label>
        <label>Last contact<input type="date" value={draft.last_contact_on ?? ""} onChange={(event) => update("last_contact_on", event.target.value || null)} /></label>
        <label>Next follow-up<input type="date" value={draft.next_follow_up_on ?? ""} onChange={(event) => update("next_follow_up_on", event.target.value || null)} /></label>
      </div></fieldset>

      <label className={styles.full}>Next action<input maxLength={240} value={draft.next_action ?? ""} onChange={(event) => update("next_action", event.target.value || null)} placeholder="Send the three-session proposal on Friday" /></label>
      <label className={styles.full}>Private notes<textarea rows={4} maxLength={3000} value={draft.notes ?? ""} onChange={(event) => update("notes", event.target.value || null)} placeholder="Context, needs, objections and promises made" /></label>
      <div className={styles.formActions}><button type="button" onClick={contactedToday}>Record contact today</button><button type="submit" disabled={saving}>{saving ? "Saving…" : lead ? "Save changes" : "Add to CRM"}</button></div>
      <p className={styles.formStatus} role="status">{message}</p>
    </form>
  );
}
