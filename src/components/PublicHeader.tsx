import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export function PublicHeader({ hubHref }: { hubHref?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#DCD6BF] px-6 py-4">
      <Link
        href="/"
        className="flex items-center gap-2 font-mono text-[13px] tracking-[0.1em] text-forest"
      >
        <BrandMark size={20} />
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
