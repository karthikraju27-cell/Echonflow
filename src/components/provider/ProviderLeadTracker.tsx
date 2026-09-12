"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Lead, LeadFollowup, LeadStatus } from "@/lib/database.types";
import styles from "./lead-tracker.module.css";

type Filter = "due" | "all" | LeadStatus;
const STATUSES: LeadStatus[] = ["new", "contacted", "booked", "closed"];

function localDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function isDue(value: string | null, status: LeadStatus) {
  if (status === "booked" || status === "closed") return false;
  if (!value) return status === "new";
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return new Date(value) <= end;
}

function isOverdue(value: string | null, status: LeadStatus) {
  if (!value || status === "booked" || status === "closed") return false;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return new Date(value) < start;
}

export function ProviderLeadTracker({
  leads,
  followups,
  listingNames,
}: {
  leads: Lead[];
  followups: LeadFollowup[];
  listingNames: Record<string, string>;
}) {
  const router = useRouter();
  const followupByLead = useMemo(
    () => Object.fromEntries(followups.map((followup) => [followup.lead_id, followup])),
    [followups]
  );
  const [filter, setFilter] = useState<Filter>("due");
  const dueCount = leads.filter((lead) =>
    isDue(followupByLead[lead.id]?.next_follow_up_at ?? null, lead.status)
  ).length;
  const visible = leads.filter((lead) => {
    if (filter === "all") return true;
    if (filter === "due") {
      return isDue(followupByLead[lead.id]?.next_follow_up_at ?? null, lead.status);
    }
    return lead.status === filter;
  });

  return (
    <section className={styles.tracker}>
      <header className={styles.heading}>
        <div>
          <h1>Inquiries &amp; follow-ups</h1>
          <p>Keep each seeker conversation moving from first message to a clear outcome.</p>
        </div>
        <div className={styles.today}>
          <strong>{dueCount}</strong>
          <span>due today or overdue</span>
        </div>
      </header>

      <nav className={styles.filters} aria-label="Filter inquiries">
        {(["due", "all", ...STATUSES] as Filter[]).map((item) => (
          <button
            type="button"
            key={item}
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
          >
            {item === "due"
              ? `Due (${dueCount})`
              : item === "all"
                ? `All (${leads.length})`
                : item}
          </button>
        ))}
      </nav>

      {visible.length === 0 ? (
        <div className={styles.empty}>
          <h2>{leads.length ? "You’re caught up." : "Your first inquiry will appear here."}</h2>
          <p>
            {leads.length
              ? "There are no follow-ups in this view."
              : "When a seeker connects through one of your listings, you can plan and record the follow-up here."}
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {visible.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              followup={followupByLead[lead.id]}
              listingName={lead.listing_id ? listingNames[lead.listing_id] : "General inquiry"}
              afterSave={() => router.refresh()}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function LeadRow({
  lead,
  followup,
  listingName,
  afterSave,
}: {
  lead: Lead;
  followup?: LeadFollowup;
  listingName: string;
  afterSave: () => void;
}) {
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [notes, setNotes] = useState(followup?.notes ?? "");
  const [next, setNext] = useState(localDateTime(followup?.next_follow_up_at ?? null));
  const [markContacted, setMarkContacted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const overdue = isOverdue(followup?.next_follow_up_at ?? null, status);

  async function save() {
    if (saving) return;
    setSaving(true);
    setMessage("");
    const { error } = await createClient().rpc("update_provider_lead", {
      p_lead_id: lead.id,
      p_status: status,
      p_notes: notes,
      p_next_follow_up_at: next ? new Date(next).toISOString() : null,
      p_mark_contacted: markContacted,
    });
    setSaving(false);
    if (error) {
      setMessage("Could not save. Please try again.");
      return;
    }
    setMarkContacted(false);
    setMessage("Saved");
    afterSave();
  }

  return (
    <article className={styles.row} data-overdue={overdue}>
      <div className={styles.identity}>
        <div className={styles.rowTop}>
          <span>{listingName}</span>
          <time dateTime={lead.created_at}>
            Received {new Date(lead.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </time>
        </div>
        <h2>{lead.name}</h2>
        <div className={styles.contact}>
          <a href={`mailto:${lead.email}`}>{lead.email}</a>
          {lead.phone && <a href={`tel:${lead.phone}`}>{lead.phone}</a>}
        </div>
        {lead.message && <blockquote>{lead.message}</blockquote>}
      </div>

      <div className={styles.followup}>
        <div className={styles.fieldRow}>
          <label>
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value as LeadStatus)}>
              {STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            Next follow-up
            <input type="datetime-local" value={next} onChange={(event) => setNext(event.target.value)} />
          </label>
        </div>
        <label>
          Private notes
          <textarea
            maxLength={2000}
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Context, promised next step, or what to remember"
          />
        </label>
        <div className={styles.saveRow}>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={markContacted}
              onChange={(event) => setMarkContacted(event.target.checked)}
            />
            Record contact now
          </label>
          <button type="button" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save follow-up"}
          </button>
        </div>
        <p role="status" className={styles.statusMessage}>{message}</p>
      </div>
    </article>
  );
}
