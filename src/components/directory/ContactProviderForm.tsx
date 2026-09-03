"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ContactProviderForm({
  seekerId,
  listingId,
  businessName,
  defaultName,
  defaultEmail,
}: {
  seekerId: string;
  listingId: string;
  businessName: string;
  defaultName: string;
  defaultEmail: string;
}) {
  const supabase = createClient();
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from("leads").insert({
      seeker_id: seekerId,
      listing_id: listingId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      message: message.trim() || null,
    });

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setSent(true);

    fetch("/api/email/new-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId,
        leadName: name.trim(),
        leadEmail: email.trim(),
        leadPhone: phone.trim() || null,
        leadMessage: message.trim() || null,
      }),
    }).catch(() => {
      // Best-effort — the lead is already saved either way.
    });
  }

  if (sent) {
    return <p className="font-body text-moss">Sent — {businessName} will get back to you.</p>;
  }

  return (
    <form onSubmit={submit}>
      <p className="mb-3.5 font-body text-[13.5px] text-[#4A4738]">
        Reach out to {businessName} directly.
      </p>
      <div className="flex flex-col gap-2.5">
        <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Textarea
          placeholder="What are you looking for?"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        {error && <p className="font-body text-[12.5px] text-red-700">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Sending…" : "Contact this provider"}
        </Button>
      </div>
    </form>
  );
}
