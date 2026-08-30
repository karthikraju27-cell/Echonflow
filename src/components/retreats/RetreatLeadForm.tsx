"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function RetreatLeadForm({
  seekerId,
  defaultName,
  defaultEmail,
}: {
  seekerId: string;
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

    const { error: insertError } = await supabase.from("retreat_leads").insert({
      seeker_id: seekerId,
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
  }

  if (sent) {
    return <p className="font-body text-moss">Noted — the team will follow up shortly.</p>;
  }

  return (
    <form onSubmit={submit} className="max-w-[420px] rounded-md border border-[#DCD6BF] bg-card p-[22px]">
      <p className="mb-3.5 font-body text-[13.5px] text-[#4A4738]">
        Leave your details and the team will follow up about retreats, 1:1s, and small-group sessions.
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
          {loading ? "Sending…" : "I'm interested"}
        </Button>
      </div>
    </form>
  );
}
