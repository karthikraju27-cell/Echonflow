import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Echonflow",
};

// TODO(legal): interim placeholder copy, shipped alongside account creation
// per the seeker-experience gap analysis (consent must exist from day one,
// even before a lawyer-reviewed version does). Replace with reviewed policy
// before any paid transactions or provider commission flow go live.
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-mist px-6 py-16">
      <div className="mx-auto max-w-[640px]">
        <Link href="/" className="mb-8 inline-block font-mono text-[11.5px] uppercase text-moss">
          ← Echonflow
        </Link>
        <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">
          Interim · pending full legal review
        </div>
        <h1 className="mb-6 font-display text-[32px] font-medium text-ink">Privacy Policy</h1>
        <div className="flex flex-col gap-4 font-body text-[15px] leading-relaxed text-[#4A4738]">
          <p>
            We collect what&apos;s needed to run your account: your name, email, and (for providers)
            phone and service details, plus whatever you choose to submit — Energy & Resilience
            Audit answers, module quiz results, listings, Vārtā posts, and messages to providers.
          </p>
          <p className="font-semibold text-ink">
            Your individual Energy & Resilience Audit answers are yours. They are never sold,
            never shared with an employer, and never shown to any provider or other user —
            full stop. Only you can see your own results.
          </p>
          <p>
            When you contact a provider through a listing, we share what you submit in that
            message (your name, email, phone if given, and your note) with that specific
            provider, since that&apos;s the point of the introduction — nothing more, and nothing is
            shared with any other provider or user.
          </p>
          <p>
            We use Supabase to store account and application data, and Vercel to host the site.
            We don&apos;t sell your data to third parties or use it for advertising.
          </p>
          <p>
            You can ask us to delete your account and associated data at any time by contacting
            us directly.
          </p>
          <p className="font-mono text-[12px] text-[#8C8770]">
            This is an interim placeholder, not final legal language. A reviewed version will
            replace it before any paid transactions go live on the platform.
          </p>
        </div>
      </div>
    </div>
  );
}
