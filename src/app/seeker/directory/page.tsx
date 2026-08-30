import { createClient } from "@/lib/supabase/server";
import { BackToHub } from "@/components/BackToHub";
import { DirectoryClient } from "@/components/directory/DirectoryClient";

export default async function DirectoryPage() {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <BackToHub />
      <h1 className="mb-1.5 font-display text-[30px] font-medium text-ink">Find a provider</h1>
      <p className="mb-7 font-body text-[14.5px] text-[#4A4738]">
        Every listing here comes straight from a provider&apos;s own Echonflow page.
      </p>
      <DirectoryClient listings={listings ?? []} />
    </div>
  );
}
