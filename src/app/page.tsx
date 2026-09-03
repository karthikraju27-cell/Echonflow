import { Butterflies } from "@/components/landing/Butterflies";
import { ChoiceCard } from "@/components/landing/ChoiceCard";
import { BrandMark } from "@/components/BrandMark";

export default function LandingPage() {
  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 0%, #24402F 0%, #1B3328 45%, #0F1D15 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 40% at 15% 85%, rgba(79,122,91,0.55), transparent), radial-gradient(50% 35% at 85% 20%, rgba(217,164,65,0.18), transparent)",
        }}
      />
      <Butterflies />

      <div className="relative z-10 mx-auto max-w-[980px] px-6 pb-20 pt-[clamp(60px,10vh,120px)] text-center">
        <BrandMark size={44} variant="dark" className="mx-auto mb-4" />
        <div className="mb-[22px] font-mono text-[11px] uppercase tracking-[0.3em] text-gold">
          echonflow
        </div>
        <h1 className="mb-5 font-display text-[clamp(36px,6vw,64px)] font-medium leading-[1.08] text-mist">
          Walk into the wellness
          <br />
          you were already becoming.
        </h1>
        <p className="mx-auto mb-[52px] max-w-[520px] font-body text-base leading-relaxed text-mist/75">
          Echonflow connects people building their wellness with the trainers,
          resorts, and practitioners who guide it — one platform, two sides,
          one flow.
        </p>

        <div className="mx-auto grid max-w-[700px] grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
          <ChoiceCard
            href="/auth/provider"
            eyebrow="I offer wellness"
            title="Are you a wellness provider?"
            body="Resorts, trainers, therapists, studios — list your practice and reach seekers directly."
          />
          <ChoiceCard
            href="/auth/seeker"
            eyebrow="I'm here to grow"
            title="Are you a wellness seeker?"
            body="Free modules, the Energy & Resilience Audit, curated content, and a directory of providers."
          />
        </div>
      </div>
    </div>
  );
}
