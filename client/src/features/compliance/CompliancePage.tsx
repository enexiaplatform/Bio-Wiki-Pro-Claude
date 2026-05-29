import { ClipboardCheck, ShieldCheck } from "lucide-react";
import { complianceTopics } from "@/data/compliance/auditBank";
import { AuditQuestionBank } from "./AuditQuestionBank";
import { useSEO } from "@/hooks/use-seo";

export default function CompliancePage() {
  useSEO({
    title: "Compliance — GMP Audit Readiness & Annex 1",
    description: "Chuẩn bị audit GMP và Annex 1: topic intelligence, câu hỏi thanh tra, evidence-backed answers — dành cho QC/QA Pharma Vietnam.",
  });
  return (
    <div className="pb-24 pt-4 md:pt-8 max-w-6xl mx-auto px-4">
      <section className="mb-8 rounded-2xl border border-white/10 bg-card p-5 md:p-7 shadow-xl shadow-black/10">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-primary/10 text-primary items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Compliance intelligence</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Compliance</h1>
            <p className="text-muted-foreground max-w-3xl leading-relaxed">
              Build Annex 1 and GMP inspection readiness through topic intelligence, strong answers, and evidence-backed audit thinking.
            </p>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {complianceTopics.map((topic) => (
          <article key={topic.id} className="rounded-2xl border border-white/10 bg-card p-5">
            <div className="flex items-center gap-2 text-primary mb-3">
              <ClipboardCheck className="w-5 h-5" />
              <h2 className="font-bold">{topic.title}</h2>
            </div>
            <p className="text-sm font-medium mb-2">{topic.focus}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{topic.whyItMatters}</p>
            <div className="flex flex-wrap gap-2">
              {topic.evidenceExamples.map((item) => (
                <span key={item} className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-muted-foreground">
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <AuditQuestionBank />
    </div>
  );
}
