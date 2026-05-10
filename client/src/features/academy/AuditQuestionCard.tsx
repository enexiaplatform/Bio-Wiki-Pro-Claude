import { BookmarkPlus, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuditQuestion } from "@/types/lesson";

interface AuditQuestionCardProps {
  question: AuditQuestion;
  onSave?: () => void;
}

export function AuditQuestionCard({ question, onSave }: AuditQuestionCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="font-bold leading-snug">{question.question}</h3>
        {onSave && (
          <Button size="icon" variant="ghost" onClick={onSave} className="shrink-0">
            <BookmarkPlus className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className="grid md:grid-cols-2 gap-3 mb-3">
        <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-4">
          <div className="flex items-center gap-2 text-red-300 mb-2">
            <XCircle className="w-4 h-4" />
            <p className="text-xs font-bold uppercase tracking-wider">Weak Answer</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{question.weakAnswer}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-2 text-emerald-300 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <p className="text-xs font-bold uppercase tracking-wider">Strong Answer</p>
          </div>
          <p className="text-sm leading-relaxed">{question.strongAnswer}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {question.evidenceNeeded.map((evidence) => (
          <span key={evidence} className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-muted-foreground">
            {evidence}
          </span>
        ))}
      </div>
    </div>
  );
}
