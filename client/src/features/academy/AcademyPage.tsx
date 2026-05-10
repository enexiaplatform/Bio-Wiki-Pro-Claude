import { useMemo, useState } from "react";
import { BookOpen, Filter, Search, ShieldCheck } from "lucide-react";
import clsx from "clsx";
import { microbiologyLessons } from "@/data/lessons/microbiologyLessons";
import { LessonCard } from "./LessonCard";

const all = "All";

export default function AcademyPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(all);
  const [level, setLevel] = useState(all);

  const categories = useMemo(() => [all, ...Array.from(new Set(microbiologyLessons.map((lesson) => lesson.category)))], []);
  const levels = useMemo(() => [all, ...Array.from(new Set(microbiologyLessons.map((lesson) => lesson.level)))], []);

  const filteredLessons = microbiologyLessons.filter((lesson) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [lesson.title, lesson.subtitle, lesson.summary, lesson.category].some((value) => value.toLowerCase().includes(query));
    const matchesCategory = category === all || lesson.category === category;
    const matchesLevel = level === all || lesson.level === level;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-6xl mx-auto px-4">
      <section className="mb-8 rounded-2xl border border-white/10 bg-card p-5 md:p-7 shadow-xl shadow-black/10">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-primary/10 text-primary items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Pharma Microbiology Intelligence OS</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Academy</h1>
            <p className="text-muted-foreground max-w-3xl leading-relaxed">
              Learn microbiology like a QC Director. Build practical reasoning across EM, CCS, investigations, sterility assurance, rapid methods, and audit readiness.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4 mb-8 sticky top-[60px] md:top-20 z-30 bg-background/95 backdrop-blur-xl py-3 -mx-4 px-4 border-b border-white/5 md:static md:border-none md:bg-transparent md:p-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search lessons, risks, audit topics..."
            className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
          <FilterBar label="Category" values={categories} active={category} onChange={setCategory} />
          <FilterBar label="Level" values={levels} active={level} onChange={setLevel} />
        </div>
      </section>

      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <BookOpen className="w-4 h-4 text-primary" />
        <span>{filteredLessons.length} director-level lessons</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredLessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </div>

      {filteredLessons.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-card p-10 text-center text-muted-foreground">
          No matching lessons yet. Try a broader search or filter.
        </div>
      )}
    </div>
  );
}

function FilterBar({ label, values, active, onChange }: { label: string; values: string[]; active: string; onChange: (value: string) => void }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Filter className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {values.map((value) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={clsx(
              "shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
              active === value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/50",
            )}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}
