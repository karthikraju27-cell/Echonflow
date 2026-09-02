import Link from "next/link";
import { notFound } from "next/navigation";
import { findChapter, moduleCode, estimateMinutes, flatChapterList } from "@/lib/modules-data";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ moduleId: string; chapterId: string }>;
}) {
  const { moduleId, chapterId } = await params;
  const found = findChapter(moduleId, chapterId);
  if (!found) notFound();
  const { m, c } = found;

  const flat = flatChapterList();
  const idx = flat.findIndex((x) => x.m.id === m.id && x.c.id === c.id);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx < flat.length - 1 ? flat[idx + 1] : null;

  return (
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
      <aside className="lg:sticky lg:top-24">
        <div className="mb-4 font-body text-[13px] text-[#8C8770]">
          <Link href="/seeker/modules" className="text-moss">
            Curriculum
          </Link>{" "}
          /{" "}
          <Link href={`/seeker/modules/${m.id}`} className="text-moss">
            {moduleCode(m)}
          </Link>
        </div>
        <div className="mb-3.5 font-display text-[15px] font-medium text-ink">{m.title}</div>
        <nav className="flex flex-col gap-0.5">
          {m.chapters.map((ch) => (
            <Link
              key={ch.id}
              href={`/seeker/modules/${m.id}/${ch.id}`}
              className={`flex gap-2.5 rounded px-2.5 py-2 font-body text-[13px] ${
                ch.id === c.id
                  ? "border-l-2 border-gold bg-[#F6E9D2] font-semibold text-[#955710]"
                  : "border-l-2 border-transparent text-[#4A4738]"
              }`}
            >
              <span className="font-mono text-[11px] text-[#8C8770]">
                {String(ch.num).padStart(2, "0")}
              </span>
              <span>{ch.title}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="min-w-0">
        <div className="mb-2 font-body text-[13px] text-[#8C8770]">
          <Link href="/seeker/modules" className="text-moss">
            Curriculum
          </Link>{" "}
          /{" "}
          <Link href={`/seeker/modules/${m.id}`} className="text-moss">
            {moduleCode(m)}. {m.title}
          </Link>
        </div>
        <span className="font-mono text-[11.5px] uppercase tracking-[0.06em] text-[#8C8770]">
          Chapter {c.num}
        </span>
        <h1 className="mt-2 font-display text-[clamp(26px,4vw,36px)] font-medium leading-tight text-ink">
          {c.title}
        </h1>
        <div className="mt-3.5 flex gap-3.5 font-mono text-[12px] text-[#8C8770]">
          <span>{estimateMinutes(c)} min read</span>
          <span>{moduleCode(m)}</span>
        </div>

        <article className="mt-8 max-w-[68ch]">
          {c.sections.map((s, i) => {
            const [snum, ...rest] = s.heading.split(" ");
            return (
              <div key={i}>
                <h2 className="mt-9 mb-3.5 font-display text-[21px] font-medium text-ink first:mt-0">
                  <span className="mr-2.5 font-mono text-[16px] text-gold">{snum}</span>
                  {rest.join(" ")}
                </h2>
                {s.paras.map((p, j) => (
                  <p
                    key={j}
                    className="mt-3.5 font-body text-[16px] leading-relaxed text-ink first:mt-0"
                  >
                    {p}
                  </p>
                ))}
              </div>
            );
          })}

          {c.takeaways && c.takeaways.length > 0 && (
            <div className="mt-6 rounded-md border border-l-[3px] border-[#DCD6BF] border-l-gold bg-card p-5">
              <div className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.06em] text-[#955710]">
                Key takeaways
              </div>
              <ul className="flex flex-col gap-1.5">
                {c.takeaways.map((t, i) => (
                  <li key={i} className="flex gap-2 font-body text-[14px] text-[#4A4738]">
                    <span className="font-bold text-[#955710]">✓</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>

        <div className="mt-12 flex justify-between gap-4 border-t border-[#DCD6BF] pt-7">
          {prev ? (
            <Link
              href={`/seeker/modules/${prev.m.id}/${prev.c.id}`}
              className="max-w-[48%] rounded-md border border-[#DCD6BF] bg-card px-4 py-3.5"
            >
              <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-[#8C8770]">
                ← Previous
              </div>
              <div className="mt-1.5 font-display text-[15px] font-medium text-ink">
                {prev.c.title}
              </div>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/seeker/modules/${next.m.id}/${next.c.id}`}
              className="ml-auto max-w-[48%] rounded-md border border-[#DCD6BF] bg-card px-4 py-3.5 text-right"
            >
              <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-[#8C8770]">
                Next →
              </div>
              <div className="mt-1.5 font-display text-[15px] font-medium text-ink">
                {next.c.title}
              </div>
            </Link>
          ) : (
            <Link
              href={`/seeker/modules/${m.id}`}
              className="ml-auto max-w-[48%] rounded-md border border-[#DCD6BF] bg-card px-4 py-3.5 text-right"
            >
              <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-[#8C8770]">
                Module complete →
              </div>
              <div className="mt-1.5 font-display text-[15px] font-medium text-ink">
                Back to {moduleCode(m)} overview
              </div>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
