import { createClient } from "@/lib/supabase/server";

import { VartaClient } from "@/components/varta/VartaClient";
import { AddEntryForm } from "@/components/varta/AddEntryForm";

export default async function VartaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user!.id)
    .single();
  const { data: posts } = await supabase
    .from("varta_posts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <header className="varta-intro">
        <h1>Vārtā.</h1>
        <p>A little perspective goes a long way. Explore wellness reels, fresh insights, and ideas worth sharing.</p>
      </header>
      {/* Sponsored placements and affiliate offers require real inventory and clear disclosures before launch. */}
      <AddEntryForm userId={user!.id} defaultCurator={profile?.name ?? "A seeker"} />
      <VartaClient posts={posts ?? []} />
    </div>
  );
}
