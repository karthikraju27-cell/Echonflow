"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { VartaType } from "@/lib/database.types";

const EMPTY_FORM = {
  type: "insight" as VartaType,
  category: "",
  title: "",
  blurb: "",
  instagramId: "",
};

export function AddEntryForm({ userId, defaultCurator }: { userId: string; defaultCurator: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.category.trim() || !form.title.trim()) return;
    if (form.type === "reel" && !form.instagramId.trim()) {
      setError("Add the Instagram reel ID for a reel entry.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from("varta_posts").insert({
      type: form.type,
      category: form.category.trim(),
      title: form.title.trim(),
      blurb: form.blurb.trim() || null,
      instagram_id: form.type === "reel" ? form.instagramId.trim() : null,
      curator: defaultCurator,
      created_by: userId,
    });

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setForm(EMPTY_FORM);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <div className="mb-8">
        <Button type="button" onClick={() => setOpen(true)}>
          + Add entry
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mb-8 max-w-[460px] rounded-md border border-[#DCD6BF] bg-card p-[22px]"
    >
      <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">
        New Vārtā entry
      </div>
      <div className="flex flex-col gap-2.5">
        <Select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as VartaType })}
        >
          <option value="insight">Insight (written)</option>
          <option value="reel">Reel (Instagram)</option>
        </Select>
        <Input
          placeholder="Category (e.g. Sleep, Nutrition, Breathwork)"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        />
        <Input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <Textarea
          placeholder="Short blurb"
          rows={3}
          value={form.blurb}
          onChange={(e) => setForm({ ...form, blurb: e.target.value })}
        />
        {form.type === "reel" && (
          <Input
            placeholder="Instagram reel ID (from the reel's URL)"
            value={form.instagramId}
            onChange={(e) => setForm({ ...form, instagramId: e.target.value })}
          />
        )}
        {error && <p className="font-body text-[12.5px] text-red-700">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Posting…" : "Post entry"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
