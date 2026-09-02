import raw from "./modules-data.json";

// Content migrated from the Swasthi Primer reference build (13 modules,
// 116 chapters). See supabase/README or the build brief, Task 4.

export interface ModuleSection {
  heading: string;
  paras: string[];
}

export interface ModuleChapter {
  id: string;
  num: number;
  title: string;
  sections: ModuleSection[];
  takeaways?: string[];
}

export interface WellnessModule {
  id: string;
  num: number;
  track: string;
  title: string;
  blurb: string;
  chapters: ModuleChapter[];
}

interface ModulesData {
  brand: string;
  tagline: string;
  tracks: Record<string, { name: string }>;
  modules: WellnessModule[];
}

const DATA = raw as ModulesData;

export const TRACKS = DATA.tracks;
export const MODULES = DATA.modules;

export function findModule(id: string): WellnessModule | undefined {
  return MODULES.find((m) => m.id === id);
}

export function findChapter(
  moduleId: string,
  chapterId: string
): { m: WellnessModule; c: ModuleChapter } | null {
  const m = findModule(moduleId);
  if (!m) return null;
  const c = m.chapters.find((ch) => ch.id === chapterId);
  if (!c) return null;
  return { m, c };
}

export function moduleCode(m: WellnessModule): string {
  return "M" + String(m.num).padStart(2, "0");
}

export function trackName(t: string): string {
  return TRACKS[t]?.name ?? t;
}

function chapterWordCount(c: ModuleChapter): number {
  return c.sections.reduce((sum, s) => sum + s.paras.join(" ").split(/\s+/).length, 0);
}

export function estimateMinutes(c: ModuleChapter): number {
  return Math.max(2, Math.round(chapterWordCount(c) / 200));
}

export function moduleMinutes(m: WellnessModule): number {
  return m.chapters.reduce((sum, c) => sum + estimateMinutes(c), 0);
}

export function totalChapters(): number {
  return MODULES.reduce((sum, m) => sum + m.chapters.length, 0);
}

export function flatChapterList(): { m: WellnessModule; c: ModuleChapter }[] {
  const list: { m: WellnessModule; c: ModuleChapter }[] = [];
  for (const m of MODULES) {
    for (const c of m.chapters) list.push({ m, c });
  }
  return list;
}
