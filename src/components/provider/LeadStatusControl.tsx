"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { LeadStatus } from "@/lib/database.types";

const STATUSES: LeadStatus[] = ["new", "contacted", "booked"];

export function LeadStatusControl({ leadId, status }: { leadId: string; status: LeadStatus }) {
  const router = useRouter();
  const supabase = createClient();
  const [current, setCurrent] = useState(status);
  const [saving, setSaving] = useState(false);

  async function setStatus(next: LeadStatus) {
    if (next === current || saving) return;
    setSaving(true);
    setCurrent(next);
    const { error } = await supabase.from("leads").update({ status: next }).eq("id", leadId);
    setSaving(false);
    if (!error) router.refresh();
  }

  return (
    <div className="flex gap-1.5">
      {STATUSES.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => setStatus(s)}
          disabled={saving}
          className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.04em] disabled:opacity-60 ${
            current === s
              ? "bg-forest text-mist"
              : "border border-[#C9C3AC] text-[#4A4738]"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
