import Link from "next/link";

export function BackToHub({ href = "/seeker" }: { href?: string }) {
  return (
    <Link href={href} className="mb-5 inline-block font-mono text-[11.5px] uppercase text-moss">
      ← Back to hub
    </Link>
  );
}
