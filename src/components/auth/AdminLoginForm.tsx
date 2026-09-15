"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { passwordSignInError } from "@/lib/auth-messages";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordField } from "@/components/auth/PasswordField";

export function AdminLoginForm({
  returnTo = "/admin/crm",
  currentEmail,
  initialError,
}: {
  returnTo?: string;
  currentEmail?: string;
  initialError?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [info, setInfo] = useState<string | null>(null);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      if (currentEmail && currentEmail.toLowerCase() !== email.trim().toLowerCase()) {
        await supabase.auth.signOut({ scope: "local" });
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError) {
        setError(passwordSignInError(signInError));
        return;
      }
      router.replace(returnTo);
      router.refresh();
    } catch (signInError) {
      setError(passwordSignInError(signInError instanceof Error ? signInError : {}));
    } finally {
      setLoading(false);
    }
  }

  async function sendMagicLink() {
    if (!email.trim()) {
      setError("Enter your approved admin email first.");
      return;
    }
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const response = await fetch("/api/auth/admin-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({})) as { reason?: string };
        setError(payload.reason === "rate_limited"
          ? "A sign-in email was requested recently. Wait a few minutes, then try again."
          : "We could not send the sign-in email right now. Use your password or try again shortly.");
        return;
      }
      setInfo("Secure sign-in link sent. Open the newest Echonflow email on this device.");
    } catch {
      setError("We could not reach the account service. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function useDifferentAccount() {
    setLoading(true);
    await supabase.auth.signOut({ scope: "local" });
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={signIn} className="flex flex-col gap-2.5">
      {currentEmail && (
        <div className="auth-notice" role="status">
          <span>Active Echonflow account</span>
          <strong>{currentEmail}</strong>
          <p>This account is signed in, but it does not have access to the private CRM.</p>
          <button type="button" onClick={useDifferentAccount} disabled={loading}>Use a different account</button>
        </div>
      )}
      <label className="auth-field-label">
        <span>Admin email</span>
        <Input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </label>
      <PasswordField label="Password" autoComplete="current-password" placeholder="Your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      <Link href="/auth/forgot-password?next=%2Fadmin%2Fcrm" className="self-end font-body text-[12px] text-moss underline underline-offset-4">Forgot password?</Link>
      {error && <p className="auth-error" role="alert">{error}</p>}
      {info && <p className="auth-success" role="status">{info}</p>}
      <Button type="submit" disabled={loading} className="mt-1 w-full">{loading ? "Signing in…" : "Open private CRM"}</Button>
      <div className="auth-divider"><span>or</span></div>
      <button type="button" disabled={loading} onClick={sendMagicLink} className="auth-secondary-action">Email me a secure sign-in link</button>
    </form>
  );
}
