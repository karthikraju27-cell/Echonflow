"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function CertificateDoc({
  seekerId,
  existingName,
  issuedAt,
  totalChapters,
  passPct,
}: {
  seekerId: string;
  existingName: string | null;
  issuedAt: string | null;
  totalChapters: number;
  passPct: number;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [editing, setEditing] = useState(!existingName);
  const [name, setName] = useState(existingName ?? "");
  const [saving, setSaving] = useState(false);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await supabase
      .from("certificates")
      .upsert({ seeker_id: seekerId, name: name.trim() }, { onConflict: "seeker_id" });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <form
        onSubmit={save}
        className="mt-8 max-w-[480px] rounded-md border border-[#DCD6BF] bg-card p-7 text-center"
      >
        <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">
          All 13 modules passed
        </div>
        <h2 className="mb-5 font-display text-[20px] font-medium text-ink">
          Enter your name for the certificate
        </h2>
        <div className="flex flex-wrap justify-center gap-2.5">
          <Input
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="min-w-[220px] flex-1"
          />
          <Button type="submit" disabled={saving}>
            {saving ? "Generating…" : "Generate certificate →"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-9 print:mt-0">
      <div
        className="rounded-xl p-[3px]"
        style={{ background: "linear-gradient(135deg, #D9A441, #C0472E)" }}
      >
        <div className="flex flex-col items-center rounded-[10px] bg-card px-14 py-16 text-center">
          <div className="font-mono text-[12px] uppercase tracking-[0.08em] text-[#8C8770]">
            Echonflow
          </div>
          <div className="mt-4 font-display text-[15px] italic text-[#4A4738]">
            Certificate of Completion
          </div>
          <div className="mt-3.5 max-w-[90%] border-b border-[#C9C3AC] pb-4 font-display text-[38px] font-medium text-ink">
            {existingName}
          </div>
          <p className="mt-5 max-w-[52ch] font-body text-[14.5px] leading-relaxed text-[#4A4738]">
            has successfully completed all 13 modules and {totalChapters} chapters of the
            Echonflow wellness curriculum, passing every module quiz at {passPct}% or better.
          </p>
          <div className="mt-5 font-mono text-[12px] text-[#8C8770]">
            {issuedAt ? formatDate(issuedAt) : ""}
          </div>
          <div className="mt-7 flex w-full justify-between border-t border-[#DCD6BF] pt-5 font-mono text-[10px] uppercase tracking-[0.05em] text-[#8C8770]">
            <span>Echonflow</span>
            <span>
              {totalChapters} chapters · 13 modules
            </span>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-center gap-2.5 print:hidden">
        <Button type="button" onClick={() => window.print()}>
          Print / Save as PDF
        </Button>
        <Button type="button" variant="outline" onClick={() => setEditing(true)}>
          Edit name
        </Button>
      </div>
    </div>
  );
}
