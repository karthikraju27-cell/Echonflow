import Link from "next/link";
import { notFound } from "next/navigation";
import { findModule, moduleCode } from "@/lib/modules-data";
import { findQuiz } from "@/lib/quizzes-data";
import { createClient } from "@/lib/supabase/server";
import { QuizFlow } from "@/components/quiz/QuizFlow";

export default async function ModuleQuizPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const m = findModule(moduleId);
  const quiz = findQuiz(moduleId);
  if (!m || !quiz) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <div className="mb-5 font-body text-[13px] text-[#8C8770]">
        <Link href="/seeker/modules" className="text-moss">
          Curriculum
        </Link>{" "}
        /{" "}
        <Link href={`/seeker/modules/${m.id}`} className="text-moss">
          {moduleCode(m)}
        </Link>{" "}
        / Quiz
      </div>
      <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">
        Module Quiz · {moduleCode(m)}
      </div>
      <h1 className="mb-7 font-display text-[30px] font-medium text-ink">{m.title}</h1>

      <QuizFlow
        seekerId={user!.id}
        moduleId={m.id}
        moduleTitle={m.title}
        moduleCode={moduleCode(m)}
        questions={quiz.questions}
      />
    </div>
  );
}
