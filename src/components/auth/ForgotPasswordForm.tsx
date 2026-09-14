"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function ForgotPasswordForm({ returnTo, signInHref }: { returnTo: string; signInHref: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    const resetPage = `/auth/reset-password?next=${encodeURIComponent(returnTo)}`;
    const { error: resetError } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(resetPage)}`,
    });
    setLoading(false);
    if (resetError) {
      setError("We could not send the reset email. Wait a moment and try again.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-4 font-body">
        <p className="text-[14px] leading-7 text-[#3F5143]">If an Echonflow account exists for <strong className="font-semibold text-ink">{email}</strong>, a secure password-reset link is on its way.</p>
        <p className="text-[12.5px] leading-6 text-[#59665A]">Check your inbox and spam folder. The link will bring you back to Echonflow to choose a new password.</p>
        <button type="button" onClick={() => setSent(false)} className="font-mono text-[11px] uppercase tracking-wide text-moss underline underline-offset-4">Use another email</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2.5">
      <p className="mb-3 font-body text-[13.5px] leading-6 text-[#4A5C4C]">Enter the email attached to your Echonflow account. We’ll send you a secure reset link.</p>
      <Input type="email" aria-label="Account email" autoComplete="email" placeholder="Account email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      {error && <p className="font-body text-[12.5px] text-red-700" role="alert">{error}</p>}
      <Button type="submit" disabled={loading} className="mt-1 w-full">{loading ? "Sending…" : "Send password reset"}</Button>
      <Link href={signInHref} className="mt-2 text-center font-body text-[12px] text-moss underline underline-offset-4">Back to sign in</Link>
    </form>
  );
}
