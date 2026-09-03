"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/database.types";
import { BrandMark } from "@/components/BrandMark";

export function Shell({
  name,
  role,
  children,
}: {
  name: string;
  role: UserRole;
  children: ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-mist">
      <div className="flex items-center justify-between border-b border-[#DCD6BF] px-6 py-4">
        <div className="flex items-center gap-2 font-mono text-[13px] tracking-[0.1em] text-forest">
          <BrandMark size={20} />
          echonflow
        </div>
        <div className="flex items-center gap-3.5 font-body text-[13px] text-[#4A4738]">
          <span>
            {name} · <span className="capitalize">{role}</span>
          </span>
          <button onClick={handleLogout} className="font-mono text-[11.5px] uppercase text-moss">
            Log out
          </button>
        </div>
      </div>
      <div className="mx-auto max-w-[1020px] px-6 pb-20 pt-9">{children}</div>
    </div>
  );
}
