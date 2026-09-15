"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function ForgotPasswordForm({
  returnTo,
  signInHref,
  initialError,
}: {
  returnTo: string;
  signInHref: string;
  initialError?: string;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/password-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), returnTo }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({})) as { reason?: string };
        setError(payload.reason === "rate_limited"
          ? "A reset was requested recently. Wait a few minutes, then try again."
          : "We could not send the reset email right now. Please try again shortly.");
        return;
      }
      setSent(true);
    } catch {
      setError("We could not reach the account service. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
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
      <label className="auth-field-label">
        <span>Account email</span>
        <Input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </label>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <Button type="submit" disabled={loading} className="mt-1 w-full">{loading ? "Sending…" : "Send password reset"}</Button>
      <Link href={signInHref} className="mt-2 text-center font-body text-[12px] text-moss underline underline-offset-4">Back to sign in</Link>
    </form>
  );
}
