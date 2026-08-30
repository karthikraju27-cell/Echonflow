import { createClient } from "@/lib/supabase/server";
import { BackToHub } from "@/components/BackToHub";
import { EraFlow } from "@/components/era/EraFlow";

// TODO(era): the question set behind this flow is a placeholder — see
// src/lib/era-questions.ts. Swap in the real spec once provided; the results
// screen and persistence to `era_responses` are already real.
export default async function EraPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <BackToHub />
      <h1 className="mb-1.5 font-display text-[30px] font-medium text-ink">
        Energy &amp; Resilience Audit
      </h1>
      <p className="mb-7 font-body text-[14.5px] text-[#4A4738]">
        5 sections, ~15 questions — sleep, stress load, movement, nutrition, and recovery-environment
        fit.
      </p>
      <EraFlow seekerId={user!.id} />
    </div>
  );
}
