"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function ResetPasswordForm({ returnTo }: { returnTo: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Use at least 8 characters for your new password.");
      return;
    }
    if (password !== confirmation) {
      setError("The two passwords do not match.");
      return;
    }
    setLoading(true);
    const { error: updateError } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError("This reset link has expired or was already used. Request a new one below.");
      return;
    }
    router.replace(returnTo);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2.5">
      <p className="mb-3 font-body text-[13.5px] leading-6 text-[#4A5C4C]">Choose a new password with at least 8 characters.</p>
      <Input type="password" aria-label="New password" autoComplete="new-password" placeholder="New password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
      <Input type="password" aria-label="Confirm new password" autoComplete="new-password" placeholder="Confirm new password" minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required />
      {error && <p className="font-body text-[12.5px] text-red-700" role="alert">{error}</p>}
      <Button type="submit" disabled={loading} className="mt-1 w-full">{loading ? "Updating…" : "Set new password"}</Button>
      <Link href={`/auth/forgot-password?next=${encodeURIComponent(returnTo)}`} className="mt-2 text-center font-body text-[12px] text-moss underline underline-offset-4">Request another reset link</Link>
    </form>
  );
}
