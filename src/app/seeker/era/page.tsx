import { createClient } from "@/lib/supabase/server";
import { BackToHub } from "@/components/BackToHub";
import { EraFlow } from "@/components/era/EraFlow";
import { ERA_TITLE, ERA_EYEBROW } from "@/lib/era-questions";

export default async function EraPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count } = await supabase
    .from("era_responses")
    .select("id", { count: "exact", head: true })
    .eq("seeker_id", user!.id);

  return (
    <div>
      <BackToHub />
      <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">
        {ERA_EYEBROW}
      </div>
      <h1 className="mb-7 font-display text-[30px] font-medium text-ink">{ERA_TITLE}</h1>
      <EraFlow seekerId={user!.id} hasHistory={(count ?? 0) > 0} />
    </div>
  );
}
