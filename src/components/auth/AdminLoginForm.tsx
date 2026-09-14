"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function AdminLoginForm({ returnTo = "/admin/crm" }: { returnTo?: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    setInfo(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError("That email and password did not match an Echonflow account.");
      return;
    }
    router.push(returnTo);
    router.refresh();
  }

  async function sendMagicLink() {
    if (!email.trim()) {
      setError("Enter your approved admin email first.");
      return;
    }
    setLoading(true);
    setError(null);
    setInfo(null);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnTo)}`,
      },
    });
    setLoading(false);
    if (otpError) {
      setError("A magic link could not be sent. Check that this account already exists.");
      return;
    }
    setInfo("Magic link sent. Open it from this device to enter the CRM.");
  }

  return (
    <form onSubmit={signIn} className="flex flex-col gap-2.5">
      <Input type="email" aria-label="Admin email" autoComplete="email" placeholder="Admin email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <Input type="password" aria-label="Password" autoComplete="current-password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      <Link href="/auth/forgot-password?next=%2Fadmin%2Fcrm" className="self-end font-body text-[12px] text-moss underline underline-offset-4">Forgot password?</Link>
      {error && <p className="font-body text-[12.5px] text-red-700" role="alert">{error}</p>}
      {info && <p className="font-body text-[12.5px] text-moss" role="status">{info}</p>}
      <Button type="submit" disabled={loading} className="mt-1 w-full">{loading ? "Signing in…" : "Open private CRM"}</Button>
      <button type="button" disabled={loading} onClick={sendMagicLink} className="mt-1 text-center font-mono text-[11px] uppercase tracking-wide text-moss disabled:opacity-40">Email me a secure sign-in link</button>
    </form>
  );
}
