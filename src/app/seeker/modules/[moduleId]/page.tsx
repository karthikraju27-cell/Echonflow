import Link from "next/link";
import { notFound } from "next/navigation";
import {
  findModule,
  moduleCode,
  moduleMinutes,
  trackName,
  estimateMinutes,
} from "@/lib/modules-data";

export default async function ModuleSyllabusPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const m = findModule(moduleId);
  if (!m) notFound();

  return (
    <div>
      <div className="mb-5 font-body text-[13px] text-[#8C8770]">
        <Link href="/seeker/modules" className="text-moss">
          Curriculum
        </Link>{" "}
        / {moduleCode(m)}
      </div>

      <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-moss">
        {trackName(m.track)} · {moduleCode(m)}
      </div>
      <h1 className="mb-2 font-display text-[32px] font-medium text-ink">{m.title}</h1>
      <p className="max-w-[60ch] font-body text-[14.5px] text-[#4A4738]">{m.blurb}</p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Link
          href={`/seeker/modules/${m.id}/${m.chapters[0].id}`}
          className="rounded bg-forest px-[18px] py-[11px] font-mono text-[11.5px] uppercase tracking-[0.06em] text-mist"
        >
          Start Module {m.num}
        </Link>
        <span className="font-mono text-[12px] text-[#8C8770]">
          {m.chapters.length} chapters · {moduleMinutes(m)} min total
        </span>
      </div>

      <div className="mt-8 border-t border-[#DCD6BF]">
        {m.chapters.map((c) => (
          <Link
            key={c.id}
            href={`/seeker/modules/${m.id}/${c.id}`}
            className="grid grid-cols-[40px_1fr_50px] items-center gap-4 border-b border-[#DCD6BF] py-4"
          >
            <div className="font-mono text-[13px] text-[#8C8770]">
              {String(c.num).padStart(2, "0")}
            </div>
            <div className="font-body text-[15.5px] font-semibold text-ink">{c.title}</div>
            <div className="text-right font-mono text-[11.5px] text-[#8C8770]">
              {estimateMinutes(c)}m
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
