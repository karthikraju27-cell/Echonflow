import { createClient } from "@/lib/supabase/server";
import { BackToHub } from "@/components/BackToHub";
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
      <BackToHub />
      <h1 className="mb-1.5 font-display text-[30px] font-medium text-ink">Vārtā — reels &amp; insights</h1>
      <p className="mb-7 font-body text-[14.5px] text-[#4A4738]">
        Curated wellness reels and short written takes, categorised.
      </p>
      <AddEntryForm userId={user!.id} defaultCurator={profile?.name ?? "A seeker"} />
      <VartaClient posts={posts ?? []} />
    </div>
  );
}
