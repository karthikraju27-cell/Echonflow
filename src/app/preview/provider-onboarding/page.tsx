import { notFound } from "next/navigation";
import { ProviderOnboardingPreview } from "@/components/provider/onboarding/ProviderOnboardingPreview";

export const metadata = { title: "Provider onboarding preview — Echonflow", robots: { index: false, follow: false } };

export default function Page() {
  // Review-only surface. Never ship an anonymous onboarding or publishing bypass.
  if (process.env.NODE_ENV === "production") notFound();
  return <ProviderOnboardingPreview />;
}
