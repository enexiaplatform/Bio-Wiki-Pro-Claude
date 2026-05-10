import { BookmarkPlus, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CaseStudy } from "@/types/lesson";

interface CaseStudyBlockProps {
  caseStudy: CaseStudy;
  onSave?: () => void;
}

export function CaseStudyBlock({ caseStudy, onSave }: CaseStudyBlockProps) {
  return (
    <section className="bg-card border border-white/10 rounded-2xl p-5 md:p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Practical Case Study</h2>
        </div>
        {onSave && (
          <Button size="sm" variant="outline" onClick={onSave}>
            <BookmarkPlus className="w-4 h-4" />
            Save
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <Info title="Scenario" value={caseStudy.scenario} />
        <Info title="Context" value={caseStudy.context} />
        <Info title="Problem" value={caseStudy.problem} />
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Analysis Path</p>
          <div className="space-y-2">
            {caseStudy.analysisPath.map((step, index) => (
              <div key={step} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</span>
                <p className="text-sm text-muted-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>
        <Info title="Decision" value={caseStudy.decision} strong />
        <Info title="Lesson Learned" value={caseStudy.lessonLearned} />
      </div>
    </section>
  );
}

function Info({ title, value, strong = false }: { title: string; value: string; strong?: boolean }) {
  return (
    <div className={strong ? "rounded-xl border border-primary/20 bg-primary/10 p-4" : "rounded-xl border border-white/10 bg-white/5 p-4"}>
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{title}</p>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  );
}
