import { WordmarkText } from "@/components/WordmarkText";
import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/BrandMark";
import { FlowArtwork } from "@/components/FlowArtwork";

export function AuthCard({
  eyebrow,
  title,
  children,
  storyTitle,
  storyBody,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  storyTitle?: ReactNode;
  storyBody?: string;
}) {
  return (
    <main id="main-content" className="auth-layout">
      <section className="auth-story">
        <Link href="/" className="wordmark"><BrandMark size={34} variant="dark" /><WordmarkText /></Link>
        <div>
          <h1>{storyTitle ?? <>Your next chapter<br />starts with <em>you.</em></>}</h1>
          <p>{storyBody ?? "One account. A world of learning, connection, and wellbeing."}</p>
        </div>
        <FlowArtwork />
      </section>
      <section className="auth-content">
        <Link href="/" className="text-link">← Back to Echonflow</Link>
        <div className="auth-form-wrap">
          <h2>{title}</h2>
          <p className="auth-role">{eyebrow}</p>
          {children}
          <p className="auth-legal">Protected by Echonflow. <Link href="/privacy">Read our privacy promise.</Link></p>
        </div>
      </section>
    </main>
  );
}
