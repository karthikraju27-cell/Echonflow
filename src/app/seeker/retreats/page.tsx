import { createClient } from "@/lib/supabase/server";
import { BackToHub } from "@/components/BackToHub";
import { RetreatLeadForm } from "@/components/retreats/RetreatLeadForm";

export default async function RetreatsPage() {
  const supabase = await createClient();
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
      <BackToHub />
      <h1 className="mb-1.5 font-display text-[30px] font-medium text-ink">Retreats &amp; sessions</h1>
      <p className="mb-7 font-body text-[14.5px] text-[#4A4738]">
        Multi-day retreats, 1:1s, small-group sessions — run on demand.
      </p>
      <RetreatLeadForm
        seekerId={user!.id}
        defaultName={profile?.name ?? ""}
        defaultEmail={profile?.email ?? ""}
      />
    </div>
  );
}
