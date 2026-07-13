import { ClipboardCheck, Search, ShieldCheck, Sparkles } from "lucide-react";
import { auditQuestionBank, complianceTopics } from "@/data/compliance/auditBank";
import { AuditQuestionBank } from "./AuditQuestionBank";
import { useSEO } from "@/hooks/use-seo";
import { useTranslation } from "react-i18next";
import { EditorialImage } from "@/components/EditorialImage";

const pillClass =
  "inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200";

export default function CompliancePage() {
  const { t } = useTranslation("sections");
  useSEO({ title: t("compliance.seoTitle"), description: t("compliance.seoDesc") });

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:pt-8">
      <section className="mb-8 overflow-hidden rounded-lg border border-teal-400/20 bg-gradient-to-br from-teal-500/12 via-white/[0.045] to-emerald-500/10 p-6 shadow-xl shadow-black/15 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <div>
            <span className={pillClass}>
              <ShieldCheck className="h-3.5 w-3.5" />
              {t("compliance.eyebrow")}
            </span>
            <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">
              {t("compliance.title")}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {t("compliance.subtitle")}
            </p>
          </div>

          <div>
            <EditorialImage
              src="/images/editorial/cleanroom-environmental-monitoring.jpg"
              alt="Cleanroom technician documenting environmental monitoring samples"
              creditName="Toon Lambrechts"
              creditUrl="https://unsplash.com/photos/9e6o06Y4cN8"
              className="h-64 rounded-lg border border-white/10 lg:h-72"
              imageClassName="object-center"
              eager
            />
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-white/10 bg-background/35 p-3">
                <p className="text-xl font-bold text-teal-200">{complianceTopics.length}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">Focus areas</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-background/35 p-3">
                <p className="text-xl font-bold text-teal-200">{auditQuestionBank.length}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">Audit prompts</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-background/35 p-3">
                <p className="text-xl font-bold text-teal-200">GMP</p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">Evidence-led</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Inspection themes</p>
            <h2 className="mt-2 text-2xl font-bold">Start from the evidence inspectors ask for</h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Each topic links a regulatory concern to the records, trends, and decisions that make an answer defensible.
          </p>
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {complianceTopics.map((topic) => (
          <article
            key={topic.id}
            className="group rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-lg shadow-black/10 transition-colors hover:border-teal-400/35"
          >
            <div className="mb-3 flex items-center gap-2 text-teal-300">
              <ClipboardCheck className="h-5 w-5" />
              <h2 className="font-bold">{topic.title}</h2>
            </div>
            <p className="mb-2 text-sm font-semibold">{topic.focus}</p>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{topic.whyItMatters}</p>
            <div className="mb-4 flex flex-wrap gap-2">
              {topic.evidenceExamples.map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-background/40 px-3 py-1 text-xs text-muted-foreground">
                  {item}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-white/10 pt-3 text-xs font-semibold text-teal-300">
              <Search className="h-3.5 w-3.5" />
              Use in question bank
            </div>
          </article>
        ))}
        <article className="rounded-lg border border-teal-400/25 bg-teal-400/10 p-5 shadow-lg shadow-black/10">
          <div className="mb-3 flex items-center gap-2 text-teal-200">
            <Sparkles className="h-5 w-5" />
            <h2 className="font-bold">Practice mode</h2>
          </div>
          <p className="mb-2 text-sm font-semibold">Search by topic, weak answer, strong answer, or evidence cue.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Use the bank below to rehearse concise inspection answers and save the prompts you want to revisit.
          </p>
        </article>
      </section>

      <AuditQuestionBank />
    </div>
  );
}
