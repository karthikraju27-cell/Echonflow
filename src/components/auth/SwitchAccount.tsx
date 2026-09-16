"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function SwitchAccount({ requestedRole, currentRole }: { requestedRole: string; currentRole?: string | null }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const requested = requestedRole === "provider" ? "provider" : "individual";
  const current = currentRole === "provider" ? "a Provider account" : currentRole === "seeker" ? "an Individual account" : "another account";

  async function switchAccount() {
    setBusy(true);
    setError("");
    try {
      const { error } = await createClient().auth.signOut({ scope: "local" });
      if (error) throw error;
      // Reload the selected entrance, preserving its next/org query parameters.
      window.location.reload();
    } catch {
      setError("We couldn’t sign you out. Please try again.");
      setBusy(false);
    }
  }

  return <div className="flex flex-col gap-4">
    <p>You’re currently signed in with {current}. To enter the {requested} space, sign in with a {requested} account or create one after signing out.</p>
    <Button onClick={switchAccount} disabled={busy}>{busy ? "Signing out…" : `Sign out and continue as ${requested}`}</Button>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {(currentRole === "provider" || currentRole === "seeker") && <Link href={currentRole === "provider" ? "/provider" : "/seeker"} className="underline">Return to my current space</Link>}
    <Link href="/" className="underline">Back to Echonflow</Link>
  </div>;
}
