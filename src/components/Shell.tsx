"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/database.types";
import { BrandMark } from "@/components/BrandMark";

export function Shell({ name, role, children }: { name: string; role: UserRole; children: ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [error, setError] = useState("");
  const hub = role === "provider" ? "/provider" : "/seeker";
  const links = role === "provider"
    ? [{ href: hub, label: "My space" }, { href: "/provider/listings", label: "Listings" }, { href: "/provider/leads", label: "Inquiries" }, { href: "/varta", label: "Vārtā" }]
    : [{ href: hub, label: "My space" }, { href: "/seeker/era", label: "My energy" }, { href: "/seeker/modules", label: "Learn" }, { href: "/seeker/directory", label: "Providers" }, { href: "/varta", label: "Vārtā" }];
  async function handleLogout() {
    const { error } = await createClient().auth.signOut();
    if (error) { setError("Could not sign out. Please try again."); return; }
    router.push("/");
    router.refresh();
  }
  return (
    <div className="app-shell">
      <header className="app-header"><Link href="/" className="wordmark" aria-label="Echonflow home"><BrandMark size={30} />echonflow</Link><div className="account-actions"><span>{name.split(" ")[0]}</span><button onClick={handleLogout}>Log out</button></div></header>
      <nav className="app-navigation" aria-label="Your workspace">{links.map((link) => {
        const active = link.href === hub ? path === hub : path.startsWith(link.href) || (link.href === "/varta" && path === "/seeker/varta");
        return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined}><span className="nav-dot" aria-hidden="true" />{link.label}</Link>;
      })}</nav>
      {error && <p role="alert" className="px-6 text-red-700">{error}</p>}
      <main id="main-content" className="app-content">{children}</main>
    </div>
  );
}
