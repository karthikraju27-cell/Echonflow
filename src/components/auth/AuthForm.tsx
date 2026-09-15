"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/database.types";
import { authDestination } from "@/lib/auth-destination";
import { accountCreationError, emailAuthError, passwordSignInError } from "@/lib/auth-messages";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordField } from "@/components/auth/PasswordField";

type Mode = "sign_in" | "sign_up";

export function AuthForm({
  role,
  companyId,
  returnTo,
  initialError,
}: {
  role: UserRole;
  companyId?: string;
  returnTo?: string;
  initialError?: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("sign_in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [info, setInfo] = useState<string | null>(null);

  // Middleware re-routes to the correct hub if this guess is wrong for the
  // signed-in account's actual role, so a static destination per auth page
  // is safe here.
  const destination = authDestination(returnTo) ?? (role === "provider" ? "/provider" : "/seeker");

  function signUpMetadata() {
    return role === "provider"
      ? { name, role, phone: phone.trim() || null, service: service.trim() || null }
      : { name, role, company_id: companyId ?? null };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (mode === "sign_up" && !agreed) {
      setError("Please agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "sign_up") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: signUpMetadata(),
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`,
          },
        });
        if (signUpError) {
          setError(accountCreationError(signUpError));
          return;
        }
        if (!data.session) {
          setInfo("Check your inbox to confirm your email, then return here to sign in.");
          setMode("sign_in");
          return;
        }
        router.replace(destination);
        router.refresh();
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError) {
        setError(passwordSignInError(signInError));
        return;
      }
      router.replace(destination);
      router.refresh();
    } catch (authError) {
      setError(mode === "sign_in" ? passwordSignInError(authError instanceof Error ? authError : {}) : accountCreationError(authError instanceof Error ? authError : {}));
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink() {
    if (!email.trim()) {
      setError("Enter your email first.");
      return;
    }
    if (mode === "sign_up" && !agreed) {
      setError("Please agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          data: mode === "sign_up" ? signUpMetadata() : undefined,
          shouldCreateUser: mode === "sign_up",
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`,
        },
      });
      if (otpError) {
        setError(emailAuthError(otpError));
        return;
      }
      setInfo("Secure sign-in link sent. Open the newest Echonflow email on this device.");
    } catch (otpError) {
      setError(emailAuthError(otpError instanceof Error ? otpError : {}));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <div className="mb-1 flex gap-2">
        <button
          type="button"
          aria-pressed={mode === "sign_in"}
          onClick={() => { setMode("sign_in"); setError(null); setInfo(null); }}
          className={`rounded border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide ${
            mode === "sign_in" ? "border-forest bg-forest text-mist" : "border-[#C9C3AC] text-[#4A4738]"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          aria-pressed={mode === "sign_up"}
          onClick={() => { setMode("sign_up"); setError(null); setInfo(null); }}
          className={`rounded border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide ${
            mode === "sign_up" ? "border-forest bg-forest text-mist" : "border-[#C9C3AC] text-[#4A4738]"
          }`}
        >
          Create account
        </button>
      </div>

      {mode === "sign_up" && (
        <label className="auth-field-label">
          <span>Full name</span>
          <Input autoComplete="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
      )}
      <label className="auth-field-label">
        <span>Email</span>
        <Input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <PasswordField label="Password" autoComplete={mode === "sign_up" ? "new-password" : "current-password"} placeholder={mode === "sign_up" ? "At least 8 characters" : "Your password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={mode === "sign_up" ? 8 : undefined} />
      {mode === "sign_in" && (
        <Link
          href={`/auth/forgot-password?next=${encodeURIComponent(destination)}`}
          className="self-end font-body text-[12px] text-moss underline underline-offset-4"
        >
          Forgot password?
        </Link>
      )}
      {mode === "sign_up" && role === "provider" && (
        <>
          <label className="auth-field-label">
            <span>Phone <small>Optional</small></span>
            <Input type="tel" autoComplete="tel" placeholder="Your phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label className="auth-field-label">
            <span>Practice or service <small>Optional</small></span>
            <Input placeholder="What do you offer?" value={service} onChange={(e) => setService(e.target.value)} />
          </label>
        </>
      )}

      {mode === "sign_up" && (
        <label className="mt-1 flex items-start gap-2.5 font-body text-[12.5px] text-[#4A4738]">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            required
            className="mt-0.5 h-4 w-4 flex-none accent-forest"
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" target="_blank" className="text-moss underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" target="_blank" className="text-moss underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
      )}

      {error && <p className="auth-error" role="alert">{error}</p>}
      {info && <p className="auth-success" role="status">{info}</p>}

      <Button
        type="submit"
        disabled={loading || (mode === "sign_up" && !agreed)}
        className="mt-1 w-full"
      >
        {loading ? "Please wait…" : mode === "sign_up" ? "Create account" : "Continue"}
      </Button>

      <div className="auth-divider"><span>or</span></div>
      <button
        type="button"
        onClick={handleMagicLink}
        disabled={loading}
        className="auth-secondary-action"
      >
        Email me a secure sign-in link
      </button>
    </form>
  );
}
