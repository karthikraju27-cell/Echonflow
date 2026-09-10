import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/BrandMark";
import { FlowArtwork } from "@/components/FlowArtwork";

export function AuthCard({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <main id="main-content" className="auth-layout"><section className="auth-story"><Link href="/" className="wordmark"><BrandMark size={34} variant="dark" />echonflow</Link><div><h1>Your next chapter<br />starts with <em>you.</em></h1><p>One account. A world of learning, connection, and wellbeing.</p></div><FlowArtwork /></section><section className="auth-content"><Link href="/" className="text-link">← Back to Echonflow</Link><div className="auth-form-wrap"><h2>{title}</h2><p className="auth-role">{eyebrow}. Make yourself at home.</p>{children}<p className="auth-legal">Your space, at your pace. <Link href="/privacy">Read our privacy promise.</Link></p></div></section></main>;
}
