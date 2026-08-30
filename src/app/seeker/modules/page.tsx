import { BackToHub } from "@/components/BackToHub";
import { MODULE_LIST } from "@/lib/constants";

// TODO(modules): STUB. This lists module titles only — the 13-module,
// 116-chapter curriculum content (Zerodha Varsity-style) still needs to be
// migrated in and rendered per-chapter. See build brief, Task 4.
export default function ModulesPage() {
  return (
    <div>
      <BackToHub />
      <h1 className="mb-1.5 font-display text-[30px] font-medium text-ink">Learning modules</h1>
      <p className="mb-7 font-body text-[14.5px] text-[#4A4738]">
        13 modules, 116 chapters — this stub lists the modules; chapter content isn&apos;t wired in yet.
      </p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
        {MODULE_LIST.map((m, i) => (
          <div key={m} className="rounded-md border border-[#DCD6BF] bg-card px-4 py-3.5">
            <div className="mb-1.5 font-mono text-[10px] text-gold">{String(i + 1).padStart(2, "0")}</div>
            <div className="font-display text-[15.5px] text-ink">{m}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
