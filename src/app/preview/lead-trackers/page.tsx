import Link from "next/link";
import { notFound } from "next/navigation";
import { RecruitmentTracker } from "@/components/admin/RecruitmentTracker";
import { ProviderLeadTracker } from "@/components/provider/ProviderLeadTracker";
import type { Lead, LeadFollowup, ProviderProspect } from "@/lib/database.types";

export const metadata = {
  title: "Lead tracker preview — Echonflow",
  robots: { index: false, follow: false },
};

const PROSPECTS: ProviderProspect[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    provider_name: "Stillwater Movement Studio",
    category: "Studio",
    organization: "Stillwater Wellness",
    contact_name: "Ananya Rao",
    email: "ananya@example.com",
    phone: "+91 90000 00001",
    city: "Bengaluru",
    source: "Founder referral",
    stage: "interested",
    last_contact_on: "2026-09-10",
    next_follow_up_on: "2026-09-12",
    notes: "Interested in joining the founding provider cohort.",
    created_at: "2026-09-02T09:00:00.000Z",
    updated_at: "2026-09-10T09:00:00.000Z",
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    provider_name: "Nandi Forest Retreat",
    category: "Resort",
    organization: "Nandi Forest Retreat",
    contact_name: "Rohan Mehta",
    email: "rohan@example.com",
    phone: null,
    city: "Nandi Hills",
    source: "Direct outreach",
    stage: "onboarding",
    last_contact_on: "2026-09-11",
    next_follow_up_on: "2026-09-15",
    notes: "Listing draft is in progress; WRS assessment follows.",
    created_at: "2026-09-04T09:00:00.000Z",
    updated_at: "2026-09-11T09:00:00.000Z",
  },
];

const LEADS: Lead[] = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    seeker_id: null,
    listing_id: "30000000-0000-4000-8000-000000000001",
    name: "Maya Krishnan",
    email: "maya@example.com",
    phone: "+91 90000 00002",
    message: "I found your practice through my Echonflow results and would like to know about a first session.",
    status: "new",
    created_at: "2026-09-12T06:30:00.000Z",
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    seeker_id: "40000000-0000-4000-8000-000000000001",
    listing_id: "30000000-0000-4000-8000-000000000001",
    name: "Arjun Nair",
    email: "arjun@example.com",
    phone: null,
    message: "Do you offer small-group sessions for workplace teams?",
    status: "contacted",
    created_at: "2026-09-08T10:30:00.000Z",
  },
];

const FOLLOWUPS: LeadFollowup[] = [
  {
    lead_id: "20000000-0000-4000-8000-000000000002",
    listing_id: "30000000-0000-4000-8000-000000000001",
    owner_id: "50000000-0000-4000-8000-000000000001",
    notes: "Send the workplace wellness format and suggest a 20-minute call.",
    next_follow_up_at: "2026-09-12T09:30:00.000Z",
    last_contact_at: "2026-09-09T09:30:00.000Z",
    updated_at: "2026-09-09T09:30:00.000Z",
  },
];

export default async function LeadTrackersPreview({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();
  const { view } = await searchParams;

  if (view === "inquiries") {
    return (
      <main className="min-h-screen bg-[#EFEBDD] px-5 py-8 text-[#17251C] sm:px-10 sm:py-12">
        <div className="mx-auto mb-8 flex max-w-[1080px] gap-5 text-sm">
          <Link href="/preview/lead-trackers">Recruitment preview</Link>
          <strong>Inquiry preview</strong>
        </div>
        <div className="mx-auto max-w-[1080px]">
          <ProviderLeadTracker
            leads={LEADS}
            followups={FOLLOWUPS}
            listingNames={{ "30000000-0000-4000-8000-000000000001": "Stillwater Somatic Practice" }}
          />
        </div>
      </main>
    );
  }

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50 rounded-md bg-[#F7F4EA] px-4 py-3 text-xs shadow-lg">
        <Link href="/preview/lead-trackers?view=inquiries">View provider inquiries →</Link>
      </div>
      <RecruitmentTracker prospects={PROSPECTS} accessKey="preview-only" />
    </>
  );
}
