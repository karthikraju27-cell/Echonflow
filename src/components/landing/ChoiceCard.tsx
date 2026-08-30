import Link from "next/link";

export function ChoiceCard({
  href,
  eyebrow,
  title,
  body,
}: {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group text-left rounded-md border border-mist/25 bg-ink/55 backdrop-blur-sm p-[26px_22px] text-mist transition-all hover:-translate-y-0.5 hover:border-gold block"
    >
      <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-gold mb-2.5">
        {eyebrow}
      </div>
      <div className="font-display text-[22px] font-medium mb-2 leading-tight">{title}</div>
      <div className="font-body text-[13.5px] text-mist/70 leading-relaxed">{body}</div>
    </Link>
  );
}
