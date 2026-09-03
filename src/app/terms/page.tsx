import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Echonflow",
};

// TODO(legal): interim placeholder copy, shipped alongside account creation
// per the seeker-experience gap analysis (consent must exist from day one,
// even before a lawyer-reviewed version does). Replace with reviewed terms
// before any paid transactions or provider commission flow go live.
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-mist px-6 py-16">
      <div className="mx-auto max-w-[640px]">
        <Link href="/" className="mb-8 inline-block font-mono text-[11.5px] uppercase text-moss">
          ← Echonflow
        </Link>
        <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">
          Interim · pending full legal review
        </div>
        <h1 className="mb-6 font-display text-[32px] font-medium text-ink">Terms of Service</h1>
        <div className="flex flex-col gap-4 font-body text-[15px] leading-relaxed text-[#4A4738]">
          <p>
            Echonflow is a platform connecting people building their wellness (&quot;seekers&quot;)
            with the trainers, resorts, therapists, and studios who guide it (&quot;providers&quot;).
            By creating an account, you agree to use Echonflow honestly and in good faith — no
            impersonation, no fraudulent listings, no harassment of other users.
          </p>
          <p>
            Echonflow facilitates introductions between seekers and providers. We are not a party
            to any booking, session, or payment arrangement made between a seeker and a provider,
            and we don&apos;t guarantee the outcome, quality, or safety of any service a provider
            offers. Use your own judgment, the way you would with any introduction.
          </p>
          <p>
            Content you submit — audit responses, module quiz answers, Vārtā posts, listing
            details — must be your own or something you have the right to share. We can remove
            content or suspend accounts that violate these terms or misuse the platform.
          </p>
          <p>
            The service is provided &quot;as is&quot; while Echonflow is in active development.
            Features, pricing, and these terms may change as the platform grows; material changes
            will be reflected on this page.
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
