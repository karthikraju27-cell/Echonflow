"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PROVIDER_CATEGORIES } from "@/lib/constants";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { ProviderCategory } from "@/lib/database.types";

const EMPTY_FORM = {
  businessName: "",
  category: PROVIDER_CATEGORIES[0] as ProviderCategory,
  location: "",
  description: "",
  priceRange: "",
  paymentLink: "",
};

export function ListingForm({ ownerId }: { ownerId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.businessName.trim() || !form.location.trim()) return;
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from("listings").insert({
      owner_id: ownerId,
      business_name: form.businessName.trim(),
      category: form.category,
      location: form.location.trim(),
      description: form.description.trim() || null,
      price_range: form.priceRange.trim() || null,
      payment_link: form.paymentLink.trim() || null,
    });

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setForm(EMPTY_FORM);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mb-9 max-w-[480px] rounded-md border border-[#DCD6BF] bg-card p-[22px]">
      <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">New listing</div>
      <div className="flex flex-col gap-2.5">
        <Input
          placeholder="Business / practice name"
          value={form.businessName}
          onChange={(e) => setForm({ ...form, businessName: e.target.value })}
          required
        />
        <Select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value as ProviderCategory })}
        >
          {PROVIDER_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Input
          placeholder="Location (city)"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          required
        />
        <Textarea
          placeholder="What you offer, in a line or two"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <Input
          placeholder="Price range (e.g. ₹2,000–5,000/session)"
          value={form.priceRange}
          onChange={(e) => setForm({ ...form, priceRange: e.target.value })}
        />
        <Input
          type="url"
          placeholder="Payment / booking link (optional, e.g. your Razorpay link)"
          value={form.paymentLink}
          onChange={(e) => setForm({ ...form, paymentLink: e.target.value })}
        />
        {error && <p className="font-body text-[12.5px] text-red-700">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Publishing…" : "Publish listing"}
        </Button>
      </div>
    </form>
  );
}
