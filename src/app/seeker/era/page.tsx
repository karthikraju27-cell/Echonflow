import { createClient } from "@/lib/supabase/server";
import { BackToHub } from "@/components/BackToHub";
import { EraFlow } from "@/components/era/EraFlow";
import { EraHistory } from "@/components/era/EraHistory";
import { ERA_TITLE, ERA_EYEBROW } from "@/lib/era-questions";

export default async function EraPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: responses } = await supabase
    .from("era_responses")
    .select("*")
    .eq("seeker_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <BackToHub />
      <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">
        {ERA_EYEBROW}
      </div>
      <h1 className="mb-7 font-display text-[30px] font-medium text-ink">{ERA_TITLE}</h1>
      <EraFlow seekerId={user!.id} />
      <EraHistory responses={responses ?? []} />
    </div>
  );
}
