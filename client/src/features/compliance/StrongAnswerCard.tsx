import type { ComplianceQuestion } from "@/types/compliance";
import { AuditQuestionCard } from "@/features/academy/AuditQuestionCard";

export function StrongAnswerCard({ question, onSave }: { question: ComplianceQuestion; onSave?: () => void }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] font-medium text-muted-foreground">
          {question.topic}
        </span>
      </div>
      <AuditQuestionCard question={question} onSave={onSave} />
    </div>
  );
}
