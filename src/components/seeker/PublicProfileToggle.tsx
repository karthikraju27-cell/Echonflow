"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function PublicProfileToggle({
  seekerId,
  initialValue,
}: {
  seekerId: string;
  initialValue: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    setSaving(true);
    const next = !value;
    const { error } = await supabase
      .from("profiles")
      .update({ public_profile: next })
      .eq("id", seekerId);
    setSaving(false);
    if (!error) {
      setValue(next);
      router.refresh();
    }
  }

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#DCD6BF] bg-card px-4 py-3.5">
      <div>
        <div className="font-body text-[13.5px] text-ink">Public profile</div>
        <div className="font-body text-[12px] text-[#8C8770]">
          {value
            ? "Anyone with the link can see your name and certificates."
            : "Off — your profile is private. Your audit answers are never shown either way."}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {value && (
          <Link
            href={`/p/seeker/${seekerId}`}
            target="_blank"
            className="font-mono text-[10.5px] uppercase tracking-[0.05em] text-moss"
          >
            View →
          </Link>
        )}
        <button
          type="button"
          onClick={toggle}
          disabled={saving}
          className={`rounded-full px-3.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.05em] disabled:opacity-60 ${
            value ? "bg-forest text-mist" : "border border-[#C9C3AC] text-[#4A4738]"
          }`}
        >
          {value ? "On" : "Off"}
        </button>
      </div>
    </div>
  );
}
