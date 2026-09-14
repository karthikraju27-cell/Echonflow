"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/database.types";
import { authDestination } from "@/lib/auth-destination";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Mode = "sign_in" | "sign_up";

export function AuthForm({ role, companyId, returnTo }: { role: UserRole; companyId?: string; returnTo?: string }) {
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
  const [error, setError] = useState<string | null>(null);
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

    if (mode === "sign_up") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: signUpMetadata(),
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`,
        },
      });
      setLoading(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (!data.session) {
        setInfo("Check your inbox to confirm your email, then sign in.");
        setMode("sign_in");
        return;
      }
      router.push(destination);
      router.refresh();
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push(destination);
    router.refresh();
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
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: mode === "sign_up" ? signUpMetadata() : undefined,
        shouldCreateUser: mode === "sign_up",
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`,
      },
    });
    setLoading(false);
    if (otpError) {
      setError(otpError.message);
      return;
    }
    setInfo("Magic link sent — check your inbox.");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <div className="mb-1 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("sign_in")}
          className={`rounded border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide ${
            mode === "sign_in" ? "border-forest bg-forest text-mist" : "border-[#C9C3AC] text-[#4A4738]"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("sign_up")}
          className={`rounded border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide ${
            mode === "sign_up" ? "border-forest bg-forest text-mist" : "border-[#C9C3AC] text-[#4A4738]"
          }`}
        >
          Create account
        </button>
      </div>

      {mode === "sign_up" && (
        <Input
          aria-label="Full name" autoComplete="name" placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      )}
      <Input
        type="email"
        aria-label="Email" autoComplete="email" placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        aria-label="Password" autoComplete={mode === "sign_up" ? "new-password" : "current-password"} placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />
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
          <Input
            type="tel"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            placeholder="What service do you provide?"
            value={service}
            onChange={(e) => setService(e.target.value)}
          />
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

      {error && <p className="font-body text-[12.5px] text-red-700">{error}</p>}
      {info && <p className="font-body text-[12.5px] text-moss">{info}</p>}

      <Button
        type="submit"
        disabled={loading || (mode === "sign_up" && !agreed)}
        className="mt-1 w-full"
      >
        {loading ? "Please wait…" : mode === "sign_up" ? "Create account" : "Continue"}
      </Button>

      <button
        type="button"
        onClick={handleMagicLink}
        disabled={loading}
        className="mt-1 text-center font-mono text-[11px] uppercase tracking-wide text-moss disabled:opacity-40"
      >
        Or email me a magic link
      </button>
    </form>
  );
}
