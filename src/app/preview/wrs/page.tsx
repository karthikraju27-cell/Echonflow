import { notFound } from "next/navigation";
import { WrsFlow } from "@/components/wrs/WrsFlow";
import { WRS_CATEGORIES } from "@/lib/wrs-questions";

export const metadata = {
  title: "WRS preview — Echonflow",
  robots: { index: false, follow: false },
};

export default async function WrsPreviewPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { view } = await searchParams;
  const sampleBreakdown = Object.fromEntries(WRS_CATEGORIES.map((category, index) => [
    category.id,
    { title: category.title, score: [92, 67, 83, 58, 88, 75, 50, 71, 63][index], weight: category.weight },
  ]));
  return (
    <main className="min-h-screen bg-[#EFEBDD] px-5 py-10 text-[#17251C] sm:px-12 sm:py-16">
      <div className="mx-auto max-w-[1120px]">
        <p className="mb-7 font-mono text-[10px] uppercase tracking-[0.1em] text-moss">Design review · No data is published</p>
        <WrsFlow
          listingId="preview-resort"
          businessName="The Grove Retreat"
          initialScore={view === "results" ? 74 : null}
          initialTier={view === "results" ? "Silver" : null}
          initialBreakdown={view === "results" ? sampleBreakdown : null}
        />
      </div>
    </main>
  );
}
