import Link from "next/link";
import { BackToHub } from "@/components/BackToHub";
import { ModulesDirectory } from "@/components/modules/ModulesDirectory";
import { QUIZZES } from "@/lib/quizzes-data";
import { createClient } from "@/lib/supabase/server";

export default async function ModulesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: progressRows } = await supabase
    .from("module_quiz_progress")
    .select("module_id, passed")
    .eq("seeker_id", user!.id);

  const passedCount = (progressRows ?? []).filter((p) => p.passed).length;

  return (
    <div>
      <BackToHub />
      <Link
        href="/seeker/certificate"
        className="mb-6 inline-block rounded-md border border-[#DCD6BF] bg-card px-4 py-3 font-mono text-[11.5px] uppercase tracking-[0.05em] text-moss"
      >
        {passedCount} of {QUIZZES.length} module quizzes passed — view certificate progress →
      </Link>
      <ModulesDirectory />
    </div>
  );
}
