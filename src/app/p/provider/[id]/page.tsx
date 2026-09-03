import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PublicHeader } from "@/components/PublicHeader";
import { ListingProfileContent } from "@/components/listings/ListingProfileContent";

// Genuinely public — this route lives outside /seeker and /provider, so
// src/proxy.ts never gates it. No login required to view or to send an
// inquiry (see ContactProviderForm's optional seekerId).

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("business_name, category, location, description")
    .eq("id", id)
    .single();
  if (!listing) return { title: "Provider — Echonflow" };

  const description =
    listing.description ?? `${listing.category} in ${listing.location} on Echonflow.`;
  return {
    title: `${listing.business_name} — Echonflow`,
    description,
    openGraph: {
      title: `${listing.business_name} — Echonflow`,
      description,
      type: "profile",
    },
  };
}

export default async function PublicProviderProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: listing } = await supabase.from("listings").select("*").eq("id", id).single();
  if (!listing) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hubHref: string | undefined;
  let seekerName: string | undefined;
  let seekerEmail: string | undefined;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, email, role")
      .eq("id", user.id)
      .single();
    hubHref = profile?.role === "provider" ? "/provider" : "/seeker";
    seekerName = profile?.name;
    seekerEmail = profile?.email;
  }

  return (
    <div className="min-h-screen bg-mist">
      <PublicHeader hubHref={hubHref} />
      <div className="mx-auto max-w-[1020px] px-6 pb-20 pt-9">
        <ListingProfileContent
          listing={listing}
          seekerId={user?.id}
          seekerName={seekerName}
          seekerEmail={seekerEmail}
        />
      </div>
    </div>
  );
}
