"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/database.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Mode = "sign_in" | "sign_up";

export function AuthForm({ role }: { role: UserRole }) {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("sign_in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Middleware re-routes to the correct hub if this guess is wrong for the
  // signed-in account's actual role, so a static destination per auth page
  // is safe here.
  const destination = role === "provider" ? "/provider" : "/seeker";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (mode === "sign_up") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
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
    setError(null);
    setInfo(null);
    setLoading(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: mode === "sign_up" ? { name, role } : undefined,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
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
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      )}
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />

      {error && <p className="font-body text-[12.5px] text-red-700">{error}</p>}
      {info && <p className="font-body text-[12.5px] text-moss">{info}</p>}

      <Button type="submit" disabled={loading} className="mt-1 w-full">
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
