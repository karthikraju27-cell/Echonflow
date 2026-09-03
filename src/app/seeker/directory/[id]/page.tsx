import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingProfileContent } from "@/components/listings/ListingProfileContent";

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: listing } = await supabase.from("listings").select("*").eq("id", id).single();
  if (!listing) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("id", user!.id)
    .single();

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <Link href="/seeker/directory" className="font-mono text-[11.5px] uppercase text-moss">
          ← Back to directory
        </Link>
        <Link
          href={`/p/provider/${listing.id}`}
          target="_blank"
          className="font-mono text-[11.5px] uppercase text-moss"
        >
          Public page ↗
        </Link>
      </div>
      <ListingProfileContent
        listing={listing}
        seekerId={user!.id}
        seekerName={profile?.name ?? ""}
        seekerEmail={profile?.email ?? ""}
      />
    </div>
  );
}
