import Link from "next/link";
import type { ReactNode } from "react";

export function AuthCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-mist p-6">
      <div className="w-full max-w-[380px] rounded-md border border-[#DCD6BF] bg-card p-[34px]">
        <Link href="/" className="mb-[18px] inline-block font-mono text-[11.5px] uppercase text-moss">
          ← Back
        </Link>
        <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-moss">
          {eyebrow}
        </div>
        <h2 className="mb-5 font-display text-[26px] font-medium text-ink">{title}</h2>
        {children}
      </div>
    </div>
  );
}
