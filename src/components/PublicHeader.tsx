import Link from "next/link";

export function PublicHeader({ hubHref }: { hubHref?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#DCD6BF] px-6 py-4">
      <Link href="/" className="font-mono text-[13px] tracking-[0.1em] text-forest">
        echonflow
      </Link>
      {hubHref ? (
        <Link href={hubHref} className="font-mono text-[11.5px] uppercase text-moss">
          Your hub →
        </Link>
      ) : (
        <Link href="/auth/seeker" className="font-mono text-[11.5px] uppercase text-moss">
          Sign in
        </Link>
      )}
    </div>
  );
}
