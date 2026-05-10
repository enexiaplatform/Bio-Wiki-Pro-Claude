import { ArrowRight, Clock, Layers3 } from "lucide-react";
import { Link } from "wouter";
import type { Lesson } from "@/types/lesson";

export function LessonCard({ lesson }: { lesson: Lesson }) {
  return (
    <Link href={`/academy/${lesson.id}`}>
      <article className="group h-full rounded-2xl border border-white/10 bg-card p-5 shadow-xl shadow-black/10 transition-colors hover:border-primary/40">
        <div className="flex items-start justify-between gap-3 mb-4">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{lesson.category}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">{lesson.level}</span>
        </div>
        <h2 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">{lesson.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">{lesson.subtitle}</p>
        <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{lesson.estimatedMinutes} min</span>
          <span className="flex items-center gap-1"><Layers3 className="w-3.5 h-3.5" />{lesson.keyConcepts.length} cards</span>
          <ArrowRight className="w-4 h-4 ml-auto text-primary opacity-70 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </article>
    </Link>
  );
}
